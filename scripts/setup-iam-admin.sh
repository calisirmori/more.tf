#!/bin/bash
# Setup IAM Admin User for more.tf
# Run this while logged in as ROOT user

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║           Setup IAM Admin User for more.tf                      ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
echo "Checking current AWS identity..."
CURRENT_USER=$(aws sts get-caller-identity --query Arn --output text 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Error: Not logged into AWS CLI"
    echo ""
    echo "Please configure AWS CLI with root credentials first:"
    echo "  aws configure"
    echo ""
    exit 1
fi

echo "Current AWS Identity: $CURRENT_USER"
echo ""

if [[ ! "$CURRENT_USER" =~ "root" ]]; then
    echo "⚠️  WARNING: You don't appear to be logged in as root user"
    echo "Current user: $CURRENT_USER"
    echo ""
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $ACCOUNT_ID"
echo ""

# User name
IAM_USER="more-tf-admin"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Creating IAM user '$IAM_USER'..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if user already exists
if aws iam get-user --user-name "$IAM_USER" >/dev/null 2>&1; then
    echo "⚠️  User '$IAM_USER' already exists!"
    read -p "Delete and recreate? (yes/no): " RECREATE
    if [ "$RECREATE" = "yes" ]; then
        echo "Deleting existing access keys..."
        aws iam list-access-keys --user-name "$IAM_USER" --query 'AccessKeyMetadata[].AccessKeyId' --output text | \
            xargs -I {} aws iam delete-access-key --user-name "$IAM_USER" --access-key-id {} 2>/dev/null || true

        echo "Detaching policies..."
        aws iam detach-user-policy --user-name "$IAM_USER" --policy-arn arn:aws:iam::aws:policy/AdministratorAccess 2>/dev/null || true

        echo "Deleting user..."
        aws iam delete-user --user-name "$IAM_USER"
        echo "✅ User deleted"
    else
        echo "Using existing user..."
    fi
fi

# Create user if doesn't exist
if ! aws iam get-user --user-name "$IAM_USER" >/dev/null 2>&1; then
    aws iam create-user --user-name "$IAM_USER"
    echo "✅ IAM user '$IAM_USER' created"
else
    echo "✅ Using existing user '$IAM_USER'"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Attaching AdministratorAccess policy..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

aws iam attach-user-policy \
    --user-name "$IAM_USER" \
    --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

echo "✅ AdministratorAccess policy attached"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Creating access keys..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Delete old access keys if exist
OLD_KEYS=$(aws iam list-access-keys --user-name "$IAM_USER" --query 'AccessKeyMetadata[].AccessKeyId' --output text)
if [ ! -z "$OLD_KEYS" ]; then
    echo "Found existing access keys. Deleting..."
    echo "$OLD_KEYS" | xargs -I {} aws iam delete-access-key --user-name "$IAM_USER" --access-key-id {}
fi

# Create new access key
KEY_OUTPUT=$(aws iam create-access-key --user-name "$IAM_USER")
ACCESS_KEY_ID=$(echo "$KEY_OUTPUT" | grep -o '"AccessKeyId": "[^"]*' | cut -d'"' -f4)
SECRET_ACCESS_KEY=$(echo "$KEY_OUTPUT" | grep -o '"SecretAccessKey": "[^"]*' | cut -d'"' -f4)

echo "✅ Access keys created"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 YOUR ACCESS KEYS (SAVE THESE NOW!)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access Key ID:     $ACCESS_KEY_ID"
echo "Secret Access Key: $SECRET_ACCESS_KEY"
echo ""
echo "Account ID:        $ACCOUNT_ID"
echo ""

# Save to file
mkdir -p .aws-config
cat > .aws-config/iam-admin-credentials.txt << EOF
AWS IAM Admin Credentials for more.tf
Created: $(date)

Access Key ID:     $ACCESS_KEY_ID
Secret Access Key: $SECRET_ACCESS_KEY
Account ID:        $ACCOUNT_ID
Region:            us-east-2

DO NOT COMMIT THIS FILE TO GIT!
EOF

echo "⚠️  Credentials saved to: .aws-config/iam-admin-credentials.txt"
echo "   (This file is in .gitignore - safe from commits)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Configuring AWS CLI profile 'more-tf'..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if profile exists
if grep -q "\[more-tf\]" ~/.aws/credentials 2>/dev/null; then
    echo "⚠️  Profile 'more-tf' already exists in ~/.aws/credentials"
    read -p "Overwrite? (yes/no): " OVERWRITE
    if [ "$OVERWRITE" != "yes" ]; then
        echo "Skipping profile configuration. You can do it manually:"
        echo "  aws configure --profile more-tf"
        exit 0
    fi
fi

# Configure profile automatically
aws configure set aws_access_key_id "$ACCESS_KEY_ID" --profile more-tf
aws configure set aws_secret_access_key "$SECRET_ACCESS_KEY" --profile more-tf
aws configure set region us-east-2 --profile more-tf
aws configure set output json --profile more-tf

echo "✅ AWS CLI profile 'more-tf' configured"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Verifying profile..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

export AWS_PROFILE=more-tf
VERIFY=$(aws sts get-caller-identity 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Profile verified successfully!"
    echo ""
    echo "$VERIFY" | grep -E "(UserId|Account|Arn)"
    echo ""
else
    echo "❌ Error verifying profile:"
    echo "$VERIFY"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your AWS profiles:"
echo "  • default, asu-le, asu-ep  ← Work accounts (DO NOT USE)"
echo "  • more-tf                  ← Personal account (USE THIS!)"
echo ""
echo "To use the more-tf profile:"
echo "  export AWS_PROFILE=more-tf"
echo ""
echo "Or add to ~/.zshrc:"
echo "  echo 'alias aws-moretf=\"aws --profile more-tf\"' >> ~/.zshrc"
echo "  echo 'alias tf-moretf=\"AWS_PROFILE=more-tf terraform\"' >> ~/.zshrc"
echo "  source ~/.zshrc"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 NEXT STEPS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Set profile for current session:"
echo "   export AWS_PROFILE=more-tf"
echo ""
echo "2. Run safety check:"
echo "   ./scripts/check-aws-account.sh"
echo ""
echo "3. Start deployment:"
echo "   cat AWS_QUICKSTART.md"
echo ""
echo "4. Save your credentials file:"
echo "   .aws-config/iam-admin-credentials.txt"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
