use crate::{
    api::{generation::GenerationEgine, Dragons, Message},
    auth::{authenticated_account, AuthenticatedAccountInfo},
};
use ds_core::{
    breeder::Breeder,
    config::COOKIE_NAME,
    sqlx_postgres::{ds_management as db, sqlx::PgPool},
};

use std::sync::Arc;

use actix_web::{
    error::{ErrorBadRequest, ErrorInternalServerError, ErrorUnauthorized},
    get, post, put,
    web::{self, Data},
    Error, HttpRequest, HttpResponse, Responder,
};
use serde::Deserialize;
use tokio::sync::RwLock;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("dragon")
            .service(new_dragon)
            .service(update_dragon)
            .service(public_dragon)
            .service(buy_dragon)
            .service(mate_dragon),
    );
}

#[get("/new")]
async fn new_dragon(
    conn: Data<PgPool>,
    req: HttpRequest,
    generation_egine: Data<Arc<RwLock<GenerationEgine>>>,
) -> Result<impl Responder, Error> {
    let cookie = req.cookie(COOKIE_NAME);
    let AuthenticatedAccountInfo { account, .. } =
        authenticated_account(conn.get_ref(), cookie.map(|c| c.value().to_owned()))
            .await
            .map_err(ErrorUnauthorized)?;

    // after write account id into egine's generation hash set free the read write lock
    let mut new_dragon = async {
        let mut engine = generation_egine.write().await;

        let  Some(res)= engine.generation.as_mut().map(| g|g
            .new_dragon(account.id))  else {return Err(ErrorInternalServerError("GenerationEgine or newDragon goes wrong"))};
        res
    }
    .await?;

    let new_dragon_id = db::store_dragon(conn.get_ref(), new_dragon.clone())
        .await
        .map_err(ErrorInternalServerError)?;

    new_dragon.dragon_id = Some(new_dragon_id);
    db::store_account_dragon(conn.get_ref(), account.id, new_dragon_id)
        .await
        .map_err(ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(new_dragon))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct UpdateDragonRequest {
    dragon_id: i32,
    nickname: Option<String>,
    is_public: Option<bool>,
    sale_value: Option<i32>,
    sire_value: Option<i32>,
}

#[put("/update")]
async fn update_dragon(
    conn: Data<PgPool>,
    body: web::Json<UpdateDragonRequest>,
) -> Result<impl Responder, Error> {
    let UpdateDragonRequest {
        dragon_id,
        nickname,
        is_public,
        sale_value,
        sire_value,
    } = body.into_inner();

    db::update_dragon(
        conn.get_ref(),
        dragon_id,
        nickname,
        is_public,
        sale_value,
        sire_value,
    )
    .await
    .map_err(ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(Message {
        message: "Successfully updated dragon".to_owned(),
    }))
}

#[get("/public-dragons")]
async fn public_dragon(conn: Data<PgPool>) -> Result<impl Responder, Error> {
    let dragons = db::get_public_dragon(conn.get_ref())
        .await
        .map_err(ErrorInternalServerError)?;

    Ok(HttpResponse::Ok().json(Dragons { dragons }))
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BuyDragonRequest {
    dragon_id: i32,
    sale_value: i32,
}
#[post("/buy")]
async fn buy_dragon(
    conn: Data<PgPool>,
    body: web::Json<BuyDragonRequest>,
    req: HttpRequest,
) -> Result<impl Responder, Error> {
    let BuyDragonRequest {
        dragon_id,
        sale_value,
    } = body.into_inner();

    let dragon_info = db::get_dragon(conn.get_ref(), dragon_id)
        .await
        .map_err(ErrorInternalServerError)?;

    if sale_value != dragon_info.sale_value {
        return Err(ErrorBadRequest("Sale value is not correct"));
    }

    if !dragon_info.is_public {
        return Err(ErrorBadRequest("Dragon must be public"));
    }

    let cookie = req.cookie(COOKIE_NAME);
    let AuthenticatedAccountInfo {
        account,
        authenticated,
        ..
    } = authenticated_account(conn.get_ref(), cookie.map(|c| c.value().to_owned()))
        .await
        .map_err(ErrorUnauthorized)?;

    if !authenticated {
        return Err(ErrorUnauthorized("Unauthenticated"));
    }

    if sale_value > account.balance {
        return Err(ErrorBadRequest("Sale value exceeds balance"));
    }

    let buyer_id = account.id;
    let seller_id = db::get_dragon_account(conn.get_ref(), dragon_id)
        .await
        .map_err(ErrorInternalServerError)?;

    if seller_id == buyer_id {
        return Err(ErrorBadRequest("Can not buy your own dragon"));
    }

    match futures::try_join!(
        db::update_balance(conn.get_ref(), sale_value.saturating_neg(), buyer_id),
        db::update_balance(conn.get_ref(), sale_value, seller_id),
        db::update_dragon_account(conn.get_ref(), buyer_id, dragon_id),
        db::update_dragon(conn.get_ref(), dragon_id, None, Some(false), None, None),
    ) {
        Ok(_) => Ok(HttpResponse::Ok().json(Message {
            message: "Success!".to_owned(),
        })),
        Err(e) => Err(ErrorInternalServerError(e)),
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MateDragonRequest {
    matron_dragon_id: i32,
    patron_dragon_id: i32,
}
#[post("/mate")]
async fn mate_dragon(
    conn: Data<PgPool>,
    body: web::Json<MateDragonRequest>,
    req: HttpRequest,
) -> Result<impl Responder, Error> {
    let MateDragonRequest {
        matron_dragon_id,
        patron_dragon_id,
    } = body.into_inner();

    let cookie = req.cookie(COOKIE_NAME);
    let AuthenticatedAccountInfo {
        account,
        authenticated,
        ..
    } = authenticated_account(conn.get_ref(), cookie.map(|c| c.value().to_owned()))
        .await
        .map_err(ErrorUnauthorized)?;

    if !authenticated {
        return Err(ErrorUnauthorized("Unauthenticated"));
    }

    if matron_dragon_id == patron_dragon_id {
        return Err(ErrorBadRequest("Can not breed with same dragon"));
    }

    let matron = db::get_dragon_with_traits(conn.get_ref(), matron_dragon_id)
        .await
        .map_err(ErrorBadRequest)?;

    let patron = db::get_dragon_with_traits(conn.get_ref(), patron_dragon_id)
        .await
        .map_err(ErrorBadRequest)?;

    if !patron.is_public {
        return Err(ErrorBadRequest("Dragon must be public"));
    }

    if patron.sire_value > account.balance {
        return Err(ErrorBadRequest("Sire value exceeds balance"));
    }

    let matron_account_id = account.id;
    let patron_account_id = db::get_dragon_account(conn.get_ref(), patron_dragon_id)
        .await
        .map_err(ErrorBadRequest)?;

    if matron_account_id == patron_account_id {
        return Err(ErrorBadRequest("Can not breed your own dragons"));
    }

    let baby_dragon = Breeder::breeder_dragon(matron, patron.clone()).map_err(ErrorBadRequest)?;

    let baby_dragon_id = db::store_dragon(conn.get_ref(), baby_dragon)
        .await
        .map_err(ErrorBadRequest)?;

    match futures::try_join!(
        db::update_balance(
            conn.get_ref(),
            patron.sire_value.saturating_neg(),
            matron_account_id
        ),
        db::update_balance(conn.get_ref(), patron.sire_value, patron_account_id),
        db::store_account_dragon(conn.get_ref(), matron_account_id, baby_dragon_id),
    ) {
        Ok(_) => Ok(HttpResponse::Ok().json(Message {
            message: "Success!".to_owned(),
        })),
        Err(e) => Err(ErrorInternalServerError(e)),
    }
}
