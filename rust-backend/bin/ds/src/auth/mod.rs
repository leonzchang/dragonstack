use crate::api::Message;
use ds_core::{
    common::AccountInfo,
    config::{APP_SECRET, COOKIE_NAME, SEPARATOR},
    sqlx_postgres::{ds_management as db, sqlx::PgPool},
};

use actix_web::{
    cookie::{time::Duration, Cookie},
    error::ErrorInternalServerError,
    Error, HttpResponse, Responder,
};
use serde::Serialize;
use sha2::{Digest, Sha256};
use uuid::Uuid;

pub fn hash(s: &str) -> String {
    let mut hasher = Sha256::new();

    hasher.update(APP_SECRET);
    hasher.update(s);
    hasher.update(APP_SECRET);

    format!("{:X}", hasher.finalize())
}

pub struct Session {
    username: String,
    id: String,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SessionInfo {
    pub username: String,
    pub id: String,
    pub session_hash: String,
}

impl Session {
    pub fn new(username: String) -> Self {
        let id = Uuid::new_v4().to_string();
        Self { username, id }
    }

    pub fn to_session_string(&self) -> String {
        Self::session_string(&self.username, &self.id)
    }

    pub fn parse(session_string: String) -> SessionInfo {
        let session_data = session_string
            .split(SEPARATOR)
            .map(|s| s.to_string())
            .collect::<Vec<String>>();

        SessionInfo {
            username: session_data[0].clone(),
            id: session_data[1].clone(),
            session_hash: session_data[2].clone(),
        }
    }

    pub fn verify(session_string: String) -> bool {
        let SessionInfo {
            username,
            id,
            session_hash,
        } = Self::parse(session_string);

        let account_data = Self::account_data(&username, &id);

        hash(&account_data) == session_hash
    }

    pub fn account_data(username: &str, id: &str) -> String {
        format!("{}{}{}", username, SEPARATOR, id)
    }

    pub fn session_string(username: &str, id: &str) -> String {
        let account_data = Self::account_data(username, id);

        format!("{}{}{}", account_data, SEPARATOR, hash(&account_data))
    }
}

pub async fn set_session(
    conn: &PgPool,
    username: &str,
    session_id: Option<&String>,
) -> Result<HttpResponse, Error> {
    if let Some(session_id) = session_id {
        let session_string = Session::session_string(username, session_id);
        set_session_cookie(&session_string, "session restored")
    } else {
        let session = Session::new(username.to_owned());
        let session_string = session.to_session_string();
        db::update_session_id(conn, Some(&session.id), &hash(username))
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

pub async fn authenticated_account(
    conn: &PgPool,
    session_string: Option<String>,
) -> Result<AuthenticatedAccountInfo, String> {
    let Some(session_string) = session_string else{ return Err("Invalid session".to_owned())};
    if !Session::verify(session_string.clone()) {
        return Err("Invalid session".to_owned());
    }

    let SessionInfo { username, id, .. } = Session::parse(session_string);

    let Some(account_info) = db::get_account(conn, &hash(&username))
        .await
        .map_err(|_|"get account error".to_owned())? else { return Err("Invalid session: does not match up user information".to_owned())};

    let Some(session_id) =  account_info.session_id.clone() else  { return Err("Invalid session: session should not be none".to_owned())};
    let authenticated = id == session_id;

    Ok(AuthenticatedAccountInfo {
        account: account_info,
        authenticated,
        username,
    })
}
