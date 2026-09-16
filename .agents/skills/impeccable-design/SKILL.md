---
name: impeccable-design
description: >-
  Expert UI/UX design skill inspired by Impeccable (https://impeccable.style/).
  Use when designing new pages, refining typography, polishing interfaces, removing
  generic AI design tropes ("AI slop"), simplifying complex layouts, or improving accessibility and delight.
---

# Impeccable Design Skill

This skill embeds the design philosophy and workflows from **Impeccable** (`https://impeccable.style/`), specialized for human-crafted, elegant web applications and reading experiences.

## Core Design Philosophy: Eliminating "AI Slop"

When generating or refactoring UI, proactively eliminate these common AI tropes:
1. **No gratuitous cards inside cards**: Avoid wrapping every metric or block in nested bordered cards. Group logically using white space, typography scale, or subtle dividing rules.
2. **No status-chip soup**: Don't tag every line item with colored pill badges. Use quiet typography or small indicators only when status change requires action.
3. **Restrained, meaningful palette**: Prefer neutral paper/surface tones (`#f8f8f8`, `#181818`, `#fff`), near-black ink, fine muted lines (`#dedede`), and a purposeful accent (e.g. warm gold `#e9be43` / `#90701b`). Avoid generic purple/blue gradients.
4. **Deliberate Typography (Typesetting)**:
   - Establish clear optical hierarchy: title > eyebrow > heading > body > meta.
   - Generous line height for long-form reading (1.75 - 1.85) with measure constrained to 60-75 characters per line (max-width: 680-760px).
   - Full diacritics support for Vietnamese (using Be Vietnam Pro with appropriate line-height compensation so marks aren't clipped).

---

## Actionable Design Workflows

### 1. `/distill` — Find the Hierarchy
- **When**: A page or toolbar feels cluttered with competing elements.
- **Action**:
  - Identify the primary action (e.g., Open Current Book, Import Book). Give it strong contrast.
  - Demote secondary controls (filters, view toggles) to quiet text buttons or compact icon buttons.
  - Remove redundant borders, labels, or decorative lines that do not aid comprehension.

### 2. `/polish` — Remove the Tells & Add Craft
- **When**: An interface looks generic, unfinished, or assembled by AI.
- **Action**:
  - Replace thick, heavy box-shadows with subtle, layered elevation or crisp 1px borders.
  - Align icon weights with font weights.
  - Ensure focus rings are accessible (`:focus-visible`) and aesthetically matched to the accent color.

### 3. `/typeset` — Optical & Text Perfection
- **When**: Reviewing book content, article views, or dense typography.
- **Action**:
  - Use `hyphens: auto`, `overflow-wrap: break-word`.
  - Style quotes, citations, and headings with rhythm and breath.
  - Keep meta text (`font-variant-numeric: tabular-nums`, monospace or muted sans-serif).

### 4. `/delight` & `/animate` — Micro-interactions with Purpose
- **When**: User triggers significant state changes (bookmarking, reading progress, theme toggle).
- **Action**:
  - Keep animations swift (150ms - 250ms ease-out) and purposeful, never lingering.
  - Respect `prefers-reduced-motion`.

### 5. `/harden` — Edge Cases & Resilience
- **When**: Dealing with empty states, unexpected file sizes, errors, or offline transitions.
- **Action**:
  - Clear, human empty states with a single unambiguous call-to-action.
  - Error messages that explain *what happened* and *how to fix it*, not just a red banner.
