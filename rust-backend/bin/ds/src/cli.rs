use crate::mono::Opts;

use clap::Parser;
use serde::Serialize;
use strum_macros::{Display, EnumString};

#[derive(Debug, Parser)]
#[clap(name = "DS", about = "DragonStack")]
pub struct Cli {
    #[clap(flatten)]
    pub base: BaseCli,

    #[clap(flatten)]
    pub shared_params: SharedParams,

    /// Subcommands
    #[clap(subcommand)]
    pub subcommand: Subcommand,
}

#[derive(Debug, Parser)]
pub struct BaseCli {
    /// Executing Environment
    #[clap(short, long, env = "DS_ENV", default_value = "dev")]
    pub env: Environment,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, EnumString, Display)]
pub enum Environment {
    #[strum(serialize = "dev", serialize = "develop")]
    Develop,
    #[strum(serialize = "stag", serialize = "staging")]
    Staging,
    #[strum(serialize = "prod", serialize = "production")]
    Production,
}

impl Environment {
    pub fn prod(&self) -> bool {
        matches!(self, Environment::Production)
    }

    pub fn dev(&self) -> bool {
        matches!(self, Environment::Develop)
    }

    pub fn staging(&self) -> bool {
        matches!(self, Environment::Staging)
    }
}

#[derive(Debug, Parser)]
pub enum Subcommand {
    /// Monolithic API
    Mono(Opts),
}

#[derive(Debug, Parser)]
pub struct SharedParams {
    /// Database connection
    #[clap(
        default_value = "postgres://postgres:123456@localhost:5432/dragonstack?sslmode=disable",
        env = "DS_POSTGRES"
    )]
    pub database_url: String,

    /// Database Pool Size
    #[clap(default_value = "5", env = "DS_POSTGRES_POOL_SIZE")]
    pub database_pool_size: u32,
}
