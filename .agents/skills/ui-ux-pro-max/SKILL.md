---
name: ui-ux-pro-max
description: "UI/UX Pro Max Skill: Professional design system rules, glassmorphism tokens, micro-interactions, responsive layouts, color harmony, typography hierarchy, and accessibility standards for web applications."
version: "2.1.0"
---

# UI/UX Pro Max Design System Guidelines

## 1. Design System Tokens & Aesthetics
- **Theme**: Ultra-Deep Dark Glassmorphism (`#080a11` primary background, `#0d111c` secondary surface, `rgba(16, 22, 36, 0.75)` glass card background with `backdrop-filter: blur(24px)`).
- **Border Tokens**: `1px solid rgba(255, 255, 255, 0.08)` subtle borders; `1px solid rgba(255, 255, 255, 0.16)` on hover/active.
- **Accent Palettes**:
  - Violet: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)`
  - Cyan: `linear-gradient(135deg, #00d2d3 0%, #2e86de 100%)`
  - Emerald: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
  - Sunset: `linear-gradient(135deg, #ff4757 0%, #ff7f50 100%)`
  - Gold: `linear-gradient(135deg, #ffa502 0%, #ff6b81 100%)`
- **Typography**: Display Font `Outfit`, Body Font `Plus Jakarta Sans`. High contrast ratios (`#f8fafc` headers, `#94a3b8` body text, `#64748b` captions).

## 2. Component Guidelines
- **Navbar**: Floating top header, glass blur (`24px`), brand icon with gradient background, search input with rounded pill border, quick actions (shortcuts, theme toggle, sound toggle, accent picker, "+ New Task").
- **Sidebar**: 280px fixed width, navigation views with active gradient highlight and left border accent, category dots with glowing halos, tag chips, productivity completion score widget.
- **Hero Dashboard Banner**: Time-of-day greeting, real-time productivity score ring, task summary, quick add button.
- **Task Cards**: Elevated glass card with 4px left priority border, title, description, priority badge (Urgent/High/Medium/Low), category tag, subtask progress bar, due date status badge, and hover action controls.
- **Filter Pills**: Rounded pill buttons (`padding: 9px 18px`), item counts, active gradient fill with glowing shadow.
- **Modals**: Glass overlay backdrop (`rgba(0, 0, 0, 0.75)`), smooth `slideUp` animation, styled inputs and native `<select>` dropdowns.

## 3. Micro-Interactions & UX Polish
- Audio synthesis via Web Audio API for task completions, button clicks, and alarms.
- Interactive canvas confetti bursts on task completions & habit streak milestones.
- Keyboard shortcuts (`/` for search, `Ctrl+N` for quick add, `?` for shortcuts overlay, `Esc` to close).
- Responsive breakpoint adaptivity for desktop, tablet, and mobile displays.
