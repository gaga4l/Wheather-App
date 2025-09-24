const body = document.querySelector("body");
const todayDate = document.getElementById("today-date");
const currentTemp = document.getElementById("current-temp");
const currentTempImg = document.getElementById("current-temp-img");
const currentLocation = document.getElementById("current-location");
const currentFeels = document.getElementById("current-feels");
const currentWindSpeed = document.getElementById("current-wind-speed");
const currentHumidity = document.getElementById("current-humidity");
const currentPrecipitation = document.getElementById("current-precipitation");
const unitsContainer = document.getElementById("unit-container");
const unitsDropdown = document.getElementById("units-drop-down");
const hourlyForecastDropdown = document.getElementById("hourly-forecast-dropdown");
const daysContainer = document.getElementById("days-container");
let currentLatitude = null;
let currentLongitude = null;
let loc = "Addis ababa";

//------------------------------------------------------------------------------------
// Change Unit measurment from one unit to another(functionality & display)

unitsDropdown.addEventListener("click", (e) => {
  switch (e.target.id) {
    case "celsius":
      unitOptions.tempUnit = "celsius";
      e.target.classList.add("now-mes");
      document.getElementById("fahrenheit").classList.remove("now-mes");
      break;
    case "fahrenheit":
      unitOptions.tempUnit = "fahrenheit";
      e.target.classList.add("now-mes");
      document.getElementById("celsius").classList.remove("now-mes");
      break;
    case "kmh":
      unitOptions.windUnit = "kmh";
      e.target.classList.add("now-mes");
      document.getElementById("mph").classList.remove("now-mes");
      break;
    case "mph":
      unitOptions.windUnit = "mph";
      e.target.classList.add("now-mes");
      document.getElementById("kmh").classList.remove("now-mes");
      break;
    case "mm":
      unitOptions.precipUnit = "mm";
      e.target.classList.add("now-mes");
      document.getElementById("km").classList.remove("now-mes");
      break;
    case "inch":
      unitOptions.precipUnit = "inch";
      e.target.classList.add("now-mes");
      document.getElementById("mm").classList.remove("now-mes");
      break;
  }
  fetchWeatherForLocation(loc);
});

//------------------------------------------------------------------------------------
// Unit measurments and Days dropdown on the mouse enter and leave

unitsContainer.addEventListener("mouseenter", () => {
  unitsDropdown.classList.remove("display-none");
});

unitsDropdown.addEventListener("mouseleave", () => {
  unitsDropdown.classList.add("display-none");
});

unitsDropdown.addEventListener("click", (e) => {
  e.stopPropagation();
});

daysContainer.addEventListener("mouseenter", () => {
  hourlyForecastDropdown.classList.remove("display-none");
});

hourlyForecastDropdown.addEventListener("mouseleave", () => {
  hourlyForecastDropdown.classList.add("display-none");
});

hourlyForecastDropdown.addEventListener("click", (e) => {
  e.stopPropagation();
});

body.addEventListener("click", () => {
  unitsDropdown.classList.add("display-none");
  hourlyForecastDropdown.classList.add("display-none");
});

//------------------------------------------------------------------------------------
// Get country, city, latitude and longitude (Coordinates).


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
// Listen for input, get 6 results related to that input,
// listen for those results on click inorder to get their coordinates


const searchBar = document.getElementById("search-input");
const searchResults = document.getElementById("search-dropdown");

// Fetch location suggestions
async function getLocationSuggestions(query) {
  if (!query) {
    searchResults.innerHTML = "";
    return;
  }
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query
  )}&count=6`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      searchResults.innerHTML = "<p>No results found</p>";
      return;
    }

    // Render top 6 results
    searchResults.innerHTML = data.results
      .slice(0, 6)
      .map(
        (place) => `
        <div class="search-item" data-lat="${place.latitude}" data-lon="${place.longitude}">
          <p>${place.name}, ${place.country}<p>
        </div>`
      )
      .join("");
    // Add click listeners to suggestions
    document.querySelectorAll(".search-item").forEach((item) => {
      item.addEventListener("click", () => {
        const lat = item.dataset.lat;
        const lon = item.dataset.lon;
        const city = item.textContent.split(",")[0];
        const country = item.textContent.split(",")[1].trim();

        searchResults.innerHTML = ""; // clear dropdown
        searchBar.value = city + ", " + country; 
        fetchWeatherForLocation(city);
      });
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

// Add typing listener with debounce
let debounceTimeout;
searchBar.addEventListener("input", () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    getLocationSuggestions(searchBar.value);
  }, 300);
});

//------------------------------------------------------------------------------------
// Current temp main display, current temp details, houlry forecast, days dropdown, daily predictions


async function getWeatherData(city, country, weatherUrl) {
    const days = ["Sun", "Mon", "Tue", "wed", "Thru", "Fri", "Sat"];
    const now = new Date();
try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

// Current temp main display
     currentLocation.textContent = `${city}, ${country}`;
     currentTemp.textContent = Math.round(data.current.temperature_2m) + "°";
    const currentCode = data.current.weathercode;
    currentTempImg.src = `${getWeatherIcon(currentCode)}`;

     todayDate.textContent = now.toLocaleDateString("en-us", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

// Current temp details
    currentWindSpeed.textContent = Math.round(data.current.windspeed_10m) + " " + unitOptions.windUnit;
    currentHumidity.textContent = Math.round(data.current.relative_humidity_2m) + "%";
    currentPrecipitation.textContent = Math.round(data.current.precipitation) + unitOptions.precipUnit;
    currentFeels.textContent = Math.round(data.current.apparent_temperature) + "°";

// Hourly Forecast details
    const hourlyTemp = data.hourly.temperature_2m;
    const hourlyPrecipitation = data.hourly.precipitation;
    const hourlyWindSpeed = data.hourly.windspeed_10m;
    const hourlyHumidity = data.hourly.relative_humidity_2m;
    const container = document.getElementById("hourly-forecast-container");

    const times = data.hourly.time;
    const codes = data.hourly.weathercode;

    Array.from(container.children)
      .slice(1) // skip first child
      .forEach((child) => child.remove());

    let startIndex = times.findIndex((t) => new Date(t) >= now); // find closest forecast time >= now
    const step = 3;
    const limit = 8;
    let count = 0;
    for (let i = startIndex; count < limit && i < times.length; i += step) {
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
      const card = document.createElement("div");
      card.className = "items flex flex-col items-center";
      card.innerHTML = `
      <div>
        <img src="${icon}" alt="weather-icon" />
      </div>
      <p>${displayHour}</p>
      <p>${Math.round(hourlyTemp[i])}°</p>
    `;

      container.appendChild(card);
      count++;
    }
      

// Daily Forecast details
    const dailyForecastContainer = document.getElementById(
      "daily-forecast-container"
    );
    const dailyCodes = data.daily.weathercode;
    dailyForecastContainer.innerHTML = ""; // clear old cards first
    hourlyForecastDropdown.innerHTML = ""; // clear old days dropdown

    let counter = now.getDay();
    for (let i = 0; i < 7; i++) {
      const today = document.createElement("p");
      const dailyCard = document.createElement("div");
      const dayMax = Math.round(data.daily.temperature_2m_max[i]);
      const dayMin = Math.round(data.daily.temperature_2m_min[i]);
      const dailyIcon = getWeatherIcon(dailyCodes[i]);
      
      dailyCard.innerHTML = `
          <div>
            <p id="day-${i}">${days[counter]}</p>
            <img src="${dailyIcon}" alt="weather-icon" />
            <div class="degree-range flex">
              <p id="day-${i}-max">${dayMax}°</p>
              <p id="day-${i}-min">${dayMin}°</p>
            </div>
          </div>`;

      // Change hourly forecast when the day change
      if (i !== 0) {
        today.addEventListener("click", () => {
          showHourlyForDay(i, data);
        });
      }      
      today.textContent = `${days[counter]}`;

      hourlyForecastDropdown.appendChild(today);
      dailyForecastContainer.appendChild(dailyCard);
      const s = now.getDay();
      counter++;
      if (counter != s && counter === 7) {
        counter = 0;
      }
    }
    return data;
  } catch (error) {
    console.error("Error: ", error);
  }
}

//------------------------------------------------------------------------------------

function showHourlyForDay(dayIndex, data) {
  const container = document.getElementById("hourly-forecast-container");
  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weathercode;

  Array.from(container.children)
    .slice(1)
    .forEach((c) => c.remove());

  // get the date string for that day (YYYY-MM-DD)
  const selectedDate = data.daily.time[dayIndex];

  // filter hourly times belonging to that day
  const filteredIndexes = times
    .map((t, idx) => ({ t, idx }))
    .filter(({ t }) => t.startsWith(selectedDate))
    .map(({ idx }) => idx);

  // show max 8 slots every 3 hours
  let count = 0;
  for (let j = 0; j < filteredIndexes.length && count < 8; j += 3) {
    const i = filteredIndexes[j];
    const date = new Date(times[i]);
    const hour = date.getHours();
    const displayHour =
      hour === 0
        ? "12 AM"
        : hour < 12
        ? hour + " AM"
        : (hour - 12 || 12) + " PM";

    const card = document.createElement("div");
    card.className = "items flex flex-col items-center";
    card.innerHTML = `
      <div><img src="${getWeatherIcon(codes[i])}" alt="weather-icon" /></div>
      <p>${displayHour}</p>
      <p>${Math.round(temps[i])}°</p>
    `;
    container.appendChild(card);
    count++;
  }
}

//------------------------------------------------------------------------------------

async function fetchWeatherForLocation(locationName) {
  const coord = await getCoordinates(locationName);
  if (coord) {
    if (coord.city == undefined) {
      coord.city = locationName;
    }
    currentLatitude = coord.latitude;
    currentLongitude = coord.longitude;
    const weatherUrl = buildWeatherUrl(
      unitOptions,
      currentLatitude,
      currentLongitude,
      "auto"
    );
    getWeatherData(coord.city, coord.country, weatherUrl);
  }
}
//------------------------------------------------------------------------------------

function getWeatherIcon(code) {
  if (code === 0) return "./assets/images/icon-sunny.webp"; // clear
  if ([1, 2].includes(code)) return "./assets/images/icon-partly-cloudy.webp"; // partly cloudy
  if (code === 3) return "./assets/images/icon-overcast.webp"; // overcast
  if (code >= 51 && code <= 67) return "./assets/images/icon-rain.webp"; // rain
  if (code >= 71 && code <= 77) return "./assets/images/icon-snow.webp"; // snow
  if (code >= 95) return "./assets/images/icon-storm.webp"; // thunderstorm
  return "./assets/images/icon-fog.webp"; // fallback
}

//------------------------------------------------------------------------------------

function buildWeatherUrl(options = {}, latitude, longitude, timezone = "auto") {
  let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}`;
  url +=
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weathercode,rain,precipitation_probability,windspeed_10m";
  url +=
    "&hourly=temperature_2m,weathercode,precipitation,windspeed_10m,relative_humidity_2m";
  url +=
    "&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max,apparent_temperature_max";
  url += `&timezone=${timezone}`;

  if (options.tempUnit && options.tempUnit !== "celsius")
    url += `&temperature_unit=${options.tempUnit}`;
  if (options.windUnit && options.windUnit !== "kmh")
    url += `&wind_speed_unit=${options.windUnit}`;
  if (options.precipUnit && options.precipUnit !== "mm")
    url += `&precipitation_unit=${options.precipUnit}`;

  return url;
}

let unitOptions = {
  tempUnit: "celsius", // or "fahrenheit"
  windUnit: "kmh", // or "mph"
  precipUnit: "mm", // or "inch"
};

//-----------------------------------------------------------------------------------------

const n = String(loc);
loc = n
  .split(" ") 
  .map(
    (word) =>
      word.charAt(0).toUpperCase() + 
      word.slice(1).toLowerCase() 
  )
  .join(" ");

fetchWeatherForLocation(loc);
