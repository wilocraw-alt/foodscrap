# Foodscrap v4 - SPECIFICATION

## Overview
Redesign UI to match reference screenshots. Cyan theme, card-based layout, emoji menu items, time badges.

## Design Specs

### Colors (extracted from screenshots)
- Header gradient: #4FC3F7 -> #0288D1
- Background: #F5F7FA
- Card: #FFFFFF
- Text: #263238
- Secondary: #78909C
- Badge bg: #E1F5FE
- Today: #E53935

### Layout
- Max width: 430px
- Border radius: 16px
- Shadows: 0 2px 12px rgba(0,0,0,0.06)

## Components

### Tabs
- Horizontal scroll
- Each tab: day number (large) + day name (small)
- Active: cyan bg
- Today: active + red "Today" label (::after)

### Date Title
- Above cards: "3.30(월)" format

### Menu Card
- Header: icon + restaurant name + time badge "11:30 ~ 13:30"
- Body: list items with emoji + text

### Footer
- Refresh button (cyan gradient)
- Last Updated in 12h AM/PM format

## Implementation Tasks

1. style.css: Add new color variables, tab styling, card styling, date-title, badge
2. index.html: Add date-title container after tabs
3. app.js:
   - getMenuEmoji() function
   - Format Last Updated to AM/PM
   - Rewrite render() to use date-title
   - Rewrite selectDay() to use new card structure
4. Test with data/menu.json

## Acceptance
- Matches screenshots
- Emojis correct
- Time badge shows
- Today label visible
- No console errors
