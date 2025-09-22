async function getCoordinates(locationName) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    locationName
  )}&count=1`;

  try {
    const response = await fetch(geoUrl);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const { country, name, latitude, longitude } = data.results[0];
      console.log(latitude, longitude)
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
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=10.5&hourly=temperature_2m`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

  } catch(error) {
    console.error("Error: ", error);
  }
}

async function fetchWeatherForLocation(locationName) {
  const coord = getCoordinates(locationName);

  if (coord) {
    const weather = await getWeatherData(coord.latitude, coord.longitude);
  }
}

const loc = "germany";
fetchWeatherForLocation(loc)


