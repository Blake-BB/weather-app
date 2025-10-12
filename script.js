function renderWeather(city, temp, description, code) {
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
      <h2>${city}</h2>
      <p>Temperature: ${temp}°F</p>
      <p>${description}</p>
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

async function fetchWeather(city) {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) throw new Error('City not found');
    const geoData = await geoRes.json();
    if (!geoData.results?.[0]) throw new Error('City not found');
    const { latitude, longitude } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&timezone=auto&temperature_unit=fahrenheit`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error('Weather fetch failed');
    const weatherData = await weatherRes.json();

    const temp = weatherData.current_weather.temperature;
    const description = getWeatherDescription(weatherData.current_weather.weathercode);

    renderWeather(city, temp, description);
  } catch (error) {
    document.getElementById('weatherResult').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

document.getElementById('getWeather').addEventListener('click', () => {
  let city = document.getElementById('city').value.trim();
  if (!city) {
    alert('Please type a city name.');
    return;
  }
  city = city.replace(/[<>]/g, '');
  if (!/^[a-zA-Z\s]+$/.test(city)) {
    alert('Please use only letters and spaces for city name.');
    return;
  }
  fetchWeather(city);
});
