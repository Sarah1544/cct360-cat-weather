# A Day in the Life of a Cat

An interactive website where a virtual cat lives in a cozy bedroom that changes according to real-world weather data. Using the Open-Meteo API, the room's lighting, the outdoor window scene, and the cat's behaviour transform based on current conditions in a selected city.

## Concept

A single cozy room where a cute orange cat lives. The user enters a city name, and real weather data fetched from Open-Meteo shapes the entire experience—from room lighting to cat behaviour to animated weather outside the window.

## Team

- Sarah Khan
- Christina [Last Name]

## Technical Implementation

### Class-Taught Techniques (CCT360)
- HTML5 semantic structure
- CSS flexbox layout, gradients, responsive design, animations
- JavaScript DOM manipulation (getElementById, querySelector, classList)
- Event listeners (click, keypress)
- Fetch API and JSON parsing
- Canvas for animated weather visualization
- Functions, loops, control flow
- Transition and animation effects

### External Resources (Cited)

**Open-Meteo API**
- Source: https://open-meteo.com/en/docs
- Used to fetch real weather data: temperature, weather code, day/night, wind speed
- Free, public API - no authentication key required
- Includes geocoding to find city coordinates

## Three Data-Driven Properties

The website implements three interface properties controlled by real weather API data:

### Property 1: Room Lighting and Colours
Based on weather condition and time of day:
- **Sunny** → Warm bright tones (#f5d4a8, #f0c79e)
- **Cloudy** → Muted neutral tones (#d4c5b9, #e8d5c4)
- **Rainy** → Dim grey tones (#a8a0a0, #bab0a8)
- **Snowy** → Cool light tones (#d8dce8, #e8ecf0)
- **Night** → Dark blue tones (#2a2a4a, #3a3a5a)

Room class changes via `classList` based on weather code and `is_day` from API.

### Property 2: Weather Visualization (Window)
Animated canvas shows real-time weather conditions:
- **Sunny day** → Blue sky with animated sun
- **Cloudy** → Grey clouds
- **Rainy** → Blue sky with rain animation (falling lines)
- **Snowy** → White snow particles falling
- **Night** → Dark sky with moon and twinkling stars

Canvas updates 60 FPS to create smooth animations.

### Property 3: Cat Behaviour and Poses
Cat's visual state and mood change based on weather:
- **Rainy weather** → Cat sleeping (`.sleeping` class, rotated pose)
- **Cold weather (<5°C)** → Cat appears on blanket, reduced opacity (`.cold` class)
- **Windy weather (>20 km/h)** → Cat alert (`.alert` class), tail raised, plant swaying animation
- **Sunny & warm (>20°C)** → Cat tail wagging (`.happy` state)
- **Any weather** → Mood text in info panel changes dynamically

Cat mood examples:
- Rainy: "😴 Sleepy"
- Sunny & warm: "😸 Happy & Warm"
- Snowy: "🥶 Chilly"
- Windy: "😺 Alert"

## User Interactions

**Interaction 1: Choose a City**
- Type city name in input box and press Enter or click "Check Weather"
- Or click one of four preset buttons: Toronto, Tokyo, London, New York
- Fetches real coordinates via Open-Meteo geocoding, then weather data

**Interaction 2: Click the Cat**
- Cat responds with random meows and tail wags
- Shows cute dialogue bubble: "Meow! 😸", "Purr 🐱", "Pounce!", "So cozy! ☕"

## Room Elements

- **Lamp** (top left) → Turns on at night (lighting effect visible on shade)
- **Bed** (bottom right) → Blanket appears when temperature < 5°C
- **Plant** (bottom left) → Sways when windy (>20 km/h)
- **Rug** (bottom center) → Soft background element
- **Cat** (center) → Main interactive character, changes pose/behaviour
- **Window** (top, animated canvas) → Shows live weather visualization
- **Info panel** (bottom) → Displays city, temperature, condition, time, cat mood

## How It Works

1. User enters a city name or clicks a preset button
2. App fetches city coordinates from Open-Meteo Geocoding API
3. App fetches current weather data (temperature, weather code, is_day, wind_speed)
4. Room updates:
   - Room background colour changes based on weather + time of day
   - Canvas draws animated weather scene (sun/moon/stars/rain/snow/clouds)
   - Cat pose and behaviour change based on temperature, wind, rain
   - Lamp turns on/off based on day/night
   - Blanket appears if cold
   - Plant sways if windy
5. Info panel displays all current data
6. User can click cat for cute interactions

## Responsive Design

- **Desktop** (900px+) — Full scene with all decorative elements
- **Tablet** (768px) — Optimized spacing, smaller elements
- **Mobile** (480px) — Single column, stacked buttons, simplified layout

All elements remain visible and functional on all screen sizes.

## Files

- `index.html` — Page structure with room, cat, window, info panel, controls
- `style.css` — Cozy bedroom design with weather state classes, animations, responsive layout
- `script.js` — Open-Meteo API integration, weather-driven updates, canvas animations, interactions
- `README.md` — This file

## GitHub Pages

Fully functional on GitHub Pages at: https://sarah1544.github.io/cct360-cat-weather/

## Notes

- No frameworks or external libraries (vanilla HTML/CSS/JS + Fetch API)
- All techniques from class materials
- Open-Meteo provides free, real weather data with no API key required
- Fully responsive and accessible
- Data-driven interface responds meaningfully to real-world weather
- Smooth animations and transitions enhance the experience

## Why This Works for the Assignment

✅ **One public API** — Open-Meteo (free, no key)  
✅ **Live JSON data** — Real weather fetched and parsed  
✅ **3+ interface properties driven by data** — room lighting, window weather, cat behaviour  
✅ **2+ user interactions** — choose city, click cat  
✅ **Responsive** — works on all screen sizes  
✅ **Clear concept** — weather shapes the digital experience  
✅ **Easy to demonstrate** — change cities, see room transform  
