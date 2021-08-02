CREATE TABLE dragon(
    id             SERIAL PRIMARY KEY,
    birthdate      TIMESTAMP NOT NULL,
    nickname       VARCHAR(64),
    "isPublic"     BOOLEAN NOT NULL,
    "saleValue"    INTEGER Not Null,
    "sireValue"    INTEGER Not Null,
    "generationId" INTEGER,
    FOREIGN KEY ("generationId") REFERENCES generation(id)
);