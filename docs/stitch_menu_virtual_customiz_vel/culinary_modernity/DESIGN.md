---
name: Culinary Modernity
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#5a4138'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#8e7166'
  outline-variant: '#e2bfb2'
  surface-tint: '#a73a00'
  primary: '#a33900'
  on-primary: '#ffffff'
  primary-container: '#cc4900'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb599'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#8d4b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#b15f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.025em
  price-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system serves a dual-purpose culinary ecosystem: an alluring, sensory-rich guest ordering flow paired with a high-velocity, ergonomic operator POS and back-office management system. 

The aesthetic is Modern Tactile Minimalism, rooted in culinary warmth. The environment pairs deep charcoal, soot, and slate structure with rich terracotta and fiery amber accents. The emotional goal for guests is appetite stimulation, effortless discovery, and trust. For floor staff and managers, the emotional goal is unflappable clarity, zero-friction muscle memory, and low visual fatigue under high-pressure kitchen and counter rushes.

The system avoids sterile utilitarian software patterns by celebrating food through expansive media surfaces, warm-tinted neutral foundations, and crisp, micro-delineated component architecture.

## Colors

The core palette draws from fire, clay, and cast iron:
- **Primary (`#EA580C`)**: Deep terracotta flame. Used for principal calls-to-action (e.g., "Add to Order", "Fire Ticket"), critical progress states, and key navigational anchors.
- **Secondary (`#F97316`)**: Vivid amber glaze. Used for active badges, modifiable ingredients, accent highlights, and secondary interactive moments.
- **Tertiary (`#D97706`)**: Warm honey amber. Reserved for modifier upsells, alert states, and preparation timing signals.
- **Neutral (`#1E293B`)**: Slate cast iron. Anchors text hierarchy, high-contrast modal backdrops, and POS control bars.

### Contextual Color Modes
- **Customer Menu / Tablet Display**: Defaults to an appetizing light stone base (`#FAFAF9` canvas, `#FFFFFF` cards) with terracotta primaries to maintain high visibility and daylight vibrancy.
- **Kitchen / POS Terminal Mode**: Shifts dynamically to an inverted slate palette (`#0F172A` ground, `#1E293B` surfaces) with vivid `#F97316` and status cues to minimize glare under restaurant lighting and highlight operational alerts.

## Typography

Typography pairs the structural precision of **Inter** for data density and ergonomic readability with the warm, geometric openness of **Plus Jakarta Sans** for menu items, categories, and prices.

- **Plus Jakarta Sans** provides welcoming curves on headings and price tags, softening the technical edge of transactional screens.
- **Inter** handles dense back-office grids, modifier checklists, order summaries, and receipt displays with neutrality and high legibility at 11px to 14px sizes.
- **Numbers & Prices**: Standardize on tabular figures (`tnum`) across all pricing, ticket numbers, inventory counts, and modifiers to ensure vertical columns always align neatly in tables, receipts, and order tickets.

## Layout & Spacing

The layout is built upon an 8-point base grid scaled via a fluid container system:
- **Mobile (< 640px)**: 4-column layout with `1rem` margins. Menus render as single-column food cards with persistent bottom summary bars. Back-office switches into full-width stacked list rows.
- **Tablet / POS Screen (640px - 1024px)**: 8-column layout with `1.5rem` margins. Optimized for landscape tablet usage: a split-view partition allocating 60% width to catalog/grid selection and 40% fixed width to the live order ticket/cart.
- **Desktop / Admin Dashboard (> 1024px)**: 12-column layout with `2.5rem` margins and `1.5rem` gutters. Accommodates multi-column menu engineering tools, kitchen display matrices, and administrative tables.

Element gaps must adhere strictly to proportional roles: micro gaps (`space-xs` and `space-sm`) for badge-to-title associations, standard gaps (`space-md`) for form controls and modifier selections, and layout breaks (`space-xl` and above) between menu courses and ticket sections.

## Elevation & Depth

Visual hierarchy uses warm, ambient diffusion mixed with crisp hairline boundaries rather than high-contrast drops:

- **Level 0 (Flat / Canvas)**: Base background `#FAFAF9` in customer light mode or `#0F172A` in POS mode.
- **Level 1 (Cards & Rows)**: Elevated via surface color (`#FFFFFF` or `#1E293B`) combined with a sub-pixel border (`1px solid rgba(30, 41, 59, 0.08)` in light, `rgba(255, 255, 255, 0.08)` in dark) and an ambient shadow: `0 2px 8px -2px rgba(30, 41, 59, 0.04), 0 1px 3px -1px rgba(30, 41, 59, 0.06)`.
- **Level 2 (Active Item / Floating Modifiers / Dropdowns)**: Elevated with a warmer, slightly deepened spread: `0 10px 25px -5px rgba(234, 88, 12, 0.08), 0 8px 10px -6px rgba(30, 41, 59, 0.04)`.
- **Level 3 (Modals / Order Trays / Drawer Overlays)**: High-altitude depth: `0 25px 50px -12px rgba(15, 23, 42, 0.25)` paired with a soft background backdrop filter (`backdrop-blur-md`).

## Shapes

The shape system employs Level 2 roundedness (`0.5rem` base, `1rem` on `rounded-lg`, and `1.5rem` on `rounded-xl`):

- **Interactive Elements & Fields**: Base `0.5rem` (8px) ensures that buttons, steppers, and text boxes maintain a sturdy, tactile appearance that resists accidental misses on touch screens.
- **Food & Modifier Cards**: Large `1rem` (16px) corners soften food imagery, framing photography naturally without sharp visual cutoffs.
- **Modals, Floating Sheets, and Sticky Drawers**: Extra-large `1.5rem` (24px) corners create a distinct physical layering metaphor reminiscent of a tray or plating dish.
- **Chips, Badges, and Increment Steppers**: Full pill radius (`9999px`) to immediately distinguish small status tags from clickable rectangular action surfaces.

## Components

### Buttons
- **Primary Action**: Solid `#EA580C` terracotta fill, `#FFFFFF` text, `0.5rem` border radius, bold typography. Hover states deepen to `#C2410C`. Focus rings feature a 2px offset terracotta glow.
- **Secondary Action**: Bordered button with 1px slate outline (`rgba(30, 41, 59, 0.2)`), `#1E293B` text, and transparent surface. On hover, transitions to a light warm wash (`#FFF7ED`).
- **Touch-Optimized POS Buttons**: Minimum height of `48px` with clear, non-collapsible tap targets.

### Badges & Tags (Required vs. Optional)
- **Required Modifier Badge**: Deep charcoal pill badge with crisp white text (`#1E293B` fill, `#FFFFFF` text, `11px` uppercase tracking), indicating mandatory choices (e.g., meat temperatures, base selection).
- **Optional / Add-on Badge**: Warm amber tint pill (`#FFF7ED` fill, `#C2410C` text, border `1px solid #FFEDD5`).
- **Dietary Badges (Vegan, GF, Halal)**: Subtle slate/leaf green tints, micro-pill format with leading iconography.

### Cards (Menu & Ticket)
- **Customer Menu Card**: High-bleed top image, padded body (`1rem`), Plus Jakarta Sans dish title, subtle clamp for description, right-aligned price display in bold, and a floating quick-add icon button.
- **POS Order Ticket Card**: Compact, image-free layout. Split header with order number and timer badge (color-coded amber when approaching threshold), nested list of items with strike-through completion, and slate dividers.

### Chips & Category Tabs
- **Category Navigational Chips**: Pill shape, horizontal scrollable track. Inactive state: white background with subtle border. Active state: `#1E293B` slate fill with `#FFFFFF` text or `#EA580C` fill with white text to indicate the active menu section.

### Checkboxes, Radios, & Steppers
- **Radios (Single Select Modifiers)**: Circular with a terracotta ring and inner dot when selected.
- **Checkboxes (Multi-Select Ingredients)**: Rounded square (4px radius) checking into `#EA580C` with a white checkmark.
- **Quantity Stepper**: Pill-shaped capsule consisting of three joined zones: a decrement button (`-`), a centered bold number display, and an increment button (`+`).

### Input Fields
- Structured slate borders (`1px solid #CBD5E1`), transitioning to a crisp terracotta outline (`#EA580C`) on active focus. Floating labels utilizing `label-sm` sizing ensure high contextual clarity during fast search operations and back-office stock edits.