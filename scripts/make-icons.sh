#!/usr/bin/env bash
# ----------------------------------------------------------------------
# Generate app icons (icon.png, icon.ico, icon.icns) for AgentDock.
#
# Prereqs:
#   - ImageMagick (`magick` or `convert`) on PATH
#   - macOS only:  built-in `iconutil` (already on PATH on macOS)
#
# Usage:
#   1. Drop a 1024x1024 PNG at apps/desktop/resources/branding/icon.png
#      (or pass a path as the first argument).
#   2. Run this script:  ./scripts/make-icons.sh
#
# Output: apps/desktop/build/icon.{png,ico,icns}
# ----------------------------------------------------------------------

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="$HERE/../apps/desktop/build"
SOURCE="${1:-$HERE/../apps/desktop/resources/branding/icon.png}"

if [ ! -f "$SOURCE" ]; then
  echo "[make-icons] Source image not found: $SOURCE"
  echo "[make-icons] Drop a 1024x1024 PNG there first."
  exit 1
fi

mkdir -p "$BUILD"

# Pick the ImageMagick binary
if command -v magick >/dev/null 2>&1; then
  IM=magick
elif command -v convert >/dev/null 2>&1; then
  IM=convert
else
  echo "[make-icons] ImageMagick not found (install with: brew install imagemagick / apt install imagemagick)"
  exit 1
fi

echo "[make-icons] Generating 512x512 PNG..."
"$IM" "$SOURCE" -resize 512x512 "$BUILD/icon.png"

echo "[make-icons] Generating multi-size .ico (Win)..."
"$IM" "$SOURCE" -define icon:auto-resize=256,128,96,64,48,32,16 "$BUILD/icon.ico"

if [ "$(uname -s)" = "Darwin" ]; then
  echo "[make-icons] Generating .icns (macOS)..."
  ICNSET="$BUILD/icon.iconset"
  rm -rf "$ICNSET"
  mkdir -p "$ICNSET"
  for size in 16 32 64 128 256 512 1024; do
    "$IM" "$SOURCE" -resize ${size}x${size} "$ICNSET/icon_${size}x${size}.png"
  done
  # 2x variants expected at half the size
  cp "$ICNSET/icon_32x32.png"   "$ICNSET/icon_16x16@2x.png"
  cp "$ICNSET/icon_64x64.png"   "$ICNSET/icon_32x32@2x.png"
  cp "$ICNSET/icon_256x256.png" "$ICNSET/icon_128x128@2x.png"
  cp "$ICNSET/icon_512x512.png" "$ICNSET/icon_256x256@2x.png"
  cp "$ICNSET/icon_1024x1024.png" "$ICNSET/icon_512x512@2x.png"
  iconutil -c icns "$ICNSET" -o "$BUILD/icon.icns"
  rm -rf "$ICNSET"
fi

echo "[make-icons] Done."
