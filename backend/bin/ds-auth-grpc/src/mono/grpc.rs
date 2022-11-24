use crate::mono::confidential;
use ds_core::authsdk::{
    AccountDataRequest, AccountDataResponse, AuthServiceTrait, HashRequest, HashResponse,
    NewSessionIdResponse, ParseRequest, ParseResponse, SessionStringRequest, SessionStringResponse,
    VerifySessionRequest, VerifySessionResponse,
};

use sha2::{Digest, Sha256};
use tonic::{Request, Response, Status};
use uuid::Uuid;

#[derive(Default, Clone)]
pub struct AuthService;

#[tonic::async_trait]
impl AuthServiceTrait for AuthService {
    async fn new_session_id(
        &self,
        _request: Request<()>,
    ) -> Result<tonic::Response<NewSessionIdResponse>, Status> {
        let uuid = Uuid::new_v4().to_string();

        log::info!("Create new session Id {}", uuid);

        Ok(Response::new(NewSessionIdResponse { uuid }))
    }

    async fn to_session_string(
        &self,
        request: tonic::Request<SessionStringRequest>,
    ) -> Result<tonic::Response<SessionStringResponse>, Status> {
        let r = request.into_inner();
        let acount_data_resp = self
            .account_data(Request::new(AccountDataRequest {
                username: r.username,
                uuid: r.uuid,
            }))
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .into_inner();
        let hash_resp = self
            .hash(Request::new(HashRequest {
                string: acount_data_resp.account_data.clone(),
            }))
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .into_inner();

        let session_string = format!(
            "{}{}{}",
            acount_data_resp.account_data,
            confidential::SEPARATOR,
            hash_resp.hash_string
        );

        log::info!("Create session string {}", session_string);

        Ok(Response::new(SessionStringResponse { session_string }))
    }

    async fn verify(
        &self,
        request: tonic::Request<VerifySessionRequest>,
    ) -> Result<tonic::Response<VerifySessionResponse>, Status> {
        let r = request.into_inner();

        let parse_resp = self
            .parse(Request::new(ParseRequest {
                session_string: r.session_string,
            }))
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .into_inner();

        let acount_data_resp = self
            .account_data(Request::new(AccountDataRequest {
                username: parse_resp.username.clone(),
                uuid: parse_resp.uuid,
            }))
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .into_inner();

        let hash_resp = self
            .hash(Request::new(HashRequest {
                string: acount_data_resp.account_data,
            }))
            .await
            .map_err(|e| Status::internal(e.to_string()))?
            .into_inner();

        log::info!("Vefify user {}", parse_resp.username);

        Ok(Response::new(VerifySessionResponse {
            verify: hash_resp.hash_string == parse_resp.session_hash,
        }))
    }

    async fn parse(
        &self,
        request: tonic::Request<ParseRequest>,
    ) -> Result<tonic::Response<ParseResponse>, Status> {
        let r = request.into_inner();

        let mut session_data = r
            .session_string
            .split(confidential::SEPARATOR)
            .map(|s| s.to_string())
            .collect::<Vec<String>>();

        if session_data.len() != 3 {
            return Err(Status::invalid_argument("invalid request input"));
        }

        log::info!(
            "Parse session string {} {} {}",
            session_data[0],
            session_data[1],
            session_data[2]
        );

        Ok(Response::new(ParseResponse {
            username: session_data.remove(0),
            uuid: session_data.remove(0),
            session_hash: session_data.remove(0),
        }))
    }

    async fn hash(
        &self,
        request: tonic::Request<HashRequest>,
    ) -> Result<tonic::Response<HashResponse>, Status> {
        let r = request.into_inner();

        let mut hasher = Sha256::new();

        hasher.update(confidential::APP_SECRET);
        hasher.update(r.string.clone());
        hasher.update(confidential::APP_SECRET);

        let hash_string = format!("{:X}", hasher.finalize());

        log::info!("hash string {} to {}", r.string, hash_string);

        Ok(Response::new(HashResponse { hash_string }))
    }

    async fn account_data(
        &self,
        request: tonic::Request<AccountDataRequest>,
    ) -> Result<tonic::Response<AccountDataResponse>, Status> {
        let r = request.into_inner();

        Ok(Response::new(AccountDataResponse {
            account_data: format!("{}{}{}", r.username, confidential::SEPARATOR, r.uuid),
        }))
    }
}
