#!/bin/bash

# AWS EC2 Deployment Script for Course Buddy
# This script sets up Docker and deploys the application on EC2 instance.

echo "🚀 Starting Course Buddy deployment on AWS EC2..."

# Update system packages
echo "📦 Updating system packages..."
sudo yum update -y

# Install Docker
echo "🐳 Installing Docker..."
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
echo "📋 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Setting up application directory..."
mkdir -p /home/ec2-user/course-buddy
cd /home/ec2-user/course-buddy



# Build and start containers
echo "🔨 Building and starting containers..."
sudo docker-compose up -d --build

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at:"
echo "   Frontend: http://YOUR_EC2_PUBLIC_IP:3000"
echo "   Backend: http://YOUR_EC2_PUBLIC_IP:5001"
echo ""
echo "📊 To check container status: sudo docker-compose ps"
echo "📝 To view logs: sudo docker-compose logs" 