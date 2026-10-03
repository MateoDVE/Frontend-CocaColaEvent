---
name: "frontend-design"
version: 1.0.2
category: build
platforms: [CLAUDE_CODE]
tags: [anthropic]
description: "Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults."
---
# Frontend Design

Approach this as the design lead at a design studio known for giving every client a distinct visual identity that is not mistaken for anyone else's. This client has already rejected proposals that felt cliché or templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take aesthetic risk if justified.

## Ground your designs in the subject matter

If the brief does not identify what the product or subject matter is, identify it yourself before designing, and confirm with the client. You can come up with one concrete subject, the design's audience, and the design's primary job, as a proposal. If there's any information in your memory about the client's preferences or context about what they're building, use that as a hint. The subject's industry, subject matter, materials, and vernacular are where distinctive visual choices come from — a design for a toy for girls aged 8–11 will be very aesthetically different from a dashboard for financial analysts. Build with the brief's real content and subject matter throughout.

## Design principles

For web designs, the hero is the first thing viewers will see. Open with the most characteristic thing in the subject's world, in the form that is most appropriate: a headline, an image, an animation, a live demo, an interactive moment, or other treatments. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the default treatment, so only use it if that's truly the best option.

Typography carries the personality of the page. You don't need a different typeface for display or headline text and body content: use one family or two, and if two, make them clearly distinct.

Choose your typefaces deliberately, not the default families you would reach for on any other project, and set a clear type scale following the default guidance of The Elements of Typographic Style with intentional weights, widths, and spacing. When type is used as a headline or visual element, use the type treatment itself as an active part of the design, not a neutral delivery vehicle for the content.

Default to line lengths of less than 80 characters. Serif typefaces can have slightly longer line lengths; give serif body text slightly more line-height than a sans-serif.

Avoid these default typographic treatments; they are the commonest tells of a generated page:
- Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color.
- Using all caps for labels.
- Adding unnecessary typographic labels above content.

Visual structure is information. Structural devices like outlines, borders, numbering, eyebrows, dividers, labels, etc., encode useful information about the content rather than decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a stepped process or a timeline. Before adding numbered markers, check the content really is a sequence.

Use non-user-triggered motion sparingly and deliberately, only to draw attention. A single orchestrated moment — one page-load sequence or one reveal — lands better than scattered effects; fade-and-slide-up entrances on each section and hover transitions on every card are the generic default and read as AI-generated. Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy and placeholder content. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: plan, review against the brief, build, critique

For calibration, AI-generated design right now clusters around some traits:
1. a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta or warm-clay accent (often near #D97757 — Anthropic's own Claude-interaction accent, so on a user's brief it reads as a tell);
2. a near-black background with a single bright acid-green or vermilion accent;
3. a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns;
4. the SaaS-card kit: content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration;
5. template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow label above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em dash; tinted near-black (#0B0B0B, #111) standing in for black; a monospace face for small data labels; a '→' appended to link and button text.

All traits are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. As with a hired human designer, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

Work in two passes. First, brainstorm a short design plan based on the client's design brief: create a compact token system with color, type, layout, and principles.
- Color: describe the core base palette as 4–6 named hex values.
- Type: the typefaces and their roles.
- Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Include alignment guidance; should the content be left aligned, center aligned, justified?
- Principles: the high-level guidance for what makes this page unique.

Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and an element-based selector like .cta). This can happen often with padding/margin between sections.

## Restraint and self-critique

Spend your boldness in one place. Let one element be the memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected, visually accessible, harmonious color palettes. Critique your own work as you build, taking screenshots to review if your environment supports it — a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creatives have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

## More on writing in design

Words appear in a design for one reason: to make it easier to understand and use. They are design content, not decoration. Bring the same intentionality and minimalism to copywriting that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's perspective. Name things by what users will understand in simple language, not by how the system is built. A user manages notifications, not webhook config. Describe what something is or does in plain terms rather than selling it. Being specific and legible to new users is always better than being clever.

Use active voice as default. A CTA says exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the tone conversational: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each written element do exactly one job.


---
name: "ui-design-system"
version: 1.0.1
category: build
platforms: [CLAUDE_CODE]
tags: [alirezarezvani]
description: "UI design system toolkit for Senior UI Designer including design token generation, component documentation, responsive design calculations, and developer handoff tools. Use when creating design systems, generating design tokens, maintaining visual consistency, or facilitating design-dev collaboration and developer handoff."
---
# UI Design System

Generate design tokens, create color palettes, calculate typography scales, build component systems, and prepare developer handoff documentation.

---

## Table of Contents

- [Trigger Terms](#trigger-terms)
- [Workflows](#workflows)
  - [Workflow 1: Generate Design Tokens](#workflow-1-generate-design-tokens)
  - [Workflow 2: Create Component System](#workflow-2-create-component-system)
  - [Workflow 3: Responsive Design](#workflow-3-responsive-design)
  - [Workflow 4: Developer Handoff](#workflow-4-developer-handoff)
- [Tool Reference](#tool-reference)
- [Quick Reference Tables](#quick-reference-tables)
- [Knowledge Base](#knowledge-base)

---

## Trigger Terms

Use this skill when you need to:

- "generate design tokens"
- "create color palette"
- "build typography scale"
- "calculate spacing system"
- "create design system"
- "generate CSS variables"
- "export SCSS tokens"
- "set up component architecture"
- "document component library"
- "calculate responsive breakpoints"
- "prepare developer handoff"
- "convert brand color to palette"
- "check WCAG contrast"
- "build 8pt grid system"

---

## Workflows

### Workflow 1: Generate Design Tokens

**Situation:** You have a brand color and need a complete design token system.

**Steps:**

1. **Identify brand color and style**
   - Brand primary color (hex format)
   - Style preference: `modern` | `classic` | `playful`

2. **Generate tokens using script**
   ```bash
   python scripts/design_token_generator.py "#0066CC" modern json
   ```

3. **Review generated categories**
   - Colors: primary, secondary, neutral, semantic, surface
   - Typography: fontFamily, fontSize, fontWeight, lineHeight
   - Spacing: 8pt grid-based scale (0-64)
   - Borders: radius, width
   - Shadows: none through 2xl
   - Animation: duration, easing
   - Breakpoints: xs through 2xl

4. **Export in target format**
   ```bash
   # CSS custom properties
   python scripts/design_token_generator.py "#0066CC" modern css > design-tokens.css

   # SCSS variables
   python scripts/design_token_generator.py "#0066CC" modern scss > _design-tokens.scss

   # JSON for Figma/tooling
   python scripts/design_token_generator.py "#0066CC" modern json > design-tokens.json
   ```

5. **Validate accessibility**
   - Check color contrast meets WCAG AA (4.5:1 normal, 3:1 large text)
   - Verify semantic colors have contrast colors defined

---

### Workflow 2: Create Component System

**Situation:** You need to structure a component library using design tokens.

**Steps:**

1. **Define component hierarchy**
   - Atoms: Button, Input, Icon, Label, Badge
   - Molecules: FormField, SearchBar, Card, ListItem
   - Organisms: Header, Footer, DataTable, Modal
   - Templates: DashboardLayout, AuthLayout

2. **Map tokens to components**

   | Component | Tokens Used |
   |-----------|-------------|
   | Button | colors, sizing, borders, shadows, typography |
   | Input | colors, sizing, borders, spacing |
   | Card | colors, borders, shadows, spacing |
   | Modal | colors, shadows, spacing, z-index, animation |

3. **Define variant patterns**

   Size variants:
   ```
   sm: height 32px, paddingX 12px, fontSize 14px
   md: height 40px, paddingX 16px, fontSize 16px
   lg: height 48px, paddingX 20px, fontSize 18px
   ```

   Color variants:
   ```
   primary: background primary-500, text white
   secondary: background neutral-100, text neutral-900
   ghost: background transparent, text neutral-700
   ```

4. **Document component API**
   - Props interface with types
   - Variant options
   - State handling (hover, active, focus, disabled)
   - Accessibility requirements

5. **Reference:** See `references/component-architecture.md`

---

### Workflow 3: Responsive Design

**Situation:** You need breakpoints, fluid typography, or responsive spacing.

**Steps:**

1. **Define breakpoints**

   | Name | Width | Target |
   |------|-------|--------|
   | xs | 0 | Small phones |
   | sm | 480px | Large phones |
   | md | 640px | Tablets |
   | lg | 768px | Small laptops |
   | xl | 1024px | Desktops |
   | 2xl | 1280px | Large screens |

2. **Calculate fluid typography**

   Formula: `clamp(min, preferred, max)`

   ```css
   /* 16px to 24px between 320px and 1200px viewport */
   font-size: clamp(1rem, 0.5rem + 2vw, 1.5rem);
   ```

   Pre-calculated scales:
   ```css
   --fluid-h1: clamp(2rem, 1rem + 3.6vw, 4rem);
   --fluid-h2: clamp(1.75rem, 1rem + 2.3vw, 3rem);
   --fluid-h3: clamp(1.5rem, 1rem + 1.4vw, 2.25rem);
   --fluid-body: clamp(1rem, 0.95rem + 0.2vw, 1.125rem);
   ```

3. **Set up responsive spacing**

   | Token | Mobile | Tablet | Desktop |
   |-------|--------|--------|---------|
   | --space-md | 12px | 16px | 16px |
   | --space-lg | 16px | 24px | 32px |
   | --space-xl | 24px | 32px | 48px |
   | --space-section | 48px | 80px | 120px |

4. **Reference:** See `references/responsive-calculations.md`

---

### Workflow 4: Developer Handoff

**Situation:** You need to hand off design tokens to development team.

**Steps:**

1. **Export tokens in required formats**
   ```bash
   # For CSS projects
   python scripts/design_token_generator.py "#0066CC" modern css

   # For SCSS projects
   python scripts/design_token_generator.py "#0066CC" modern scss

   # For JavaScript/TypeScript
   python scripts/design_token_generator.py "#0066CC" modern json
   ```

2. **Prepare framework integration**

   **React + CSS Variables:**
   ```tsx
   import './design-tokens.css';

   <button className="btn btn-primary">Click</button>
   ```

   **Tailwind Config:**
   ```javascript
   const tokens = require('./design-tokens.json');

   module.exports = {
     theme: {
       colors: tokens.colors,
       fontFamily: tokens.typography.fontFamily
     }
   };
   ```

   **styled-components:**
   ```typescript
   import tokens from './design-tokens.json';

   const Button = styled.button`
     background: ${tokens.colors.primary['500']};
     padding: ${tokens.spacing['2']} ${tokens.spacing['4']};
   `;
   ```

3. **Sync with Figma**
   - Install Tokens Studio plugin
   - Import design-tokens.json
   - Tokens sync automatically with Figma styles

4. **Handoff checklist**
   - [ ] Token files added to project
   - [ ] Build pipeline configured
   - [ ] Theme/CSS variables imported
   - [ ] Component library aligned
   - [ ] Documentation generated

5. **Reference:** See `references/developer-handoff.md`

---

## Tool Reference

### design_token_generator.py

Generates complete design token system from brand color.

| Argument | Values | Default | Description |
|----------|--------|---------|-------------|
| brand_color | Hex color | #0066CC | Primary brand color |
| style | modern, classic, playful | modern | Design style preset |
| format | json, css, scss, summary | json | Output format |

**Examples:**

```bash
# Generate JSON tokens (default)
python scripts/design_token_generator.py "#0066CC"

# Classic style with CSS output
python scripts/design_token_generator.py "#8B4513" classic css

# Playful style summary view
python scripts/design_token_generator.py "#FF6B6B" playful summary
```

**Output Categories:**

| Category | Description | Key Values |
|----------|-------------|------------|
| colors | Color palettes | primary, secondary, neutral, semantic, surface |
| typography | Font system | fontFamily, fontSize, fontWeight, lineHeight |
| spacing | 8pt grid | 0-64 scale, semantic (xs-3xl) |
| sizing | Component sizes | container, button, input, icon |
| borders | Border values | radius (per style), width |
| shadows | Shadow styles | none through 2xl, inner |
| animation | Motion tokens | duration, easing, keyframes |
| breakpoints | Responsive | xs, sm, md, lg, xl, 2xl |
| z-index | Layer system | base through notification |

---

## Quick Reference Tables

### Color Scale Generation

| Step | Brightness | Saturation | Use Case |
|------|------------|------------|----------|
| 50 | 95% fixed | 30% | Subtle backgrounds |
| 100 | 95% fixed | 38% | Light backgrounds |
| 200 | 95% fixed | 46% | Hover states |
| 300 | 95% fixed | 54% | Borders |
| 400 | 95% fixed | 62% | Disabled states |
| 500 | Original | 70% | Base/default color |
| 600 | Original × 0.8 | 78% | Hover (dark) |
| 700 | Original × 0.6 | 86% | Active states |
| 800 | Original × 0.4 | 94% | Text |
| 900 | Original × 0.2 | 100% | Headings |

### Typography Scale (1.25x Ratio)

| Size | Value | Calculation |
|------|-------|-------------|
| xs | 10px | 16 ÷ 1.25² |
| sm | 13px | 16 ÷ 1.25¹ |
| base | 16px | Base |
| lg | 20px | 16 × 1.25¹ |
| xl | 25px | 16 × 1.25² |
| 2xl | 31px | 16 × 1.25³ |
| 3xl | 39px | 16 × 1.25⁴ |
| 4xl | 49px | 16 × 1.25⁵ |
| 5xl | 61px | 16 × 1.25⁶ |

### WCAG Contrast Requirements

| Level | Normal Text | Large Text |
|-------|-------------|------------|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

Large text: ≥18pt regular or ≥14pt bold

### Style Presets

| Aspect | Modern | Classic | Playful |
|--------|--------|---------|---------|
| Font Sans | Inter | Helvetica | Poppins |
| Font Mono | Fira Code | Courier | Source Code Pro |
| Radius Default | 8px | 4px | 16px |
| Shadows | Layered, subtle | Single layer | Soft, pronounced |

---

## Knowledge Base

Detailed reference guides in `references/`:

| File | Content |
|------|---------|
| `token-generation.md` | Color algorithms, HSV space, WCAG contrast, type scales |
| `component-architecture.md` | Atomic design, naming conventions, props patterns |
| `responsive-calculations.md` | Breakpoints, fluid typography, grid systems |
| `developer-handoff.md` | Export formats, framework setup, Figma sync |

---

## Validation Checklist

### Token Generation
- [ ] Brand color provided in hex format
- [ ] Style matches project requirements
- [ ] All token categories generated
- [ ] Semantic colors include contrast values

### Component System
- [ ] All sizes implemented (sm, md, lg)
- [ ] All variants implemented (primary, secondary, ghost)
- [ ] All states working (hover, active, focus, disabled)
- [ ] Uses only design tokens (no hardcoded values)

### Accessibility
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Touch targets ≥ 44×44px
- [ ] Semantic HTML elements used

### Developer Handoff
- [ ] Tokens exported in required format
- [ ] Framework integration documented
- [ ] Design tool synced
- [ ] Component documentation complete

---
name: "ui-design"
version: 1.0.0
category: build
platforms: [CLAUDE_CODE]
tags: [mindrally]
description: "UI design best practices for building accessible, performant, and user-friendly interfaces with modern web standards"
---
# UI Design Best Practices

You are an expert in UI design principles for software development. Apply these guidelines when creating or reviewing user interfaces.

## Visual Design

- Establish a clear visual hierarchy to guide user attention
- Choose a cohesive color palette that reflects the brand (ask the user for guidelines)
- Use typography effectively for readability and emphasis
- Maintain sufficient contrast for legibility (WCAG 2.1 AA standard)
- Ensure consistent styling throughout the application

## Interaction Design

- Create intuitive navigation patterns
- Use familiar UI components to reduce cognitive load
- Provide clear calls-to-action to guide user behavior
- Implement responsive design for cross-device compatibility
- Apply animations sparingly to enhance rather than distract

## Accessibility Standards

- Follow WCAG guidelines for web accessibility
- Use semantic HTML to enhance screen reader compatibility
- Provide alternative text for images and non-text content
- Ensure keyboard navigability for all interactive elements
- Test with various assistive technologies

## Performance Optimization

- Optimize images and assets to minimize load times
- Implement lazy loading for non-critical resources
- Use code splitting to improve initial load performance
- Monitor Core Web Vitals (LCP, FID, CLS)

## User Feedback

- Provide clear action confirmation mechanisms
- Display loading indicators for asynchronous operations
- Offer helpful error messages with recovery guidance
- Track user behavior through analytics

## Information Architecture

- Organize content logically for discoverability
- Use clear labels and consistent categorization
- Implement effective search functionality
- Create visual structure maps

## Mobile-First Approach

- Design for mobile devices first, then scale up
- Use touch-friendly interface elements
- Implement gestures for common actions (swipe, pinch-to-zoom)
- Consider thumb zones for important interactive elements

## Design Consistency

- Develop and maintain a design system
- Use consistent terminology across interfaces
- Position recurring elements predictably
- Ensure visual consistency across different sections

## Testing and Iteration

- Conduct A/B testing for critical design decisions
- Analyze user behavior via heatmaps and session recordings
- Gather regular user feedback
- Iterate designs based on data

## Technical Implementation

- Use relative units (%, em, rem) instead of fixed pixels
- Implement CSS Grid and Flexbox for flexible layouts
- Adjust typography for readability across screen sizes
- Ensure interactive elements are large enough for touch (min 44x44 pixels)
- Use CSS animations over JavaScript where feasible
- Implement critical CSS for above-the-fold content

## Navigation and Forms

- Design mobile-friendly navigation patterns (e.g., hamburger menu)
- Ensure keyboard and screen reader accessibility
- Implement responsive form layouts with appropriate input types
- Include inline validation with clear error messaging

## Testing Requirements

- Use browser developer tools for responsiveness
- Test on actual devices, not just emulators
- Conduct usability testing across device types

Stay current with responsive design techniques and industry standards.

---
name: ux
version: 2.1.0
category: ux
platforms: [CLAUDE_CODE]
tags: [skills-hub-registry]
description: "Dual-mode UX quality skill — runs a heuristic/accessibility/motion audit on the current codebase, or validates implementation against design mockups. Fixes all issues found and commits."
---
You are a senior UX engineer and design systems specialist. You operate in one of two
modes depending on whether the user provides design mockups.

Do NOT ask the user questions. Run autonomously from start to finish.

TARGET: $ARGUMENTS

If arguments are provided, interpret them as:
- A specific screen or feature name to focus the audit on (e.g., "home screen", "settings")
- A mode override: "audit" for UX audit, "validate" for design validation
- A path to design mockups or screenshots for design validation mode
- A severity filter: "critical-only" to only fix critical issues

If no arguments are provided, audit the entire application in the current directory using UX AUDIT mode.

INPUT:

The user will provide one or more of:
1. Nothing (audit the current codebase as-is).
2. Specific screens or features to focus on.
3. Design mockups, screenshots, or Figma frames showing the intended design.
4. A design system specification or brand guidelines document.
5. Output from `/story-implementer` indicating what was just implemented.
6. Any combination of the above.

If no specific input is provided, audit the entire application in the current directory.

DETERMINE PROJECT STRUCTURE:

1. Look for backend/ and mobile/ directories (monorepo from `/build`).
2. If not found, look for pubspec.yaml (Flutter project) or package.json with a frontend framework.
3. Identify the tech stack by reading config files:
   - pubspec.yaml for Flutter dependencies
   - lib/config/theme.dart for theme tokens
   - lib/config/routes.dart or lib/app.dart for routes and screen map
   - lib/core/widgets/ for shared widget patterns
   - package.json + src/ for web frontend (React, Next.js, Vue, Angular, etc.)

DETERMINE MODE:

1. If the user provided design mockups, screenshots, Figma frames, or a design specification:
   Mode = DESIGN VALIDATION.
2. If the user provided only code, a feature name, or nothing:
   Mode = UX AUDIT.
3. If the user explicitly says "audit" or "review the UX", use UX AUDIT regardless.
4. If the user explicitly says "validate against design" or "match the mockup", use DESIGN VALIDATION regardless.

State which mode you are using at the top of your output.

PLATFORM DETECTION:

Detect the target platform(s) to apply platform-appropriate heuristics:
- If pubspec.yaml exists: Flutter (mobile — iOS + Android, possibly web).
- If package.json with react/next/vue/angular: Web frontend.
- If both exist (monorepo): Audit both.
Store this as TARGET_PLATFORMS for all subsequent analysis.

============================================================
MODE 1: UX AUDIT (no design mockups provided)
============================================================

Perform a comprehensive UX quality audit of the current codebase. This is a code-based
audit — read every screen, widget, and theme file, then evaluate against established
heuristics and standards.

PHASE 1: INVENTORY

Step 1.1 — Screen Map

Discover every screen/page in the application:
- Flutter: Read routes from GoRouter config (lib/app.dart or lib/config/routes.dart).
  For each route, identify the screen widget file.
- Web: Read the router config or page directory structure.

Build a complete screen inventory:
| Route | Screen File | Platform | Has Loading | Has Error | Has Empty |

Step 1.2 — Theme & Design Token Inventory

Read the theme configuration and extract:
- Color palette (all named colors, color scheme values).
- Typography scale (all text styles, font families, weights, sizes).
- Spacing system (if constants exist, or infer from usage).
- Border radii, elevation values, shadow definitions.
- Component theme overrides (buttons, cards, inputs, app bar, bottom nav, chips, etc.).

Step 1.3 — Shared Widget Inventory

Read all shared/reusable widgets:
- List every widget in core/widgets/ or shared/widgets/.
- Note which screens use each shared widget.
- Identify widgets that should be shared but are duplicated inline in screens.

PHASE 2: NIELSEN'S 10 HEURISTICS EVALUATION

For every screen, evaluate against Jakob Nielsen's 10 usability heuristics:

H1 — Visibility of System Status
- Does the screen show loading state while data is being fetched?
- Is there feedback after user actions (submit, delete, save)?
- Are progress indicators present for long operations?
- Is there visual feedback on tap (ripple, highlight, color change)?

H2 — Match Between System and Real World
- Does the UI use language familiar to the target user?
- Are icons intuitive and universally understood?
- Is the information organized in a natural, logical order?
- Do labels match user expectations (not developer jargon)?

H3 — User Control and Freedom
- Can the user undo or go back from any action?
- Is there a clear way to dismiss modals, bottom sheets, and overlays?
- Can the user cancel in-progress operations?
- Is the back button behavior correct on every screen?

H4 — Consistency and Standards
- Are the same actions and terms used consistently across screens?
- Do similar screens follow the same layout pattern?
- Are button styles consistent (primary actions use the same style everywhere)?
- Does the app follow platform conventions (Material on Android, Cupertino on iOS)?

H5 — Error Prevention
- Are destructive actions confirmed (delete, discard)?
- Are form inputs validated before submission?
- Are constraints communicated before the user makes an error (character limits, required fields)?
- Is the submit button disabled when the form is invalid?

H6 — Recognition Rather Than Recall
- Are options visible rather than hidden behind extra taps?
- Do search/filter controls show current active filters?
- Are recently used items or favorites easily accessible?
- Are form fields pre-populated when editing existing data?

H7 — Flexibility and Efficiency of Use
- Are there shortcuts for power users (swipe actions, long press)?
- Is pull-to-refresh implemented for list screens?
- Can the user get to core actions within 2-3 taps from the home screen?
- Is infinite scroll or pagination implemented for long lists?

H8 — Aesthetic and Minimalist Design
- Is every element on screen necessary? Is there visual clutter?
- Is whitespace used effectively?
- Are decorative elements adding value or just noise?
- Is the information density appropriate for the platform?

H9 — Help Users Recognize, Diagnose, and Recover from Errors
- Do error messages explain what went wrong in plain language?
- Do error messages suggest a corrective action?
- Are form validation errors displayed inline next to the relevant field?
- Is there a retry mechanism for network failures?

H10 — Help and Documentation
- Are empty states helpful (explain what to do, not just "no data")?
- Are complex features explained with tooltips or onboarding?
- Is there contextual help where needed?

For each heuristic, list every violation found with:
- The screen and file where it occurs.
- The specific widget or code section.
- A severity rating: CRITICAL (blocks core flow), MAJOR (significantly hurts UX), MINOR (noticeable but low impact).

PHASE 3: ACCESSIBILITY DEEP-DIVE (WCAG 2.1 AA)

For every screen, evaluate:

COLOR & CONTRAST:
- Check every text color against its background using the contrast ratio formula.
- Normal text (below 18sp or 14sp bold): minimum 4.5:1 contrast ratio.
- Large text (18sp+ or 14sp+ bold): minimum 3:1 contrast ratio.
- Non-text elements (icons, borders, focus indicators): minimum 3:1 against background.
- Do not rely on color alone to convey information (use icons, labels, or patterns too).
- Check contrast in both light and dark mode if applicable.

SEMANTIC STRUCTURE:
- Every Icon widget must have a semanticLabel or be wrapped in Semantics.
- Every Image/Image.network must have a semanticLabel.
- Interactive elements must be identifiable by screen readers.
- Decorative images must be excluded from semantics (excludeFromSemantics: true).
- Logical reading order must match visual order.
- MergeSemantics used where a group of widgets represents one concept.

TOUCH TARGETS:
- Every tappable element must be at least 48x48 dp (Material minimum).
- Adjacent touch targets must have at least 8dp spacing.
- Small icons used as buttons must have padding to expand their hit area.
- Check IconButton, GestureDetector, InkWell tap areas.

TEXT SCALING:
- Text must scale with the system font size setting.
- No fixed pixel sizes that prevent scaling (use sp/theme text styles).
- Layout must not break at 200% text scale factor.
- Test that TextOverflow handling works at larger text sizes.

FOCUS & NAVIGATION:
- Tab/focus order for forms must be logical (top to bottom, left to right).
- Focus indicators must be visible.
- Keyboard/switch access navigation must work on all interactive elements.

MOTION & ANIMATION:
- Animations must respect MediaQuery.disableAnimations.
- No content that flashes more than 3 times per second.
- Auto-playing animations must be pausable or respect reduced motion preferences.

For each accessibility violation found, record:
- WCAG criterion violated (e.g., 1.4.3 Contrast, 2.5.5 Target Size).
- The screen, file, and line.
- Current value vs required value (e.g., "contrast 2.8:1, required 4.5:1").
- Severity: CRITICAL (blocks users), MAJOR (significantly hinders), MINOR (best practice).

PHASE 4: INTERACTION & MOTION CHOREOGRAPHY

Evaluate the motion design language across the entire application:

PAGE TRANSITIONS:
- Are page transitions consistent? (All push routes use the same transition.)
- Do transitions match platform conventions? (Slide from right on iOS, fade on Android.)
- Is transition duration appropriate? (200-350ms for page transitions, not instant, not sluggish.)
- Do modal routes use appropriate transitions? (Slide up for bottom sheets, fade for dialogs.)

MICRO-INTERACTIONS:
- Do buttons have press states (ink splash, scale, color change)?
- Do loading indicators use appropriate animations (shimmer for content, spinner for actions)?
- Do success/failure states have feedback animations (checkmark, shake)?
- Are snackbar/toast notifications animated in and out?

LIST ANIMATIONS:
- Do list items animate in on first load (staggered fade/slide)?
- Do list items animate on add/remove (AnimatedList or equivalent)?
- Is hero animation used between list items and detail screens?

MEANINGFUL MOTION PRINCIPLES:
- Every animation must serve a purpose (guide attention, show relationship, provide feedback).
- No gratuitous animation that slows the user down.
- Duration must match the scope of change: small (100-200ms), medium (200-350ms), large (350-500ms).
- Easing curves must feel natural (Curves.easeInOut for most, Curves.easeOut for enter, Curves.easeIn for exit).
- Related elements should animate together as a choreographed sequence, not independently.

Record each finding with screen, file, what is missing or wrong, and suggested fix.

PHASE 5: DESIGN SYSTEM CONSISTENCY CHECK

Audit every screen for design system adherence:

THEME TOKEN USAGE:
- Every color reference must use ColorScheme or the app's named color constants.
  Flag any hardcoded Color(0xFF...) values in screen or widget files.
- Every text style must use TextTheme from the theme or the app's text style constants.
  Flag any hardcoded TextStyle(fontSize: ...) values not from the theme.
- Every spacing value must use the app's spacing constants or consistent multiples of a base unit (4dp or 8dp grid).
  Flag magic number padding/margin values that deviate from the grid.
- Every border radius must use the app's standard radii.
  Flag inconsistent border radius values across similar components.

COMPONENT CONSISTENCY:
- Are the same component patterns used for similar data across screens?
  (e.g., all list items use the same ListTile style, all cards have the same shape and elevation.)
- Are buttons used correctly? (Primary actions use FilledButton, secondary use OutlinedButton, tertiary use TextButton.)
- Are icons from a consistent family? (Do not mix Material Icons, Cupertino Icons, and custom SVGs arbitrarily.)
- Are loading/error/empty states using shared widgets consistently?

LAYOUT PATTERNS:
- Is the spacing system consistent? (Same padding around content areas, same gap between sections.)
- Is the layout grid consistent? (Same number of grid columns, same breakpoints.)
- Are screen structures consistent? (AppBar pattern, body padding, section headers.)

RESPONSIVE DESIGN:
- Does the layout adapt for different screen sizes?
- Are there LayoutBuilder or MediaQuery checks for tablet vs phone?
- Does landscape orientation work or is it locked to portrait?
- Does text handle different screen widths (no overflow, proper wrapping)?

For each inconsistency, record: file, line, what was found, what it should be, severity.

PHASE 6: FIX ALL ISSUES

Process all findings from Phases 2-5 and fix them in priority order:

Priority 1 — CRITICAL issues (blocks core flow or locks out users):
Fix immediately. These include broken navigation, missing loading states on primary screens,
touch targets too small for core actions, contrast failures on primary text.

Priority 2 — MAJOR issues (significantly hurts UX or accessibility):
Fix next. These include missing error states, inconsistent design tokens, missing semantic
labels on key interactive elements, missing form validation.

Priority 3 — MINOR issues (best practice, polish):
Fix last. These include missing entrance animations, suboptimal empty states,
minor spacing inconsistencies, decorative images missing excludeFromSemantics.

For each fix:
a. Read the affected file.
b. Apply the fix following existing code conventions.
c. Verify the fix does not break existing functionality.
d. Commit with a descriptive message.

Commit pattern:
- "fix(ux): [screen] add missing loading state" for state handling fixes.
- "fix(a11y): [screen] add semantic labels to interactive elements" for accessibility fixes.
- "fix(design): [screen] replace hardcoded colors with theme tokens" for design system fixes.
- "fix(motion): [screen] add page transition and list entrance animation" for motion fixes.

After all fixes, re-audit each fixed screen to confirm the issue is resolved.

PHASE 7: UX AUDIT REPORT

Produce a structured report:

## UX Audit Report

### Project
- Platform: [Flutter mobile / Web / Both]
- Screens audited: N
- Theme file: [path]

### Nielsen's Heuristics Summary

| Heuristic | Violations Found | Critical | Major | Minor | Fixed |
|-----------|-----------------|----------|-------|-------|-------|
| H1: Visibility of System Status | N | N | N | N | N |
| H2: Match System & Real World | N | N | N | N | N |
| H3: User Control & Freedom | N | N | N | N | N |
| H4: Consistency & Standards | N | N | N | N | N |
| H5: Error Prevention | N | N | N | N | N |
| H6: Recognition over Recall | N | N | N | N | N |
| H7: Flexibility & Efficiency | N | N | N | N | N |
| H8: Aesthetic & Minimalist Design | N | N | N | N | N |
| H9: Error Recovery | N | N | N | N | N |
| H10: Help & Documentation | N | N | N | N | N |

### Accessibility Summary (WCAG 2.1 AA)

| Category | Violations Found | Critical | Major | Minor | Fixed |
|----------|-----------------|----------|-------|-------|-------|
| Color & Contrast | N | N | N | N | N |
| Semantic Structure | N | N | N | N | N |
| Touch Targets | N | N | N | N | N |
| Text Scaling | N | N | N | N | N |
| Focus & Navigation | N | N | N | N | N |
| Motion & Animation | N | N | N | N | N |

### Motion & Interaction Quality

| Category | Status |
|----------|--------|
| Page transitions | [Consistent/Inconsistent/Missing] |
| Micro-interactions | [Present/Partial/Missing] |
| List animations | [Present/Partial/Missing] |
| Meaningful motion | [Follows principles/Needs work] |

### Design System Consistency

| Category | Violations | Fixed |
|----------|-----------|-------|
| Hardcoded colors | N | N |
| Hardcoded text styles | N | N |
| Inconsistent spacing | N | N |
| Inconsistent components | N | N |
| Responsive issues | N | N |

### Screen Ratings

| Screen | Route | Heuristics | A11y | Motion | Design System | Overall |
|--------|-------|-----------|------|--------|--------------|---------|
| ... | /... | PASS/FAIL | PASS/FAIL | PASS/FAIL | PASS/FAIL | EXCELLENT/GOOD/NEEDS WORK/POOR |

### Issues Fixed
[List every fix with commit reference, file, and what was changed.]

### Remaining Issues
[Anything that could not be fixed automatically — requires design decisions, needs device
testing, depends on backend changes, or needs user research to resolve.]

### Verdict

UX READY: All screens rated GOOD or above. No critical or major issues remain.
UX NEEDS WORK: List the specific screens and issues that must be addressed.
UX POOR: Significant usability or accessibility problems across multiple screens.

============================================================
MODE 2: DESIGN VALIDATION (design mockups provided)
============================================================

The user has provided design mockups, screenshots, or Figma frames. Extract the intended
design specification and validate the current implementation against it.

PHASE 1: DESIGN SPEC EXTRACTION

Step 1.1 — Analyze Every Mockup

For each provided mockup/screenshot/Figma frame:
- Identify the screen or component it represents.
- Map it to the corresponding route and screen file in the codebase.
- If a mockup does not match any existing screen, note it as a new screen to implement.

Step 1.2 — Extract Color Palette

From the mockups, extract every distinct color used:
- Primary color (main brand color, used for primary actions and key UI elements).
- Secondary color (supporting brand color).
- Accent/tertiary colors.
- Background colors (page background, card background, surface colors).
- Text colors (primary text, secondary text, hint text, disabled text).
- Semantic colors (error/red, success/green, warning/amber, info/blue).
- Special-purpose colors (badges, tags, status indicators).

Record each as a hex value. Group by usage category.

Step 1.3 — Extract Typography

From the mockups, extract the typography system:
- Font family/families used.
- For each distinct text style observed:
  - Approximate font size (in sp).
  - Font weight (regular, medium, semibold, bold).
  - Letter spacing if notable.
  - Line height if determinable.
  - Usage context (headline, title, body, caption, label, button).

Step 1.4 — Extract Spacing & Layout

From the mockups, extract the spacing system:
- Page/content padding (horizontal and vertical).
- Section spacing (gap between major content blocks).
- Card/component internal padding.
- Grid gap (spacing between grid items).
- List item spacing.
- Infer the base spacing unit (likely 4dp or 8dp grid).

Step 1.5 — Extract Component Specs

For each distinct UI component visible in the mockups:
- Buttons: size, border radius, padding, elevation, color states.
- Cards: border radius, elevation, shadow, padding, background.
- Input fields: height, border radius, border style, padding, placeholder style.
- App bars: height, background, title style, icon style.
- Bottom navigation: height, icon size, label style, active/inactive states.
- List items: height, avatar size, text layout, trailing element.
- Chips/tags: height, padding, border radius, colors.
- Modals/bottom sheets: border radius, padding, background.
- Any custom components specific to the design.

Step 1.6 — Extract Iconography & Imagery

From the mockups:
- Icon style (outlined, filled, rounded — which Material icon family).
- Icon sizes used.
- Image aspect ratios and corner treatments.
- Avatar sizes and shapes.
- Placeholder/empty state illustrations if visible.

Produce a complete Design Specification Document summarizing all extractions above.

PHASE 2: GAP ANALYSIS

Compare the extracted design spec against the current implementation.

Step 2.1 — Theme Token Comparison

Compare extracted colors against the app's theme file (e.g., lib/config/theme.dart):
| Token | Design Value | Code Value | Match |
|-------|-------------|-----------|-------|

Compare extracted typography against the app's text theme:
| Style | Design Size/Weight | Code Size/Weight | Match |
|-------|-------------------|-----------------|-------|

Compare component themes (buttons, cards, inputs, etc.):
| Component | Design Spec | Code Spec | Match |
|-----------|------------|----------|-------|

Step 2.2 — Screen-by-Screen Comparison

For each screen that has a corresponding mockup:
- Compare layout structure (arrangement of elements matches mockup).
- Compare spacing (padding, margins, gaps match extracted values).
- Compare component usage (correct button types, card styles, etc.).
- Compare typography (correct text styles applied to correct elements).
- Compare colors (correct colors applied to correct elements).
- Compare iconography (correct icons, correct sizes).
- Note any elements in the mockup that are missing from the implementation.
- Note any elements in the implementation that are not in the mockup.

Rate each screen:
- MATCH: Implementation matches the design within acceptable tolerance.
- CLOSE: Minor discrepancies (off by 2-4dp spacing, slightly different shade).
- DIVERGENT: Noticeable differences that a user would perceive.
- MISSING: Screen exists in design but not in code, or major sections missing.

PHASE 3: FIX DISCREPANCIES

Address all gaps found in Phase 2 in this order:

Step 3.1 — Update Theme Tokens

Update the theme file to match the design specification:
- Correct color values.
- Correct typography scale.
- Correct component themes (button styles, card styles, input styles, etc.).
- Add missing color constants or text styles.
Commit: "fix(design): update theme tokens to match design specification"

Step 3.2 — Fix Screen Layouts

For each screen rated CLOSE, DIVERGENT, or MISSING:
a. Adjust spacing to match the design (padding, margins, gaps).
b. Adjust component usage to match the design (swap button types, card styles).
c. Adjust typography to match the design (use correct text theme styles).
d. Adjust colors to match the design (use correct theme colors, not hardcoded).
e. Add missing elements that exist in the mockup but not the code.
f. Remove extraneous elements that exist in the code but not the mockup.
g. Adjust iconography to match (correct icon family, sizes).
h. Re-evaluate the screen after fixes — it should now rate MATCH or CLOSE.
Commit per screen: "fix(design): [screen-name] align layout with design mockup"

Step 3.3 — Add Missing Screens

If any mockup represents a screen not yet implemented:
a. Create the screen file following existing project conventions.
b. Add the route to the router configuration.
c. Implement the screen matching the mockup as closely as possible.
d. Wire up to existing providers/services if applicable.
e. Add loading, error, and empty states.
Commit per screen: "feat(design): implement [screen-name] from design mockup"

Step 3.4 — Verify Accessibility Post-Changes

After all design fixes, run a quick accessibility check on modified screens:
- Contrast ratios still meet WCAG 2.1 AA with the new colors.
- Touch targets still meet 48x48dp minimum.
- Semantic labels are present on new or modified elements.
- Text still scales properly.
Fix any accessibility regressions introduced by the design changes.
Commit: "fix(a11y): resolve accessibility regressions from design update"

PHASE 4: DESIGN VALIDATION REPORT

Produce a structured report:

## Design Validation Report

### Design Input
- Mockups provided: N
- Screens covered: [list]
- Design system source: [Figma / Screenshots / Specification doc]

### Extracted Design Spec Summary

#### Color Palette
| Name | Hex | Usage |
|------|-----|-------|

#### Typography Scale
| Style | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|

#### Spacing System
- Base unit: Xdp
- Page padding: Xdp
- Section gap: Xdp
- Card padding: Xdp

### Gap Analysis Results

#### Theme Token Comparison
| Category | Tokens Checked | Matching | Updated |
|----------|---------------|----------|---------|
| Colors | N | N | N |
| Typography | N | N | N |
| Components | N | N | N |

#### Screen Comparison
| Screen | Before | After | Mockup Provided |
|--------|--------|-------|----------------|
| ... | MATCH/CLOSE/DIVERGENT/MISSING | MATCH/CLOSE | Yes/No |

### Changes Made
[List every file modified with description of changes and commit reference.]

### Remaining Gaps
[Anything that could not be resolved: ambiguous mockup details, missing mockups for
certain screens, animations not determinable from static mockups, etc.]

### Accessibility Impact
- Contrast check: [All passing / N issues found and fixed]
- Touch targets: [All passing / N issues found and fixed]

### Verdict

DESIGN ALIGNED: All screens with mockups now rate MATCH or CLOSE.
PARTIALLY ALIGNED: Some screens still divergent — list them with remaining gaps.
SIGNIFICANT GAPS: Major sections of the design are unimplemented or divergent.

============================================================
RULES FOR BOTH MODES
============================================================

- Read EVERY screen file. Do not skip any screen. Do not skim.
- Fix issues as you find them. Do not just report — fix the code and verify the fix.
- Do not modify business logic. Focus exclusively on: visual design, layout, spacing,
  colors, typography, accessibility, motion, and interaction patterns.
- Do not add new features or change navigation flows. Only improve UX quality of existing screens.
- Commit fixes incrementally with descriptive messages using the commit prefixes defined above.
- Follow existing code conventions. Match the import style, widget structure, and naming patterns
  already established in the codebase.
- Every fix must maintain existing test coverage — do not break existing tests.
- For Flutter projects: always use theme tokens from the ThemeData. Never introduce new
  hardcoded Color or TextStyle values in screen files.
- For Flutter projects: use Material 3 components (FilledButton, NavigationBar, SearchBar)
  rather than their Material 2 predecessors where appropriate.
- For web projects: use CSS custom properties (variables) from the design system. Never
  introduce hardcoded color or font values in component stylesheets.
- When adding semantic labels, use concise, descriptive text that a screen reader user
  would find helpful. Do not use "button" or "icon" in the label — the widget role is
  announced automatically.
- When fixing contrast, prefer adjusting the foreground (text/icon) color over the
  background, unless the background is the problem.
- When adding animations, keep durations between 150ms and 400ms. Use standard curves.
  Do not add animation to elements that are already on screen and static.
- Rate screens honestly. Do not inflate ratings.
- If a design decision is ambiguous (the mockup is unclear, or the heuristic allows
  multiple valid approaches), note it as a remaining item rather than guessing.


============================================================
SELF-EVOLUTION TELEMETRY
============================================================

After producing output, record execution metadata for the /evolve pipeline.

Check if a project memory directory exists:
- Look for the project path in `~/.claude/projects/`
- If found, append to `skill-telemetry.md` in that memory directory

Entry format:
```
### /ux — {{YYYY-MM-DD}}
- Outcome: {{SUCCESS | PARTIAL | FAILED}}
- Self-healed: {{yes — what was healed | no}}
- Iterations used: {{N}} / {{N max}}
- Bottleneck: {{phase that struggled or "none"}}
- Suggestion: {{one-line improvement idea for /evolve, or "none"}}
```

Only log if the memory directory exists. Skip silently if not found.
Keep entries concise — /evolve will parse these for skill improvement signals.

============================================================
DO NOT
============================================================

- Do NOT modify business logic, navigation flows, or data models — UX and visual only.
- Do NOT introduce new hardcoded Color or TextStyle values — always use theme tokens.
- Do NOT skip screens — audit every screen in the application without exception.
- Do NOT inflate screen ratings — rate honestly based on findings.
- Do NOT add new features or functionality — only improve UX quality of what exists.


============================================================
SELF-HEALING VALIDATION (max 3 iterations)
============================================================

After completing fixes, re-validate:

1. Re-run the specific UX/accessibility checks that originally found issues.
2. Run the project's test suite to verify fixes didn't break functionality.
3. Run build/compile to confirm no breakage.
4. If new issues surfaced from fixes, add them to the fix queue.
5. Repeat up to 3 iterations.

STOP when:
- Zero Critical/High issues remain
- Build and tests pass

IF STILL FAILING after 3 iterations:
- Document remaining issues with full context

============================================================
NEXT STEPS
============================================================

After a UX AUDIT with verdict UX READY:
- "Run `/qa` to perform full automated testing and verification."

After a UX AUDIT with verdict UX NEEDS WORK:
- "Address the remaining items above, then run `/ux` again to re-validate."
- "Or run `/qa` to proceed with automated testing alongside the known UX issues."

After a DESIGN VALIDATION with verdict DESIGN ALIGNED:
- "Run `/qa` to perform full automated testing and verification."

After a DESIGN VALIDATION with verdict PARTIALLY ALIGNED or SIGNIFICANT GAPS:
- "Provide additional mockups for the unmatched screens and run `/ux` again."
- "Address the remaining gaps manually, then run `/ux` again to re-validate."