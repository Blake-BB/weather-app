# Sky Check by BB

A polished weather application built with HTML, CSS, and JavaScript, using the Open-Meteo API to provide real-time temperature, wind speed, humidity, a 6-hour forecast, and a 7-day forecast for any city, state, or ZIP code worldwide.

## Features
- Search by city (e.g., London, Tokyo, São Paulo), city/state (e.g., Atlanta, Georgia), or US ZIP code
- Simple, intuitive form with robust input validation and no autofill
- 6-hour and 7-day forecast with temperature, weather icons, and hover effects
- Highly responsive design with modern styling for mobile and desktop
- Dynamic weather-specific backgrounds (sunny, cloudy, rainy)
- Displays temperature, wind speed, humidity, and weather description
- Accessibility features (ARIA labels, keyboard navigation)
- Loading spinner and dismissible error messages
- Deployed on GitHub Pages: https://blake-bb.github.io/weather-app

## Tech Stack
- HTML, CSS, JavaScript
- Open-Meteo API for geocoding and weather data
- Google Fonts (Poppins)
- GitHub Pages for deployment

## Setup
1. Clone the repo: `git clone https://github.com/Blake-BB/weather-app.git`
2. Open `index.html` in a browser or run a local server: `python3 -m http.server 8000`
3. Enter a city, city/state, or US ZIP code to check the weather.

## Future Improvements
- Add geolocation for automatic location detection
- Support more weather conditions (e.g., snow, thunderstorms)
- Implement caching for faster repeat searches

## License
MIT License
