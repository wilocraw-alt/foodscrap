# Evaluation Criteria for Foodscrap v4

## Scoring Rubric (Total 10 points)

### 1. Design Fidelity (3 points)
- Colors match reference (cyan gradient, gray bg) - 1 pt
- Typography (fonts, sizes, weights) - 1 pt
- Spacing and layout (margins, padding, card radius) - 1 pt

### 2. Component Implementation (3 points)
- Header (title + subtitle) - 0.5 pt
- Day tabs (horizontal scroll, day+date, active state) - 1 pt
- Today indicator (red "Today" label) - 0.5 pt
- Menu cards (icon, name, time badge, menu list) - 1 pt
- Footer (refresh button, last updated) - 0.5 pt

### 3. Functionality (2 points)
- Tab switching works correctly - 0.5 pt
- Emoji assignment per menu item - 0.5 pt
- Refresh button reloads data - 0.5 pt
- Last Updated time formatted (AM/PM) - 0.5 pt

### 4. Code Quality (1 point)
- Clean, readable code - 0.5 pt
- No console errors - 0.5 pt

### 5. Mobile & PWA (1 point)
- Responsive layout (max-width 430px) - 0.5 pt
- PWA manifest and icons work - 0.5 pt

## Pass Threshold
- Total score >= 8 = PASS
- 6-7.9 = CONDITIONAL (minor fixes)
- < 6 = FAIL (needs major rework)

## Critical Defects (auto-fail)
- Data fails to load
- Tabs don't switch
- No menus displayed
- Broken layout on mobile
