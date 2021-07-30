#!/bin/bash

echo "Configuring  dragonstackdb"

dropdb -U node_user dragonstackdb
createdb -U node_user dragonstackdb

psql -U node_user dragonstackdb < ./bin/sql/account.sql
psql -U node_user dragonstackdb < ./bin/sql/generation.sql
psql -U node_user dragonstackdb < ./bin/sql/dragon.sql
psql -U node_user dragonstackdb < ./bin/sql/trait.sql
psql -U node_user dragonstackdb < ./bin/sql/dragonTrait.sql

ts-node ./bin/insertTraits.ts

echo "dragonstackdb configured"