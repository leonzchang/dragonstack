CREATE TABLE IF NOT EXISTS generation(
    id            SERIAL PRIMARY KEY,
    expiration    TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS dragon(
    id             SERIAL PRIMARY KEY,
    birthdate      TIMESTAMPTZ NOT NULL,
    nickname       VARCHAR(64),
    "isPublic"     BOOLEAN NOT NULL,
    "saleValue"    INTEGER Not Null,
    "sireValue"    INTEGER Not Null,
    "generationId" INTEGER,
    FOREIGN KEY ("generationId") REFERENCES generation(id)
);


CREATE TABLE IF NOT EXISTS trait(
    id             SERIAL PRIMARY KEY,
    "traitType"    VARCHAR NOT NULL,
    "traitValue"   VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
    id                SERIAL PRIMARY KEY,
    "usernameHash"    CHARACTER(64),
    "passwordHash"    CHARACTER(64),
    "sessionId"       CHARACTER(36),
    balance           INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS accountDragon(
    "accountId"      INTEGER REFERENCES account(id),
    "dragonId"       INTEGER REFERENCES dragon(id),
    PRIMARY KEY ("accountId","dragonId")
);

CREATE TABLE IF NOT EXISTS dragonTrait(
    "traitId"    INTEGER,
    "dragonId"   INTEGER,
    FOREIGN KEY ("traitId")  REFERENCES trait(id),
    FOREIGN KEY ("dragonId") REFERENCES dragon(id)
);


