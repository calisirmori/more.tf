# RDS PostgreSQL - Free Tier Optimized

# DB Subnet Group (required for RDS)
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-db-subnet-group"
  subnet_ids = concat(aws_subnet.public[*].id, aws_subnet.private[*].id) # All subnets for migration

  tags = {
    Name = "${var.app_name}-db-subnet-group"
  }
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier     = "${var.app_name}-postgres"
  engine         = "postgres"
  engine_version = "15" # Latest in 15.x family

  # Free Tier Settings
  instance_class        = var.db_instance_class # db.t3.micro
  allocated_storage     = var.db_allocated_storage # 20 GB
  storage_type          = "gp3" # General Purpose SSD (more cost-effective)
  storage_encrypted     = true
  max_allocated_storage = 100 # Enable storage autoscaling

  # Database Configuration
  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result
  port     = 5432

  # Network & Security
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = true # Temporarily public for migration (switch to false later)

  # Backup & Maintenance
  backup_retention_period   = var.db_backup_retention_period
  backup_window             = "03:00-04:00" # UTC
  maintenance_window        = "mon:04:00-mon:05:00" # UTC
  auto_minor_version_upgrade = true

  # Performance & Monitoring
  performance_insights_enabled = false # Costs extra
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # Deletion Protection
  deletion_protection = false # Temporarily disabled for recreation
  skip_final_snapshot = true # Skip snapshot for recreation

  # CA certificate
  ca_cert_identifier = "rds-ca-rsa2048-g1"

  tags = {
    Name = "${var.app_name}-postgres"
  }

  lifecycle {
    ignore_changes = [final_snapshot_identifier]
  }
}
