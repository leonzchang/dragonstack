use crate::api::Message;
use ds_core::{
    authsdk::{
        AuthServiceClient, HashRequest, HashResponse, NewSessionIdResponse, ParseRequest,
        ParseResponse, SessionStringRequest, SessionStringResponse, VerifySessionRequest,
        VerifySessionResponse,
    },
    common::AccountInfo,
    config::{AUTHORIZATION, BAERER, COOKIE_NAME},
    sqlx_postgres::{ds_management as db, sqlx::PgPool},
};

use actix_web::{
    cookie::{time::Duration, Cookie},
    error::ErrorInternalServerError,
    Error, HttpResponse,
};
use http::uri::Uri;
use serde::Serialize;
use tokio::sync::MutexGuard;
use tonic::{
    metadata::MetadataValue,
    service::interceptor::{InterceptedService, Interceptor},
    transport::Channel,
    Request, Status,
};

#[derive(Clone)]
pub struct AuthServiceClientInterceptor {
    token: String,
}

impl AuthServiceClientInterceptor {
    pub fn new(token: &str) -> Self {
        Self {
            token: token.to_owned(),
        }
    }
}

impl Interceptor for AuthServiceClientInterceptor {
    fn call(&mut self, mut req: Request<()>) -> Result<Request<()>, Status> {
        // adding token to request.
        let bearer_token = format!("{} {}", BAERER, &self.token);
        let Ok(metadata) = MetadataValue::try_from(bearer_token) else {return Err(Status::internal("set token to header failed"))};
        req.metadata_mut().insert(AUTHORIZATION, metadata);
        Ok(req)
    }
}

#[derive(Clone)]
pub struct GrpcClient {
    pub grcp: AuthServiceClient<InterceptedService<Channel, AuthServiceClientInterceptor>>,
    pub host: String,
}

impl GrpcClient {
    pub async fn new(host: &str, token: &str) -> anyhow::Result<Self> {
        let uri = Uri::try_from(host)?;
        let channel = Channel::builder(uri).connect().await?;
        let client_interceptor = AuthServiceClientInterceptor::new(token);

        let grcp = AuthServiceClient::with_interceptor(channel, client_interceptor);

        Ok(Self {
            grcp,
            host: host.to_owned(),
        })
    }
}

pub async fn set_session<'a>(
    conn: &PgPool,
    mut client: MutexGuard<'a, GrpcClient>,
    username: &str,
    session_id: Option<&String>,
) -> Result<HttpResponse, Error> {
    if let Some(session_id) = session_id {
        let SessionStringResponse { session_string } = client
            .grcp
            .to_session_string(SessionStringRequest {
                username: username.to_owned(),
                uuid: session_id.clone(),
            })
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn to_session_string failed"))?
            .into_inner();

        set_session_cookie(&session_string, "session restored")
    } else {
        let NewSessionIdResponse { uuid } = client
            .grcp
            .new_session_id(Request::new(()))
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn new_session_id failed"))?
            .into_inner();

        let HashResponse { hash_string } = client
            .grcp
            .hash(Request::new(HashRequest {
                string: username.to_owned(),
            }))
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn hash failed"))?
            .into_inner();

        let SessionStringResponse { session_string } = client
            .grcp
            .to_session_string(Request::new(SessionStringRequest {
                username: username.to_owned(),
                uuid: uuid.clone(),
            }))
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn to_session_string failed"))?
            .into_inner();

        db::update_session_id(conn, Some(&uuid), &hash_string)
            .await
            .map_err(ErrorInternalServerError)?;

        set_session_cookie(&session_string, "session created")
    }
}

pub fn set_session_cookie(session_string: &str, message: &str) -> Result<HttpResponse, Error> {
    let cookie = Cookie::build(COOKIE_NAME, session_string)
        .path("/")
        .max_age(Duration::hours(1))
        .http_only(true)
        .secure(true)
        .finish();

    Ok(HttpResponse::Ok().cookie(cookie).json(Message {
        message: message.to_owned(),
    }))
}

#[derive(Serialize, Clone, Debug)]
pub struct AuthenticatedAccountInfo {
    pub account: AccountInfo,
    pub authenticated: bool,
    pub username: String,
}

pub async fn authenticated_account<'a>(
    conn: &PgPool,
    mut client: MutexGuard<'a, GrpcClient>,
    session_string: Option<String>,
) -> Result<AuthenticatedAccountInfo, String> {
    let Some(session_string) = session_string else{ return Err("Invalid session".to_owned())};

    // gRpc auth server
    // verify session string
    let VerifySessionResponse { verify } = client
        .grcp
        .verify(Request::new(VerifySessionRequest {
            session_string: session_string.clone(),
        }))
        .await
        .map_err(|_| "grpc fn verify failed".to_owned())?
        .into_inner();

    if !verify {
        return Err("Invalid session".to_owned());
    }

    // parse session string
    let ParseResponse { username, uuid, .. } = client
        .grcp
        .parse(Request::new(ParseRequest {
            session_string: session_string,
        }))
        .await
        .map_err(|_| "grpc fn parse failed".to_owned())?
        .into_inner();

    // hash username
    let HashResponse {
        hash_string: hash_username,
    } = client
        .grcp
        .hash(Request::new(HashRequest {
            string: username.clone(),
        }))
        .await
        .map_err(|_| "grpc fn hash failed".to_owned())?
        .into_inner();

    let Some(account_info) = db::get_account(conn, &hash_username)
        .await
        .map_err(|_|"get account error".to_owned())? else { return Err("Invalid session: does not match up user information".to_owned())};

    let Some(session_id) =  account_info.session_id.clone() else  { return Err("Invalid session: session should not be none".to_owned())};
    let authenticated = uuid == session_id;

    Ok(AuthenticatedAccountInfo {
        account: account_info,
        authenticated,
        username: username,
    })
}
