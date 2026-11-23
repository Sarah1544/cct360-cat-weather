/* CLASS-TAUGHT: fetch API, DOM manipulation, event listeners, JSON parsing, canvas */
/* EXTERNAL: Open-Meteo API (https://open-meteo.com/en/docs) - no key required */

let currentWeather = null;
let currentCity = "Toronto";

// Canvas setup
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const container = document.querySelector(".weather-window");
  if (!container) return;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// DOM elements
const cityInput = document.getElementById("cityInput");
const presetBtns = document.querySelectorAll(".preset-btn");
const bedroomContainer = document.querySelector(".bedroom-container");
const lightingOverlay = document.getElementById("lightingOverlay");
const mochieArea = document.getElementById("mochieArea");
const speechBubble = document.getElementById("speechBubble");

// Event listeners
presetBtns.forEach(btn => {
  btn.addEventListener("click", () => fetchWeather(btn.dataset.city));
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

mochieArea.addEventListener("click", mochieClick);

// Fetch weather
function fetchWeather(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  fetch(geoUrl)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        getWeatherData(location.latitude, location.longitude, city);
      } else {
        showMochinMessage(`Can't find ${city}...`);
      }
    })
    .catch(err => {
      console.error("Error:", err);
      showMochinMessage("Connection trouble!");
    });
}

function getWeatherData(lat, lon, city) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code,wind_speed_10m&timezone=auto`;

  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      currentCity = city;
      currentWeather = data.current;
      updateRoom();
      updateActiveButton(city);
    })
    .catch(err => console.error("Error:", err));
}

function updateActiveButton(city) {
  presetBtns.forEach(btn => btn.classList.remove("active"));
  const activeBtn = Array.from(presetBtns).find(btn => btn.dataset.city === city);
  if (activeBtn) activeBtn.classList.add("active");
}

// Update room with weather data
function updateRoom() {
  if (!currentWeather) return;

  const temp = currentWeather.temperature_2m;
  const isDay = currentWeather.is_day;
  const code = currentWeather.weather_code;
  const windSpeed = currentWeather.wind_speed_10m;

  const condition = getWeatherCondition(code, isDay);
  const mood = getMochinMood(condition, temp, windSpeed, isDay);

  // Update info panel
  document.getElementById("cityName").textContent = currentCity;
  document.getElementById("temperature").textContent = `${Math.round(temp)}°C`;
  document.getElementById("condition").textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
  document.getElementById("timeOfDay").textContent = isDay ? "Day" : "Night";
  document.getElementById("catMood").textContent = mood;
  updateWeatherIcon(condition);

  // Data-driven Property 1: Lighting overlay
  updateLighting(condition, isDay);

  // Data-driven Property 2: Window weather
  drawWeatherScene(condition, isDay);
}

function getWeatherCondition(code, isDay) {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3) return "cloudy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 90 && code <= 99) return "thunderstorm";
  return "cloudy";
}

function updateWeatherIcon(condition) {
  const icons = { sunny: "☀️", cloudy: "☁️", rainy: "🌧️", snowy: "❄️", thunderstorm: "⛈️" };
  document.getElementById("weatherIcon").textContent = icons[condition] || "☁️";
}

// Property 1: Lighting overlay
function updateLighting(condition, isDay) {
  bedroomContainer.classList.remove("daytime", "sunny", "rainy", "snowy");

  if (isDay) {
    if (condition === "sunny") {
      bedroomContainer.classList.add("sunny");
    } else if (condition === "rainy" || condition === "thunderstorm") {
      bedroomContainer.classList.add("rainy");
    } else if (condition === "snowy") {
      bedroomContainer.classList.add("snowy");
    } else {
      bedroomContainer.classList.add("daytime");
    }
  }
}

// Property 2: Window weather
function drawWeatherScene(condition, isDay) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isDay) {
    ctx.fillStyle = condition === "rainy" ? "#7a8a9a" : "#87ceeb";
  } else {
    ctx.fillStyle = "#1a1a3e";
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isDay) {
    ctx.fillStyle = "#ffdb58";
    ctx.beginPath();
    ctx.arc(canvas.width - 25, 25, 15, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#fffacd";
    ctx.beginPath();
    ctx.arc(canvas.width - 25, 25, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.7);
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  if (condition === "rainy") drawRain();
  else if (condition === "snowy") drawSnow();
  else if (condition === "cloudy") drawClouds();
  else if (condition === "thunderstorm") {
    drawRain();
    drawClouds();
  }
}

function drawRain() {
  const time = Date.now() / 100 % 100;
  ctx.strokeStyle = "rgba(100, 150, 200, 0.7)";
  ctx.lineWidth = 1.5;

  for (let i = 0; i < 15; i++) {
    const x = (i * 15 + time * 3) % canvas.width;
    const y = (time * 2) % canvas.height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 2, y + 8);
    ctx.stroke();
  }
}

function drawSnow() {
  const time = Date.now() / 150 % 100;
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

  for (let i = 0; i < 20; i++) {
    const x = (i * 12 + Math.sin(time + i) * 8) % canvas.width;
    const y = (time * 1.5 + i * 4) % canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawClouds() {
  ctx.fillStyle = "rgba(200, 200, 200, 0.5)";
  ctx.beginPath();
  ctx.arc(40, 35, 18, 0, Math.PI * 2);
  ctx.arc(65, 30, 20, 0, Math.PI * 2);
  ctx.arc(85, 40, 15, 0, Math.PI * 2);
  ctx.fill();
}

// Animate canvas
function animateCanvas() {
  if (currentWeather) {
    const condition = getWeatherCondition(currentWeather.weather_code, currentWeather.is_day);
    drawWeatherScene(condition, currentWeather.is_day);
  }
  requestAnimationFrame(animateCanvas);
}
animateCanvas();

// Property 3: Mochi mood and interactions
function getMochinMood(condition, temp, windSpeed, isDay) {
  if (!isDay) return "😴 Dreaming...";
  if (condition === "rainy") return "😴 Cozy nap";
  if (condition === "snowy") return "🥶 Chilly";
  if (windSpeed > 20) return "👀 Alert";
  if (temp > 25 && condition === "sunny") return "😸 Warm!";
  if (temp < 5) return "🥶 Cold";
  return "😺 Content";
}

function mochieClick() {
  if (!currentWeather) return;

  const temp = currentWeather.temperature_2m;
  const isDay = currentWeather.is_day;
  const code = currentWeather.weather_code;
  const condition = getWeatherCondition(code, isDay);

  let message = "Meow!";
  if (!isDay) {
    message = "zzz... good dreams...";
  } else if (condition === "rainy") {
    message = "Pitter-patter... so cozy!";
  } else if (condition === "snowy") {
    message = "Brrr! Nope, inside is better!";
  } else if (condition === "sunny" && temp > 25) {
    message = "Found the perfect sunny spot!";
  } else if (temp < 5) {
    message = "Way too cold out there!";
  } else if (currentWeather.wind_speed_10m > 20) {
    message = "What's all that noise?";
  } else {
    message = "Purrrr... everything's perfect!";
  }

  showMochinMessage(message);
}

function showMochinMessage(text) {
  speechBubble.textContent = text;
  speechBubble.style.opacity = "0";
  speechBubble.style.animation = "none";

  setTimeout(() => {
    speechBubble.style.animation = "fadeInOut 3s ease-in-out";
  }, 10);
}

// Initialize
fetchWeather(currentCity);
