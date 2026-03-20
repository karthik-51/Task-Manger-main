pipeline {
    agent any

    stages {

        stage('Check Docker & Compose') {
            steps {
                sh 'docker --version'
                sh 'docker-compose --version'
            }
        }

        stage('Create .env File') {
            steps {
                sh '''
                echo "PORT=5000" > backend/.env
                echo "MONGO_URI=mongodb+srv://havmore75_db_user:fkXTlhrzbrpqoiwe@taskmanger-ai.ffvm0ak.mongodb.net/?appName=TaskManger-AI" >> backend/.env
                echo "JWT_SECRET=secret123" >> backend/.env
                '''
            }
        }

        stage('Clean Old Containers & Cache') {
            steps {
                sh 'docker-compose down -v || true'
                sh 'docker system prune -af || true'
            }
        }

        stage('Build Fresh Images') {
            steps {
                sh 'docker-compose build --no-cache'
            }
        }

        stage('Start Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Verify Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ Deployment Successful!'
        }
        failure {
            echo '❌ Deployment Failed!'
        }
    }
}