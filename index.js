const todayDate = document.getElementById("today-date");
const currentTemp = document.getElementById("current-temp");
const currentTempImg = document.getElementById("current-temp-img");
const currentWindSpeed = document.getElementById("current-wind-speed");
const currentHumidity = document.getElementById("current-humidity");
const currentPrecipitation = document.getElementById("current-precipitation");
const currentFeels = document.getElementById("current-feels");
const currentLocation = document.getElementById("current-location");
const day1Max = document.getElementById("day-1-max");
const day1min = document.getElementById("day-1-min");

//------------------------------------------------------------------------------------
async function getCoordinates(locationName) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    locationName
  )}&count=1`;

  try {
    const response = await fetch(geoUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { country, name, latitude, longitude } = data.results[0];
      return { country, name, latitude, longitude };
    } else {
      console.log("location not found");
      return null;
    }
  } catch (error) {
    console.error("Error: ", error);
  }
}
//------------------------------------------------------------------------------------

async function getWeatherData(city, country, latitude, longitude) {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,precipitation_probability,windspeed_10m&hourly=temperature_2m,weathercode,precipitation,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,apparent_temperature_max&timezone=${timezone}`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

    currentLocation.textContent = `${city}, ${country}`;

    currentTemp.textContent = Math.round(data.current.temperature_2m);

    currentWindSpeed.textContent = Math.round(data.current.windspeed_10m);

    currentHumidity.textContent = Math.round(data.current.relative_humidity_2m);

    currentPrecipitation.textContent = Math.round(data.current.precipitation);
    currentFeels.textContent = Math.round(data.current.apparent_temperature);

    const days = ["Sun", "Mon", "Tue", "wed", "Thrus", "Fri", "Sat"];

    const now = new Date();
    todayDate.textContent = now.toLocaleDateString("en-us", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Hourly details example (first hour)
    const hourlyTemp = data.hourly.temperature_2m[0];
    const hourlyPrecipitation = data.hourly.precipitation[0];
    const hourlyWindSpeed = data.hourly.windspeed_10m[0];
    const hourlyHumidity = data.hourly.relative_humidity_2m[0];

    // Daily details example (first day)
    const dailyMaxTemp = data.daily.temperature_2m_max[0];
    const dailyMinTemp = data.daily.temperature_2m_min[0];

    // day1Max.textContent = Math.round(dailyMaxTemp)
    // day1min.textContent = Math.round(dailyMinTemp)
    let counter = now.getDay();
    for (let i = 1; i <= 7; i++) {
      const dayMax = document.getElementById(`day-${i}-max`);
      const dayMin = document.getElementById(`day-${i}-min`);
      const today = document.getElementById(`day-${i}`);

      dayMax.textContent = Math.round(data.daily.temperature_2m_max[i - 1]);
      dayMin.textContent = Math.round(data.daily.temperature_2m_min[i - 1]);
      const s = now.getDay();

      if (counter === s) {
        today.textContent = "Now";
      } else if (counter != s && counter === 7) {
        counter = 0;
      } else {
        today.textContent = days[counter];
      }
      counter++;
    }

    const times = data.hourly.time;
    const temps = data.hourly.temperature_2m;
    const codes = data.hourly.weathercode;
    console.log(codes)

    for (let i = 0; i < 8; i++) {
      const date = new Date(times[i]);
      const hour = date.getHours();
      const displayHour =
        hour === 0
          ? "12 AM"
          : hour < 12
          ? hour + " AM"
          : (hour - 12 || 12) + " PM";

      // pick icon path from weather code
      const icon = getWeatherIcon(codes[i]);

      const container = document.getElementById("hourly-forecast-container")
      const card = document.createElement("div");
      card.className = "items flex flex-col items-center";
      card.innerHTML = `
      <div>
        <img src="${icon}" alt="weather-icon" />
      </div>
      <p>${displayHour}</p>
      <p>${Math.round(temps[i])}°</p>
    `;
    container.appendChild(card)
    }

    return data;
  } catch (error) {
    console.error("Error: ", error);
  }
}
//------------------------------------------------------------------------------------

async function fetchWeatherForLocation(locationName) {
  const coord = await getCoordinates(locationName);

  if (coord) {
    if (coord.city == undefined) {
      coord.city = locationName;
    }
    const weather = await getWeatherData(
      coord.city,
      coord.country,
      coord.latitude,
      coord.longitude
    );
  }
}
//------------------------------------------------------------------------------------

function getWeatherIcon(code) {
  if (code === 0) return "./assets/images/icon-sunny.webp"; // clear
  if ([1, 2].includes(code))
    return "./assets/images/icon-partly-cloudy.webp"; // partly cloudy
  if (code === 3) return "./assets/images/icon-overcast.webp"; // overcast
  if (code >= 51 && code <= 67) return "./assets/images/icon-rain.webp"; // rain
  if (code >= 71 && code <= 77) return "./assets/images/icon-snow.webp"; // snow
  if (code >= 95) return "./assets/images/icon-storm.webp.webp"; // thunderstorm
  return "./assets/images/icon-fog.webp"; // fallback
}

//------------------------------------------------------------------------------------
let loc = "Addis ababa";
const n = String(loc);
loc = n
  .split(" ") // split by spaces
  .map(
    (word) =>
      word.charAt(0).toUpperCase() + // first letter upper
      word.slice(1).toLowerCase() // rest lower
  )
  .join(" ");

const timezone = "auto";
fetchWeatherForLocation(loc);
