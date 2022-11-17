mod api;
mod auth;
mod cli;
mod mono;

use clap::Parser;
use cli::{Cli, Subcommand::*};

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.subcommand {
        Mono(opts) => mono::run(cli.shared_params, opts),
    }
    .expect("main failed, debugging with panic backtrace...");

    Ok(())
}
