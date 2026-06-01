# Mor Airlines Product Context

register: product

## Product Purpose

Mor Airlines is a private Hebrew RTL travel app for Mor and Eyal. It turns the recurring "where should we go?" moment into a small ceremony: a globe spins, a destination is selected, a boarding pass appears, and the shared passport keeps dream, booked, visited, and favorite destinations in sync across two phones.

## Users

- Mor: frontend developer, UX/UI strong, emotionally invested in the gift and in the travel memory layer.
- Eyal: backend, tooling, strategy, and maintenance. Needs the app to be understandable, shippable, and easy to hand off between AI coding agents.

## Emotional Register

Personal, celebratory, tactile, romantic, and a little airport-theatrical. The interface should feel like a shared artifact: boarding pass, passport, travel stamp, memory ledger. It should not feel like a generic SaaS dashboard, admin panel, or AI-generated dark card layout.

## Strategic Principles

- Ceremony is the product. Do not add network calls, blocking loaders, or heavy UI during spin, lock, pin drop, or reveal.
- Hebrew first, RTL always. English is acceptable for destination names, airline codes, and airport-like labels.
- Local-first behavior matters more than ornamental polish. Supabase sync is background only.
- Tactility should come from type, spacing, paper/stamp surfaces, image framing, and state feedback.
- Keep the UI usable on phones at 375px and 412px widths.

## Anti-References

- Generic dark indigo SaaS cards with `bg-white/5`, glow shadows, and rounded-2xl everywhere.
- Emoji-led controls that make the app feel like a prototype.
- Marketing landing page composition. This is an app, not a campaign page.
- Decorative glassmorphism, gradient text, nested cards, or motion that slows repeat use.
