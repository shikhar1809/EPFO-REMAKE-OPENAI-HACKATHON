# Anti-AI Slop Design System

This document outlines our commitment to intentional, unique, and user-centric design, actively resisting generic, boilerplate "AI-generated" aesthetics (often referred to as "AI slop"). We adhere to these principles for all current and future updates to the EPFO Remake.

## Core Philosophy
1. **Intentionally Minimal, Not Generic**: Minimalism should serve a purpose (reducing cognitive load for non-tech-savvy users), not act as a lack of effort. Every pixel must have a reason to exist.
2. **Context-Aware Over Standardized**: We do not use standard dashboard layouts blindly. The interface is tailored to the exact state of mind of the user (e.g., anxiety during a PF withdrawal, curiosity during a balance check).
3. **Typography and Whitespace as First-Class Citizens**: We rely on deliberate spacing and clear typography rather than overwhelming the user with cards, borders, and shadows that look like a generic UI kit.
4. **Human-Centric Language**: No robotic or overly formal bureaucratic jargon. We use plain, conversational language (e.g., "Your Money", "Employer's Money", "Job Switch").

## Visual Language Rules
### 1. Layout & Structure
- **Aspect Ratio**: The core application strictly follows a 9:16 mobile-first aspect ratio centered on the screen, even on desktop. This limits feature creep and keeps the flow focused.
- **No Headers/Footers**: Avoid generic top navbars or complex footer links. Navigation is strictly contextual ("What do you want to do? -> Step -> Done").
- **Focused Attention**: Only one primary action per screen whenever possible.

### 2. Color Palette
- **Primary**: Deep Blue (#1a365d) - Conveys trust and institutional backing without being overly vibrant.
- **Accents**: 
  - Green (#22c55e) for success and "Your Money".
  - Blue/Cyan (#3b82f6) for "Employer".
  - Orange/Amber (#f97316) for "Interest".
- **Backgrounds**: Slate-50 (#f8fafc) for main backgrounds to provide warmth compared to stark white. Cards are clean white (#ffffff) with very subtle borders (#f1f5f9), avoiding heavy drop shadows.

### 3. Components
- **Buttons**: Rounded-xl (not fully pill, not sharp squares). Must have deliberate padding (py-3.5) for touch targets. No excessive gradients.
- **Inputs**: High contrast, rounded-xl, clear error states without shifting the layout. 
- **Icons**: Lucide icons are used sparingly and deliberately. They must have a background container if used as a primary visual anchor on a page.

### 4. Interaction Design
- **State Management**: Every interaction must have a clear loading state, success state, or error state. No silent failures.
- **Transitions**: Use Framer Motion for gentle, purposeful transitions (e.g., fading in lists, sliding between steps). Avoid bouncy, exaggerated animations.
- **Skeletons**: Use pulsing skeleton loaders rather than generic spinning circles for data fetches to provide context on what is loading.

## Development Workflow Checks
Before committing any new feature, ask:
- [ ] Does this look like a standard generic template? If yes, rethink it.
- [ ] Is the language bureaucratic? If yes, rewrite it.
- [ ] Did we add a component just to fill space? If yes, remove it.
- [ ] Is the user's primary goal on this screen immediately obvious?

*This document is a living artifact. It must be updated alongside any major design shift.*
