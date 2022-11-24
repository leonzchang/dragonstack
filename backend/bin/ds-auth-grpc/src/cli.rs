use crate::mono::Opts;

use clap::Parser;
use serde::Serialize;
use strum_macros::{Display, EnumString};

#[derive(Debug, Parser)]
#[clap(name = "AS", about = "AuthServer")]
pub struct Cli {
    #[clap(flatten)]
    pub base: BaseCli,

    /// Subcommands
    #[clap(subcommand)]
    pub subcommand: Subcommand,
}

#[derive(Debug, Parser)]
pub struct BaseCli {
    /// Executing Environment
    #[clap(short, long, env = "AS_ENV", default_value = "dev")]
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
