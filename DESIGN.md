# Portfolio V5 — Design System

## Status

This is the visual source of truth for Yiqiang Adrian Liu’s portfolio: Homepage, Archive, About, Project Detail, future motion and interaction, project preview assets, and live-demo visual refreshes.

Do not reinterpret the site as a generic developer portfolio, SaaS landing page, AI startup, or hacker-themed interface. It is a personal technical magazine made by an independent developer.

## Core identity

- **Name:** Yiqiang Adrian Liu
- **Positioning:** Independent Developer & Builder
- **Character:** Editorial. Technical. Sharp. Restrained. Experimental. Intentional.

The site should feel closer to an independent technology publication than a conventional portfolio template.

## Principles

### Editorial first

Typography, spacing, composition, and hierarchy carry the design. Do not solve weak hierarchy with more cards, effects, gradients, borders, or decoration. Large type should behave as magazine layout, with controlled asymmetry and useful negative space.

### Technical, not cyberpunk

Terminal output, status labels, signal language, metadata, diagrams, monospace labels, subtle grids, and scanline references are allowed when meaningful. Avoid Matrix effects, persistent glow, decorative fake code, robot/AI imagery, and terminal clichés without information.

### Mostly flat, selectively layered

Depth comes from typography overlap, motion, foreground/background relationships, real previews, meaningful screens, and controlled section contrast. Do not use generic drop shadows or glassmorphism.

## Color

| Token | Value | Use |
| --- | --- | --- |
| Primary background | `#050706` | Page field |
| Green-black 1 | `#070A08` | Subtle section contrast |
| Green-black 2 | `#090D0A` | Dense field |
| Green-black 3 | `#0C110E` | Meaningful technical surfaces |
| Acid signal | `#A6FF1A` | Important emphasis, active/live state, primary CTA, technical signal |
| Primary text | `#EDF1EC` | Display and reading text |
| Secondary text | `#BAC3BB` | Supporting copy |
| Muted metadata | `#758077` | Technical context |

Acid green is a signal color, not general decoration. Do not make all links, tags, borders, headings, and metadata green. Avoid large pure-white areas.

## Borders and shape

Use selective 1px deep-green borders for major separators, terminal surfaces, meaningful technical screens, secondary system panels, and project leaderboard rows. Do not box every section.

The shape language is sharp: prefer `0px` radius, or an extremely small radius only when technically necessary. Avoid soft SaaS cards, pills, bubbles, glass panels, and large rounded rectangles.

## Typography

The site uses three families:

- **Bricolage Grotesque** — display: hero name, major headings, project names, editorial statements, contact type. Recommended variable settings: `wdth 94`, `opsz 48`.
- **Instrument Sans** — body: readable descriptions, supporting copy, explanatory text.
- **IBM Plex Mono** — technical metadata: section numbers, status, years, project classes, terminal output, nav, system state, issue/volume metadata.

Do not use monospace everywhere.

## Hero

The primary lockup is:

```text
YIQIANG
ADRIAN LIU
```

`LIU` may remain acid green. Keep “I build useful things — sometimes strange ones.”, “Independent Developer & Builder”, and broad categories such as “Systems / Tools / Experiments”. Do not turn the hero into AI positioning.

Ghost type may use `ADRIAN` and `2026`; it remains low contrast and subordinate.

## AI positioning

AI is part of the work, not the identity. Do not repeatedly position the site or person as an AI Engineer, AI Developer, AI Builder, or LLM Expert. Use terms such as agentic workflows, agent products, developer tools, local AI, automation systems, and human-in-the-loop systems only where relevant. The hero does not need AI language.

## Featured project

Featured communicates useful information in this order:

1. Project name
2. What it is
3. Why it is interesting
4. How it works
5. Metadata
6. CTA
7. Atmosphere

Do not dedicate large space to decorative artwork that does not explain the project. For InterDemTV, a compact functional signal flow is preferred:

```text
CURATED SOURCES
        ↓
RANDOM CHANNEL
        ↓
FILTER / SAVE / NEXT
```

Use IBM Plex Mono metadata, thin rules, arrows/signal lines, restrained acid-green signal, near-black background, and sharp geometry. The diagram supports the project title; it never becomes a SaaS flowchart, colorful diagram, or giant card.

## Selected systems

Codex Provider Switcher is the primary system and remains largely unboxed; its terminal is the framed technical surface. Job Search Agent and Local Voice Assistant remain quieter and staggered secondary systems. Do not turn this into an equal-card grid.

## Project index

The Project Index is a signature leaderboard/editorial-table component, never cards. Project name is strongest; number/status are secondary signal; class/year are metadata.

Future hover previews use meaningful real project visuals (interface, terminal state, product UI crop, visualization, or system output), not generic art. A hovered row will shift slightly, receive signal emphasis, dim peers, and show a preview above the list. Mobile removes cursor-dependent preview. Do not implement this system before its dedicated motion pass.

## NOW and Contact

NOW stays concise with BUILDING / EXPLORING. AI can appear naturally in current work but must not become a set of skill badges. The preferred BUILDING copy is: “Building developer tools, agentic workflows, and small agent products for real use.”

Contact keeps “Get in touch.”, optional acid-green `touch.`, and compact solid acid-green `SEND A SIGNAL`. Never turn it into a pill-shaped SaaS CTA.

## Motion

Motion later creates depth, not animation for its own sake. Avoid bouncing, excessive springs, large zooms, constant ambient motion, heavy glitch, and animation on every element. Planned treatments are line-based hero reveal, small ghost-type scroll parallax, restrained section reveal, signature Project Index hover, and subtle magnetic Contact CTA. Always support `prefers-reduced-motion`.

Do not implement these effects before their dedicated pass.

## Responsive behavior

Desktop can use asymmetry, staggered panels, overlap, and floating previews. Mobile prioritizes readability, no horizontal overflow, simple stacking, reduced background type, and no cursor-dependent effects.

## Brand mark and previews

Navbar branding and favicon development are handled separately. Do not redesign them during normal frontend work. Prefer real project interfaces over decorative mockups, and do not permanently capture poor screenshots solely to finish hover previews. Existing demos will be assessed independently for redesign, facelift, stronger portfolio preview, or lower prominence.

## Implementation rule

For every component, ask: does it feel like part of the same technical magazine, and does each visual element improve hierarchy, comprehension, navigation, atmosphere, or project understanding? If not, remove it. Default to restraint.
