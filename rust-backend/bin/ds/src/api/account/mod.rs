use crate::{
    api::{Dragons, ErrorResponse, Message},
    auth::{
        authenticated_account, hash, set_session, AuthenticatedAccountInfo, Session, SessionInfo,
    },
};
use ds_core::{
    config::COOKIE_NAME,
    sqlx_postgres::{ds_management as db, sqlx::PgPool},
};

use actix_web::{
    error::{ErrorBadRequest, ErrorConflict, ErrorInternalServerError, ErrorUnauthorized},
    get,
    http::StatusCode,
    post,
    web::{self, Data},
    Error, HttpRequest, HttpResponse, Responder,
};
use serde::{Deserialize, Serialize};

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("account")
            .service(sign_up)
            .service(login)
            .service(logout)
            .service(authenticated_cookie)
            .service(dragons)
            .service(information),
    );
}
#[derive(Deserialize, Serialize)]
struct RegisterInfo {
    username: String,
    password: String,
}

#[post("/signup")]
async fn sign_up(
    register_info: web::Json<RegisterInfo>,
    conn: Data<PgPool>,
) -> Result<impl Responder, Error> {
    let RegisterInfo { username, password } = register_info.into_inner();
    let username_hash = hash(&username);
    let password_hash = hash(&password);

    match db::get_account(conn.get_ref(), &username_hash)
        .await
        .map_err(ErrorInternalServerError)?
    {
        None => db::store_account(conn.get_ref(), &username_hash, &password_hash)
            .await
            .map_err(ErrorInternalServerError)?,
        // Some(_) => return Err(ErrorConflict("This username has already been taken")),
        Some(_) => {
            return Ok(
                HttpResponse::build(StatusCode::CONFLICT).json(ErrorResponse {
                    code: 409,
                    r#type: "error".to_owned(),
                    message: "This username has already been taken".to_owned(),
                }),
            )
        }
    }

    set_session(conn.get_ref(), &username, None).await
}

#[post("/login")]
async fn login(
    register_info: web::Json<RegisterInfo>,
    conn: Data<PgPool>,
) -> Result<impl Responder, Error> {
    let RegisterInfo { username, password } = register_info.into_inner();
    let username_hash = hash(&username);
    let password_hash = hash(&password);

    match db::get_account(conn.get_ref(), &username_hash)
        .await
        .map_err(ErrorInternalServerError)?
    {
        None => Ok(
            HttpResponse::build(StatusCode::UNAUTHORIZED).json(ErrorResponse {
                code: 401,
                r#type: "error".to_owned(),
                message: "Incorrect username/password".to_owned(),
            }),
        ),

        Some(account) => {
            if account.password_hash == password_hash {
                set_session(conn.get_ref(), &username, account.session_id.as_ref()).await
            } else {
                Ok(
                    HttpResponse::build(StatusCode::UNAUTHORIZED).json(ErrorResponse {
                        code: 401,
                        r#type: "error".to_owned(),
                        message: "Incorrect username/password".to_owned(),
                    }),
                )
            }
        }
    }
}

#[derive(Serialize, Clone, Debug)]
pub struct LogoutReponse {
    message: String,
}
#[get("/logout")]
async fn logout(conn: Data<PgPool>, req: HttpRequest) -> Result<impl Responder, Error> {
    let Some(mut cookie) = req.cookie(COOKIE_NAME) else {return Err(ErrorBadRequest("Logout failed: no cookies."))};

    let SessionInfo { username, .. } = Session::parse(cookie.value().to_owned());

    // remove session id
    db::update_session_id(conn.get_ref(), None, &hash(&username))
        .await
        .map_err(ErrorInternalServerError)?;

    let mut resp = HttpResponse::Ok().json(LogoutReponse {
        message: "Successful logout".to_owned(),
    });

    // add a “removal” cookie to the response that matches attributes of given cookie
    // This will cause browsers/clients to remove stored cookies with this name.
    // req.cookie("cookie-name") this will not parse cookie's attributes
    cookie.set_path("/");
    resp.add_removal_cookie(&cookie)?;

    Ok(resp)
}

#[derive(Serialize, Clone, Debug)]
pub struct AuthenticatedResponse {
    authenticated: bool,
}
#[get("/authenticated")]
async fn authenticated_cookie(
    conn: Data<PgPool>,
    req: HttpRequest,
) -> Result<impl Responder, Error> {
    let cookie = req.cookie(COOKIE_NAME);
    let AuthenticatedAccountInfo { authenticated, .. } =
        authenticated_account(conn.get_ref(), cookie.map(|c| c.value().to_owned()))
            .await
            .map_err(ErrorUnauthorized)?;

    Ok(HttpResponse::Ok().json(AuthenticatedResponse { authenticated }))
}

#[get("/dragons")]
async fn dragons(conn: Data<PgPool>, req: HttpRequest) -> Result<impl Responder, Error> {
    let cookie = req.cookie(COOKIE_NAME);
    let AuthenticatedAccountInfo { account, .. } =
        authenticated_account(conn.get_ref(), cookie.map(|c| c.value().to_owned()))
            .await
            .map_err(ErrorUnauthorized)?;
    let account_dragons = db::get_account_dragon(conn.get_ref(), account.id)
        .await
        .map_err(ErrorInternalServerError)?;

    // spawn vec future
    let mut get_account_dragon_futures = Vec::new();

    for dragon_id in account_dragons {
        get_account_dragon_futures.push(db::get_dragon_with_traits(conn.get_ref(), dragon_id));
    }

    match futures::future::try_join_all(get_account_dragon_futures).await {
        Ok(dragons) => Ok(HttpResponse::Ok().json(Dragons { dragons })),
        Err(e) => Err(ErrorInternalServerError(e)),
    }
}

#[derive(Serialize, Clone, Debug)]
pub struct AccountInfo {
    info: AccountBasic,
}

#[derive(Serialize, Clone, Debug)]
pub struct AccountBasic {
    username: String,
    balance: i32,
}

#[get("/info")]
async fn information(conn: Data<PgPool>, req: HttpRequest) -> Result<impl Responder, Error> {
    let cookie = req.cookie(COOKIE_NAME);
    let AuthenticatedAccountInfo {
        username, account, ..
    } = authenticated_account(conn.get_ref(), cookie.map(|c| c.value().to_owned()))
        .await
        .map_err(ErrorUnauthorized)?;

    Ok(HttpResponse::Ok().json(AccountInfo {
        info: AccountBasic {
            username,
            balance: account.balance,
        },
    }))
}
