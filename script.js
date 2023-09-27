const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const getLocationButton = document.querySelector(".search-loc-btn");
const currentDayWeather = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const apikey = "43e86a66e541bb00050092a6ac8fb914";
let units, symbol, speed;

const showWeatherData = (city, weather, i) => {
  if (i === 0) {
    return `<div class="details">
                <h2>${city} ${weather.dt_txt.split(" ")[0]}</h2>
                <h4>Temperature: ${weather.main.temp}${symbol}</h4>
                <h4>Feels like: ${weather.main.feels_like}${symbol}</h4>
                <h4>Wind: ${weather.wind.speed} ${speed}</h4>
                <h4>Humidity: ${weather.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="https://openweathermap.org/img/wn/${
                  weather.weather[0].icon
                }@4x.png" alt="weather" />
                <h4>${weather.weather[0].description}</h4>
            </div>`;
  } else {
    return `<li class="card">
                    <h3>(${weather.dt_txt.split(" ")[0]})</h2>
                    <img src="https://openweathermap.org/img/wn/${
                      weather.weather[0].icon
                    }@2x.png" alt="weather" />
                    <h4>Tempearture: ${weather.main.temp}${symbol}</h4>
                    <h4>Wind: ${weather.wind.speed} ${speed}</h4>
                    <h4>Humidity: ${weather.main.humidity}%</h4>
                    <h4>${weather.weather[0].description}</h4>
                </li>`;
  }
};

const getWeather = async (city, lat, lon) => {
  const URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apikey}`;

  await fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      const uniqueForecastDays = [];

      const multipleDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();

        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Previous data cleared
      city.value = "";
      currentDayWeather.innerHTML = "";
      weatherCardsDiv.innerHTML = "";

      multipleDaysForecast.forEach((weather, i) => {
        if (i === 0) {
          currentDayWeather.insertAdjacentHTML(
            "beforeend",
            showWeatherData(city, weather, i)
          );
        } else {
          weatherCardsDiv.insertAdjacentHTML(
            "beforeend",
            showWeatherData(city, weather, i)
          );
        }
      });
    })
    .catch((error) => {
      console.log(error);
      alert("An error occurred. Please try again");
    });
};

const getCityCoordinates = async () => {
  const city = cityInput.value.trim();
  const selectedUnit = document.querySelector("#unit");
  units = selectedUnit.value;
  symbol = units === "metric" ? "°C" : units === "imperial" ? "°F" : "K";
  speed = units === "imperial" ? "miles/h" : "m/s";

  if (!city) return;

  const URL = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apikey}`;

  await fetch(URL)
    .then((response) => response.json())
    .then((data) => {
      if (!data.length) return alert("Please enter a valid place");

      const { name, lat, lon } = data[0];
      getWeather(name, lat, lon);
    })
    .catch((error) => {
      console.log(error);
      alert("An error occurred");
    });
};

const getLocation = () => {
  speed = "m/s";
  symbol = "K";  
  navigator.geolocation.getCurrentPosition(
    location => {
      const { latitude, longitude } = location.coords;

      const URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apikey}`;

      fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        if (!data.length) return alert("Location not found");
        const { name, lat, lon } = data[0];
        getWeather(name, lat, lon);
      });
    },
    (error) => {
      if(error.code === error.PERMISSION_DENIED) {
        alert("Please allow location access.")
      }
    }
  );
};

cityInput.addEventListener("keyup", e => e.key === 'Enter' && getCityCoordinates());
searchButton.addEventListener("click", getCityCoordinates);
getLocationButton.addEventListener("click", getLocation);
