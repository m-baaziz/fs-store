# FS Store

Simple File Storage application using GridFs (MongoDB) as a persistant file storage system.
This repository is compsed of 3 parts:
- web server
- web client
- CLI client

The web server and client were developped using NextJs Framework (NodeJS + ReactJS) ->
cf. /web

The cli client was developed in Rust ->
cf. /cli


Continuous Integration runs on Concourse (self hosted Concourse + Vault) -> cf. /ci

## Requirements

Simple use: 
- Docker & docker-compose

Developement & build:
- NodeJs (> 12.0)
- Rust (rustup, cargo )
- Concourse (+ Vault) for CI
- Docker & docker-compose for MongoDB and CI

## Getting Started

```
docker-compose build --no-cache

docker-compose up -d
```

visit http://localhost:3000 to use the web client

to use the CLI tool, connect to the container `cli`, and use `fs-store`:

```
docker-compose run cli

fs-store help

wget -O image.jpg https://picsum.photos/id/1057/200/300

fs-store --url http://web:3000 upload image.jpg

fs-store --url http://web:3000 list

fs-store --url http://web:3000 delete [id]

```

Note: By default, fs-store will try to reach `localhost`. However, while using the docker services, the web server will have `web` as a domain name. So we need to adapt the command using the `--url` option.

## Build

For development purposes, here is how to run the stack locally:

web ->

```
cd web

npm install

npm run build

npm start
```

cli ->

```
cd cli

cargo install --path .

./target/release/fs-store delete --help

```

Note: MongoDB is still needed to be started, either with a local mongod server or using the docker-compose.yml provided. MongoDB url can be changed in web/.env file.

In production, the CLI should be built and released for the correct target platform.
For the purpose of this exercise I prefered to use docker containerization to avoid platform issues.
