variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-2" # Ohio region
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "more-tf"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# RDS Configuration - Free Tier Optimized
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "moretf"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "moretfadmin"
}

variable "db_instance_class" {
  description = "RDS instance class (db.t3.micro is free tier eligible)"
  type        = string
  default     = "db.t3.micro" # Free tier: 750 hours/month for 12 months
}

variable "db_allocated_storage" {
  description = "Allocated storage for RDS in GB (20GB free tier)"
  type        = number
  default     = 20
}

variable "db_backup_retention_period" {
  description = "Backup retention period in days (0 = disabled, saves costs)"
  type        = number
  default     = 7 # Enable backups for best practices
}

# ECS Configuration - Free Tier Optimized
variable "ecs_instance_type" {
  description = "EC2 instance type for ECS (t2.micro is free tier eligible)"
  type        = string
  default     = "t2.micro" # Free tier: 750 hours/month for 12 months
}

variable "app_port" {
  description = "Port the application listens on"
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1 # Keep at 1 for free tier
}

# Secrets
variable "steam_api_key" {
  description = "Steam API key (from .env STEAMKEY)"
  type        = string
  sensitive   = true
}

# Domain Configuration (for Cloudflare)
variable "domain_name" {
  description = "Your domain name (e.g., more.tf)"
  type        = string
  default     = "more.tf"
}

# Cost Optimization
variable "enable_nat_gateway" {
  description = "Enable NAT Gateway (costs ~$32/month). Set false to use free tier only."
  type        = bool
  default     = false # Set to false for free tier
}
