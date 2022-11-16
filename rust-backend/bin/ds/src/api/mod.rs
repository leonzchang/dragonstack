pub mod account;
pub mod dragon;
pub mod generation;

use ds_core::common::Dragon;

use actix_web::web::{self};
use serde::Serialize;

pub fn routes(scope: &'static str) -> impl FnOnce(&mut web::ServiceConfig) {
    move |config: &mut web::ServiceConfig| {
        config.service(
            web::scope(scope)
                .configure(crate::api::generation::config)
                .configure(crate::api::account::config)
                .configure(crate::api::dragon::config),
        );
    }
}

#[derive(Serialize, Clone, Debug)]
pub struct Dragons {
    pub dragons: Vec<Dragon>,
}

#[derive(Serialize, Clone, Debug)]
pub struct Message {
    pub message: String,
}

#[derive(Serialize)]
struct ErrorResponse {
    pub code: u16,
    pub r#type: String,
    pub message: String,
}
