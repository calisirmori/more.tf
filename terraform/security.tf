# Security Groups

# ECS EC2 Instance Security Group
resource "aws_security_group" "ecs_instance" {
  name        = "${var.app_name}-ecs-instance-sg"
  description = "Security group for ECS EC2 instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow all traffic for ECS tasks"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ecs-instance-sg"
  }
}

# ECS Task Security Group
resource "aws_security_group" "ecs_task" {
  name        = "${var.app_name}-ecs-task-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow HTTP traffic from anywhere"
    from_port   = var.app_port
    to_port     = var.app_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-ecs-task-sg"
  }
}

# RDS Security Group
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-rds-sg"
  description = "Security group for RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "PostgreSQL from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_task.id, aws_security_group.ecs_instance.id]
  }

  # Temporary public access for migration - remove this after a few days
  ingress {
    description = "Temporary public access for database migration and setup"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-rds-sg"
  }
}
