function formatTemperature(temperature) {
  return temperature.toFixed(1);
}

function displayForecast(data) {
  let forecastHTML = "";
  let daysDisplayed = [];

  data.forEach((item) => {
    let date = new Date(item.dt * 1000);
    let day = date.toLocaleDateString("en-US", { weekday: "long" });
    let temp = formatTemperature(item.main.temp);
    let icon = item.weather[0].icon;

    if (day !== "Saturday" && !daysDisplayed.includes(day)) {
      // Calculate the minimum and maximum temperature for the day
      let minTemp = Number.POSITIVE_INFINITY;
      let maxTemp = Number.NEGATIVE_INFINITY;

      data.forEach((item) => {
        let itemDay = new Date(item.dt * 1000).toLocaleDateString("en-US", { weekday: "long" });
        if (itemDay === day) {
          let itemTemp = item.main.temp;
          minTemp = Math.min(minTemp, itemTemp);
          maxTemp = Math.max(maxTemp, itemTemp);
        }
      });

      // Only create the card if there is at least one data point for the day
      if (minTemp !== Number.POSITIVE_INFINITY && maxTemp !== Number.NEGATIVE_INFINITY) {
        forecastHTML += `
          <div class="card">
            <h4>${day}</h4>
            <img src="https://openweathermap.org/img/w/${icon}.png" alt="${item.weather[0].description}">
            <p>Temperature: ${temp} &#176;C</p>
            <p>Min Temp: ${formatTemperature(minTemp)} &#176;C</p>
            <p>Max Temp: ${formatTemperature(maxTemp)} &#176;C</p>
          </div>
        `;
      }

      daysDisplayed.push(day);
    }
  });

  document.getElementById("show").innerHTML = forecastHTML;
}

let show = document.getElementById("show");
let search = document.getElementById("search");
let cityVal = document.getElementById("city");
let cityHeader = document.getElementById("cityHeader");

let key = "2f745fa85d563da5adb87b6cd4b81caf";

function getWeather() {
  let cityValue = cityVal.value;
  if (cityValue.length == 0) {
    show.innerHTML = `<h3 class="error">Please enter a city name</h3>`;
  } else {
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${key}&units=metric`;
    cityVal.value = "";
    fetch(url)
      .then((resp) => resp.json())
      .then((data) => {
        let latitude = data.coord.lat;
        let longitude = data.coord.lon;

        let forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=metric`;
        fetch(forecastUrl)
          .then((forecastResp) => forecastResp.json())
          .then((forecastData) => {
            let forecast = forecastData.list;
            cityHeader.innerText = cityValue;
            displayForecast(forecast);
          })
          .catch(() => {
            show.innerHTML = `<h3 class="error">Forecast not available</h3>`;
          });
      })
      .catch(() => {
        show.innerHTML = `<h3 class="error">City not found</h3>`;
      });
  }
}

search.addEventListener("click", getWeather);
window.addEventListener("load", getWeather);
