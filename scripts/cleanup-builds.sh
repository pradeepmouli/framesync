#!/bin/bash

# Xcode Build Cleanup Script
# Cleans up Xcode build artifacts and caches to free disk space
#
# Usage:
#   ./scripts/cleanup-builds.sh           # Interactive mode (asks before deleting)
#   ./scripts/cleanup-builds.sh --auto    # Automatic mode (deletes without asking)

set -e

AUTO_MODE=false
if [[ "$1" == "--auto" ]]; then
    AUTO_MODE=true
fi

echo "🧹 Starting Xcode build cleanup..."
echo ""

# Function to show size and clean a directory
cleanup_dir() {
    local dir="$1"
    local name="$2"

    if [ -d "$dir" ]; then
        local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "📦 $name: $size"

        if [ "$AUTO_MODE" = true ]; then
            rm -rf "$dir"
            echo "   ✅ Deleted"
        else
            read -p "   Delete? (y/N) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rm -rf "$dir"
                echo "   ✅ Deleted"
            else
                echo "   ⏭️  Skipped"
            fi
        fi
    else
        echo "📦 $name: Not found (already clean)"
    fi
    echo ""
}

# Xcode DerivedData (build artifacts) - typically 5-10GB
cleanup_dir ~/Library/Developer/Xcode/DerivedData "Xcode DerivedData"

# Xcode Archives (old app builds)
cleanup_dir ~/Library/Developer/Xcode/Archives "Xcode Archives"

# CocoaPods cache - typically 1-2GB
cleanup_dir ~/Library/Caches/CocoaPods "CocoaPods Cache"

# Xcode DeviceSupport (old iOS device support files)
cleanup_dir ~/Library/Developer/Xcode/iOS\ DeviceSupport "iOS DeviceSupport"

# Xcode module cache
cleanup_dir ~/Library/Developer/Xcode/DerivedData/ModuleCache.noindex "Xcode Module Cache"

# Local project build folders
echo "📦 Local project builds"
cd "$(dirname "$0")/.."
for build_dir in packages/*/ios/build packages/*/android/build packages/*/android/.gradle; do
    if [ -d "$build_dir" ]; then
        size=$(du -sh "$build_dir" 2>/dev/null | cut -f1 || echo "0B")
        echo "   - $build_dir: $size"
        rm -rf "$build_dir"
        echo "     ✅ Deleted"
    fi
done
echo ""

# Expo caches
echo "📦 Expo caches"
for expo_cache in packages/*/.expo; do
    if [ -d "$expo_cache" ]; then
        size=$(du -sh "$expo_cache" 2>/dev/null | cut -f1 || echo "0B")
        echo "   - $expo_cache: $size"
        rm -rf "$expo_cache"
        echo "     ✅ Deleted"
    fi
done
echo ""

# Show final disk space
echo "💾 Disk space status:"
df -h / | awk 'NR==2 {print "   Available: " $4}'
echo ""

echo "✨ Cleanup complete!"
echo ""
echo "💡 To rebuild your iOS project:"
echo "   cd packages/mobile"
echo "   npx pod-install"
echo "   npx expo run:ios"
