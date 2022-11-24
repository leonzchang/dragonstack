pub mod breeder;
pub mod common;
pub mod config;
pub mod sqlx_postgres;

// protos
pub mod authsdk {
    tonic::include_proto!("authsdk");

    pub use auth_service_client::AuthServiceClient;
    pub use auth_service_server::{AuthService as AuthServiceTrait, AuthServiceServer};
}
