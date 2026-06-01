# Mor Airlines Design Context

## Typography

Local fonts live in `public/fonts`.

- `Mor Leon` from `Leon-Regular.woff2` and `Leon-Heavy.woff2`: primary Hebrew UI family. Use regular for body and heavy for headings, destination names, and decisive buttons.
- `Mor Danidin` from `Danidin-CondensedBold.woff2`: stamp and airport-label accent. Use for section labels, boarding pass codes, passport stamps, filter chips, and small artifact text.
- Avoid display treatment for body copy and form content. The app should stay readable before it becomes decorative.

## Color Strategy

The app uses a restrained product palette with tactile artifact surfaces:

- `--night`: globe and modal background.
- `--paper`, `--paper-warm`: boarding pass and passport card surfaces.
- `--ink`, `--ink-muted`: text on paper.
- `--stamp-red`, `--stamp-blue`, `--stamp-green`, `--gold`: state, stamp, and action accents.

The globe can stay dark because the physical scene is nighttime travel planning on phones. The passport and boarding pass should contrast it with warm paper surfaces so the reward moment feels tangible.

## Component Direction

- Boarding pass: physical ticket, perforation, framed destination image, large Hebrew destination, Danidin accent labels.
- Passport: paper cards on a deep passport-cover background, stamp pills for state, editable fields inside the card.
- Globe controls: compact, readable, tactile. Primary lottery button may use gold; secondary actions should feel like controls, not decorative chips.
- Modal: dark utility surface with the local font system. Keep it plain and fast to use.

## Guardrails

- Do not return to an all-dark card grid.
- Keep cards at modest radius, usually under 14px.
- Do not use gradient text.
- Do not use glass blur as decoration.
- Use Hebrew labels and verify RTL on every change.
- Preserve the ceremony timing and no-network critical path.
