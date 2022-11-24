use crate::api::Message;
use ds_core::{
    common::AccountInfo,
    config::{AUTHORIZATION, BAERER, COOKIE_NAME},
    sqlx_postgres::{ds_management as db, sqlx::PgPool},
};

use actix_web::{
    cookie::{time::Duration, Cookie},
    error::ErrorInternalServerError,
    Error, HttpResponse,
};
pub use auth::{
    auth_client::AuthClient, AccountDataRequest, HashRequest, HashResponse, ParseRequest,
    ParseResponse, SessionStringRequest, VerifySessionRequest,
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

mod auth {
    tonic::include_proto!("auth");
}

#[derive(Clone)]
pub struct AuthClientInterceptor {
    token: String,
}

impl AuthClientInterceptor {
    pub fn new(token: &str) -> Self {
        Self {
            token: token.to_owned(),
        }
    }
}

impl Interceptor for AuthClientInterceptor {
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
    pub grcp: AuthClient<InterceptedService<Channel, AuthClientInterceptor>>,
    pub host: String,
}

impl GrpcClient {
    pub async fn new(host: &str, token: &str) -> anyhow::Result<Self> {
        let uri = Uri::try_from(host)?;
        let channel = Channel::builder(uri).connect().await?;
        let client_interceptor = AuthClientInterceptor::new(token);

        let grcp = AuthClient::with_interceptor(channel, client_interceptor);

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
        let to_session_string_resp = client
            .grcp
            .to_session_string(SessionStringRequest {
                username: username.to_owned(),
                uuid: session_id.clone(),
            })
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn to_session_string failed"))?
            .into_inner();

        set_session_cookie(&to_session_string_resp.session_string, "session restored")
    } else {
        let new_session_id_resp = client
            .grcp
            .new_session_id(Request::new(()))
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn new_session_id failed"))?
            .into_inner();

        let hash_resp = client
            .grcp
            .hash(Request::new(HashRequest {
                string: username.to_owned(),
            }))
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn hash failed"))?
            .into_inner();

        let to_session_string_resp = client
            .grcp
            .to_session_string(Request::new(SessionStringRequest {
                username: username.to_owned(),
                uuid: new_session_id_resp.uuid.clone(),
            }))
            .await
            .map_err(|_| ErrorInternalServerError("grpc fn to_session_string failed"))?
            .into_inner();

        db::update_session_id(
            conn,
            Some(&new_session_id_resp.uuid),
            &hash_resp.hash_string,
        )
        .await
        .map_err(ErrorInternalServerError)?;

        set_session_cookie(&to_session_string_resp.session_string, "session created")
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
    let Ok(verify_resp) = client.grcp
        .verify(Request::new(VerifySessionRequest {
        session_string: session_string.clone()
        }))
        .await else {return Err("grpc fn verify failed".to_owned()) };

    if !verify_resp.into_inner().verify {
        return Err("Invalid session".to_owned());
    }

    // parse session string
    let Ok(parse_resp) = client
        .grcp
        .parse(Request::new(ParseRequest {
            session_string: session_string,
        }))
        .await else {return Err("grpc fn parse failed".to_owned()) };
    let parse_resp = parse_resp.into_inner();

    // hash username
    let Ok(hash_resp) = client
        .grcp
        .hash(Request::new(HashRequest {
            string: parse_resp.username.clone(),
        }))
        .await else {return Err("grpc fn hash failed".to_owned()) };
    let hash_username = hash_resp.into_inner().hash_string;

    let Some(account_info) = db::get_account(conn, &hash_username)
        .await
        .map_err(|_|"get account error".to_owned())? else { return Err("Invalid session: does not match up user information".to_owned())};

    let Some(session_id) =  account_info.session_id.clone() else  { return Err("Invalid session: session should not be none".to_owned())};
    let authenticated = parse_resp.uuid == session_id;

    Ok(AuthenticatedAccountInfo {
        account: account_info,
        authenticated,
        username: parse_resp.username,
    })
}
