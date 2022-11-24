set dotenv-load

## frontend
# install husky
local-frontend-prepare:
    yarn && yarn prepare
# lint
local-frontend-lint:
    yarn lint
# prettier format
local-frontend-format:
    yarn format
# start local frontend
local-frontend:
    cd frontend && yarn && yarn dev

## backend
# start rust local backend
local-mono-backend:
    cd backend && RUST_BACKTRACE=1 RUST_LOG=info,sqlx=error cargo run --bin ds mono

## auth grpc server
# start rust local auth grpc server
local-mono-auth:
    cd backend && RUST_BACKTRACE=1 RUST_LOG=info,sqlx=error cargo run --bin ds-auth-grpc mono