mod cli;
mod mono;

use clap::Parser;
use cli::{Cli, Subcommand::Mono};

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.subcommand {
        Mono(opts) => mono::run(opts),
    }
    .expect("main failed, debugging with panic backtrace...");

    Ok(())
}
