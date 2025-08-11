#!/bin/bash

# Development scripts for TagYou Android app
# Make this file executable: chmod +x dev_scripts.sh

# Android SDK paths
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Function to start emulator
start_emulator() {
    echo "Starting Android emulator..."
    $ANDROID_HOME/emulator/emulator -avd Medium_Phone_API_36.0 &
    echo "Emulator starting... wait a moment for it to boot"
}

# Function to check emulator status
check_emulator() {
    echo "Checking emulator status..."
    adb devices
}

# Function to install and run app
install_and_run() {
    echo "Building and installing app..."
    ./gradlew installDebug
    echo "Launching app..."
    adb shell am start -n com.tagyou.festivaltracker/.MainActivity
}

# Function to view app logs
view_logs() {
    echo "Viewing app logs (Ctrl+C to stop)..."
    adb logcat | grep "TagYou"
}

# Function to clear app data
clear_app_data() {
    echo "Clearing app data..."
    adb shell pm clear com.tagyou.festivaltracker
}

# Function to uninstall app
uninstall_app() {
    echo "Uninstalling app..."
    adb uninstall com.tagyou.festivaltracker
}

# Main menu
case "$1" in
    "start")
        start_emulator
        ;;
    "check")
        check_emulator
        ;;
    "install")
        install_and_run
        ;;
    "logs")
        view_logs
        ;;
    "clear")
        clear_app_data
        ;;
    "uninstall")
        uninstall_app
        ;;
    *)
        echo "TagYou Android Development Scripts"
        echo "Usage: ./dev_scripts.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start     - Start the Android emulator"
        echo "  check     - Check emulator status"
        echo "  install   - Build, install and run the app"
        echo "  logs      - View app logs"
        echo "  clear     - Clear app data"
        echo "  uninstall - Uninstall the app"
        echo ""
        echo "Example: ./dev_scripts.sh install"
        ;;
esac
