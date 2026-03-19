pipeline {
    agent any

    stages {
        stage('Clone Code') {
            steps {
                git 'https://github.com/karthik-51/Task-Manger-main.git'
            }
        }

        stage('Docker Compose Down') {
            steps {
                sh 'docker-compose down || true'
            }
        }

        stage('Docker Compose Build & Run') {
            steps {
                sh 'docker-compose up --build -d'
            }
        }
    }
}