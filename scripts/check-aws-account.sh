#!/bin/bash
# AWS Account Safety Check
# This script ensures you're deploying to the CORRECT AWS account

set -e

echo "========================================="
echo "AWS Account Safety Check"
echo "========================================="
echo ""

# Check if AWS_PROFILE is set
if [ -z "$AWS_PROFILE" ]; then
    echo "⚠️  WARNING: AWS_PROFILE not set!"
    echo ""
    echo "You should set AWS_PROFILE to avoid using work account:"
    echo "  export AWS_PROFILE=personal-moretf"
    echo ""
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        echo "Aborting for safety."
        exit 1
    fi
fi

# Get current AWS account info
echo "Checking current AWS account..."
ACCOUNT_INFO=$(aws sts get-caller-identity 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to get AWS account info"
    echo "$ACCOUNT_INFO"
    exit 1
fi

ACCOUNT_ID=$(echo "$ACCOUNT_INFO" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)
USER_ARN=$(echo "$ACCOUNT_INFO" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)
USER_ID=$(echo "$ACCOUNT_INFO" | grep -o '"UserId": "[^"]*' | cut -d'"' -f4)

echo ""
echo "Current AWS Account:"
echo "  Account ID: $ACCOUNT_ID"
echo "  User ARN:   $USER_ARN"
echo "  User ID:    $USER_ID"
echo ""

# Prompt for confirmation
echo "⚠️  IMPORTANT: Verify this is your PERSONAL AWS account (NOT work)!"
echo ""
echo "Does this look like your personal account?"
read -p "Is this your PERSONAL account? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo ""
    echo "❌ Aborting deployment for safety!"
    echo ""
    echo "To use your personal account:"
    echo "  1. Set up named profile: aws configure --profile personal-moretf"
    echo "  2. Export profile: export AWS_PROFILE=personal-moretf"
    echo "  3. Run this script again"
    echo ""
    exit 1
fi

echo ""
echo "✅ Account verified! Safe to proceed with deployment."
echo ""
echo "You can now run:"
echo "  cd terraform && terraform apply"
echo ""

# Optional: Save account ID for future reference
mkdir -p .aws-config
echo "$ACCOUNT_ID" > .aws-config/verified-account-id
echo "Account ID saved to .aws-config/verified-account-id"
