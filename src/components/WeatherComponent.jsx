import React, { useEffect, useState } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import App from '../App';

const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [options, setOptions] = useState()
  
  const URL = "https://api.open-meteo.com/v1/forecast";


  useEffect(() => {
    fetchData();   
  }, []);

  useEffect(() => {
    // Log data when weatherData changes
    if (weatherData) {
      console.log("response:", weatherData);
      console.log("response:", weatherData.hourly.time[0]);
    }
      
  }, [weatherData]);

  function range(start, end, step) {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }

  function convertTemperature(temperature) {
    if (temperatureUnit === 'Fahrenheit') {
      // Convert Celsius to Fahrenheit
      return (temperature * 9) / 5 + 32;
    }
    return temperature;
  }

  const setOptionsForHighchart = () => {

    const gradientColors = Highcharts.getOptions().colors.map(color => Highcharts.color(color).setOpacity(0).get());

    setOptions( {
      chart: {
        type: 'spline',
      },
      title: {
        text: 'Hourly Chart',
      },
      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%b %e, %H:%M}',
        },
      },
      yAxis: {
        title: {
          text: 'Temperature',
        },
      },
      series: [
        {
          name: 'Temperature',
          data: weatherData.hourly.time.map((timestamp, index) => ({
            x: new Date(timestamp).getTime(),
            y: weatherData.hourly.temperature2m[index],
          })),
        },
      ],      
    });
  
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
        setOptionsForHighchart();
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
    <div class="h-screen mx-auto p-4 overflow-hidden">
      {weatherData ? (
        <div class="flex columns-2 gap-8">
        <div className="w-1/3 p-4 bg-white rounded">
        <h2 class="text-xl font-semibold mb-2">Current weather</h2>
        <h2>{convertTemperature(weatherData.current.temperature2m).toFixed(1)}</h2>
        <h3>{daysOfWeek[new Date(weatherData.current.time).getUTCDay()]} {new Date(weatherData.current.time).getUTCHours()}:{new Date(weatherData.current.time).getUTCMinutes()}</h3>
        <h2>Wind speed {(weatherData.current.windSpeed10m).toFixed(1)}m/s</h2>
        </div>
        <div class="w-2/3 h-2/3 p-4 bg-white rounded">
          <h2 class="text-xl font-semibold mb-2">Weekly highlight</h2>
          <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
          
        </div>
      </div>
      ) 
      : 
      (
        <p>Loading..</p>
      )
    }
      
      
    </div>
  );
};

export default WeatherComponent;
