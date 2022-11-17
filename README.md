# DragonStack
A full-stack e-commerce site with with Node.js, PostgreSQL, React, Redux, RESTful API, authentication to interact with dragons. 
### [DEMO](https://dragonstackfront.herokuapp.com/)

# Getting Started
## Rust-Backend
Make sure an active instance of PostgresSQL is running with default port 5432, or here we start an instance with Docker.

Set up postgresql docker:

1. Pull postgres docker image: 
   
    ```bash
    docker pull postgres
    ```

2. Start postgres service: 
    ```bash
    docker run --name postgres \
        -p 5432:5432 \
        -e POSTGRES_USER="Your postgres Username" \
        -e POSTGRES_PASSWORD="Your postgres User Password" \
        -d  postgres
    ```

3. Modify `APP_SECRET` string for hash encryption in [config.rs](https://github.com/leonzchang/dragonstack/blob/master/rust-backend/core/src/config.rs) (optional)

Start backend server: 
```bash
RUST_BACKTRACE=1 RUST_LOG=info,sqlx=error cargo run --bin ds DATABASE_URL=postgres://"Your postgres Username":"Your postgres User Password"@localhost:5432/dragonstack?sslmode=disable mono
```

- Backend service will start at http://localhost:3000/

## Node-Backend
Make sure an active instance of PostgresSQL is running with default port 5432, or here we start an instance with Docker.

Set up postgresql docker:

1. Pull postgres docker image: 
   
    ```bash
    docker pull postgres
    ```

2. Start postgres service: 
    ```bash
    docker run --name mypostgres \
        -p 5432:5432 \
        -e POSTGRES_USER="Your postgres Username" \
        -e POSTGRES_PASSWORD="Your postgres User Password" \
        -d  postgres
    ```

3. Change line `export PGPASSWORD="Your postgres User Password"` in [configure_db.sh](https://github.com/leonzchang/dragonstack/tree/master/node-backend/bin/configure_db.sh), setup postgres schema by running command:
    ```bash
    yarn configure
    ```
4. Change line ` user: 'Your postgres Username'` and `password: 'Your postgres User Password'` to your postgres username and password in [databaseConfiguration.ts](https://github.com/leonzchang/dragonstack/tree/master/node-backend/bin/databaseConfiguration.ts)
5. Modify string for hash encryption in [index.ts](https://github.com/leonzchang/dragonstack/tree/master/node-backend/bin/index.ts) (optional)

Start backend server: 
```bash
yarn start
```
- Backend service will start at [http://localhost:3000/]( http://localhost:3000/)

## Frontend
Start frontend application: 
```bash 
yarn dev
```

- Frontend application will start at [http://localhost:1234/]( http://localhost:1234/)
  

Build for production: 
```bash  
yarn build
```


## Testing
There is currently no testing on this project.

Currently using [typescript](https://www.typescriptlang.org/), [eslint](https://eslint.org/) and [prettier](https://prettier.io/) to improve code quality for development.

With [husky](https://typicode.github.io/husky/#/)'s git hooks and [lint-staged](https://github.com/okonet/lint-staged), automatically run prettier, eslint and typescript-eslint before pushing commits.

To manually start the check, run:
```bash 
yarn format && yarn lint
```



## Future tech
- [x] Typescript
- [x] Webpack bundle
- [x] redux-toolkit slice to rewrite redux structure
- [x] Functional Component with hooks to rewrite Class Component
- [x] prettier, eslint, husky, lint-staged
- [ ] Nextjs
- [ ] Jest
- [ ] ...

Ideas on the Udemy course: [Master Full-Stack Web Development | Node, SQL, React, & More](https://www.udemy.com/course/full-stack/)






