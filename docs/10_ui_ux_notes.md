# 10 — UI/UX Notes

## Design Philosophy

- Modern travel/getaway feeling — clean, airy, inspirational
- Consistent colors, spacing, and typography throughout
- Every state accounted for: loading, empty, error, success
- Responsive: desktop and mobile
- No default browser UI left unstyled

## Color Palette (to finalize in Phase 2)

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#2D6A4F` (deep green) | Buttons, links, accents |
| `--color-primary-light` | `#52B788` | Hover states |
| `--color-bg` | `#F8F9FA` | Page backgrounds |
| `--color-surface` | `#FFFFFF` | Cards, modals |
| `--color-text` | `#1B1B1B` | Primary text |
| `--color-text-muted` | `#6B7280` | Secondary text |
| `--color-error` | `#EF4444` | Error states |
| `--color-success` | `#22C55E` | Success states |

## Typography

- Font: **Inter** (Google Fonts) — clean, modern, legible
- Fallback: system-ui, sans-serif
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 px

## Component Standards

- All buttons have hover + active + disabled states
- All inputs have focus ring, error state, and helper text
- All modals have backdrop + close button + keyboard trap
- Loading states use skeleton loaders or spinners (not blank screens)
- Empty states have a helpful illustration + CTA message

## Pages

| Page | Key UX Note |
|---|---|
| Landing | Hero image (Login.png), logo, clear CTA |
| Login/Signup | Password strength meter, Google button, friendly errors |
| Dashboard | Map centered on user, budget slider, AI generate button |
| Plan view | Card-based day/activity layout, Save button |
| Saved Trips | List with trip title, date, cost; empty state illustration |

## Accessibility

- All interactive elements keyboard-navigable
- Color contrast meets WCAG AA minimum
- Screen reader labels on icon-only buttons
- Location permission explained in plain language before requesting
