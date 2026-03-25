pipeline {
    agent any

    environment {
        REGISTRY            = "havmore"
        BACKEND_IMAGE       = "${REGISTRY}/task-backend"
        FRONTEND_IMAGE      = "${REGISTRY}/task-frontend"
        IMAGE_TAG           = "${BUILD_NUMBER}"
        LOG_DIR_NAME        = "jenkins-logs"
        GIT_REPO            = "https://github.com"
        DOCKER_CREDS_ID     = "docker-hub-credentials"
        EC2_SSH_CREDS       = "ec2-ssh-key"
        EC2_HOST            = "ubuntu@18.60.29.79"
        DEPLOY_DIR          = "/home/ubuntu/Task-Manger-main"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Init Logs') {
            steps {
                sh '''
                    mkdir -p "${WORKSPACE}/${LOG_DIR_NAME}"
                    rm -f "${WORKSPACE}/${LOG_DIR_NAME}"/*.log
                    echo "===== PIPELINE STARTED: $(date) =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/pipeline.log"
                '''
            }
        }

        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/sayeem-branch']],
                    userRemoteConfigs: [[url: "${GIT_REPO}"]]
                ])
            }
        }

        stage('Build') {
            /* SEQUENTIAL BUILD: Fixed to prevent EC2 RAM freeze (no parallel) */
            stages {
                stage('Backend Build') {
                    agent {
                        docker {
                            image 'node:20'
                            reuseNode true
                            args '--entrypoint="" -u root:root'
                        }
                    }
                    steps {
                        dir('backend') {
                            sh '''
                                export NODE_OPTIONS="--max-old-space-size=1024"
                                npm ci
                                npm run build --if-present
                            '''
                        }
                    }
                }

                stage('Frontend Build') {
                    agent {
                        docker {
                            image 'node:20'
                            reuseNode true
                            args '--entrypoint="" -u root:root'
                        }
                    }
                    steps {
                        dir('frontend') {
                            sh '''
                                export NODE_OPTIONS="--max-old-space-size=1536"
                                npm install
                                npm run build
                            '''
                        }
                    }
                }
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                sh '''
                    # Build using build-args to handle memory during image creation
                    docker build --build-arg NODE_OPTIONS="--max-old-space-size=1536" -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                    docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest

                    docker build --build-arg NODE_OPTIONS="--max-old-space-size=1536" -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                    docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                '''
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

                            echo '🧹 Cleaning up old/orphan containers to fix Auth errors...'
                            docker compose --env-file backend/.env down --remove-orphans || true

                            echo '📥 Pulling images...'
                            docker pull ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest

                            echo '🚀 Starting containers with NEW MongoDB credentials...'
                            # --force-recreate ensures the NEW password in .env is applied
                            docker compose --env-file backend/.env up -d --force-recreate

                            docker ps
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment Successful! New MongoDB password applied."
        }
        failure {
            echo "❌ Deployment Failed. Check EC2 RAM/Swap or MongoDB Auth logs."
        }
        always {
            archiveArtifacts artifacts: "${LOG_DIR_NAME}/*.log", fingerprint: true, allowEmptyArchive: true
        }
    }
}
