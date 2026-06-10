@echo off
REM ----------------------------------------------------------------------
REM Generate app icons (icon.png, icon.ico, icon.icns) for AgentDock.
REM
REM Prereqs:
REM   - ImageMagick (https://imagemagick.org) on PATH
REM   - macOS only:  built-in `iconutil` (already on PATH on macOS)
REM
REM Usage:
REM   1. Drop a 1024x1024 PNG named `icon-source.png` in this directory
REM      (or in apps/desktop/resources/branding/).
REM   2. Run this script:  `scripts\make-icons.bat` (Win) or `./make-icons.sh` (mac/Linux)
REM
REM Output: apps/desktop/build/icon.{png,ico,icns}
REM ----------------------------------------------------------------------

setlocal

set HERE=%~dp0
set BUILD=%HERE%..\build
set SOURCE=%~1

if "%SOURCE%"=="" set SOURCE=%HERE%..\resources\branding\icon.png

if not exist "%SOURCE%" (
  echo [make-icons] Source image not found: %SOURCE%
  echo [make-icons] Drop a 1024x1024 PNG there first.
  exit /b 1
)

if not exist "%BUILD%" mkdir "%BUILD%"

echo [make-icons] Generating 512x512 PNG...
magick "%SOURCE%" -resize 512x512 "%BUILD%\icon.png"

echo [make-icons] Generating multi-size .ico (Win)...
magick "%SOURCE%" -define icon:auto-resize=256,128,96,64,48,32,16 "%BUILD%\icon.ico"

if "%OS%"=="Windows_NT" goto :skipicns
echo [make-icons] Generating .icns (macOS)...
set ICNSET=%BUILD%\icon.iconset
if exist "%ICNSET%" rmdir /s /q "%ICNSET%"
mkdir "%ICNSET%"
magick "%SOURCE%" -resize 16x16      "%ICNSET%\icon_16x16.png"
magick "%SOURCE%" -resize 32x32      "%ICNSET%\icon_16x16@2x.png"
magick "%SOURCE%" -resize 32x32      "%ICNSET%\icon_32x32.png"
magick "%SOURCE%" -resize 64x64      "%ICNSET%\icon_32x32@2x.png"
magick "%SOURCE%" -resize 128x128    "%ICNSET%\icon_128x128.png"
magick "%SOURCE%" -resize 256x256    "%ICNSET%\icon_128x128@2x.png"
magick "%SOURCE%" -resize 256x256    "%ICNSET%\icon_256x256.png"
magick "%SOURCE%" -resize 512x512    "%ICNSET%\icon_256x256@2x.png"
magick "%SOURCE%" -resize 512x512    "%ICNSET%\icon_512x512.png"
magick "%SOURCE%" -resize 1024x1024  "%ICNSET%\icon_512x512@2x.png"
iconutil -c icns "%ICNSET%" -o "%BUILD%\icon.icns"
rmdir /s /q "%ICNSET%"
:skipicns

echo [make-icons] Done.
endlocal
