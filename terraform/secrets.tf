# AWS Secrets Manager - Store sensitive environment variables

# Database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.app_name}-db-credentials"
  description = "Database credentials for ${var.app_name}"

  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    PGUSER     = var.db_username
    PGPASSWORD = random_password.db_password.result
    PGHOST     = aws_db_instance.postgres.address
    PGPORT     = aws_db_instance.postgres.port
    PGDATABASE = var.db_name
  })
}

# Application secrets
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "${var.app_name}-app-secrets"
  description = "Application secrets for ${var.app_name}"

  recovery_window_in_days = 7
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    STEAMKEY       = var.steam_api_key
    SESSION_SECRET = random_password.session_secret.result
    ADMIN_PASSWORD = random_password.admin_password.result
    PORT           = tostring(var.app_port)
  })
}
