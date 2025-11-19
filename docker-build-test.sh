#!/bin/bash
# Docker build comparison script

echo "========================================="
echo "Docker Build Performance Test"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build and time
build_and_time() {
    local dockerfile=$1
    local tag=$2
    local description=$3

    echo -e "${BLUE}Building with ${description}...${NC}"
    echo "Dockerfile: $dockerfile"
    echo "Tag: $tag"
    echo ""

    local start=$(date +%s)

    if [ "$dockerfile" == "Dockerfile.optimized" ]; then
        # Use BuildKit for optimized version
        DOCKER_BUILDKIT=1 docker build -f "$dockerfile" -t "$tag" .
    else
        docker build -f "$dockerfile" -t "$tag" .
    fi

    local end=$(date +%s)
    local duration=$((end - start))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    echo ""
    echo -e "${GREEN}✓ Build completed in ${minutes}m ${seconds}s${NC}"
    echo ""

    return $duration
}

# Test 1: Standard Dockerfile
echo -e "${YELLOW}Test 1: Standard Dockerfile${NC}"
echo "========================================="
build_and_time "Dockerfile" "more-tf:standard" "Standard Dockerfile"
STANDARD_TIME=$?

echo ""
echo "========================================="
echo ""

# Test 2: Optimized Dockerfile (with BuildKit)
echo -e "${YELLOW}Test 2: Optimized Dockerfile (with BuildKit cache)${NC}"
echo "========================================="
build_and_time "Dockerfile.optimized" "more-tf:optimized" "Optimized Dockerfile + BuildKit"
OPTIMIZED_TIME=$?

# Calculate improvement
echo ""
echo "========================================="
echo -e "${BLUE}BUILD TIME COMPARISON${NC}"
echo "========================================="
echo ""
printf "Standard build:  %dm %ds\n" $((STANDARD_TIME / 60)) $((STANDARD_TIME % 60))
printf "Optimized build: %dm %ds\n" $((OPTIMIZED_TIME / 60)) $((OPTIMIZED_TIME % 60))
echo ""

if [ $OPTIMIZED_TIME -lt $STANDARD_TIME ]; then
    local saved=$((STANDARD_TIME - OPTIMIZED_TIME))
    local percent=$(( (saved * 100) / STANDARD_TIME ))
    echo -e "${GREEN}✓ Optimized build is ${saved}s (${percent}%) faster!${NC}"
else
    echo -e "${YELLOW}Note: First optimized build may be slower. Run again to see cache benefits.${NC}"
fi

echo ""
echo "========================================="
echo "RECOMMENDATIONS:"
echo "========================================="
echo ""
echo "1. Use 'Dockerfile.optimized' for builds with:"
echo "   DOCKER_BUILDKIT=1 docker build -f Dockerfile.optimized -t more-tf:latest ."
echo ""
echo "2. For subsequent builds (with cache):"
echo "   - Only changed layers will rebuild"
echo "   - npm cache will be reused"
echo "   - Native module compilation happens once"
echo ""
echo "3. Expected build times:"
echo "   - First build: 2-5 minutes"
echo "   - Cached builds (code changes only): 30-60 seconds"
echo "   - Cached builds (no changes): 5-10 seconds"
echo ""
