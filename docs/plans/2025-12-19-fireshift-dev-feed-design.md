# FireShift Development Feed Design

**Date:** 2025-12-19
**Status:** Approved
**Pattern:** Based on SailorSkills development page implementation

## Overview

Add a real-time, customer-value-oriented development feed to the FireShift project page on briancline.io. Updates are translated from git commits into plain English, organized by category, targeting Perimeter team leads.

## Target Audience

Burning Man Perimeter team leads managing 100+ volunteers across shifts in a no-cell-service environment.

**Their operational challenges:**
- Scheduling: Coordinating shifts across multiple trucks and positions
- Tracking: Knowing where trucks and volunteers are on the 7-mile perimeter
- Communication: Handoffs between shifts without cell service
- Documentation: Paper schedules getting lost or dusty

## Data Structure

**File:** `public/data/fireshift-updates.json`

```json
{
  "lastUpdated": "2025-12-19T12:00:00Z",
  "stories": [
    {
      "commit_sha": "fd1c3ac",
      "date": "2025-12-10",
      "category": "Mobile App",
      "title": "Faster Schedule Sync",
      "description": "Shifts now sync in the background so your team sees the latest assignments without waiting.",
      "source": "burning-man-perimeter"
    }
  ]
}
```

## Categories

| Category | Color | Description |
|----------|-------|-------------|
| Mobile App | `#3b82f6` (blue) | Offline features, UI, voice commands |
| Scheduling | `#f59e0b` (amber) | Shift management, assignments, Babalooey integration |
| Tracking | `#10b981` (green) | Truck locations, volunteer positions |
| Dashboard | `#8b5cf6` (purple) | Web admin, reports, analytics |
| Infrastructure | `#6b7280` (gray) | Sync, offline-first, performance |

## Page Changes

**File:** `projects/fireshift.html`

Add after "Project Status" section:

1. **Development Feed Header**
   - "Built in the Open" heading
   - Tagline: "Watch FireShift evolve in real-time."
   - Stats row: Recent Updates, Categories, Release frequency

2. **Update Cards Grid**
   - 2-column on desktop, 1-column on mobile
   - Card: category badge (colored), date, title, description
   - Sorted newest first, ~10 most recent
   - "Last updated" timestamp

3. **Why Build in Public** (brief)
   - 2-3 sentence explanation
   - Link to GitHub repo

## Component

**File:** `src/components/fireshiftFeed.js`

Based on SailorSkills `developmentFeed.js`:
- Fetches `/data/fireshift-updates.json`
- Renders cards with category colors
- Updates stats in header
- Handles loading/error states

## Automation

**File:** `scripts/update-fireshift-feed.sh`

**Schedule:** Monday/Wednesday/Friday (cron)

**Process:**
1. Pull recent commits (last 7 days) from `burning-man-perimeter` repo
2. Filter for meaningful commits (feat, fix)
3. Call Claude Code to translate into customer-friendly language
4. Check `commit_sha` to avoid duplicates
5. Append to `fireshift-updates.json`
6. Update `lastUpdated` timestamp
7. Commit: "chore(feed): auto-update fireshift dev feed"
8. Push to origin main

**Translation prompt:**
```
Target audience: Burning Man Perimeter team leads managing 100+ volunteers.

Pain points:
- Coordinating shifts across multiple trucks and positions
- Tracking truck and volunteer locations on the 7-mile perimeter
- Shift handoffs in a no-cell-service environment
- Paper schedules getting lost in the dust

For each commit, generate:
1. Category (Mobile App, Scheduling, Tracking, Dashboard, Infrastructure)
2. Short title (5-8 words, action-oriented)
3. Description (1-2 sentences explaining the operational benefit)

Skip commits that are purely internal (CI/CD, tests, refactoring) unless they improve reliability.
```

## Files to Create

| File | Purpose |
|------|---------|
| `public/data/fireshift-updates.json` | Update data storage |
| `src/components/fireshiftFeed.js` | Feed rendering component |
| `src/styles/fireshift-feed.css` | Feed-specific styles |
| `scripts/update-fireshift-feed.sh` | Cron automation script |

## Files to Modify

| File | Changes |
|------|---------|
| `projects/fireshift.html` | Add dev feed section, load component |
| `vite.config.js` | Already configured for fireshift.html |

## Not Included (YAGNI)

- Vercel KV caching (static JSON sufficient)
- API endpoint (direct JSON fetch works)
- Category filtering UI (keep simple)
- Separate development page (embedded in project page)

## Implementation Order

1. Create `fireshift-updates.json` with seed data
2. Create `fireshiftFeed.js` component
3. Add styles for feed cards
4. Update `fireshift.html` with new section
5. Create `update-fireshift-feed.sh` script
6. Test locally
7. Deploy and verify
8. Add to cron schedule
