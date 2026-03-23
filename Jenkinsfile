pipeline {
    agent any

    environment {
        REGISTRY            = "mathew664"
        BACKEND_IMAGE       = "${REGISTRY}/task-backend"
        FRONTEND_IMAGE      = "${REGISTRY}/task-frontend"
        IMAGE_TAG           = "${BUILD_NUMBER}"

        LOG_DIR_NAME        = "jenkins-logs"

        GIT_REPO            = "https://github.com/karthik-51/Task-Manger-main.git"

        DOCKER_CREDS_ID     = "docker-hub-credentials"
        EC2_SSH_CREDS       = "ec2-ssh-key"

        EC2_HOST            = "ubuntu@18.60.223.109"
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
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: "${GIT_REPO}"]]
                ])

                sh '''
                    bash -lc '
                    set -e
                    set -o pipefail
                    echo "===== CHECKOUT STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/checkout.log"
                    git remote -v | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/checkout.log"
                    git branch -a | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/checkout.log"
                    git rev-parse --short HEAD | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/checkout.log"
                    '
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
                            args '--entrypoint="" -u root:root'
                        }
                    }
                    steps {
                        dir('backend') {
                            sh '''
                                bash -lc '
                                set -e
                                set -o pipefail
                                echo "===== BACKEND BUILD STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-build.log"
                                npm ci 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-build.log"
                                npm run build --if-present 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-build.log"
                                '
                            '''
                        }
                    }
                }

                stage('Build Frontend') {
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
                                bash -lc '
                                set -e
                                set -o pipefail
                                echo "===== FRONTEND BUILD STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/frontend-build.log"
                                npm install 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/frontend-build.log"
                                npm run build 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/frontend-build.log"
                                '
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
                        bash -lc '
                        set -e
                        set -o pipefail
                        echo "===== BACKEND TEST STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-test.log"
                        npm ci 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-test.log"
                        npm test 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-test.log"
                        '
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
                            args '--entrypoint="" -u root:root'
                        }
                    }
                    steps {
                        dir('backend') {
                            sh '''
                                bash -lc '
                                set -e
                                set -o pipefail
                                echo "===== BACKEND CODE ANALYSIS =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-analysis.log"
                                npm ci 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-analysis.log"
                                npm run lint --if-present 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/backend-analysis.log"
                                '
                            '''
                        }
                    }
                }

                stage('Frontend Analysis') {
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
                                bash -lc '
                                set -e
                                set -o pipefail
                                echo "===== FRONTEND CODE ANALYSIS =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/frontend-analysis.log"
                                npm install 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/frontend-analysis.log"
                                npm run lint --if-present 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/frontend-analysis.log"
                                '
                            '''
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    bash -lc '
                    set -e
                    set -o pipefail
                    echo "===== DOCKER BUILD STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-build.log"

                    docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-build.log"
                    docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-build.log"

                    docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-build.log"
                    docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-build.log"
                    '
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                withDockerRegistry([credentialsId: "${DOCKER_CREDS_ID}", url: '']) {
                    sh '''
                        bash -lc '
                        set -e
                        set -o pipefail
                        echo "===== DOCKER PUSH STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-push.log"

                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG} 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-push.log"
                        docker push ${BACKEND_IMAGE}:latest 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-push.log"

                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG} 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-push.log"
                        docker push ${FRONTEND_IMAGE}:latest 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/docker-push.log"
                        '
                    '''
                }
            }
        }

        stage('Check Deploy Files on EC2') {
            
            steps {
                sshagent(credentials: ["${EC2_SSH_CREDS}"]) {
                    sh '''
                        bash -lc '
                        set -e
                        set -o pipefail
                        echo "===== CHECK DEPLOY FILES STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/deploy-check.log"

                        ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
                            test -f ${DEPLOY_DIR}/docker-compose.deploy.yml &&
                            test -f ${DEPLOY_DIR}/backend/.env
                        " 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/deploy-check.log"
                        '
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            
            steps {
                sshagent(credentials: ["${EC2_SSH_CREDS}"]) {
                    sh '''
                        bash -lc '
                        set -e
                        set -o pipefail
                        echo "===== DEPLOY STAGE =====" | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/deploy.log"

                        ssh -o StrictHostKeyChecking=no ${EC2_HOST} "
                            set -e
                            cd ${DEPLOY_DIR}
                            docker compose --env-file backend/.env -f docker-compose.deploy.yml down || true
                            docker pull ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker pull ${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                            docker compose --env-file backend/.env -f docker-compose.deploy.yml up -d
                            docker compose --env-file backend/.env -f docker-compose.deploy.yml ps
                        " 2>&1 | tee -a "${WORKSPACE}/${LOG_DIR_NAME}/deploy.log"
                        '
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