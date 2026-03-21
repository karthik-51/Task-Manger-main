pipeline {
    agent none

    environment {
        REGISTRY            = "mathew664"
        BACKEND_IMAGE       = "${REGISTRY}/task-backend"
        FRONTEND_IMAGE      = "${REGISTRY}/task-frontend"
        IMAGE_TAG           = "${BUILD_NUMBER}"

        LOG_DIR             = "${WORKSPACE}/jenkins-logs"

        GIT_BRANCH          = "main"
        GIT_REPO            = "https://github.com/karthik-51/Task-Manger-main.git"

        DOCKER_CREDS_ID     = "docker-hub-credentials"
        EC2_SSH_CREDS       = "ec2-ssh-key"

        EC2_HOST            = "ubuntu@18.60.109.7 "
        DEPLOY_DIR          = "/home/ubuntu/Task-Manger-main"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Init Logs') {
            agent any
            steps {
                sh '''
                    rm -rf "${LOG_DIR}"
                    mkdir -p "${LOG_DIR}"
                    echo "===== PIPELINE STARTED: $(date) =====" | tee -a "${LOG_DIR}/pipeline.log"
                '''
            }
        }

        stage('Checkout') {
            agent any
            steps {
                git branch: "${GIT_BRANCH}", url: "${GIT_REPO}"
                sh '''
                    echo "===== CHECKOUT STAGE =====" | tee -a "${LOG_DIR}/checkout.log"
                    git rev-parse --short HEAD | tee -a "${LOG_DIR}/checkout.log"
                '''
            }
        }

        stage('Build') {
            parallel {
                stage('Build Backend') {
                    agent {
                        docker {
                            image 'node:20'
                            reuseNode true
                            args '-u root:root'
                        }
                    }
                    steps {
                        dir('backend') {
                            sh '''
                                echo "===== BACKEND BUILD STAGE =====" | tee -a "${LOG_DIR}/backend-build.log"
                                npm install 2>&1 | tee -a "${LOG_DIR}/backend-build.log"
                                npm run build --if-present 2>&1 | tee -a "${LOG_DIR}/backend-build.log"
                            '''
                        }
                    }
                }

                stage('Build Frontend') {
                    agent {
                        docker {
                            image 'node:20'
                            reuseNode true
                            args '-u root:root'
                        }
                    }
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "===== FRONTEND BUILD STAGE =====" | tee -a "${LOG_DIR}/frontend-build.log"
                                npm install 2>&1 | tee -a "${LOG_DIR}/frontend-build.log"
                                npm run build 2>&1 | tee -a "${LOG_DIR}/frontend-build.log"
                            '''
                        }
                    }
                }
            }
        }

        stage('Test') {
            agent {
                docker {
                    image 'node:20'
                    reuseNode true
                    args '-u root:root'
                }
            }
            steps {
                dir('backend') {
                    sh '''
                        echo "===== BACKEND TEST STAGE (JEST) =====" | tee -a "${LOG_DIR}/backend-test.log"
                        npm install 2>&1 | tee -a "${LOG_DIR}/backend-test.log"
                        npm test 2>&1 | tee -a "${LOG_DIR}/backend-test.log"
                    '''
                }
            }
        }

        stage('Code Analysis') {
            parallel {
                stage('Backend Analysis') {
                    agent {
                        docker {
                            image 'node:20'
                            reuseNode true
                            args '-u root:root'
                        }
                    }
                    steps {
                        dir('backend') {
                            sh '''
                                echo "===== BACKEND CODE ANALYSIS =====" | tee -a "${LOG_DIR}/backend-analysis.log"
                                npm install 2>&1 | tee -a "${LOG_DIR}/backend-analysis.log"
                                npm run lint --if-present 2>&1 | tee -a "${LOG_DIR}/backend-analysis.log"
                            '''
                        }
                    }
                }

                stage('Frontend Analysis') {
                    agent {
                        docker {
                            image 'node:20'
                            reuseNode true
                            args '-u root:root'
                        }
                    }
                    steps {
                        dir('frontend') {
                            sh '''
                                echo "===== FRONTEND CODE ANALYSIS =====" | tee -a "${LOG_DIR}/frontend-analysis.log"
                                npm install 2>&1 | tee -a "${LOG_DIR}/frontend-analysis.log"
                                npm run lint --if-present 2>&1 | tee -a "${LOG_DIR}/frontend-analysis.log"
                            '''
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            agent any
            steps {
                sh '''
                    echo "===== DOCKER BUILD STAGE =====" | tee -a "${LOG_DIR}/docker-build.log"

                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend 2>&1 | tee -a "${LOG_DIR}/docker-build.log"
                    docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest 2>&1 | tee -a "${LOG_DIR}/docker-build.log"

                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend 2>&1 | tee -a "${LOG_DIR}/docker-build.log"
                    docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest 2>&1 | tee -a "${LOG_DIR}/docker-build.log"
                '''
            }
        }

        stage('Push Docker Images') {
            agent any
            steps {
                withDockerRegistry([credentialsId: "${DOCKER_CREDS_ID}", url: '']) {
                    sh '''
                        echo "===== DOCKER PUSH STAGE =====" | tee -a "${LOG_DIR}/docker-push.log"

                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG} 2>&1 | tee -a "${LOG_DIR}/docker-push.log"
                        docker push ${BACKEND_IMAGE}:latest 2>&1 | tee -a "${LOG_DIR}/docker-push.log"

                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG} 2>&1 | tee -a "${LOG_DIR}/docker-push.log"
                        docker push ${FRONTEND_IMAGE}:latest 2>&1 | tee -a "${LOG_DIR}/docker-push.log"
                    '''
                }
            }
        }

        stage('Check Deploy Files on EC2') {
            agent any
            steps {
                sshagent(credentials: ["${EC2_SSH_CREDS}"]) {
                    sh '''
                        echo "===== CHECK DEPLOY FILES STAGE =====" | tee -a "${LOG_DIR}/deploy-check.log"

                        ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
                            test -f ${DEPLOY_DIR}/docker-compose.deploy.yml &&
                            test -f ${DEPLOY_DIR}/.env
                        " 2>&1 | tee -a "${LOG_DIR}/deploy-check.log"
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            agent any
            steps {
                sshagent(credentials: ["${EC2_SSH_CREDS}"]) {
                    sh '''
                        echo "===== DEPLOY STAGE =====" | tee -a "${LOG_DIR}/deploy.log"

                        ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
                            cd ${DEPLOY_DIR} &&
                            docker compose -f docker-compose.deploy.yml down || true &&
                            docker pull ${BACKEND_IMAGE}:${IMAGE_TAG} &&
                            docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG} &&
                            docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest &&
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest &&
                            docker compose -f docker-compose.deploy.yml up -d
                        " 2>&1 | tee -a "${LOG_DIR}/deploy.log"
                    '''
                }
            }
        }
    }

    post {
        success {
            sh '''
                echo "===== PIPELINE SUCCESS: $(date) =====" | tee -a "${LOG_DIR}/pipeline.log"
            '''
            archiveArtifacts artifacts: 'jenkins-logs/*.log', fingerprint: true
        }

        failure {
            sh '''
                echo "===== PIPELINE FAILED: $(date) =====" | tee -a "${LOG_DIR}/pipeline.log"
            '''
            archiveArtifacts artifacts: 'jenkins-logs/*.log', fingerprint: true
        }

        always {
            sh '''
                echo "===== PIPELINE FINISHED: $(date) =====" | tee -a "${LOG_DIR}/pipeline.log"
            '''
        }
    }
}
