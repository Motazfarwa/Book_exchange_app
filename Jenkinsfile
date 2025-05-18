pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = 'dockerhub-mootezfarwa'  // Jenkins credential ID for Docker Hub login
        DOCKER_IMAGE_NAME = 'mootezfarwa/book_exchange_app'
        DOCKER_IMAGE_TAG = 'latest'
    }

    stages {
       stage('Clone Code') {
           steps {
        git branch: 'ahmed', url: 'https://github.com/Motazfarwa/Book_exchange_app.git'
          }
        }


        stage('Docker Login') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_HUB_CREDENTIALS) {
                        echo "Logged in to Docker Hub"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Try to pull existing image for cache (optional)
                    try {
                        sh "docker pull ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    } catch (err) {
                        echo "No existing image to pull, building from scratch"
                    }
                    // Build image
                    dockerImage = docker.build("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_HUB_CREDENTIALS) {
                        dockerImage.push()
                        echo "Docker image pushed to Docker Hub: ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Stop and remove old container if exists
                    sh '''
                    if [ $(docker ps -q -f name=your-app-container) ]; then
                        docker stop your-app-container
                        docker rm your-app-container
                    fi
                    '''
                    // Run new container
                    sh "docker run -d --name your-app-container -p 3000:3000 ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                }
            }
        }
    }
}
