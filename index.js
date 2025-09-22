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
  } catch(error) {
    console.error("Error: ", error);
  }
}

async function getWeatherData(latitude, longitude) {

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,precipitation,windspeed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,apparent_temperature_max&timezone=${timezone}`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

    console.log(data.current_weather)
    

    const currentTemp = data.current_weather.temperature;
    const currentWindSpeed = data.current_weather.windspeed;

    // Hourly details example (first hour)
    const hourlyTemp = data.hourly.temperature_2m[0];
    const hourlyPrecipitation = data.hourly.precipitation[0];
    const hourlyWindSpeed = data.hourly.windspeed_10m[0];
    const hourlyHumidity = data.hourly.relative_humidity_2m[0];

    // Daily details example (first day)
    const dailyMaxTemp = data.daily.temperature_2m_max[0];
    const dailyMinTemp = data.daily.temperature_2m_min[0];
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

    return data

  } catch(error) {
    console.error("Error: ", error);
  }
}

async function fetchWeatherForLocation(locationName) {
  const coord = await getCoordinates(locationName);

  if (coord) {
    const weather = await getWeatherData(coord.latitude, coord.longitude);
  }
}

const loc = "germany";
const timezone = "auto"
fetchWeatherForLocation(loc)


