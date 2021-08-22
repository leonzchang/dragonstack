#!/bin/bash

echo "Configuring  dragonstackdb"

export PGPASSWORD="Your postgres User Password"

docker exec -t mypostgres dropdb -U node_user dragonstackdb
docker exec -t mypostgres createdb -U node_user dragonstackdb

docker exec -i mypostgres psql -U node_user dragonstackdb < ./bin/sql/account.sql
docker exec -i mypostgres psql -U node_user dragonstackdb < ./bin/sql/generation.sql
docker exec -i mypostgres psql -U node_user dragonstackdb < ./bin/sql/dragon.sql
docker exec -i mypostgres psql -U node_user dragonstackdb < ./bin/sql/trait.sql
docker exec -i mypostgres psql -U node_user dragonstackdb < ./bin/sql/dragonTrait.sql
docker exec -i mypostgres psql -U node_user dragonstackdb < ./bin/sql/accountDragon.sql

ts-node ./bin/insertTraits.ts

echo "dragonstackdb configured"