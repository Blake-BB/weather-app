function renderWeather(location, temp, description, code, windSpeed, humidity, hourlyData, dailyData) {
  const iconMap = {
    0: "01d", // Clear sky
    1: "02d", // Mainly clear
    2: "03d", // Partly cloudy
    3: "04d", // Overcast
    61: "10d", // Light rain
    63: "10d", // Moderate rain
    80: "09d"  // Rain showers
  };
  const weatherStyles = {
    0: "clear", // Clear sky
    1: "clear", // Mainly clear
    2: "cloudy", // Partly cloudy
    3: "cloudy", // Overcast
    61: "rain", // Light rain
    63: "rain", // Moderate rain
    80: "rain"  // Rain showers
  };
  const icon = iconMap[code] || "01d";
  const weatherStyle = weatherStyles[code] || "clear";
  document.body.className = weatherStyle;
  const result = document.getElementById('weatherResult');
  let hourlyHTML = '<h3>Next 6 Hours</h3><div class="hourly-forecast">';
  hourlyData.forEach(({ time, temp, code }) => {
    const hour = new Date(time).getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const hourIcon = iconMap[code] || "01d";
    hourlyHTML += `
      <div class="hourly-item" role="group" aria-label="Hourly forecast for ${displayHour}${ampm}">
        <p>${displayHour}${ampm}</p>
        <img src="https://openweathermap.org/img/wn/${hourIcon}.png" alt="${getWeatherDescription(code)}" />
        <p>${temp}°F</p>
      </div>
    `;
  });
  hourlyHTML += '</div>';
  let dailyHTML = '<h3>Next 7 Days</h3><div class="daily-forecast">';
  dailyData.forEach(({ time, tempMax, tempMin, code }) => {
    const date = new Date(time);
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayIcon = iconMap[code] || "01d";
    dailyHTML += `
      <div class="daily-item" role="group" aria-label="Daily forecast for ${day}">
        <p>${day}</p>
        <img src="https://openweathermap.org/img/wn/${dayIcon}.png" alt="${getWeatherDescription(code)}" />
        <p>${tempMax}°F / ${tempMin}°F</p>
      </div>
    `;
  });
  dailyHTML += '</div>';
  result.innerHTML = `
    <div class="weather-card">
      <h2>${location}</h2>
      <p>Temperature: ${temp}°F</p>
      <p>${description}</p>
      <p>Wind Speed: ${windSpeed} mph</p>
      <p>Humidity: ${humidity}%</p>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
      ${hourlyHTML}
      ${dailyHTML}
    </div>
  `;
}

function getWeatherDescription(code) {
  const codes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    61: "Light rain",
    63: "Moderate rain",
    80: "Rain showers"
  };
  return codes[code] || "Unknown";
}

async function fetchWeather(city, state, zip) {
  const result = document.getElementById('weatherResult');
  const submitButton = document.querySelector('#weatherForm button[type="submit"]');
  submitButton.disabled = true;
  result.innerHTML = `
    <div class="loading" role="alert">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  `;
  try {
    // Clean city input: remove commas and extra spaces
    const cleanCity = city.replace(/[,]/g, '').trim();
    if (!cleanCity && !zip) {
      throw new Error('Please enter a city or ZIP code.');
    }

    let geoUrl;
    if (cleanCity) {
      geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanCity)}`;
      if (state) geoUrl += `&admin1=${encodeURIComponent(state)}`;
      geoUrl += '&count=1&language=en&format=json';
    } else if (zip) {
      geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(zip)}&count=1&language=en&format=json`;
    }
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error(`Geocoding failed: ${geoRes.status}`);
    const geoData = await geoRes.json();
    if (!geoData.results?.length) throw new Error(`No results found for "${cleanCity || zip}".`);

    const { latitude, longitude, name, admin1 = '', country = '' } = geoData.results[0];
    const displayName = `${name}, ${admin1 || ''}, ${country || ''}`.replace(/, ,/, ',').replace(/, $/, '');

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode,relativehumidity_2m,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&temperature_unit=fahrenheit&windspeed_unit=mph`;
    const weatherRes = await fetch(weatherUrl, { cache: 'no-store' });
    if (!weatherRes.ok) throw new Error(`Weather fetch failed: ${weatherRes.status}`);
    const weatherData = await weatherRes.json();

    const temp = weatherData.current_weather.temperature;
    const description = getWeatherDescription(weatherData.current_weather.weathercode);
    const weatherCode = weatherData.current_weather.weathercode;
    const windSpeed = weatherData.current_weather.windspeed;
    const humidity = weatherData.hourly.relativehumidity_2m[0];
    const hourlyData = weatherData.hourly.time.slice(0, 6).map((time, i) => ({
      time,
      temp: Math.round(weatherData.hourly.temperature_2m[i]),
      code: weatherData.hourly.weathercode[i]
    }));
    const dailyData = weatherData.daily.time.map((time, i) => ({
      time,
      tempMax: Math.round(weatherData.daily.temperature_2m_max[i]),
      tempMin: Math.round(weatherData.daily.temperature_2m_min[i]),
      code: weatherData.daily.weathercode[i]
    }));

    renderWeather(displayName, temp, description, weatherCode, windSpeed, humidity, hourlyData, dailyData);
  } catch (error) {
    console.error('Error:', error);
    result.innerHTML = `
      <div class="error" role="alert">
        <p>Error: ${error.message}</p>
        <button class="dismiss-error" aria-label="Dismiss error">Dismiss</button>
      </div>
    `;
    // Add event listener for dismiss button
    setTimeout(() => {
      const dismissButton = document.querySelector('.dismiss-error');
      if (dismissButton) {
        dismissButton.addEventListener('click', () => {
          result.innerHTML = '';
        });
      }
    }, 0);
  } finally {
    submitButton.disabled = false;
  }
}

document.getElementById('weatherForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const cityInput = document.getElementById('cityInput');
  const stateInput = document.getElementById('stateInput');
  const zipInput = document.getElementById('zipInput');
  let city = cityInput.value.trim();
  const state = stateInput.value.trim();
  const zip = zipInput.value.trim();

  if (!city && !zip) {
    alert('Please enter a city or ZIP code.');
    return;
  }
  if (city && !/^[a-zA-Z\s\-\u00C0-\u017F]+$/.test(city)) {
    alert('Please use only letters, spaces, or hyphens for city name (no commas).');
    return;
  }
  if (state && !/^[a-zA-Z\s]+$/.test(state)) {
    alert('Please use only letters and spaces for state name.');
    return;
  }
  if (zip && !/^\d{5}$/.test(zip)) {
    alert('Please enter a valid 5-digit ZIP code.');
    return;
  }

  fetchWeather(city, state, zip);
  // Clear inputs after submission
  cityInput.value = '';
  stateInput.value = '';
  zipInput.value = '';
});

document.getElementById('clearForm').addEventListener('click', () => {
  const cityInput = document.getElementById('cityInput');
  const stateInput = document.getElementById('stateInput');
  const zipInput = document.getElementById('zipInput');
  const result = document.getElementById('weatherResult');
  cityInput.value = '';
  stateInput.value = '';
  zipInput.value = '';
  result.innerHTML = '';
  document.body.className = '';
});
