---
name: "aircrushin"
description: "A precise, quiet, cultivated personal portfolio for an independent software atelier."
colors:
  sea-ink: "oklch(0.23 0.026 204)"
  sea-ink-soft: "oklch(0.43 0.024 204)"
  lagoon: "oklch(0.72 0.085 185)"
  lagoon-deep: "oklch(0.46 0.08 188)"
  lacquer: "oklch(0.43 0.16 27)"
  brass: "oklch(0.74 0.105 86)"
  sand: "oklch(0.92 0.018 190)"
  foam: "oklch(0.97 0.012 185)"
  surface: "oklch(0.965 0.012 190 / 0.84)"
  surface-strong: "oklch(0.985 0.01 190 / 0.96)"
  line: "oklch(0.57 0.026 204 / 0.22)"
  dark-ink: "oklch(0.12 0.018 204)"
  dark-surface: "oklch(0.18 0.022 204 / 0.82)"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "5.6rem"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "0"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "0"
  title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0"
  body:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  label:
    fontFamily: "Schibsted Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "8px"
  control: "6px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.sea-ink}"
    textColor: "{colors.foam}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.sea-ink}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
    height: "40px"
  chip:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.sea-ink-soft}"
    rounded: "{rounded.md}"
    padding: "6px 11px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.sea-ink}"
    rounded: "{rounded.md}"
    padding: "28px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.sea-ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
---

# Design System: aircrushin

## 1. Overview

**Creative North Star: "The Software Atelier Ledger"**

This system should feel like a small studio record for serious software work: crisp, quiet, organized, and personal. It is a brand surface, so the first impression matters, but the page earns polish through proportion, type, and controlled rhythm rather than decorative spectacle.

The atmosphere is cool porcelain in light mode and ink-studio in dark mode. Visitors should feel they are reading a curated work ledger, not browsing an API dump or a portfolio theme. PRODUCT.md defines the voice as "Precise, quiet, cultivated"; every surface should keep that line.

It explicitly rejects generic SaaS landing pages, oversized stat blocks, neon hacker aesthetics, glassy blur-heavy cards, identical icon grids, portfolio pages that feel like a theme preview, beige editorial minimalism, and dark-blue developer dashboard convention.

**Key Characteristics:**
- Editorial display type balanced by compact technical labels.
- Restrained OKLCH palette with one rare lacquer accent.
- Thin structural rules, ledger rows, and gridded sections instead of decorative card piles.
- Small-radius, tactile components with visible focus states.
- Motion that supports state and orientation, never choreography for its own sake.

## 2. Colors

The palette is a restrained porcelain-and-ink system with a lacquer accent and a brass secondary note. OKLCH is the source of truth.

### Primary
- **Atelier Ink** (`sea-ink`): Main text, primary buttons, brand mark, section anchors, and high-confidence surfaces. It supplies authority without falling into pure black.
- **Lacquer Signal** (`lacquer`): The rare emphasis color for kickers, bullets, location icons, active navigation, and meaningful marks. It should stay under 10 percent of any viewport.

### Secondary
- **Lagoon Draft** (`lagoon`): Soft environmental color for ambient hero washes and generated project-cover fields.
- **Lagoon Deep** (`lagoon-deep`): Links, secondary affordances, and hover emphasis where lacquer would feel too loud.
- **Brass Glint** (`brass`): Sparse timeline and dark-mode label emphasis. Use as a supporting note, not a call-to-action color.

### Neutral
- **Porcelain Foam** (`foam`): Main light-mode page surface and inverse text on ink controls.
- **Pale Sand** (`sand`): Light-mode environmental base for large page backgrounds.
- **Draft Surface** (`surface`): Card, form, and panel background with mild translucency.
- **Strong Surface** (`surface-strong`): Header, buttons, popovers, chips, and surfaces that need more legibility.
- **Measured Line** (`line`): Borders, dividers, grid rules, and ledger row separators.
- **Ink Studio** (`dark-ink`): Dark-mode canvas.
- **Night Surface** (`dark-surface`): Dark-mode card and panel layer.

### Named Rules

**The Lacquer Rarity Rule.** Lacquer is a mark, not a wash. Use it for active state and small semantic signals only.

**The Tinted Neutral Rule.** Never use pure black or pure white. All neutrals must carry the portfolio's cool ink hue.

**The Porcelain Not Beige Rule.** The light theme must stay cool, airy, and technical. If it starts reading tan, cream, or generic editorial, correct the palette.

## 3. Typography

**Display Font:** Literata with Georgia fallback  
**Body Font:** Schibsted Grotesk with system sans fallback  
**Label/Mono Font:** Schibsted Grotesk unless data truly needs monospace

**Character:** Literata gives the portfolio its cultivated, almost archival presence. Schibsted Grotesk keeps labels, controls, and project metadata practical and contemporary. The pair should read like a studio ledger, not a magazine layout.

### Hierarchy
- **Display** (500, `5.6rem`, `0.95`): Hero headlines only. Large type is the first-viewport signal and should be left-aligned with a tight measure.
- **Headline** (500, `3rem`, `1.04`): Section titles and major editorial breaks.
- **Title** (650, `1.875rem`, `1.2`): Featured project titles, contact panels, and major card headings.
- **Body** (400, `1rem`, `1.5`): Paragraph copy, project descriptions, form helper copy, and readable content. Keep prose around 65 to 75 characters.
- **Label** (700, `0.7rem`, `0.16em`, uppercase): Kicker lines, category names, ledger labels, and chip categories. Use sparingly so labels feel intentional.

### Named Rules

**The Ledger Type Rule.** Use display type for identity and orientation; use grotesk type for operations, metadata, and controls.

**The No Decorative Mono Rule.** Monospace is not shorthand for technical taste. Use it only when the content is genuinely code-like or tabular.

## 4. Elevation

This system uses a hybrid of tonal layering, thin borders, and soft ambient shadows. Depth should feel like paper and ink under controlled light, not floating glass. Surfaces are structured first by borders and spacing; shadows support hierarchy only on cards and project surfaces.

### Shadow Vocabulary
- **Surface Lift** (`0 18px 32px oklch(0.23 0.026 204 / 0.07), 0 4px 14px oklch(0.23 0.026 204 / 0.05)`): Standard surface cards and contact panels.
- **Project Lift** (`0 22px 40px oklch(0.23 0.026 204 / 0.08), 0 6px 18px oklch(0.23 0.026 204 / 0.06)`): Project cards and portfolio work surfaces.
- **Inset Glint** (`0 1px 0 var(--inset-glint) inset`): Subtle top highlight that keeps translucent surfaces legible.
- **Input Trace** (`0 1px 2px rgb(0 0 0 / 0.05)`): Default control shadow from the UI primitive layer.

### Named Rules

**The Border-First Rule.** If a surface can be separated by a measured line and spacing, do that before increasing shadow.

**The No Glass Rule.** Do not add decorative blur or frosted-card effects. Translucency is allowed only when paired with crisp borders and readable contrast.

## 5. Components

### Buttons

- **Shape:** Small, disciplined corners (`4px` on public hero buttons, `6px` from the shared button primitive).
- **Primary:** Atelier Ink background with Porcelain Foam text; large public CTAs use `10px 24px` padding and `40px` height.
- **Hover / Focus:** Hover shifts color subtly. Focus uses a visible ring based on the `ring` token and must remain obvious on both themes.
- **Secondary / Outline:** Strong Surface background, thin Measured Line border, Atelier Ink text. It should feel quieter than primary, not pale or disabled.

### Chips

- **Style:** Compact tags with Draft Surface or Strong Surface backgrounds, Measured Line border, and soft ink text.
- **State:** Active chips invert to Atelier Ink with Porcelain Foam text. Do not add icons unless the chip is interactive and needs a clear affordance.

### Cards / Containers

- **Corner Style:** Gently squared (`8px`). Avoid pill-shaped or oversized rounded portfolio cards.
- **Background:** Draft Surface over the porcelain page field, with Strong Surface for higher contrast elements.
- **Shadow Strategy:** Use Surface Lift for normal panels and Project Lift for work cards. Borders remain visible.
- **Border:** Always use Measured Line for project cards, content panels, and form containers.
- **Internal Padding:** Use `24px` to `28px` for cards; compact cards can reduce to `16px` only when the content is metadata-heavy.

### Inputs / Fields

- **Style:** Transparent or Draft Surface field, `8px` radius, Measured Line border, `36px` default height.
- **Focus:** Ring plus border shift using the `ring` token. Focus states must not rely on color alone.
- **Error / Disabled:** Destructive states use the destructive token and preserve the same radius and padding vocabulary.

### Navigation

- **Style:** Sticky, opaque header with a thin bottom border and no blur. Brand mark is a compact ink square with lowercase initials.
- **Typography:** Body sans at `14px` for links; active links get a thin Lacquer Signal underline.
- **Desktop Treatment:** Centered nav, utility icon controls on the right, brand on the left.
- **Mobile Treatment:** Icon controls remain visible; primary navigation collapses into the menu button with a stacked text menu.

### Signature Component: Hero Ledger

The hero ledger is the portfolio's signature structure: a right-side record with a hard top rule, row separators, uppercase labels, and compact values. It should communicate technical depth through organization, not through oversized metrics.

### Signature Component: Project Card

Project cards are framed work objects. The featured card may include a generated cover field; compact cards skip imagery and rely on title, description, language, star count, and live-link metadata. Cards must never contain nested interactive links.

## 6. Do's and Don'ts

### Do:

- **Do** keep the public homepage as a brand surface: the design is part of the product.
- **Do** use OKLCH tokens from `src/styles.css` as the canonical palette.
- **Do** preserve the "Precise, quiet, cultivated" personality from PRODUCT.md.
- **Do** make work feel curated, not dumped from an API.
- **Do** use thin full borders, ledger rows, and measured spacing before adding more cards.
- **Do** keep the lacquer accent rare and meaningful.
- **Do** preserve bilingual English and Chinese content, visible focus states, reduced-motion behavior, and responsive hierarchy.
- **Do** use lucide icons only where they clarify an action or state.

### Don't:

- **Don't** create generic SaaS landing pages.
- **Don't** use oversized stat blocks or the hero-metric template.
- **Don't** use neon hacker aesthetics.
- **Don't** use glassy blur-heavy cards.
- **Don't** create identical icon grids.
- **Don't** make portfolio pages that feel like a theme preview.
- **Don't** let the design collapse into beige editorial minimalism.
- **Don't** let the design become dark-blue developer dashboard convention.
- **Don't** use side-stripe borders, gradient text, nested cards, or decorative glassmorphism.
- **Don't** use pure black, pure white, or decorative monospace.
