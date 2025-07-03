# 1PD Frontend Docker Setup for AWS Amplify

This directory contains the production Docker configuration for the 1PD frontend application, optimized for AWS Amplify deployment.

## Docker Build for Local Testing

While AWS Amplify will handle the build and deployment process in production, you can use this Dockerfile for local testing:

```bash
cd 1pd-fe
docker build -t 1pd-fe:production -f docker/Dockerfile.production .
```

## Extracting Build for Manual Deployment

If you need to extract the build artifacts for manual deployment to AWS Amplify:

```bash
# Build the image
docker build -t 1pd-fe:production -f docker/Dockerfile.production .

# Create a container from the image
docker create --name temp-container 1pd-fe:production

# Copy the build directory from the container to your local machine
docker cp temp-container:/build ./build

# Remove the temporary container
docker rm temp-container
```

## AWS Amplify Deployment

For AWS Amplify deployment, you typically don't need to use this Dockerfile at all. Instead:

1. Connect your GitHub repository to AWS Amplify
2. Configure your build settings in the Amplify console:

```yaml
# Example amplify.yml configuration
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - echo "REACT_APP_API_URL=$API_URL" >> .env.production
        - echo "REACT_APP_LOGGER_URL=$LOGGER_URL" >> .env.production
        - echo "REACT_APP_ENV=$APP_ENV" >> .env.production
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. Configure environment variables in the Amplify console:
   - API_URL
   - LOGGER_URL
   - APP_ENV

## Environment Variables

The following environment variables can be configured in AWS Amplify:

- `API_URL`: API endpoint URL (becomes `REACT_APP_API_URL` during build)
- `LOGGER_URL`: Logger service URL (becomes `REACT_APP_LOGGER_URL` during build)
- `APP_ENV`: Environment name - production, staging, etc. (becomes `REACT_APP_ENV` during build)

## Understanding the Dockerfile

The Dockerfile contains two stages:

1. **Builder Stage**: Compiles the React application
   - Uses Node.js 22 LTS (codename 'Jod') for a lightweight, high-performance build environment
   - Installs dependencies and builds the application
   - Provides long-term support until April 2027

2. **Static Assets Stage**: Contains only the built assets
   - Uses the empty `scratch` image - contains no OS, just files
   - Only includes the production-ready static files
   - Perfect for extracting to deploy to AWS Amplify

## Node.js Version

We use Node.js 22 LTS (codename 'Jod') for the build process, which provides:

- **Performance improvements** for faster builds and enhanced JavaScript execution
- **Active LTS support** until October 2025
- **Maintenance support** until April 2027
- **Enhanced ECMAScript support** for modern JavaScript features
- **Improved developer experience** with better error messages and debugging

## AWS Amplify Features

AWS Amplify provides several advantages:

- **CI/CD Pipeline**: Automatic builds and deployments
- **Preview Environments**: Preview feature branches
- **Global CDN**: Fast content delivery worldwide
- **Custom Domains**: Easy domain management
- **Environment Variables**: Simple configuration
- **Authentication**: Integration with AWS Cognito
- **Monitoring**: Performance metrics and logs 