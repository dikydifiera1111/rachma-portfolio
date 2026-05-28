# Cover Section — "making things move" (balloon + clouds)

Date: 2026-05-28
Reference: meshmeadow.vercel.app (recolored to purple theme)

## Goal

Add a dreamy full-viewport cover section above the existing hero. Purple gradient
sky, fluffy CSS clouds at the bottom, a floating pure-SVG hot air balloon top-left,
a large italic serif tagline centered, and a CSS scroll indicator. Pure CSS + inline
SVG only — no image assets.

## Placement & Scope

- New `<section id="cover" class="cover-section">` inserted BEFORE `<section id="hero">`
  in `index.html` (currently line 160).
- Existing hero (name, portrait, orbit tools, particles) left fully intact.
- CSS added to `style.css` (`:root` tokens + section rules).
- Animation = pure CSS keyframes. No new JS module. `main.js` untouched.
- Google Fonts `<link>` for Playfair Display Italic added in `<head>` next to existing
  Outfit/Inter links.

## Layout & z-index layering

| Layer | z-index | Technique |
|-------|---------|-----------|
| Background gradient | 0 | `linear-gradient` purple top→bottom on `.cover-section` |
| Clouds (bottom ~35vh) | 1 | 3+ `<div>` with radial-gradient + `filter: blur()` |
| Balloon | 2 | inline SVG ~180×240, absolute top-left `-20px / 60px`, wrapper float anim |
| Tagline | 3 | Playfair Display Italic, centered, `clamp(48px, 7vw, 96px)` |
| Scroll indicator | 4 | mouse-shape, CSS only, bottom-center |

## CSS Custom Properties (`:root`, prefix `--cover-` to avoid collisions)

| Variable | Value |
|----------|-------|
| `--cover-grad-top` | `#6B21A8` |
| `--cover-grad-mid` | `#A855F7` |
| `--cover-grad-bot` | `#C084FC` |
| `--cover-cloud-dark` | `#7C3AED` |
| `--cover-cloud-light` | `#DDD6FE` |
| `--cover-text` | `#F3E8FF` |
| `--cover-balloon-1` | `#A855F7` |
| `--cover-balloon-2` | `#7C3AED` |
| `--cover-balloon-3` | `#E9D5FF` |
| `--cover-balloon-4` | `#FAF5FF` |
| `--cover-basket` | `#3B0764` |
| `--cover-scroll` | `#E9D5FF` |

## Typography

- Family: Playfair Display, italic, weight 600–700.
- Size: `clamp(48px, 7vw, 96px)`.
- Color: `var(--cover-text)` (`#F3E8FF`).
- Tagline: "making things move". Wraps naturally on mobile (allowed).

## Cloud technique

Min 3 absolutely-positioned `<div>` blobs at bottom of section. Each: large
`border-radius`, `radial-gradient` from `--cover-cloud-light` core to transparent
edge, `filter: blur(...)`. Stacked/overlapped to read as one fluffy layer covering
the bottom ~35vh. Soft blurred edges.

## Balloon technique (inline SVG)

- Total ~180×240.
- Dome: rounded teardrop path, vertical stripe panels alternating
  `--cover-balloon-1/2/3`.
- 4 diagonal ropes (`<line>`) from dome base to basket corners.
- Basket: rounded `<rect>`, fill `--cover-basket` (`#3B0764`).
- Character: circle head + simple body shape inside basket, dark hair.
- Highlight accents via `--cover-balloon-4` (`#FAF5FF`).

## Animation

- `@keyframes coverFloat`: `translateY(0)` → `translateY(-12px)` → `translateY(0)`,
  `3.5s ease-in-out infinite`, applied to balloon wrapper.
- Scroll indicator: small dot loop translating down inside the mouse shape.
- `@media (prefers-reduced-motion: reduce)` disables float + dot loop.

## Responsive breakpoints (mobile-first)

| Breakpoint | Balloon | Tagline |
|-----------|---------|---------|
| 375px | scale ~0.6, nudged on-screen | ~48px (clamp min) |
| 768px | scale ~0.8 | ~7vw |
| 1280px+ | full 180×240, `left:-20px; top:60px` | ~96px (clamp max) |

## Constraints

- No external image assets (CSS + inline SVG only).
- Touch only the cover section + its tokens/styles. No nav/footer/other-section edits.
- All colors via `--cover-*` custom properties; zero hardcoded hex in the markup.
- Scroll indicator points down toward the hero below.
