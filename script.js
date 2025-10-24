function renderWeather(location, temp, description, code, windSpeed, humidity) {
  const iconMap = {
    0: "01d", // Clear sky
    1: "02d", // Mainly clear
    2: "03d", // Partly cloudy
    3: "04d", // Overcast
    61: "10d", // Light rain
    63: "10d", // Moderate rain
    80: "09d"  // Rain showers
  };
  const icon = iconMap[code] || "01d";
  const result = document.getElementById('weatherResult');
  result.innerHTML = `
    <div class="weather-card">
      <h2>${location}</h2>
      <p>Temperature: ${temp}°F</p>
      <p>${description}</p>
      <p>Wind Speed: ${windSpeed} mph</p>
      <p>Humidity: ${humidity}%</p>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
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

async function fetchWeather(input, isZip = false, state = '') {
  try {
    let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${input}&count=10&language=en&format=json`;
    if (state && !isZip) {
      geoUrl += `&admin1=${encodeURIComponent(state)}`;
    }
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error('Location not found');
    const geoData = await geoRes.json();
    if (!geoData.results?.length) throw new Error('Location not found');

    const { latitude, longitude, name, admin1 = '', country = '' } = geoData.results[0];
    const displayName = `${name}, ${admin1 || ''}, ${country || ''}`.replace(/, ,/, ',').replace(/, $/, '');

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode,relativehumidity_2m,windspeed_10m&timezone=auto&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Weather fetch failed');
    const weatherData = await weatherRes.json();

    const temp = weatherData.current_weather.temperature;
    const description = getWeatherDescription(weatherData.current_weather.weathercode);
    const weatherCode = weatherData.current_weather.weathercode;
    const windSpeed = weatherData.current_weather.windspeed;
    const humidity = weatherData.hourly.relativehumidity_2m[0]; // Use latest hourly humidity

    renderWeather(displayName, temp, description, weatherCode, windSpeed, humidity);
  } catch (error) {
    document.getElementById('weatherResult').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

document.getElementById('weatherForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const city = document.getElementById('cityInput').value.trim();
  const state = document.getElementById('stateInput').value.trim();
  const zip = document.getElementById('zipInput').value.trim();
  if (!city && !zip) {
    alert('Please enter a city name or ZIP code.');
    return;
  }
  if (city && !/^[a-zA-Z\s]+$/.test(city)) {
    alert('Please use only letters and spaces for city name.');
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
  fetchWeather(zip || city, !!zip, state);
});
