#!/bin/bash

# Quick push function for immediate changes
# Usage: ./push-changes.sh "Description of changes"

DESCRIPTION=${1:-"Theme update"}

echo "🔄 Pushing changes: $DESCRIPTION"

git add .
git commit -m "$DESCRIPTION"
git push origin main

echo "✅ Changes pushed to GitHub!"
echo "🔗 View at: https://github.com/macodys/movie-posters-theme"
