# Foodscrap v4 - Design Reference Analysis

## Reference Screenshots
- ref_design_1.jpg - Main screen (day selection, menu cards)
- ref_design_2.jpg - Another day view

## Visual Design Analysis

### Color Scheme
- Header: Cyan gradient (light to darker cyan)
- Background: Light gray (#F5F7FA)
- Cards: White with soft shadow
- Text: Dark slate (#263238)
- Secondary text: Gray (#78909C)
- Accent: Cyan/blue for badges and active states
- Today indicator: Red text ("Today")

### Layout Structure

1. Header
   - App title: "🍽️ 국회도서관 식단표"
   - Subtitle: Date range

2. Day Tabs (Horizontal Scroll)
   - Each tab shows: day number (large) + day name (small)
   - Active tab: light cyan background
   - Today tab: active + red "Today" label
   - Evenly spaced, centered

3. Date Title
   - Full date string (e.g., "3.30(월) Lunch")

4. Menu Cards
   - Two cards: "도서관식당" and "박물관식당"
   - Card header: Icon + name + time badge ("11:30 ~ 13:30")
   - Card body: Menu items with emoji icons
   - Empty/closed: Show "영업을 하지 않습니다"

5. Footer
   - Refresh button: "🔄 재수집"
   - Last updated: "Last Updated: 9:55 PM"
   - Source: "국회도서관 · GitHub Actions"

### v4 Goals
1. Match reference design
2. Auto emoji for menu items
3. Time badges
4. Proper AM/PM time format
5. Improved today tab
6. Card layout polish
7. Mobile responsive

### Testing Checklist
- All 7 days display correctly
- Today tab highlighted with red "Today"
- Horizontal scrolling tabs
- Appropriate emojis
- Time badges visible
- Refresh button works
- Last Updated formatted
- Empty/closed states
- PWA install
- Offline support
