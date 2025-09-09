#!/bin/bash

# Auto-push script for movie-posters-theme
# This script automatically commits and pushes changes to GitHub

echo "🚀 Auto-pushing changes to GitHub..."

# Add all changes
git add .

# Get current timestamp
timestamp=$(date "+%Y-%m-%d %H:%M:%S")

# Commit with timestamp
git commit -m "Auto-update: $timestamp - Theme modifications"

# Push to GitHub
git push origin main

echo "✅ Successfully pushed to GitHub!"
echo "📅 Timestamp: $timestamp"
echo "🔗 Repository: https://github.com/macodys/movie-posters-theme"
