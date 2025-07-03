# Work In Progress....

# AWS Configuration
AWS_REGION ?= eu-west-1  # Ireland
PROFILE ?= 1pd
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --profile $(PROFILE) --query Account --output text --no-cli-pager | tr -d ' \t\n\r')
ECR_URL := $(strip $(AWS_ACCOUNT_ID)).dkr.ecr.$(strip $(AWS_REGION)).amazonaws.com

# GitHub Actions Configuration
GITHUB_REPO ?= Cheche-Technologies/1pd-v2
GITHUB_OIDC_PROVIDER_ARN := arn:aws:iam::$(AWS_ACCOUNT_ID):oidc-provider/token.actions.githubusercontent.com

# Amplify Configuration
AMPLIFY_APP_NAME ?= 1pd-fe-$(ENVIRONMENT)
AMPLIFY_BRANCH ?= main
AMPLIFY_APP_ID ?= dy1kxlxhjujba

# Environment
ENVIRONMENT ?= staging

# ECR Configuration
ECR_REPOSITORY = 1pd-be
IMAGE_TAG ?= latest

# ECS Configuration
ECS_CLUSTER ?= 1pd-be-$(ENVIRONMENT)-cluster
ECS_SERVICE ?= 1pd-be-$(ENVIRONMENT)
ECS_TASK_FAMILY ?= 1pd-be-$(ENVIRONMENT)
ECS_CONTAINER_NAME ?= 1pd-be-$(ENVIRONMENT)
ECS_TASK_CPU ?= 256
ECS_TASK_MEMORY ?= 512
ECS_DESIRED_COUNT ?= 1

# Docker image name
DOCKER_IMAGE = $(ECR_URL)/$(ECR_REPOSITORY):$(IMAGE_TAG)

# Networking (set these to your actual AWS resource IDs)
VPC_ID ?= vpc-0e35afdf31cc94143
SUBNET_IDS ?= subnet-0d974ea2773b8182f
# SECURITY_GROUP_ID ?= sg-zzzzzz  # Removed

# Login to ECR
.PHONY: ecr-login
ecr-login:
	@echo "Logging into ECR..."
	@echo "aws ecr get-login-password --region $(AWS_REGION) --profile $(PROFILE) --no-cli-pager | docker login --username AWS --password-stdin \"$(ECR_URL)\""
	@aws ecr get-login-password --region $(AWS_REGION) --profile $(PROFILE) --no-cli-pager | docker login --username AWS --password-stdin "$(ECR_URL)"

# Build backend Docker image
.PHONY: build-be-image
build-be-image:
	docker buildx build --platform=linux/amd64 -t $(ECR_URL)/$(ECR_REPOSITORY):$(shell git rev-parse HEAD) -f Dockerfile.1pd-be --progress=plain .

# Push backend image to ECR
.PHONY: push-be-image
push-be-image:
	docker push $(ECR_URL)/$(ECR_REPOSITORY):$(shell git rev-parse HEAD)

# Build and push backend image
.PHONY: upload-be-image
upload-be-image: ecr-login build-be-image push-be-image

# Create ECR repository if it doesn't exist
.PHONY: create-ecr-repo
create-ecr-repo:
	aws ecr describe-repositories --repository-names $(ECR_REPOSITORY) --region $(AWS_REGION) --profile $(PROFILE) --no-cli-pager 2>/dev/null || \
	aws ecr create-repository --repository-name $(ECR_REPOSITORY) --region $(AWS_REGION) --profile $(PROFILE) --no-cli-pager

# List all ECR repositories
.PHONY: list-repos
list-repos:
	@echo "ECR Repositories in $(AWS_REGION):"
	@echo "aws ecr describe-repositories --region $(AWS_REGION) --profile $(PROFILE) --query 'repositories[*].repositoryName' --output table --no-cli-pager"
	@aws ecr describe-repositories --region $(AWS_REGION) --profile $(PROFILE) --query 'repositories[*].repositoryName' --output table --no-cli-pager

# List images in the backend repository
.PHONY: list-images
list-images:
	@echo "Images in $(ECR_REPOSITORY):"
	@aws ecr describe-images --repository-name $(ECR_REPOSITORY) --region $(AWS_REGION) --profile $(PROFILE) \
		--query 'imageDetails[*].[imageTags[0],imagePushedAt,imageSizeInBytes]' \
		--output table \
		--no-cli-pager

# Create ECS service-linked role
.PHONY: create-ecs-role
create-ecs-role:
	@echo "Creating ECS service-linked role..."
	@aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com --profile $(PROFILE) --no-cli-pager 2>/dev/null || true

# Create ECS Task Execution Role
.PHONY: create-ecs-role-policy
create-ecs-role-policy:
	@echo "Creating ECS Task Execution Role..."
	@aws iam get-role --role-name ecsTaskExecutionRole --profile $(PROFILE) --region $(AWS_REGION) --no-cli-pager || \
	aws iam create-role --role-name ecsTaskExecutionRole \
	--assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
	--profile $(PROFILE) --region $(AWS_REGION) --no-cli-pager
	@aws iam attach-role-policy --role-name ecsTaskExecutionRole \
	--policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
	--profile $(PROFILE) --region $(AWS_REGION) --no-cli-pager

# Create ECS cluster if it doesn't exist
.PHONY: create-ecs-cluster
create-ecs-cluster:
	@echo "Checking if cluster exists..."
	@if ! aws ecs list-clusters --region $(AWS_REGION) --profile $(PROFILE) --no-cli-pager | grep -q "cluster/$(ECS_CLUSTER)"; then \
		echo "Creating ECS cluster: $(ECS_CLUSTER)"; \
		aws ecs create-cluster \
			--cluster-name $(ECS_CLUSTER) \
			--capacity-providers FARGATE FARGATE_SPOT \
			--default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
			--region $(AWS_REGION) \
			--profile $(PROFILE) \
			--no-cli-pager; \
	else \
		echo "ECS cluster '$(ECS_CLUSTER)' already exists"; \
	fi

# Get default VPC ID
.PHONY: get-default-vpc
get-default-vpc:
	@aws ec2 describe-vpcs \
		--filters Name=isDefault,Values=true \
		--query 'Vpcs[0].VpcId' \
		--output text \
		--profile $(PROFILE) \
		--region $(AWS_REGION) \
		--no-cli-pager

# Get default subnets
.PHONY: get-default-subnets
get-default-subnets:
	@aws ec2 describe-subnets \
		--filters Name=vpc-id,Values=$(shell make get-default-vpc) Name=default-for-az,Values=true \
		--query 'Subnets[*].SubnetId' \
		--output text \
		--profile $(PROFILE) \
		--region $(AWS_REGION) \
		--no-cli-pager | tr -s '[:space:]' ',' | sed 's/[,[:space:]]*$$//g'

# Get default security group
.PHONY: get-default-sg
get-default-sg:
	@aws ec2 describe-security-groups \
		--filters Name=vpc-id,Values=$(shell make get-default-vpc) Name=group-name,Values=default \
		--query 'SecurityGroups[0].GroupId' \
		--output text \
		--profile $(PROFILE) \
		--region $(AWS_REGION) \
		--no-cli-pager

# Register new ECS task definition
.PHONY: register-task
register-task:
	aws ecs register-task-definition \
		--family $(ECS_TASK_FAMILY) \
		--requires-compatibilities FARGATE \
		--network-mode awsvpc \
		--cpu $(ECS_TASK_CPU) \
		--memory $(ECS_TASK_MEMORY) \
		--execution-role-arn arn:aws:iam::$(AWS_ACCOUNT_ID):role/ecsTaskExecutionRole \
		--container-definitions '[ \
			{ \
				"name": "$(ECS_CONTAINER_NAME)", \
				"image": "$(DOCKER_IMAGE)", \
				"portMappings": [{ "containerPort": 3000, "protocol": "tcp" }], \
				"healthCheck": { \
					"command": ["CMD-SHELL", "wget -qO- http://localhost:3000/health || exit 1"], \
					"interval": 30, \
					"timeout": 5, \
					"retries": 3, \
					"startPeriod": 60 \
				}, \
				"essential": true \
			} \
		]' \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--no-cli-pager

# Create ECS service with default VPC
.PHONY: create-service
create-service:
	aws ecs create-service \
		--cluster $(ECS_CLUSTER) \
		--service-name $(ECS_SERVICE) \
		--task-definition $(ECS_TASK_FAMILY) \
		--desired-count $(ECS_DESIRED_COUNT) \
		--launch-type FARGATE \
		--network-configuration "awsvpcConfiguration={subnets=[$(SUBNET_IDS)],assignPublicIp=ENABLED}" \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--no-cli-pager || true

# Deregister old task definitions
.PHONY: cleanup-old-tasks
cleanup-old-tasks:
	@echo "Cleaning up old task definitions..."
	@aws ecs list-task-definitions \
		--family-prefix $(ECS_TASK_FAMILY) \
		--status ACTIVE \
		--sort DESC \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--query 'taskDefinitionArns[1:]' \
		--output text \
		--no-cli-pager | tr -s '[:space:]' '\n' | while read arn; do \
		if [ ! -z "$$arn" ]; then \
			echo "Deregistering $$arn"; \
			aws ecs deregister-task-definition \
				--task-definition "$$arn" \
				--region $(AWS_REGION) \
				--profile $(PROFILE) \
				--no-cli-pager >/dev/null; \
		fi \
	done

# Check task status
.PHONY: check-tasks
check-tasks:
	@echo "Checking running tasks..."
	@aws ecs list-tasks \
		--cluster $(ECS_CLUSTER) \
		--service-name $(ECS_SERVICE) \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--query 'taskArns[]' \
		--output text \
		--no-cli-pager | tr -s '[:space:]' '\n' | while read task_arn; do \
		if [ ! -z "$$task_arn" ]; then \
			echo "\nTask details for: $$task_arn"; \
			aws ecs describe-tasks \
				--cluster $(ECS_CLUSTER) \
				--tasks $$task_arn \
				--region $(AWS_REGION) \
				--profile $(PROFILE) \
				--query 'tasks[0].[taskDefinitionArn,lastStatus,stoppedReason,containers[0].lastStatus,containers[0].reason]' \
				--output text \
				--no-cli-pager; \
		fi \
	done

# Update ECS service
.PHONY: update-service
update-service:
	@echo "Checking service status..."
	@if aws ecs describe-services --cluster $(ECS_CLUSTER) --services $(ECS_SERVICE) --region $(AWS_REGION) --profile $(PROFILE) --query 'services[0].status' --output text --no-cli-pager 2>/dev/null | grep -q ACTIVE; then \
		echo "Updating existing service..."; \
		aws ecs update-service \
			--cluster $(ECS_CLUSTER) \
			--service $(ECS_SERVICE) \
			--task-definition $(ECS_TASK_FAMILY) \
			--desired-count $(ECS_DESIRED_COUNT) \
			--force-new-deployment \
			--network-configuration "awsvpcConfiguration={subnets=[$(SUBNET_IDS)],assignPublicIp=ENABLED}" \
			--region $(AWS_REGION) \
			--profile $(PROFILE) \
			--no-cli-pager; \
		echo "Waiting for deployment to stabilize..."; \
		while true; do \
			make service-status; \
			make check-tasks; \
			echo "\nWaiting for stable deployment (press Ctrl+C to stop watching)..."; \
			aws ecs wait services-stable \
				--cluster $(ECS_CLUSTER) \
				--services $(ECS_SERVICE) \
				--region $(AWS_REGION) \
				--profile $(PROFILE) \
				--no-cli-pager & \
			wait_pid=$$!; \
			sleep 10; \
			if ps -p $$wait_pid > /dev/null; then \
				kill $$wait_pid; \
			else \
				break; \
			fi; \
		done; \
		echo "Cleaning up old tasks..."; \
		make cleanup-old-tasks; \
	else \
		echo "Service not found or not active, creating new service..."; \
		make create-service; \
		echo "Waiting for service to become active..."; \
		while true; do \
			make service-status; \
			make check-tasks; \
			echo "\nWaiting for service to stabilize (press Ctrl+C to stop watching)..."; \
			aws ecs wait services-stable \
				--cluster $(ECS_CLUSTER) \
				--services $(ECS_SERVICE) \
				--region $(AWS_REGION) \
				--profile $(PROFILE) \
				--no-cli-pager & \
			wait_pid=$$!; \
			sleep 10; \
			if ps -p $$wait_pid > /dev/null; then \
				kill $$wait_pid; \
			else \
				break; \
			fi; \
		done; \
	fi

# Show ECS service status
.PHONY: service-status
service-status:
	@echo "\nECS Service Status:"
	@aws ecs describe-services \
		--cluster $(ECS_CLUSTER) \
		--services $(ECS_SERVICE) \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--query 'services[0].[serviceName,status,desiredCount,runningCount,pendingCount,events[0].message]' \
		--output table \
		--no-cli-pager

# Create CloudWatch log group for ECS task logs
.PHONY: create-log-group
create-log-group:
	@echo "Creating CloudWatch log group for ECS tasks..."
	aws logs create-log-group --log-group-name /ecs/$(ECS_TASK_FAMILY) --region $(AWS_REGION) --profile $(PROFILE) --no-cli-pager 2>/dev/null || true
	@echo "Log group /ecs/$(ECS_TASK_FAMILY) created or already exists"

# Deploy to ECS Fargate
.PHONY: deploy-ecs
deploy-ecs: create-ecs-cluster create-ecs-role-policy create-log-group upload-be-image register-task update-service service-status cleanup-old-tasks

# Amplify Frontend Commands
.PHONY: create-amplify-app
create-amplify-app:
	@echo "Creating Amplify app: $(AMPLIFY_APP_NAME)..."
	@APP_ID=$$(aws amplify create-app \
		--name $(AMPLIFY_APP_NAME) \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--no-cli-pager \
		--query 'app.appId' \
		--output text); \
	if [ -n "$$APP_ID" ]; then \
		echo "Amplify app created successfully. App ID: $$APP_ID"; \
		echo "Please set AMPLIFY_APP_ID=$$APP_ID in your environment or Makefile"; \
	else \
		echo "Failed to create Amplify app"; \
		exit 1; \
	fi

.PHONY: create-amplify-branch
create-amplify-branch:
	@if [ -z "$(AMPLIFY_APP_ID)" ]; then \
		echo "Error: AMPLIFY_APP_ID is not set. Please set it after creating the app."; \
		exit 1; \
	fi
	@echo "Creating Amplify branch: $(AMPLIFY_BRANCH) for app: $(AMPLIFY_APP_ID)..."
	@aws amplify create-branch \
		--app-id $(AMPLIFY_APP_ID) \
		--branch-name $(AMPLIFY_BRANCH) \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--no-cli-pager

.PHONY: list-amplify-apps
list-amplify-apps:
	@echo "Listing Amplify apps..."
	@aws amplify list-apps \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--no-cli-pager

.PHONY: list-amplify-branches
list-amplify-branches:
	@if [ -z "$(AMPLIFY_APP_ID)" ]; then \
		echo "Error: AMPLIFY_APP_ID is not set. Please set it after creating the app."; \
		exit 1; \
	fi
	@echo "Listing branches for Amplify app: $(AMPLIFY_APP_ID)..."
	@aws amplify list-branches \
		--app-id $(AMPLIFY_APP_ID) \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--no-cli-pager

.PHONY: setup-amplify-frontend
setup-amplify-frontend: create-amplify-app create-amplify-branch
	@echo "Amplify frontend setup completed."
	@echo "Next steps:"
	@echo "1. Set AMPLIFY_APP_ID in your environment or Makefile"
	@echo "2. Configure your repository in the Amplify Console"
	@echo "3. Set up your build settings using the amplify.yml file"

# GitHub Actions OIDC Setup
.PHONY: create-github-oidc-provider
create-github-oidc-provider:
	@echo "Creating GitHub Actions OIDC provider..."
	@aws iam create-open-id-connect-provider \
		--url "https://token.actions.githubusercontent.com" \
		--client-id-list "sts.amazonaws.com" \
		--thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1" \
		--profile $(PROFILE) \
		--region $(AWS_REGION) \
		--no-cli-pager || true

.PHONY: create-github-deployment-policy
create-github-deployment-policy:
	@echo "Creating GitHub Actions deployment policy..."
	@aws iam create-policy \
		--policy-name GitHubActions-ECSDeployment \
		--policy-document '{ \
			"Version": "2012-10-17", \
			"Statement": [ \
				{ \
					"Effect": "Allow", \
					"Action": [ \
						"ecr:GetAuthorizationToken", \
						"ecr:BatchCheckLayerAvailability", \
						"ecr:CompleteLayerUpload", \
						"ecr:InitiateLayerUpload", \
						"ecr:PutImage", \
						"ecr:UploadLayerPart", \
						"ecr:DescribeRepositories", \
						"ecr:ListImages" \
					], \
					"Resource": "*" \
				}, \
				{ \
					"Effect": "Allow", \
					"Action": [ \
						"ecs:DescribeClusters", \
						"ecs:DescribeServices", \
						"ecs:UpdateService", \
						"ecs:DescribeTaskDefinition", \
						"ecs:RegisterTaskDefinition", \
						"ecs:ListTasks", \
						"ecs:DescribeTasks", \
						"ecs:CreateService", \
						"ecs:DeleteService" \
					], \
					"Resource": "*" \
				}, \
				{ \
					"Effect": "Allow", \
					"Action": [ \
						"iam:PassRole" \
					], \
					"Resource": [ \
						"arn:aws:iam::$(AWS_ACCOUNT_ID):role/ecsTaskExecutionRole" \
					] \
				}, \
				{ \
					"Effect": "Allow", \
					"Action": [ \
						"logs:CreateLogGroup", \
						"logs:CreateLogStream", \
						"logs:PutLogEvents" \
					], \
					"Resource": "arn:aws:logs:*:*:log-group:/ecs/*" \
				} \
			] \
		}' \
		--profile $(PROFILE) \
		--region $(AWS_REGION) \
		--no-cli-pager || true

.PHONY: create-github-deployment-role
create-github-deployment-role:
	@echo "Creating GitHub Actions deployment role..."
	@aws iam create-role \
		--role-name GitHubActions-ECSDeployment \
		--assume-role-policy-document '{ \
			"Version": "2012-10-17", \
			"Statement": [ \
				{ \
					"Effect": "Allow", \
					"Principal": { \
						"Federated": "$(GITHUB_OIDC_PROVIDER_ARN)" \
					}, \
					"Action": "sts:AssumeRoleWithWebIdentity", \
					"Condition": { \
						"StringEquals": { \
							"token.actions.githubusercontent.com:aud": "sts.amazonaws.com" \
						}, \
						"StringLike": { \
							"token.actions.githubusercontent.com:sub": "repo:$(GITHUB_REPO):*" \
						} \
					} \
				} \
			] \
		}' \
		--profile $(PROFILE) \
		--region $(AWS_REGION) \
		--no-cli-pager || true

.PHONY: attach-github-deployment-policy
attach-github-deployment-policy:
	@echo "Attaching deployment policy to role..."
	@aws iam attach-role-policy \
		--role-name GitHubActions-ECSDeployment \
		--policy-arn "arn:aws:iam::$(AWS_ACCOUNT_ID):policy/GitHubActions-ECSDeployment" \
		--profile $(PROFILE) \
		--region $(AWS_REGION) \
		--no-cli-pager || true

.PHONY: setup-github-oidc
setup-github-oidc: create-github-oidc-provider create-github-deployment-policy create-github-deployment-role attach-github-deployment-policy
	@echo "GitHub OIDC setup complete"
	@echo "Role ARN: arn:aws:iam::$(AWS_ACCOUNT_ID):role/GitHubActions-ECSDeployment"

# List tasks in the cluster
.PHONY: list-tasks
list-tasks:
	@echo "Listing all ECS tasks in cluster $(ECS_CLUSTER)..."
	@aws ecs list-tasks \
		--cluster $(ECS_CLUSTER) \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--output table \
		--no-cli-pager

# List clusters
.PHONY: list-clusters
list-clusters:
	@echo "Listing all ECS clusters..."
	@aws ecs list-clusters \
		--region $(AWS_REGION) \
		--profile $(PROFILE) \
		--output table \
		--no-cli-pager

# Help command
.PHONY: help
help:
	@echo "Deployment Flow (Backend to ECS Fargate):" \
	"\n  1. make build-be-image      - Build the backend Docker image" \
	"\n  2. make create-ecr-repo     - Create ECR repository if it doesn't exist" \
	"\n  3. make ecr-login           - Login to AWS ECR" \
	"\n  4. make push-be-image       - Push the backend Docker image to ECR" \
	"\n  5. make upload-be-image     - Login to ECR, build and push backend image in one step" \
	"\n  6. make run-be              - Run the backend container locally" \
	"\n  7. make create-ecs-cluster  - Create ECS cluster if it doesn't exist" \
	"\n  8. make create-ecs-role     - Create ECS service-linked role" \
	"\n  9. make create-ecs-role-policy - Create ECS Task Execution Role and attach policy" \
	"\n 10. make register-task       - Register new ECS task definition" \
	"\n 11. make create-service      - Create ECS service" \
	"\n 12. make update-service      - Create or update ECS service" \
	"\n 13. make deploy-ecs          - Deploy the backend image to ECS Fargate (full deployment)" \
	"\n 14. make service-status      - Show ECS service status" \
	"\n 15. make cleanup-old-tasks   - Deregister old ECS task definitions" \
	"\n 16. make check-tasks         - Check running ECS tasks" \
	"\n 17. make get-default-vpc     - Get default VPC ID" \
	"\n 18. make get-default-subnets - Get default subnets" \
	"\n 19. make get-default-sg      - Get default security group" \
	"\n 20. make create-log-group    - Create CloudWatch log group for ECS task logs" \
	"\n 21. make list-images         - List all images in the backend repository" \
	"\n 22. make list-repos          - List all ECR repositories" \
	"\n 23. make list-tasks          - List all ECS tasks in the cluster" \
	"\n 24. make list-clusters       - List all ECS clusters" \
	"\n" \
	"Deployment Flow (Frontend to Amplify):" \
	"\n  1. make build-fe-image      - Build the frontend Docker image" \
	"\n  2. make push-fe-image       - Push the frontend Docker image to ECR" \
	"\n  3. make upload-fe-image     - Login to ECR, build and push frontend image in one step" \
	"\n  4. make create-amplify-app      - Create a new Amplify app" \
	"\n  5. make create-amplify-branch   - Create a new branch in Amplify app" \
	"\n  6. make list-amplify-apps       - List all Amplify apps" \
	"\n  7. make list-amplify-branches   - List all branches in Amplify app" \
	"\n  8. make setup-amplify-frontend  - Complete Amplify frontend setup" \
	"\n" \
	"GitHub Actions OIDC Setup:" \
	"\n  1. make create-github-oidc-provider   - Create GitHub Actions OIDC provider" \
	"\n  2. make create-github-deployment-policy - Create GitHub Actions deployment policy" \
	"\n  3. make create-github-deployment-role   - Create GitHub Actions deployment role" \
	"\n  4. make attach-github-deployment-policy - Attach deployment policy to role" \
	"\n  5. make setup-github-oidc               - Complete GitHub OIDC setup" \
	"\n" \
	"Variables:" \
	"\n  ENVIRONMENT            - Environment name (default: staging, e.g., dev, staging, prod)" \
	"\n  AWS_REGION             - AWS region (default: eu-west-1)" \
	"\n  AWS_ACCOUNT_ID         - AWS account ID (auto-detected)" \
	"\n  IMAGE_TAG              - Docker image tag (default: latest)" \
	"\n  ECR_REPOSITORY         - ECR repository name (default: 1pd-be)" \
	"\n  ECR_URL                - ECR URL (auto-detected)" \
	"\n  ECS_CLUSTER            - ECS cluster name (default: 1pd-be-$(ENVIRONMENT)-cluster)" \
	"\n  ECS_SERVICE            - ECS service name (default: 1pd-be-$(ENVIRONMENT))" \
	"\n  ECS_TASK_FAMILY        - ECS task definition family (default: 1pd-be-$(ENVIRONMENT))" \
	"\n  ECS_TASK_CPU           - Task CPU units (default: 256)" \
	"\n  ECS_TASK_MEMORY        - Task memory MB (default: 512)" \
	"\n  ECS_DESIRED_COUNT      - Desired task count (default: 1)" \
	"\n  AMPLIFY_APP_NAME       - Amplify app name (default: 1pd-fe-$(ENVIRONMENT))" \
	"\n  AMPLIFY_BRANCH         - Amplify branch name (default: main)" \
	"\n  AMPLIFY_APP_ID         - Amplify app ID (required after app creation)"

# Build frontend Docker image
.PHONY: build-fe-image
build-fe-image:
	docker buildx build --platform=linux/amd64 -t $(ECR_URL)/1pd-fe:$(shell git rev-parse HEAD) -f Dockerfile.1pd-fe --build-arg VITE_API_URL=http://3.255.218.174 --build-arg VITE_ENV=$(ENVIRONMENT) --progress=plain .

# Push frontend image to ECR
.PHONY: push-fe-image
push-fe-image:
	docker push $(ECR_URL)/1pd-fe:$(shell git rev-parse HEAD)

# Build and push frontend image
.PHONY: upload-fe-image
upload-fe-image: ecr-login build-fe-image push-fe-image

# Run backend container locally
.PHONY: run-be
run-be:
	docker run -d \
	  --name 1pd-be \
	  --restart always \
	  --env-file ./1pd-be/.env \
	  -p 5005:5005 \
	  $(ECR_URL)/$(ECR_REPOSITORY):$(shell git rev-parse HEAD) 