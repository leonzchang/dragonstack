use ds_core::{
    common::Dragon,
    config::{HOUR, REFRESH_RATE, SECOND},
    sqlx_postgres::{ds_management as db, sqlx::PgPool},
};

use std::{collections::HashSet, sync::Arc, time::Duration};

use actix_web::{
    error::{ErrorBadRequest, ErrorInternalServerError},
    get,
    web::{self, Data},
    Error, HttpResponse, Responder,
};
use chrono::{DateTime, TimeZone, Utc};
use rand::Rng;
use serde::Serialize;
use tokio::sync::RwLock;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("generation").service(generation));
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Generation {
    pub expiration: DateTime<Utc>,
    pub generation_id: Option<i32>,
    pub account_ids: HashSet<i32>,
}

impl Generation {
    pub fn new() -> Self {
        Self {
            expiration: Self::calculate_expiration(),
            generation_id: None,
            account_ids: HashSet::new(),
        }
    }

    fn calculate_expiration() -> DateTime<Utc> {
        let mut rng = rand::thread_rng();
        let random_number = rng.gen_range(0.0..1.0);
        let refresh_rate = (REFRESH_RATE * SECOND) as f32;
        let expiration_period = random_number * (refresh_rate / 2.0f32).floor();

        let time_until_expiration = if random_number < 0.5 {
            (refresh_rate - expiration_period) as i64
        } else {
            (refresh_rate + expiration_period) as i64
        };

        let expired_time = Utc::now().timestamp_millis() + time_until_expiration;
        Utc.timestamp_millis(expired_time)
    }

    pub fn new_dragon(&mut self, account_id: i32) -> Result<Dragon, Error> {
        if Utc::now() > self.expiration {
            return Err(ErrorBadRequest("This generation expired already"));
        }

        if self.account_ids.contains(&account_id) {
            return Err(ErrorBadRequest(
                "You already have dragon from this generation",
            ));
        }

        self.account_ids.insert(account_id);
        Ok(Dragon::new(self.generation_id, None, None))
    }
}

#[get("/")]
async fn generation(
    generation_egine: Data<Arc<RwLock<GenerationEgine>>>,
) -> Result<impl Responder, Error> {
    let engine = generation_egine.read().await.clone();
    let Some(generation) = engine.generation else {return Err(ErrorInternalServerError("generation engine goes wrong.")) };

    Ok(HttpResponse::Ok().json(generation))
}

#[derive(Serialize, Clone, Debug)]
pub struct GenerationEgine {
    pub generation: Option<Generation>,
}

impl GenerationEgine {
    pub fn new() -> Self {
        Self { generation: None }
    }

    pub async fn build_new_generation(engine: Arc<RwLock<Self>>, conn: &PgPool) {
        loop {
            let mut new_generation = Generation::new();

            let generation_id = db::store_generation(conn, &new_generation.expiration)
                .await
                .unwrap();
            new_generation.generation_id = Some(generation_id);
            log::info!("new generation {:?}", new_generation);

            {
                let mut engine = engine.write().await;
                engine.generation = Some(new_generation.clone());
            }

            // delay to next generation
            tokio::time::sleep(Duration::from_millis(
                (new_generation.expiration.timestamp_millis() - Utc::now().timestamp_millis())
                    as u64,
            ))
            .await;
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn radom_number() {
        let mut rng = rand::thread_rng();
        let radom_number = rng.gen_range(0.0..1.0);
        let refresh_rate = (REFRESH_RATE * SECOND) as f32;
        let expiration_period = radom_number * (refresh_rate / 2.0f32).floor();
        let time_until_expiration = if radom_number < 0.5 {
            (refresh_rate - expiration_period) as i64
        } else {
            (refresh_rate + expiration_period) as i64
        };

        let expired_time = Utc::now().timestamp_millis() + time_until_expiration;
        let a = Utc::now();
        let b = Utc.timestamp_millis(expired_time);
        println!("{}", a);

        println!("{}", b);
        if a > b {
            println!("yes")
        } else {
            println!("no")
        }
    }
}
