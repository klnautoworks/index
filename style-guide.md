# KLN AutoWorks Style Guide

This style guide summarizes the core visual elements used across the KLN AutoWorks website. Use it as a reference for future updates and to ensure consistency in any marketing materials.

## Brand Colours

| Name              | Hex       | Usage                                   |
|-------------------|-----------|------------------------------------------|
| **Primary**       | `#0e1a2b` | Backgrounds, header, footers             |
| **Secondary**     | `#ff3d45` | Call‑to‑action buttons, highlights       |
| **Dark**          | `#1d2a3a` | Card backgrounds, panels                 |
| **Muted**         | `#c0c6cf` | Secondary text, subtle accents           |
| **Light**         | `#ffffff` | Body text, backgrounds on dark surfaces  |

## Typography

The site uses the **Montserrat** font family via Google Fonts. We recommend the following weights:

- `400` (regular) for body text
- `500` for secondary headings
- `600` for primary headings
- `700` for the brand name and important labels

Font sizes scale responsively using relative units (`rem`). Headings are larger on desktop and shrink slightly on mobile.

## Components

### Buttons

Buttons use the secondary colour as the background with white text. They have an 8 px border radius and change to a darker red on hover. Use concise labels such as **“Book Now”** or **“Submit”**.

### Cards

Service and testimonial cards utilise the dark colour for the background with a slight drop shadow and rounded corners. Icons (Font Awesome) appear above the heading to visually identify each category.

### Forms

Form fields span the full width of their container, with subtle borders and rounded corners. Placeholders use the muted colour. Labels appear above each input for clarity. Primary buttons follow the button style above.

### Navigation

The navigation bar is sticky and uses a simple link list. On mobile viewports it collapses into a hamburger menu. Active states are underlined on hover or focus.

### Chat Widget

The chat widget is a circular button in the bottom‑right corner. When opened, a panel slides up with conversation threads and an input box. Predefined responses answer common questions about pricing, service area, hours and warranty.

### Booking Modal

The site includes a modal overlay for quick booking accessible from any page. It centres the booking form on a darkened background. The full booking page features the same form within the page layout.

## Imagery

High‑quality, realistic photography is used throughout the site to convey trust, professionalism and the human side of automotive service. Each page features its own unique hero image, so visitors experience variety as they navigate. Photos depict mobile mechanics working on vehicles, tools and customer interactions. All images are compressed as WebP for fast loading. Avoid repeating the same photo across multiple pages; crop or adjust brightness to create new variations when needed.

## Logo Variants

The KLN AutoWorks logo comes in two variants: **logo-dark** (white symbol for dark backgrounds) and **logo-light** (red and black symbol on a transparent background for light contexts). CSS variables control which version appears based on the surrounding background using `.on-dark` and `.on-light` classes. See `style.css` for implementation details.

## Icons

We leverage the Font Awesome 6 icon set via CDN for consistency and variety. Icons are sized at 2–2.5 rem and coloured using the secondary brand colour.

## Accessibility

All interactive elements have sufficient colour contrast and include focus states. Form labels ensure screen readers can identify inputs. ARIA labels are used on interactive icons (e.g., the hamburger menu and chat button).
