mod confidential;
mod grpc;

use crate::mono::{
    confidential::{AUTHORIZATION, BAERER},
    grpc::AuthService,
};
use ds_core::authsdk::AuthServiceServer;

use clap::Parser;
use tokio::runtime::Runtime;
use tonic::{service::interceptor::Interceptor, transport::Server, Request, Status};

#[derive(Debug, Parser)]
pub struct Opts {
    /// Host string in "${HOST}:${PORT}" format.
    #[clap(long, default_value = "127.0.0.1:3001", env = "AS_HOST")]
    host: String,

    /// Access token.
    #[clap(
        short,
        long,
        default_value = "authmeauthmeauthme",
        env = "AS_ACCESS_TOKEN"
    )]
    grpc_access_token: String,
}

#[derive(Clone)]
pub struct AuthServerInterceptor {
    token: String,
}

impl AuthServerInterceptor {
    pub fn new(token: &str) -> Self {
        Self {
            token: token.to_owned(),
        }
    }
}

impl Interceptor for AuthServerInterceptor {
    fn call(&mut self, req: Request<()>) -> Result<Request<()>, Status> {
        let validate_token = format!("{} {}", BAERER, &self.token);
        let req_token = match req.metadata().get(AUTHORIZATION) {
            Some(token) => token
                .to_str()
                .map_err(|_| Status::invalid_argument("Bad request"))?,
            None => return Err(Status::unauthenticated("Token not found")),
        };
        // jwt token validation
        if req_token != validate_token {
            return Err(Status::unauthenticated("Authorization failed"));
        }
        Ok(req)
    }
}

pub fn run(opts: Opts) -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    // Create the async runtime
    let rt = Runtime::new().unwrap();

    rt.block_on(async {
        let host = opts.host.parse().expect("opts host parse error");
        let server_interceptor = AuthServerInterceptor::new(&opts.grpc_access_token);
        let auth_service = AuthService::default();
        let auth_server = AuthServiceServer::with_interceptor(auth_service, server_interceptor);
        println!("AuthServer listening on {}", opts.host);

        let _ = Server::builder().add_service(auth_server).serve(host).await;
    });

    Ok(())
}
