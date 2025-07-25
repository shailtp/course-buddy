# Course Buddy - AWS EC2 Deployment Guide

## Overview
This guide shows how to containerize and deploy the Course Buddy application to AWS EC2 using Docker.

## Prerequisites
- AWS Account
- EC2 Instance (t2.micro or larger)
- Security Group with ports 22 (SSH), 3000 (Frontend), 5001 (Backend), 27017 (MongoDB) open

## Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2
2. Launch Instance:
   - AMI: Amazon Linux 2
   - Instance Type: t2.micro (free tier)
   - Security Group: Create new with rules:
     - SSH (22) from anywhere
     - Custom TCP (3000) from anywhere
     - Custom TCP (5001) from anywhere
     - Custom TCP (27017) from anywhere

## Step 2: Connect to EC2
```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
```

## Step 3: Upload Application Files
Option A: Using SCP
```bash
scp -i your-key.pem -r /path/to/course-buddy ec2-user@YOUR_EC2_PUBLIC_IP:~/
```

Option B: Using Git (if your code is in a repository)
```bash
git clone https://github.com/your-username/course-buddy.git
```

## Step 4: Run Deployment Script
```bash
cd course-buddy
chmod +x deploy.sh
./deploy.sh
```

## Step 5: Verify Deployment
```bash
# Check if containers are running
sudo docker-compose ps

# View logs
sudo docker-compose logs

# Test the application
curl http://localhost:3000
```

## Step 6: Access Your Application
- Frontend: http://YOUR_EC2_PUBLIC_IP:3000
- Backend API: http://YOUR_EC2_PUBLIC_IP:5001

## Container Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Docker Commands
```bash
# Build containers
sudo docker-compose build

# Start services
sudo docker-compose up -d

# Stop services
sudo docker-compose down

# View logs
sudo docker-compose logs -f

# Restart services
sudo docker-compose restart
```

## Troubleshooting
1. **Port not accessible**: Check security group rules
2. **Container not starting**: Check logs with `sudo docker-compose logs`
3. **Database connection issues**: Ensure MongoDB container is running

## Benefits of Containerization
- ✅ Consistent environment across development and production
- ✅ Easy scaling and deployment
- ✅ Isolated services
- ✅ Version control for infrastructure
- ✅ Quick rollback capabilities

## Cost Estimation (t2.micro)
- EC2 Instance: ~$8-10/month
- Data Transfer: Minimal for demo
- **Total: ~$10/month for basic deployment** 