# 1PD Backend Docker Setup

## Build the Docker Image

```bash
cd 1pd-be
docker build -t 1pd-be:production -f docker/Dockerfile.production .
```

## Deploy to AWS Fargate

### 1. Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create repository (if needed)
aws ecr create-repository --repository-name 1pd-be --region us-east-1

# Tag & push image
docker tag 1pd-be:production YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/1pd-be:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/1pd-be:latest
```

### 2. Create Task Definition

- ECS → Task Definitions → Create new Task Definition
- Fargate launch type
- Task size: 1 vCPU, 2GB memory
- Container:
  - Image: YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/1pd-be:latest
  - Port mappings: 3000:3000
  - Environment variables: Add required variables (see below)

### 3. Create ECS Service

- ECS → Clusters → Create Service
- Launch type: Fargate
- Number of tasks: 1
- Networking: Private subnet, allow port 3000 from ALB
- Load balancer: Add to ALB, health check path: /health

### 4. Set up Secrets (optional)

```bash
# Create secrets
aws secretsmanager create-secret --name 1pd/db-credentials \
  --secret-string '{"POSTGRES_USER":"username","POSTGRES_PASSWORD":"password"}'

# Reference in Task Definition
"secrets": [
  {
    "name": "POSTGRES_USER",
    "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:1pd/db-credentials:POSTGRES_USER::"
  }
]
```

## Required Environment Variables

### Database

- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`,
  `POSTGRES_DATABASE`
- `RUN_MIGRATIONS` (set to "true" to run migrations)

### Auth0

- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`
- `JWT_SECRET`

### Admin

- `ADMIN_COMPANY_NAME`, `ADMIN_COMPANY_USER`, `ADMIN_COMPANY_PASS`

### Upload Storage

- `UPLOADS_STORAGE_PROVIDER` ('local' or 's3')
- `APP_URL` (required for local storage)

### S3 Storage (if using s3)

- `UPLOADS_AWS_REGION`, `UPLOADS_AWS_ACCESS_KEY_ID`
- `UPLOADS_AWS_SECRET_ACCESS_KEY`, `UPLOADS_AWS_S3_DEFAULT_BUCKET_NAME`

## Docker Optimizations

Our Docker setup is optimized for both development and production:

1. **Multi-stage builds**: Reduces final image size by separating build and
   runtime environments
2. **Layer caching**: Package files are copied before source code to leverage
   Docker's caching mechanism
3. **Security enhancements**:
   - Non-root user for running the application
   - Minimal required dependencies in the production image
   - Sensitive files excluded via `.dockerignore`
4. **Build dependencies**:
   - Build tools are only included when necessary for native compilation
   - The default build doesn't include extra tools to keep images small
   - If native compilation is needed (e.g., for `pg` or cryptographic packages),
     tools can be added to the Dockerfile
5. **Node.js version**:
   - Using Node.js 22 LTS (codename 'Jod') for improved performance and extended
     support
   - Active LTS support until October 21, 2025
   - Maintenance support until April 30, 2027
   - Benefits from latest security updates and performance improvements

## Health Checks

The application uses NestJS Terminus for comprehensive health monitoring:

- **Database Connection**: Verifies the PostgreSQL connection is active
- **Disk Storage**: Monitors disk usage (alerts at 90% usage)
- **Memory Usage**: Tracks heap and RSS memory consumption
- **Response Format**: Detailed JSON with status of all system components

Health checks are accessible at `/health` and integrated with Docker:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health || exit 1
```

AWS Fargate uses this health check to monitor container status and automatically
restart if unhealthy.

## Scale Later (when needed)

```bash
# View service details
aws ecs describe-services --cluster your-cluster --services 1pd-be-service

# Update service to scale up
aws ecs update-service --cluster your-cluster --service 1pd-be-service --desired-count 2
```

## Local Testing: Run the Backend Container with Host Database

To test the backend container locally and connect to a PostgreSQL database
running on your host machine, use the following command:

```sh
docker run --env-file 1pd-be/.env \
  -e POSTGRES_HOST=host.docker.internal \
  -d -p 5005:5005 \
  --name 1pd-be-test \
  127214158365.dkr.ecr.eu-west-1.amazonaws.com/1pd-be:latest
```

- `--env-file 1pd-be/.env` loads environment variables from your `.env` file.
- `-e POSTGRES_HOST=host.docker.internal` ensures the container can connect to a
  database running on your host (works on Mac/Windows; for Linux, use your
  host's IP address).
- `-d` runs the container in detached mode.
- `-p 5005:5005` maps the container's port 5005 to your host.
- `--name 1pd-be-test` names the container for easy reference.
- The last argument is your backend image tag.

**Note:** Ensure your database is accessible from the container and the
credentials in `.env` match your local database setup.
