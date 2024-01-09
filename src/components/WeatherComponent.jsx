import React, { useEffect, useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';

const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  const URL = "https://api.open-meteo.com/v1/forecast";

  useEffect(() => {
    fetchData();
    
  }, []);

  useEffect(() => {
    // Log data when weatherData changes
    if (weatherData) {
      console.log("response:", weatherData);
    }
  }, [weatherData]);

  function range(start, end, step) {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }
  
  const fetchData = async () => {
    try {
      const params = {
        "latitude": 52.52,
        "longitude": 13.41,
        "current": ["temperature_2m", "weather_code", "wind_speed_10m"],
        "hourly": "temperature_2m",
        "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min"]
      };
      const responses = await fetchWeatherApi(URL, params);
      const response = responses[0];

      if(response) {
        // Attributes for timezone and location
        const utcOffsetSeconds = response.utcOffsetSeconds();

        const current = response.current();
        const hourly = response.hourly();
        const daily = response.daily();

        const tempData = {
          
          current: {
            time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
            temperature2m: current.variables(0).value(),
            weatherCode: current.variables(1).value(),
            windSpeed10m: current.variables(2).value(),
          },
          
          hourly: {
            time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
              (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            temperature2m: hourly.variables(0).valuesArray(),
          },
          
          daily: {
            time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
              (t) => new Date((t + utcOffsetSeconds) * 1000)
            ),
            weatherCode: daily.variables(0).valuesArray(),
            temperature2mMax: daily.variables(1).valuesArray(),
            temperature2mMin: daily.variables(2).valuesArray(),
          },  
          
        };
        setWeatherData(tempData);
      }
      else {
        setError('Invalid weather data format.');
      }
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Error fetching weather data: ' + error.message);
    }
  };

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : weatherData ? (
        <div>
          {/* Display metadata */}
          <p>Temp: {weatherData.hourly.temperature2m[0]}</p>

          <h2>Hourly Temperature:</h2>
          
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default WeatherComponent;
