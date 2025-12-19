# Project CTA Placement Design

## Goal

Feature availability for web and software projects more prominently on briancline.co. Current state has one CTA buried in the Connect section at the bottom.

## Requirements

- **Primary goal**: Lead generation for freelance web and software work
- **Offering**: Websites, web apps, AI/automation — full-service generalist
- **Positioning**: Selective ("I take on a few projects at a time")
- **Tone**: Confident expert ("Start a Project")
- **Constraint**: Should feel natural, not salesy

## Design: Hero-Led Approach

Two strategic CTA placements:
1. Hero section — catches high-intent visitors immediately
2. Post-projects banner — catches visitors after seeing 12 examples of work (highest conversion moment)

### Change 1: Hero Section

**Current:**
```
Brian Cline
Building what works.
On land and sea.

Entrepreneur and builder turning hands-on experience
into software that solves real problems.

[Let's Connect]
```

**Proposed:**
```
Brian Cline
Building what works.
On land and sea.

Entrepreneur and builder turning hands-on experience
into software that solves real problems.

Currently taking on select web and software projects.

[Start a Project]
```

- Change CTA from "Let's Connect" to "Start a Project"
- Link to intake.sailorskills.com instead of #connect
- Add selective positioning line above the button

### Change 2: Post-Projects CTA Banner

New dark banner between Projects and Background sections:

```
────────────────────────────────────────────────────
  AVAILABLE FOR SELECT PROJECTS

  Have something you need built?

  Websites, web apps, and automation tools —
  delivered in days, not months.

                              [Start a Project →]
────────────────────────────────────────────────────
```

- Dark background (bg-gray-900) matching existing CTA styling
- Echoes "select" language from hero
- Teases speed value prop without going deep
- High-contrast draws eye after scrolling project cards

### Change 3: Connect Section Cleanup

Remove the "Need a website? Start a Web Project" CTA block from Connect section. It becomes redundant with two prominent CTAs above.

Let Connect section focus on:
- Contact form (general inquiries)
- Schedule a call (conversations)

### Change 4: Navigation

Keep nav button as "Let's Connect" → #connect
- Provides softer path for people not ready for intake form
- Avoids competing with hero CTA

## Summary of Changes

| Location | Current | Proposed |
|----------|---------|----------|
| Nav button | "Let's Connect" → #connect | Keep as-is |
| Hero CTA | "Let's Connect" → #connect | "Start a Project" → intake |
| Hero text | (none) | Add "Currently taking on select..." line |
| After Projects | (none) | New dark CTA banner |
| Connect section | "Need a website?" CTA | Remove (redundant) |

## Future Work: Intake Page

Update intake.sailorskills.com to emphasize:
- **Lead with outcome**: "Days instead of months" / accelerated timelines
- **High-touch experience**: Personal attention, not agency black box
- **Don't lead with AI**: The tools are secondary to the results
