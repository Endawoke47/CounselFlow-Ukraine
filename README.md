# Database

## Run DB locally

```
docker run -d \
 --name 1pd-postgres \
 -e POSTGRES_USER=root \
 -e POSTGRES_PASSWORD=root \
 -e POSTGRES_DB=1pd-dev \
 -v $PWD/postgresData:/var/lib/postgresql/data \
 -p 5432:5432 \
 postgres:17.2
```

## start app for dev

npm run start:dev

## Create migration

npm run migration:create --name=users

## Generate migration from DB

npm run migration:run
