pipeline {
    agent any

    environment {
        REGISTRY            = "havmore"
        BACKEND_IMAGE       = "${REGISTRY}/task-backend"
        FRONTEND_IMAGE      = "${REGISTRY}/task-frontend"
        IMAGE_TAG           = "${BUILD_NUMBER}"

        LOG_DIR_NAME        = "jenkins-logs"

        GIT_REPO            = "https://github.com/karthik-51/Task-Manger-main.git"

        DOCKER_CREDS_ID     = "docker-hub-credentials"
        EC2_SSH_CREDS       = "ec2-ssh-key"

        EC2_HOST            = "ubuntu@18.60.0.90"
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
            parallel {
                stage('Backend') {
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
                                npm ci
                                npm run build --if-present
                            '''
                        }
                    }
                }

                stage('Frontend') {
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
                                npm install
                                npm run build
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
                    args '--entrypoint="" -u root:root'
                }
            }
            steps {
                dir('backend') {
                    sh '''
                        npm ci
                        npm test
                    '''
                }
            }
        }

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

        stage('Check Deploy Files on EC2') {
            steps {
                sshagent(credentials: ["${EC2_SSH_CREDS}"]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
                            test -f ${DEPLOY_DIR}/docker-compose.yml &&
                            test -f ${DEPLOY_DIR}/backend/.env
                        "
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

                            docker compose --env-file backend/.env down || true

                            docker pull ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG}

                            docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest

                            docker compose --env-file backend/.env up -d

                            docker compose ps
                        "
                    '''
                }
            }
        }
    }

    post {
        success {
            sh '''
                mkdir -p "${WORKSPACE}/${LOG_DIR_NAME}"
                echo "===== PIPELINE SUCCESS: $(date) =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/pipeline.log"
            '''
            archiveArtifacts artifacts: "${LOG_DIR_NAME}/*.log", fingerprint: true, allowEmptyArchive: true
        }

        failure {
            sh '''
                mkdir -p "${WORKSPACE}/${LOG_DIR_NAME}"
                echo "===== PIPELINE FAILED: $(date) =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/pipeline.log"
            '''
            archiveArtifacts artifacts: "${LOG_DIR_NAME}/*.log", fingerprint: true, allowEmptyArchive: true
        }

        always {
            sh '''
                mkdir -p "${WORKSPACE}/${LOG_DIR_NAME}"
                echo "===== PIPELINE FINISHED: $(date) =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/pipeline.log"
            '''
        }
    }
}
