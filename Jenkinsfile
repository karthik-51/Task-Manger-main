pipeline {
    agent any

    environment {
        REGISTRY        = "havmore"
        BACKEND_IMAGE   = "${REGISTRY}/task-backend"
        FRONTEND_IMAGE  = "${REGISTRY}/task-frontend"
        IMAGE_TAG       = "${BUILD_NUMBER}"

        GIT_REPO        = "https://github.com/karthik-51/Task-Manger-main.git"

        DOCKER_CREDS_ID = "docker-hub-credentials"
        EC2_SSH_CREDS   = "ec2-ssh-key"

        EC2_HOST        = "ubuntu@18.60.0.90"
        DEPLOY_DIR      = "/home/ubuntu/Task-Manger-main"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'sayeem-branch', url: "${GIT_REPO}"
            }
        }

        // ❌ REMOVED: Build + Test stages (handled by Docker)

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                    docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest

                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                    docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                withDockerRegistry([credentialsId: "${DOCKER_CREDS_ID}", url: '']) {
                    sh '''
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:latest

                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ["${EC2_SSH_CREDS}"]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
                            set -e
                            cd ${DEPLOY_DIR}

                            echo '🧹 Stopping old containers...'
                            docker compose down --remove-orphans || true

                            echo '📥 Pulling latest images...'
                            docker pull ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG}

                            docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest

                            echo '🚀 Starting containers...'
                            docker compose --env-file backend/.env up -d

                            echo '✅ Running containers:'
                            docker ps
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful!"
        }
        failure {
            echo "❌ Deployment Failed!"
        }
    }
}
