#!/bin/bash
# update-fireshift-feed.sh
# Runs Claude Code to pull recent commits and update the FireShift dev feed
# Scheduled via cron: Mon/Wed/Fri at 7:30 AM

set -e

# Configuration
BRIANCLINE_DIR="/Users/brian/Documents/AI/personal/briancline.io"
LOG_DIR="$HOME/logs"
LOG_FILE="$LOG_DIR/fireshift-feed-update.log"

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Log start time
echo "========================================" >> "$LOG_FILE"
echo "FireShift Feed Update: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Change to briancline.io directory
cd "$BRIANCLINE_DIR"

# Run Claude Code with the update prompt
claude -p "Update the FireShift dev feed with recent commits. Do the following:

1. Pull recent commits (last 7 days) from this repo:
   - /Users/brian/Documents/AI/sandbox/super-shift/burning-man-perimeter

2. Filter for meaningful commits (feat, fix) - skip docs, chore, refactor, test unless they have clear user impact

3. Translate each commit into customer-friendly language for Perimeter team leads. Focus on operational benefits:
   - How does this help manage 100+ volunteers?
   - How does this make shift coordination easier?
   - How does this work better in the dust with no cell service?

4. Categorize into: Mobile App, Scheduling, Tracking, Dashboard, or Infrastructure

5. Add new entries to public/data/fireshift-updates.json (don't duplicate existing commit_sha values)

6. Update the lastUpdated timestamp

7. Commit the changes with message: 'chore(feed): auto-update fireshift dev feed'

8. Push to origin main

Be concise. Skip commits that don't provide operational value to Perimeter team leads." \
  --allowedTools "Bash,Read,Edit,Write,Glob,Grep" \
  --permission-mode acceptEdits \
  >> "$LOG_FILE" 2>&1

# Log completion
echo "" >> "$LOG_FILE"
echo "Completed: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
