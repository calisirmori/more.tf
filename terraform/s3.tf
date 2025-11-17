# S3 bucket for player season cards
resource "aws_s3_bucket" "season_cards" {
  bucket = "moretf-season-cards"

  tags = {
    Name        = "Season Cards Storage"
    Environment = var.environment
  }
}

# Enable versioning for the bucket
resource "aws_s3_bucket_versioning" "season_cards_versioning" {
  bucket = aws_s3_bucket.season_cards.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Public access block - cards should be publicly accessible
resource "aws_s3_bucket_public_access_block" "season_cards_public_access" {
  bucket = aws_s3_bucket.season_cards.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Bucket policy to allow public read access
resource "aws_s3_bucket_policy" "season_cards_policy" {
  bucket = aws_s3_bucket.season_cards.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.season_cards.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.season_cards_public_access]
}

# CORS configuration for web access
resource "aws_s3_bucket_cors_configuration" "season_cards_cors" {
  bucket = aws_s3_bucket.season_cards.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}
