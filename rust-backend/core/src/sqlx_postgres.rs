use crate::common::TraitsConfig;

use sqlx::{
    any::Any,
    migrate::{MigrateDatabase, Migrator},
    postgres::{PgPool, PgPoolOptions, PgQueryResult},
    Error as SqlxError,
};

// re-export
pub use sqlx;

pub static EMBEDDED_MIGRATE: Migrator = sqlx::migrate!();

pub async fn connect_and_migrate(database_url: &str, max_connections: u32) -> sqlx::Result<PgPool> {
    create_database(database_url).await?;
    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .connect(database_url)
        .await?;

    EMBEDDED_MIGRATE.run(&pool).await?;
    Ok(pool)
}

pub async fn create_database(uri: &str) -> sqlx::Result<()> {
    if !Any::database_exists(uri).await? {
        Any::create_database(uri).await
    } else {
        Ok(())
    }
}

pub fn ensure_affected(count: u64) -> impl FnOnce(PgQueryResult) -> sqlx::Result<()> {
    move |pg_done| {
        if pg_done.rows_affected() == count {
            Ok(())
        } else {
            Err(SqlxError::RowNotFound)
        }
    }
}

pub async fn init_traits(conn: &PgPool, traits: TraitsConfig) -> sqlx::Result<()> {
    let mut trait_vec: Vec<[String; 2]> = Vec::new();
    traits.types.iter().for_each(|t| {
        t.values
            .iter()
            .for_each(|v| trait_vec.push([format!("{:?}", t.kind), v.to_owned()]))
    });

    for pair in trait_vec {
        ds_management::insert_traits(conn, &pair[0], &pair[1]).await?;
    }

    Ok(())
}

pub mod ds_management {
    use super::ensure_affected;
    use crate::{
        common::{AccountInfo, Dragon, DragonInfo, TraitType},
        config::INITAL_BALANCE,
    };
    use chrono::{DateTime, Utc};
    use sqlx::{
        postgres::{PgQueryResult, PgRow},
        Row,
    };
    use std::convert::TryFrom;

    impl TryFrom<PgRow> for DragonInfo {
        type Error = sqlx::Error;
        fn try_from(row: PgRow) -> Result<Self, Self::Error> {
            Ok(Self {
                birthdate: row.get(0),
                nickname: row.get(1),
                generation_id: row.get(2),
                is_public: row.get(3),
                sale_value: row.get(4),
                sire_value: row.get(5),
            })
        }
    }

    impl TryFrom<PgRow> for TraitType {
        type Error = sqlx::Error;
        fn try_from(row: PgRow) -> Result<Self, Self::Error> {
            Ok(Self {
                trait_type: row.get(0),
                trait_value: row.get(1),
            })
        }
    }

    impl TryFrom<PgRow> for AccountInfo {
        type Error = sqlx::Error;
        fn try_from(row: PgRow) -> Result<Self, Self::Error> {
            Ok(Self {
                id: row.get(0),
                password_hash: row.get(1),
                session_id: row.get(2),
                balance: row.get(3),
            })
        }
    }

    pub async fn store_generation<'e, T>(
        conn: T,
        expiration: &DateTime<Utc>,
    ) -> Result<i32, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                INSERT INTO generation 
                (expiration) 
                VALUES ($1)
                RETURNING id
            "#,
        )
        .bind(expiration)
        .map(|row: PgRow| row.get::<i32, _>(0))
        .fetch_one(conn)
        .await
    }

    pub async fn insert_traits<'e, T>(
        conn: T,
        trait_type: &str,
        trait_value: &str,
    ) -> Result<PgQueryResult, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                INSERT INTO trait("traitType", "traitValue")
                SELECT $1, $2
                WHERE NOT EXISTS (
                SELECT id FROM trait WHERE "traitType" = $1 AND "traitValue"=$2
                )
            "#,
        )
        .bind(trait_type)
        .bind(trait_value)
        .execute(conn)
        .await
    }

    pub async fn store_dragon<'e, T: Clone>(conn: T, dragon: Dragon) -> Result<i32, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        let dragon_id = sqlx::query(
            r#"
                INSERT INTO dragon(birthdate, nickname, "generationId", "isPublic", "saleValue", "sireValue") 
                VALUES($1, $2, $3, $4, $5, $6) RETURNING id
            "#,
        )
        .bind(dragon.birthdate)
        .bind(dragon.nickname.clone())
        .bind(dragon.generation_id)
        .bind(dragon.is_public)
        .bind(dragon.sale_value)
        .bind(dragon.sire_value)
        .map(|row:PgRow| row.get(0))
        .fetch_one(conn.clone())
        .await?;

        for r#trait in dragon.traits {
            store_dragon_trait(
                conn.clone(),
                dragon_id,
                &r#trait.trait_type,
                &r#trait.trait_value,
            )
            .await?;
        }

        Ok(dragon_id)
    }

    pub async fn get_trait_id<'e, T>(
        conn: T,
        trait_type: &str,
        trait_value: &str,
    ) -> Result<i32, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                SELECT id FROM trait WHERE "traitType" = $1 AND "traitValue" = $2
            "#,
        )
        .bind(trait_type)
        .bind(trait_value)
        .map(|row: PgRow| row.get::<i32, _>(0))
        .fetch_one(conn)
        .await
    }

    pub async fn store_dragon_trait<'e, T: Clone>(
        conn: T,
        dragon_id: i32,
        trait_type: &str,
        trait_value: &str,
    ) -> Result<(), sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        let trait_id = get_trait_id(conn.clone(), trait_type, trait_value).await?;
        sqlx::query(
            r#"
                INSERT INTO dragonTrait("traitId","dragonId") VALUES($1, $2)
            "#,
        )
        .bind(trait_id)
        .bind(dragon_id)
        .execute(conn)
        .await
        .and_then(ensure_affected(1))
    }

    pub async fn get_dragon<'e, T>(conn: T, dragon_id: i32) -> Result<DragonInfo, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                SELECT id, birthdate, nickname, "generationId", "isPublic", "saleValue", "sireValue"
                FROM dragon 
                WHERE dragon.id = $1
            "#,
        )
        .bind(dragon_id)
        .try_map(DragonInfo::try_from)
        .fetch_one(conn)
        .await
    }

    pub async fn update_dragon<'e, T>(
        conn: T,
        dragon_id: i32,
        nickname: Option<String>,
        is_public: Option<bool>,
        sale_value: Option<i32>,
        sire_value: Option<i32>,
    ) -> Result<(), sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                UPDATE dragon SET nickname = $1, "isPublic" = $2, "saleValue" = $3, "sireValue" = $4
                WHERE id = $5
            "#,
        )
        .bind(nickname)
        .bind(is_public)
        .bind(sale_value)
        .bind(sire_value)
        .bind(dragon_id)
        .execute(conn)
        .await
        .and_then(ensure_affected(1))
    }

    pub async fn get_dragon_with_traits<'e, T: Clone>(
        conn: T,
        dragon_id: i32,
    ) -> Result<Dragon, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        let dragon_info = get_dragon(conn.clone(), dragon_id).await?;

        let traits = sqlx::query(
            r#"
                SELECT "traitType", "traitValue" 
                FROM trait 
                INNER JOIN dragonTrait ON trait.id = dragonTrait."traitId"
                WHERE dragonTrait."dragonId" = $1`,
            "#,
        )
        .bind(dragon_id)
        .try_map(TraitType::try_from)
        .fetch_all(conn)
        .await?;

        Ok(Dragon {
            traits,
            dragon_id: Some(dragon_id),
            birthdate: dragon_info.birthdate,
            nickname: dragon_info.nickname,
            generation_id: dragon_info.generation_id,
            is_public: dragon_info.is_public,
            sale_value: dragon_info.sale_value,
            sire_value: dragon_info.sire_value,
        })
    }

    pub async fn get_public_dragon<'e, T: Clone>(conn: T) -> Result<Vec<Dragon>, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        let ids = sqlx::query(
            r#"
                SELECT id FROM dragon WHERE "isPublic" = True
            "#,
        )
        .map(|row: PgRow| row.get::<i32, _>(0))
        .fetch_all(conn.clone())
        .await?;

        let mut dragons: Vec<Dragon> = Vec::new();
        for id in ids {
            let dragon = get_dragon_with_traits(conn.clone(), id).await?;
            dragons.push(dragon);
        }

        Ok(dragons)
    }

    pub async fn store_account_dragon<'e, T>(
        conn: T,
        account_id: i32,
        dragon_id: i32,
    ) -> Result<(), sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                INSERT INTO accountDragon("accountId","dragonId") VALUES($1,$2)
            "#,
        )
        .bind(account_id)
        .bind(dragon_id)
        .execute(conn)
        .await
        .and_then(ensure_affected(1))
    }

    pub async fn get_account_dragon<'e, T>(
        conn: T,
        account_id: i32,
    ) -> Result<Vec<i32>, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                SELECT "dragonId" FROM accountDragon where "accountId" = $1
            "#,
        )
        .bind(account_id)
        .map(|row: PgRow| row.get::<i32, _>(0))
        .fetch_all(conn)
        .await
    }

    pub async fn get_dragon_account<'e, T>(conn: T, dragon_id: i32) -> Result<i32, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                SELECT "accountId" FROM accountDragon WHERE "dragonId" = $1
            "#,
        )
        .bind(dragon_id)
        .map(|row: PgRow| row.get::<i32, _>(0))
        .fetch_one(conn)
        .await
    }

    pub async fn update_dragon_account<'e, T>(
        conn: T,
        account_id: i32,
        dragon_id: i32,
    ) -> Result<(), sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                UPDATE accountDragon SET "accountId" = $1 WHERE "dragonId" = $2
            "#,
        )
        .bind(account_id)
        .bind(dragon_id)
        .execute(conn)
        .await
        .and_then(ensure_affected(1))
    }

    pub async fn store_account<'e, T>(
        conn: T,
        username_hash: &str,
        password_hash: &str,
    ) -> Result<(), sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                INSERT INTO account("usernameHash", "passwordHash", balance) VALUES($1, $2, $3)
            "#,
        )
        .bind(username_hash)
        .bind(password_hash)
        .bind(INITAL_BALANCE)
        .execute(conn)
        .await
        .and_then(ensure_affected(1))
    }

    pub async fn get_account<'e, T>(
        conn: T,
        username_hash: &str,
    ) -> Result<Option<AccountInfo>, sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                SELECT id, "passwordHash","sessionId",balance FROM account WHERE "usernameHash" = $1
            "#,
        )
        .bind(username_hash)
        .try_map(AccountInfo::try_from)
        .fetch_optional(conn)
        .await
    }

    pub async fn update_session_id<'e, T>(
        conn: T,
        session_id: &str,
        username_hash: &str,
    ) -> Result<(), sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                UPDATE account SET "sessionId" = $1 WHERE "usernameHash" = $2
            "#,
        )
        .bind(session_id)
        .bind(username_hash)
        .execute(conn)
        .await
        .and_then(ensure_affected(1))
    }

    pub async fn update_balance<'e, T>(
        conn: T,
        value: i32,
        account_id: i32,
    ) -> Result<(), sqlx::Error>
    where
        T: sqlx::Executor<'e, Database = sqlx::postgres::Postgres>,
    {
        sqlx::query(
            r#"
                UPDATE account SET balance = balance + $1 WHERE id = $2
            "#,
        )
        .bind(value)
        .bind(account_id)
        .execute(conn)
        .await
        .and_then(ensure_affected(1))
    }
}
