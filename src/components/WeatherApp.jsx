import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WeatherApp.css";

// Ініціалізація основного стану додатку
function WeatherApp() {
  const [city, setCity] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [weatherData, setWeatherData] = useState({
    temp: "N/A",
    condition: "N/A",
    wind: "N/A",
    humidity: "N/A",
    cloud: "N/A",
  });

  // Динамічні стилі для кнопки пошуку
  const buttonStyles = {
    fontSize: isButtonClicked ? "20px" : "16px",
    padding: isButtonClicked ? "15px 30px" : "10px 20px",
  };

  // Іконки одягу залежно від температури
  const outfitImages = {
    shorts: "/icons/t-shirt and shorts.jpg",
    pants_hoodie: "/icons/pants and hoodies.jpg",
    jacket: "/icons/jacket.jpg",
    coat: "/icons/coat.png",
    warm_jacket: "/icons/warm jacket.jpg",
  };
  // Рекомендації щодо одягу на основі даних про погоду
  function recommendClothing(weatherData) {
    const temperature = parseFloat(weatherData.temp);
    const windSpeed = parseFloat(weatherData.wind);
    const humidity = parseFloat(weatherData.humidity);

    let clothingRecommendation =
      "Wear suitable clothing for the weather conditions.";

    if (temperature < 10) {
      clothingRecommendation =
        "It's cold outside. Wear a warm coat, hat, and gloves.";
    } else if (temperature < 20) {
      clothingRecommendation = "It's cool outside. Wear a jacket or sweater.";
    } else {
      clothingRecommendation =
        "It's warm outside. Light clothing should be comfortable.";
    }

    if (windSpeed > 30) {
      clothingRecommendation += " Be prepared for strong winds.";
    }

    if (humidity > 80) {
      clothingRecommendation +=
        " It's humid, so lightweight clothing may be more comfortable.";
    }
    return clothingRecommendation;
  }
  // Стан для динамічного списку міст
  const [cityOptions, setCityOptions] = useState([]);

  // Запит до API для отримання списку можливих міст
  const fetchCityOptions = async (searchTerm) => {
    try {
      const apiKey = "fbab90e67bd9be8d0725d90f260278fc";
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/find?q=${searchTerm}&type=like&sort=population&cnt=10&appid=${apiKey}`
      );

      if (response.data && response.data.list) {
        const cities = response.data.list.map((city) => city.name);
        setCityOptions(cities);
      } else {
        setCityOptions([]);
      }
    } catch (error) {
      console.error("Error fetching city options:", error);
      setCityOptions([]);
    }
  };

  // Спостерігаємо за змінами міста чи дати і завантажуємо дані про погоду
  useEffect(() => {
    if (city && selectedDay) {
      getWeatherData(city, selectedDay);
    }
  }, [city, selectedDay]);

  // Запит до API для отримання даних про погоду
  const getWeatherData = async (selectedCity, day) => {
    const apiKey = "fbab90e67bd9be8d0725d90f260278fc";
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${selectedCity}&limit=1&appid=${apiKey}`;

    try {
      const response = await fetch(geoApiUrl);
      const data = await response.json();

      if (data.length > 0 && data[0].lat && data[0].lon) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherApiUrl);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current) {
          throw Error("Weather data is missing 'current' field");
        }

        const windSpeed =
          weatherData.current && weatherData.current.wind
            ? `${weatherData.current.wind.speed} km/h`
            : "N/A";

        const cloudPercentage =
          weatherData.current.clouds && weatherData.current.clouds.all
            ? `${weatherData.current.clouds.all} %`
            : "N/A";
        setWeatherData({
          temp: `${Math.floor(weatherData.current.temp)}°C`,
          condition: weatherData.current.weather[0].description,
          wind: windSpeed,
          humidity: `${Math.floor(weatherData.current.humidity)} %`,
          cloud: cloudPercentage,
        });
      } else {
        console.error("Could not get coordinates for the city.");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // Створення варіантів дат для вибору
  const dayOptions = [];
  const currentDate = new Date();
  for (let i = 0; i < 4; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    dayOptions.push(
      <option key={formattedDate} value={formattedDate}>
        {formattedDate}
      </option>
    );
  }

  // Обробка зміни міста користувачем
  function handleCityChange(e) {
    const searchTerm = e.target.value;
    setCity(searchTerm);
    fetchCityOptions(searchTerm);
  }

  // Обробка зміни дати користувачем
  const handleDayChange = (e) => {
    setSelectedDay(e.target.value);
  };

  // Стани для індикатора завантаження, помилок та стану пошуку
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchClicked, setSearchClicked] = useState(false);

  // Запуск запиту про погоду при натисканні на кнопку "Пошук"
  const handleSubmit = async () => {
    setSearchClicked(true);
    if (city.trim() !== "" && selectedDay.trim() !== "") {
      setIsLoading(true);
      setError(null);
      try {
        await getWeatherData(city, selectedDay);
        document.querySelector(".weather-app").classList.add("active");
      } catch (err) {
        console.error("Error fetching weather data:", err);
        setError("An error occurred while fetching weather data.");
      }
      setIsLoading(false);
    } else {
      alert("Please enter a city and select a day.");
    }
  };

  // Визначення іконки одягу на основі температури
  const [outfitIcon, setOutfitIcon] = useState(null);

  const getOutfitIcon = (temperature) => {
    if (temperature > 20) {
      return "shorts";
    } else if (temperature >= 15 && temperature <= 20) {
      return "pants_hoodie";
    } else if (temperature >= 5 && temperature < 15) {
      return "jacket";
    } else if (temperature >= 0 && temperature < 5) {
      return "coat";
    } else {
      return "warm_jacket";
    }
  };

  // Спостерігаємо за змінами в даних про погоду і визначаємо іконку одягу
  useEffect(() => {
    const tempValue = parseFloat(weatherData.temp);
    if (!isNaN(tempValue)) {
      const icon = getOutfitIcon(tempValue);

      setOutfitIcon(icon);
    }
  }, [weatherData]);

  // Головний рендер компонента
  return (
    <div className="weather-app">
      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="weather-header">
            <form>
              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={handleCityChange}
                list="cityOptions"
              />
              <datalist id="cityOptions">
                {cityOptions.map((option, index) => (
                  <option key={index} value={option} />
                ))}
              </datalist>
              <select value={selectedDay} onChange={handleDayChange}>
                <option value="">Select a day</option>
                {dayOptions}
              </select>
              <button
                type="button"
                id="searchButton"
                onClick={() => {
                  setIsButtonClicked(true);
                  handleSubmit();
                }}
                style={buttonStyles}
              >
                {isButtonClicked ? "Searching..." : "Search"}
              </button>
            </form>
          </div>
          {outfitIcon && (
            <img
              src={outfitImages[outfitIcon]}
              alt="Outfit icon"
              className="outfit-icon"
            />
          )}

          <div className="weather-main">
            <div className="weather-temperature">
              <span
                className={weatherData.temp === "N/A" ? "loading-text" : ""}
              >
                {weatherData.temp}
              </span>
              <div id="condition" className="weather-kind">
                {weatherData.condition === "N/A" ? (
                  <span className="loading-text">Loading...</span>
                ) : (
                  <>{weatherData.condition}</>
                )}
              </div>
            </div>

            <div className="weather-footer">
              {searchClicked ? (
                <ul>
                  <li>
                    <img
                      src="https://thumbs.dreamstime.com/b/windy-icon-logo-isolated-sign-symbol-vector-illustration-high-quality-black-style-icons-190172076.jpg"
                      alt="Wind icon"
                    />
                    <span>
                      <span id="wind">{weatherData.wind}</span> km/h
                    </span>
                  </li>
                  <li>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/1582/1582886.png"
                      alt="Humidity icon"
                    />
                    <span>
                      <span id="humidity">{weatherData.humidity}</span> %
                    </span>
                  </li>
                  <li>
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/218/218706.png"
                      alt="Cloud icon"
                    />
                    <span>
                      <span id="cloud">{weatherData.cloud}</span> %
                    </span>
                  </li>
                </ul>
              ) : null}
            </div>
            <img
              className="weather-img"
              src="https://cdn-icons-png.flaticon.com/512/164/164806.png"
              alt="Weather icon"
            />

            <div className="clothing-recommendation">
              {recommendClothing(weatherData)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default WeatherApp;
