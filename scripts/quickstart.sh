#!/bin/bash

# FrameSync Quick Start Script
set -e

echo "🚀 FrameSync Quick Start"
echo "========================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "packages/mobile" ] || [ ! -d "packages/server" ]; then
    echo "❌ Error: Please run this script from the framesync repository root"
    exit 1
fi

# Detect package manager
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    echo "❌ Error: Neither pnpm nor npm found. Please install Node.js"
    exit 1
fi

echo "📦 Using package manager: $PKG_MANAGER"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node 20+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node version: $(node -v)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
$PKG_MANAGER install

# Step 2: Install iOS pods
echo "📱 Step 2: Installing iOS CocoaPods..."
cd packages/mobile/ios
pod install || echo "⚠️  Pod install failed - you may need to run 'pod install' manually"
cd ../../..

# Step 3: Create environment files
echo "⚙️  Step 3: Setting up environment files..."

if [ ! -f "packages/mobile/.env" ]; then
    echo "Creating packages/mobile/.env..."
    cat > packages/mobile/.env << 'EOF'
EXPO_PUBLIC_API_URL=http://localhost:3000
EOF
    echo "✅ Created packages/mobile/.env"
else
    echo "✓ packages/mobile/.env already exists"
fi

if [ ! -f "packages/server/.env" ]; then
    echo "Creating packages/server/.env..."
    cat > packages/server/.env << 'EOF'
PORT=3000
# Uncomment and set your Frame TV IP if you have one
# FRAME_TV_HOST=192.168.1.100
# FRAME_TV_PORT=8001
EOF
    echo "✅ Created packages/server/.env"
else
    echo "✓ packages/server/.env already exists"
fi

# Step 4: TypeCheck
echo ""
echo "🔍 Step 4: Running type check..."
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm run typecheck
else
    npm run typecheck
fi

# Step 5: Build server
echo ""
echo "🔨 Step 5: Building server..."
cd packages/server
if [ "$PKG_MANAGER" = "pnpm" ]; then
    pnpm run build
else
    npm run build
fi
cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start the server (Terminal 1):"
echo "   cd packages/server && $PKG_MANAGER run dev"
echo ""
echo "2. Start the mobile app (Terminal 2):"
echo "   cd packages/mobile && $PKG_MANAGER start"
echo "   Then press 'i' for iOS Simulator"
echo ""
echo "3. Read TESTING.md for detailed test scenarios"
echo ""
echo "📖 Documentation:"
echo "   - TESTING.md - Comprehensive testing guide"
echo "   - README.md - Project overview"
echo "   - specs/001-icloud-frame-sync/quickstart.md - Feature quickstart"
echo ""
