# CLAUDE.md - briancline.io

Personal landing page for Brian Cline.

## Project Overview

Single-page landing site targeting professional network (entrepreneurs, tech folks, men's work community). Goal: establish trust & credibility with clear paths to connect.

## Tech Stack

- **Build**: Vite + vanilla JS
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel (planned)
- **Contact Form**: Formspree (to be configured)
- **Scheduling**: Calendly embed

## Project Structure

```
briancline.io/
├── index.html          # Main page with all sections
├── src/
│   ├── main.js         # Minimal JS (smooth scroll, nav effects)
│   └── styles/
│       └── main.css    # Tailwind imports + custom styles
├── public/
│   └── images/         # Headshot, project images
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Page Sections

1. **Hero** - Name, tagline "Building what works. On land and sea."
2. **Current Focus** - SailorSkills highlight
3. **Projects** - 6 project cards
4. **Background** - Brief narrative of experience
5. **Connect** - Contact form + Calendly
6. **Footer** - Social links (LinkedIn, GitHub, Strava)

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

## To Configure Before Launch

1. Replace placeholder images with actual headshot/photos
2. Update Formspree form ID in contact form action
3. Update Calendly link
4. Add actual LinkedIn, GitHub, Strava URLs
5. Configure custom domain in Vercel
