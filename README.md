# 1pd-v2
Version 2 of 1PD


# Docker

## Prerequisites

- create aws cli profile with the name `1pd-staging`

## Docker frontend

- `cd gitRoot`
- `aws ecr get-login-password --region eu-west-1 --profile 1pd-staging | docker login --username AWS --password-stdin 127214158365.dkr.ecr.eu-west-1.amazonaws.com`
- `docker buildx build --platform=linux/amd64 -t 127214158365.dkr.ecr.eu-west-1.amazonaws.com/1pd-fe:$(git rev-parse HEAD) -f Dockerfile.1pd-fe --build-arg VITE_API_URL=/api --build-arg VITE_ENV=stage --progress=plain .`
- `docker push 127214158365.dkr.ecr.eu-west-1.amazonaws.com/1pd-fe:$(git rev-parse HEAD)`


## Docker backend

### Build

- `cd gitRoot`
- `aws ecr get-login-password --region eu-west-1 --profile 1pd-staging | docker login --username AWS --password-stdin 127214158365.dkr.ecr.eu-west-1.amazonaws.com`
- `docker buildx build --platform=linux/amd64 -t 127214158365.dkr.ecr.eu-west-1.amazonaws.com/1pd-be:$(git rev-parse HEAD) -f Dockerfile.1pd-be --progress=plain .`
- `docker push 127214158365.dkr.ecr.eu-west-1.amazonaws.com/1pd-be:$(git rev-parse HEAD)`

### Run

```
docker run -d \
  --name 1pd-be \
  --restart \
  --env-file ./1pd-be/.env \
  -p 5005:5005 \
  1pd-be:$(git rev-parse HEAD)
```