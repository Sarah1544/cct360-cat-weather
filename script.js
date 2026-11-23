/* CLASS-TAUGHT: fetch API, DOM manipulation, event listeners, JSON parsing, canvas */
/* EXTERNAL: Open-Meteo API (https://open-meteo.com/en/docs) - no key required */

let currentWeather = null;
let currentCity = "Toronto";

const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

// DOM elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const presetBtns = document.querySelectorAll(".preset-btn");
const cat = document.getElementById("cat");
const catBubble = document.getElementById("catBubble");
const catContainer = document.getElementById("catContainer");
const roomContainer = document.getElementById("roomContainer");
const lamp = document.getElementById("lamp");
const blanket = document.getElementById("blanket");
const catTail = document.getElementById("catTail");
const leaves = document.querySelector(".leaves");

// Set up canvas
function resizeCanvas() {
  const container = document.querySelector(".window-view");
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    fetchWeather(btn.dataset.city);
  });
});

cat.addEventListener("click", catClick);

// Fetch weather - CLASS-TAUGHT: fetch API, JSON
function fetchWeather(city) {
  const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const location = data.results[0];
        getWeatherData(location.latitude, location.longitude, city);
      } else {
        showMessage("City not found 😿");
      }
    })
    .catch(err => {
      console.error("Error:", err);
      showMessage("Error fetching city 😿");
    });
}

// Get weather data
function getWeatherData(lat, lon, city) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code,wind_speed_10m&timezone=auto`;

  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      currentCity = city;
      currentWeather = data.current;
      updateRoom();
    })
    .catch(err => {
      console.error("Error:", err);
      showMessage("Error fetching weather 😿");
    });
}

// Update room based on weather - Property 1, 2, 3 controlled by API data
function updateRoom() {
  if (!currentWeather) return;

  const temp = currentWeather.temperature_2m;
  const isDay = currentWeather.is_day;
  const weatherCode = currentWeather.weather_code;
  const windSpeed = currentWeather.wind_speed_10m;

  const condition = getWeatherCondition(weatherCode, isDay);
  const mood = getCatMood(condition, temp, windSpeed);

  // Update info panel
  document.getElementById("cityName").textContent = currentCity;
  document.getElementById("temperature").textContent = `${temp}°C`;
  document.getElementById("condition").textContent = condition;
  document.getElementById("timeOfDay").textContent = isDay ? "Day" : "Night";
  document.getElementById("catMood").textContent = mood;

  // Property 1: Room lighting/colors based on weather
  updateRoomLighting(condition, isDay, temp);

  // Property 2: Weather visualization in window
  drawWeatherScene(condition, isDay);

  // Property 3: Cat behavior based on weather
  updateCatBehavior(condition, temp, windSpeed);

  // Lamp on/off based on day/night
  if (isDay) {
    lamp.classList.remove("on");
  } else {
    lamp.classList.add("on");
  }

  // Blanket if cold
  if (temp < 5) {
    blanket.classList.add("visible");
  } else {
    blanket.classList.remove("visible");
  }
}

// Get weather condition from WMO code
function getWeatherCondition(code, isDay) {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "foggy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code === 80 || code === 81 || code === 82) return "rainy";
  if (code >= 85 && code <= 86) return "snowy";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 90 && code <= 99) return "thunderstorm";
  return "cloudy";
}

// Property 1: Update room lighting - CLASS-TAUGHT: DOM manipulation, classList
function updateRoomLighting(condition, isDay, temp) {
  roomContainer.classList.remove("sunny", "cloudy", "rainy", "snowy", "night");

  if (!isDay) {
    roomContainer.classList.add("night");
  } else if (condition === "sunny") {
    roomContainer.classList.add("sunny");
  } else if (condition === "rainy" || condition === "thunderstorm") {
    roomContainer.classList.add("rainy");
  } else if (condition === "snowy") {
    roomContainer.classList.add("snowy");
  } else {
    roomContainer.classList.add("cloudy");
  }
}

// Property 2: Draw weather scene in window - CLASS-TAUGHT: canvas drawing
function drawWeatherScene(condition, isDay) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky
  if (isDay) {
    ctx.fillStyle = "#87ceeb";
  } else {
    ctx.fillStyle = "#1a1a3e";
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isDay) {
    // Sun
    ctx.fillStyle = "#ffdb58";
    ctx.beginPath();
    ctx.arc(canvas.width - 60, 40, 30, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Moon
    ctx.fillStyle = "#fffacd";
    ctx.beginPath();
    ctx.arc(canvas.width - 60, 40, 25, 0, Math.PI * 2);
    ctx.fill();

    // Stars
    ctx.fillStyle = "white";
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.8);
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // Weather-specific visuals
  if (condition === "rainy") {
    drawRain();
  } else if (condition === "snowy") {
    drawSnow();
  } else if (condition === "cloudy") {
    drawClouds();
  }
}

// Draw rain animation
function drawRain() {
  const time = Date.now() / 100 % 100;
  ctx.strokeStyle = "rgba(100, 150, 200, 0.6)";
  ctx.lineWidth = 2;

  for (let i = 0; i < 20; i++) {
    const x = (i * 20 + time * 5) % canvas.width;
    const y = (time * 3) % canvas.height;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y + 10);
    ctx.stroke();
  }
}

// Draw snow animation
function drawSnow() {
  const time = Date.now() / 100 % 100;
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";

  for (let i = 0; i < 30; i++) {
    const x = (i * 15 + Math.sin(time + i) * 10) % canvas.width;
    const y = (time * 2 + i * 5) % canvas.height;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw clouds
function drawClouds() {
  ctx.fillStyle = "rgba(200, 200, 200, 0.6)";
  ctx.beginPath();
  ctx.arc(100, 60, 30, 0, Math.PI * 2);
  ctx.arc(140, 50, 35, 0, Math.PI * 2);
  ctx.arc(170, 70, 25, 0, Math.PI * 2);
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

// Property 3: Update cat behavior based on weather
function updateCatBehavior(condition, temp, windSpeed) {
  cat.classList.remove("sleeping", "alert", "cold");
  leaves.classList.remove("windy");
  catTail.classList.remove("alert", "happy");

  if (condition === "rainy" || temp < 0) {
    cat.classList.add("sleeping");
  } else if (windSpeed > 20) {
    cat.classList.add("alert");
    catTail.classList.add("alert");
    leaves.classList.add("windy");
  } else if (temp > 25) {
    catTail.classList.add("happy");
  }

  if (temp < 5) {
    cat.classList.add("cold");
  }
}

// Get cat mood based on weather
function getCatMood(condition, temp, windSpeed) {
  if (condition === "rainy") return "😴 Sleepy";
  if (condition === "sunny" && temp > 20) return "😸 Happy & Warm";
  if (condition === "snowy") return "🥶 Chilly";
  if (windSpeed > 20) return "😺 Alert";
  if (temp < 5) return "🥶 Cold";
  return "😺 Content";
}

// Cat click
function catClick() {
  const catMessages = [
    "Meow! 😸",
    "Purr 🐱",
    "Pounce! 😺",
    "So cozy! ☕"
  ];

  showCatBubble(catMessages[Math.floor(Math.random() * catMessages.length)]);
  catTail.classList.add("happy");
  setTimeout(() => catTail.classList.remove("happy"), 600);
}

// Show cat bubble
function showCatBubble(text) {
  catBubble.textContent = text;
  catBubble.style.opacity = "0";
  catBubble.style.animation = "none";

  setTimeout(() => {
    catBubble.style.animation = "fadeInOut 3s ease-in-out";
  }, 10);
}

// Show message
function showMessage(text) {
  showCatBubble(text);
}

// Initialize
fetchWeather(currentCity);
