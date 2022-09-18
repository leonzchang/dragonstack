#!/bin/bash

echo "Configuring  dragonstackdb"

export PGPASSWORD=123456

docker exec -t postgres dropdb -U postgresuser dragonstackdb
docker exec -t postgres createdb -U postgresuser dragonstackdb

docker exec -i postgres psql -U postgresuser dragonstackdb < ./bin/sql/account.sql
docker exec -i postgres psql -U postgresuser dragonstackdb < ./bin/sql/generation.sql
docker exec -i postgres psql -U postgresuser dragonstackdb < ./bin/sql/dragon.sql
docker exec -i postgres psql -U postgresuser dragonstackdb < ./bin/sql/trait.sql
docker exec -i postgres psql -U postgresuser dragonstackdb < ./bin/sql/dragonTrait.sql
docker exec -i postgres psql -U postgresuser dragonstackdb < ./bin/sql/accountDragon.sql

ts-node ./bin/insertTraits.ts

echo "dragonstackdb configured"