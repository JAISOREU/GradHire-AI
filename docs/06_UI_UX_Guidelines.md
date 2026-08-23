# Document 06 — UI/UX Guidelines

## Design System Principles
- Clear information hierarchy
- Consistent spacing and typography
- Accessible interactions for keyboard and screen-reader users
- Responsive layouts for desktop and mobile

## Visual Foundations
- Typography: modern sans-serif with strong readability
- Spacing: 8-point spacing scale
- Colors: accessible contrast-compliant palette
- Components: buttons, cards, forms, modals, and navigation patterns
- Resume upload: clear drag-and-drop / file picker with supported formats (PDF, DOCX), upload progress, and auto-fill confirmation
- Job postings: distinct visual treatment for HIRING vs INTERNSHIP types
- Notifications: unread badge and notification center for employers

## Component Usage Rules

### Buttons
- **Primary (`variant="primary"`)**: Use for the single most important action on a screen — form submissions, page-level CTAs, and hero CTAs. Do not use for secondary or destructive actions.
- **Primary Hero (`className="btn--primary--hero"`)**: Reserve for landing-page hero and CTA-section buttons only. This modifier adds a subtle pulsing glow animation that draws attention to marketing CTAs. Do not use inside the authenticated app.
- **Secondary (`variant="secondary"`)**: Use for alternative actions, cancel buttons, and secondary CTAs. In modals and inline forms, Cancel must always be secondary.
- **Ghost (`variant="ghost"`)**: Use for low-priority inline actions (Edit, View, Manage, Delete in lists) and navigation actions within cards. Do not use for form submission or destructive actions.
- **Danger (`variant="danger"`)**: Use exclusively for destructive actions (Delete, Archive, Cancel interview). Never use for non-destructive actions.
- **Sizing**: `lg` for landing-page hero CTAs; `md` for primary form actions; `sm` for compact actions in tables, cards, and lists. Keep size consistent within a given context.

### Icons
- **Semantic accuracy**: Each icon must communicate its function at a glance. Examples: `arrow-down` for decreasing trends, `analytics` for analytics pages, `reports` for reports, `resume` for resume-related actions, `ai` for AI/recommendations.
- **No overload**: Do not reuse one icon for multiple unrelated concepts. `star` is for favorites/saved items only; use `ai` or `sparkles` for recommendations, `briefcase` for internships.
- **Consistency**: Use the `<Icon>` component exclusively. Do not hardcode SVG paths or use raw `<svg>` elements inside buttons or navigation.
- **Size**: 22px for sidebar navigation; 18px for header dropdowns; 14px for trend indicators; 12px for badge icons; 16px for button icons.

### Sidebar
- **Default state**: Expanded for all authenticated users. Collapsed state is opt-in via the toggle button.
- **Persistence**: Store collapsed state per role in `localStorage` (`sidebar-collapsed-student`, `sidebar-collapsed-employer`, `sidebar-collapsed-admin`).
- **Toggle**: Always visible in both expanded and collapsed states. Use a chevron icon with a spring-like rotation animation (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Labels**: Show text labels in expanded state; hide in collapsed state. Tooltips appear on hover when collapsed.

### Empty States
- **Single primary CTA**: Each empty state should have one clear, actionable button that takes the user directly to the next micro-task. Avoid generic destinations like `/account` when a specific section link exists.
- **Deep linking**: Link to specific sections using hash anchors (e.g., `/student/account#section-skills`) to reduce friction.

## Accessibility Guidelines
- Follow WCAG 2.1 AA standards
- Provide visible focus states and semantic HTML
- Ensure form labels and error states are understandable
- All interactive elements must have accessible names (`aria-label` or visible text)

## Responsive Breakpoints
- Mobile: <768px
- Tablet: 768px–1023px
- Desktop: >=1024px
