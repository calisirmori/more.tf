# Terraform Outputs

output "ecs_public_ip" {
  description = "Public IP of ECS instance - Point your Cloudflare DNS here"
  value       = "Check EC2 console for public IP of more-tf-ecs-instance"
}

output "ecr_repository_url" {
  description = "URL of the ECR repository"
  value       = aws_ecr_repository.app.repository_url
}

output "rds_endpoint" {
  description = "RDS endpoint - Share this with your data team"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "RDS address"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.postgres.port
}

output "db_credentials_secret_arn" {
  description = "ARN of the database credentials secret"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "app_secrets_secret_arn" {
  description = "ARN of the application secrets secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.app.name
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for ECS tasks"
  value       = aws_cloudwatch_log_group.ecs.name
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for season cards"
  value       = aws_s3_bucket.season_cards.bucket
}

output "s3_bucket_url" {
  description = "Public URL of the S3 bucket for season cards"
  value       = "https://${aws_s3_bucket.season_cards.bucket}.s3.amazonaws.com"
}

output "redis_endpoint" {
  description = "Redis cluster endpoint for session storage"
  value       = "${aws_elasticache_cluster.redis.cache_nodes[0].address}:${aws_elasticache_cluster.redis.cache_nodes[0].port}"
}

output "admin_password_retrieval" {
  description = "Command to retrieve the admin portal password"
  value       = "aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.app_secrets.arn} --query SecretString --output text --region ${var.aws_region} | jq -r .ADMIN_PASSWORD"
}

# Instructions for next steps
output "next_steps" {
  description = "Next steps to complete the deployment"
  value = <<-EOT

    ========================================
    AWS Infrastructure Created Successfully!
    ========================================

    **100% FREE TIER - NO ALB COSTS!**

    1. GET EC2 PUBLIC IP:
       - Go to EC2 Console: https://console.aws.amazon.com/ec2
       - Find instance: more-tf-ecs-instance
       - Copy Public IPv4 address

    2. CLOUDFLARE DNS SETUP:
       - Log into Cloudflare
       - Add an A record:
         Name: @ (or www)
         IPv4 address: <EC2 Public IP from step 1>
         Proxy Status: Proxied (Orange cloud) ✓

    3. DATABASE ACCESS (Share with your data team):
       - Endpoint: ${aws_db_instance.postgres.endpoint}
       - Username: ${var.db_username}
       - Database: ${var.db_name}
       - Password: Get with command below

       aws secretsmanager get-secret-value --secret-id ${aws_secretsmanager_secret.db_credentials.arn} --query SecretString --output text --region ${var.aws_region} | jq -r .PGPASSWORD

    4. PUSH YOUR FIRST IMAGE:
       aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${aws_ecr_repository.app.repository_url}
       docker build -t ${var.app_name} .
       docker tag ${var.app_name}:latest ${aws_ecr_repository.app.repository_url}:latest
       docker push ${aws_ecr_repository.app.repository_url}:latest

    5. MONITOR LOGS:
       aws logs tail ${aws_cloudwatch_log_group.ecs.name} --follow --region ${var.aws_region}

    FREE TIER USAGE (12 months):
    ✅ RDS db.t3.micro: 750 hours/month FREE
    ✅ EC2 t2.micro: 750 hours/month FREE
    ✅ VPC, subnets, security groups: FREE
    ✅ ECR (500MB): FREE
    ✅ CloudWatch logs (5GB): FREE
    ✅ Data transfer (100GB): FREE

    Estimated monthly cost: $0-5/month (only if you exceed free tier limits!)

  EOT
}
