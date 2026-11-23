/* CLASS-TAUGHT: fetch API, DOM manipulation, event listeners, JSON parsing, canvas */
/* EXTERNAL: Open-Meteo API (https://open-meteo.com/en/docs) - no key required */

let currentWeather = null;
let currentCity = "Toronto";

// Canvas setup - CLASS-TAUGHT: canvas for drawing
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const container = document.querySelector(".window");
  if (!container) return;
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// DOM elements - CLASS-TAUGHT: getElementById, querySelector
const cityInput = document.getElementById("cityInput");
const presetBtns = document.querySelectorAll(".preset-btn");
const bedroomContainer = document.querySelector(".bedroom-container");
const cat = document.getElementById("cat");
const lamp = document.querySelector(".lamp");
const plant = document.querySelector(".plant");

// Event listeners - CLASS-TAUGHT: addEventListener
presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    fetchWeather(btn.dataset.city);
  });
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

cat.addEventListener("click", catClick);

// Fetch weather - CLASS-TAUGHT: fetch API, JSON parsing
function fetchWeather(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  fetch(geoUrl)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        getWeatherData(location.latitude, location.longitude, city);
      }
    })
    .catch(err => console.error("Error:", err));
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

// Update room based on weather - Three data-driven properties
function updateRoom() {
  if (!currentWeather) return;

  const temp = currentWeather.temperature_2m;
  const isDay = currentWeather.is_day;
  const code = currentWeather.weather_code;
  const windSpeed = currentWeather.wind_speed_10m;

  const condition = getWeatherCondition(code, isDay);
  const mood = getCatMood(condition, temp, windSpeed);

  // Update info panel
  document.getElementById("cityName").textContent = currentCity;
  document.getElementById("temperature").textContent = `${Math.round(temp)}°C`;
  document.getElementById("condition").textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
  document.getElementById("timeOfDay").textContent = isDay ? "Day" : "Night";
  document.getElementById("catMood").textContent = mood;
  updateWeatherIcon(condition);

  // Property 1: Room lighting based on weather
  updateRoomLighting(condition, isDay);

  // Property 2: Window weather visualization
  drawWeatherScene(condition, isDay);

  // Property 3: Cat behavior based on weather
  updateCatBehavior(condition, temp, windSpeed, isDay);
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
  const icons = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snowy: "❄️",
    thunderstorm: "⛈️"
  };
  document.getElementById("weatherIcon").textContent = icons[condition] || "☁️";
}

// Property 1: Room lighting - CLASS-TAUGHT: classList manipulation
function updateRoomLighting(condition, isDay) {
  bedroomContainer.classList.remove("rainy", "snowy", "night", "sunny");

  if (!isDay) {
    bedroomContainer.classList.add("night");
  } else if (condition === "rainy" || condition === "thunderstorm") {
    bedroomContainer.classList.add("rainy");
  } else if (condition === "snowy") {
    bedroomContainer.classList.add("snowy");
  } else if (condition === "sunny") {
    bedroomContainer.classList.add("sunny");
  }
}

// Property 2: Draw weather in window - CLASS-TAUGHT: canvas drawing
function drawWeatherScene(condition, isDay) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky
  if (isDay) {
    ctx.fillStyle = condition === "rainy" ? "#7a8a9a" : "#87ceeb";
  } else {
    ctx.fillStyle = "#1a1a3e";
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Sun or moon
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

    // Stars
    ctx.fillStyle = "white";
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.7);
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // Weather-specific visuals
  if (condition === "rainy") {
    drawRain();
  } else if (condition === "snowy") {
    drawSnow();
  } else if (condition === "cloudy") {
    drawClouds();
  } else if (condition === "thunderstorm") {
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

// Property 3: Cat behavior - CLASS-TAUGHT: classList, style manipulation
function updateCatBehavior(condition, temp, windSpeed, isDay) {
  cat.classList.remove("sleeping", "alert", "happy");
  plant.classList.remove("windy");

  // Lamp on/off
  if (isDay) {
    lamp.classList.remove("on");
  } else {
    lamp.classList.add("on");
  }

  // Blanket if cold
  if (temp < 5) {
    bedroomContainer.classList.add("cold");
  } else {
    bedroomContainer.classList.remove("cold");
  }

  // Cat states based on weather
  if (condition === "rainy" || temp < 0) {
    cat.classList.add("sleeping");
  } else if (windSpeed > 20) {
    cat.classList.add("alert");
    plant.classList.add("windy");
  } else if (condition === "sunny" && temp > 20) {
    cat.classList.add("happy");
  }
}

function getCatMood(condition, temp, windSpeed) {
  if (condition === "rainy") return "😴 Sleepy";
  if (condition === "snowy") return "🥶 Chilly";
  if (windSpeed > 20) return "😺 Alert";
  if (temp > 25 && condition === "sunny") return "😸 Happy & Warm";
  if (temp < 5) return "🥶 Cold";
  return "😺 Content";
}

// Cat click
function catClick() {
  const messages = ["Meow! 😸", "Purr 🐱", "Pounce! 😺", "So cozy! ☕"];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  // Show visible speech bubble
  let bubble = document.getElementById("catBubble");
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.id = "catBubble";
    bubble.style.cssText = `
      position: absolute;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border: 2px solid #8b7355;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11px;
      color: #5a4a3a;
      font-weight: bold;
      max-width: 100px;
      text-align: center;
      white-space: normal;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      z-index: 20;
    `;
    cat.parentElement.appendChild(bubble);
  }
  bubble.textContent = msg;
  bubble.style.opacity = "1";
  bubble.style.animation = "fadeInOut 3s ease-in-out";

  cat.classList.add("happy");
  setTimeout(() => cat.classList.remove("happy"), 600);
}

// Initialize
fetchWeather(currentCity);
