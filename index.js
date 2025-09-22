const todayDate = document.getElementById("today-date");
const currentTemp = document.getElementById("current-temp");
const currentTempImg = document.getElementById("current-temp-img");
const currentWindSpeed = document.getElementById("current-wind-speed");
const currentHumidity = document.getElementById("current-humidity");
const currentPrecipitation = document.getElementById("current-precipitation");
const currentFeels = document.getElementById("current-feels");
const currentLocation = document.getElementById("current-location");
const day1Max = document.getElementById("day-1-max")
const day1min = document.getElementById("day-1-min")

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
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,precipitation_probability,windspeed_10m&hourly=temperature_2m,precipitation,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,apparent_temperature_max&timezone=${timezone}`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

    currentLocation.textContent = `${city}, ${country}`;

    currentTemp.textContent = Math.round(data.current.temperature_2m);

    currentWindSpeed.textContent = Math.round(data.current.windspeed_10m);

    currentHumidity.textContent = Math.round(data.current.relative_humidity_2m);

    currentPrecipitation.textContent = Math.round(data.current.precipitation);
    currentFeels.textContent = Math.round(data.current.apparent_temperature);


    const now = new Date();
    console.log(now.getDay())
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

    for (let i = 1; i <= 7; i++){

      const dayMax = document.getElementById(`day-${i}-max`)
      const dayMin= document.getElementById(`day-${i}-min`)
      dayMax.textContent = Math.round(data.daily.temperature_2m_max[i-1])
      
      dayMin.textContent = Math.round(data.daily.temperature_2m_min[i-1])
    }

    const dailyPrecipitationSum = data.daily.precipitation_sum[0];
    const dailyMaxWindSpeed = data.daily.windspeed_10m_max[0];
    const dailyFeelsLikeMax = data.daily.apparent_temperature_max[0];

    console.log("Current temperature:", currentTemp);
    console.log("Current wind speed:", currentWindSpeed);
    console.log("Hourly temperature:", hourlyTemp);
    console.log("Hourly precipitation:", hourlyPrecipitation);
    console.log("Hourly wind speed:", hourlyWindSpeed);
    console.log("Hourly humidity:", hourlyHumidity);
    console.log("Daily max temperature:", dailyMaxTemp);
    console.log("Daily min temperature:", dailyMinTemp);
    console.log("Daily precipitation sum:", dailyPrecipitationSum);
    console.log("Daily max wind speed:", dailyMaxWindSpeed);
    console.log("Daily feels like max:", dailyFeelsLikeMax);
    

   

    
    return data;
  } catch (error) {
    console.error("Error: ", error);
  }
}
//------------------------------------------------------------------------------------

async function fetchWeatherForLocation(locationName) {
  const coord = await getCoordinates(locationName);

  if (coord) {
    if (coord.city == undefined){
      coord.city = locationName
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
let loc = "addis ababa";
const n = String(loc)
loc = n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()
const timezone = "auto";
fetchWeatherForLocation(loc);
