import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { fetchWeatherApi } from 'openmeteo';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faCloud, faCloudSun, faCloudRain, faSnowflake, faThunderstorm } from '@fortawesome/free-solid-svg-icons';

const WeatherComponent = forwardRef (({temperatureUnit}, ref) => {
  const [weatherData, setWeatherData] = useState(null);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [options, setOptions] = useState()
  
  const URL = "https://api.open-meteo.com/v1/forecast";

  useImperativeHandle(ref, () => ({
    fetchData: () => fetchData(),
  }));

  useEffect(() => {
    fetchData();   
  }, []);

  useEffect(() => {
    if (weatherData) {
      setOptionsForHighchart();
    }
    
  }, [weatherData]);

  const range = (start, end, step) => {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }

  const convertTemperature = (temperature) => {
    if (temperatureUnit === 'fahrenheit') {
      return (temperature * 9) / 5 + 32;
    }
    return temperature;
  }

  const setOptionsForHighchart = () => {
    setOptions( {
      chart: {
        type: 'spline',
      },
      title: {
        text: 'Hourly Chart',
      },
      xAxis: {
        type: 'datetime',
        
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
            y: convertTemperature(weatherData.hourly.temperature2m[index]),
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
        "temperature_unit": temperatureUnit,
        "current": ["temperature_2m", "weather_code", "wind_speed_10m"],
        "hourly": "temperature_2m",
        "daily": ["weather_code", "temperature_2m_max", "temperature_2m_min"]
      };
      const responses = await fetchWeatherApi(URL, params);
      const response = responses[0];

      if(response) {
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
        console.log('Invalid weather data format.');
      } 
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }   
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      dayOfWeek: daysOfWeek[date.getUTCDay()],
      hour: date.getUTCHours(),
      minutes: date.getUTCMinutes().toString().padStart(2, '0'),
    };
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('en-US', options);

    const today = new Date();
    if (
      today.getUTCFullYear() === new Date(date).getUTCFullYear() &&
      today.getUTCMonth() === new Date(date).getUTCMonth() &&
      today.getUTCDate() === new Date(date).getUTCDate()
    ) {
      return 'Today';
    }

    return formattedDate;
  };
  
  const getWeatherDescription = (weatherCode) => {
    switch (weatherCode) {
      case 0:
        return 'Clear sky';
      case 1:
      case 2:
      case 3:
        return 'Overcast';
      case 45:
      case 48:
        return 'Fog';
      case 51:
      case 53:
      case 55:
        return 'Drizzle';
      case 56:
      case 57:
        return 'Freezing Drizzle';
      case 61:
      case 63:
      case 65:
        return 'Rain';
      case 66:
      case 67:
        return 'Freezing Rain';
      case 71:
      case 73:
      case 75:
        return 'Snow';
      case 77:
        return 'Snow grains';
      case 80:
      case 81:
      case 82:
        return 'Rain';
      case 85:
      case 86:
        return 'Snow';
      case 95:
      case 96:
      case 99:
        return 'Thunderstorm';
      default:
        return 'Unknown weather code';
    }
  };

  const getWeatherIcon = (weatherCode) => {
    switch (weatherCode) {
      case 0:
        return <FontAwesomeIcon icon={faSun} />;
      case 1:
      case 2:
      case 3: 
        return <FontAwesomeIcon icon={faCloudSun} />;
      case 45:
      case 48: 
        return <FontAwesomeIcon icon={faCloud} />;
      case 51:
      case 53:
      case 55:
      case 56:
      case 57:
      case 61:
      case 63:
      case 65:
      case 66:
      case 67:
        return <FontAwesomeIcon icon={faCloudRain} />;
      case 71:
      case 73:
      case 75:
      case 77:
        return <FontAwesomeIcon icon={faSnowflake} />;
      case 80:
      case 81:
      case 82:
        return <FontAwesomeIcon icon={faCloudRain} />;
      case 85:
      case 86:
        return <FontAwesomeIcon icon={faSnowflake} />;
      case 95:
      case 96:
      case 99:
        return <FontAwesomeIcon icon={faThunderstorm} />;
      default:
        return null;
    }
  };

  const TemperatureDisplay = ({ temperature, temperatureUnit }) => (
    <h2>
      <b>
        {convertTemperature(temperature).toFixed(1)}&deg;{temperatureUnit === 'celsius' ? 'C' : 'F'}
      </b>
    </h2>
  );

  return (
    <div className="h-screen mx-auto p-4 overflow-hidden">
      {weatherData ? (
        <div className="flex columns-2 gap-8">
          <div className="w-1/3 p-4 bg-white rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-4 mt-4">Current weather</h2>
            <h2 className='p-2'><b>
              <TemperatureDisplay
                temperature={weatherData.current.temperature2m}
                temperatureUnit={temperatureUnit}
              />
            </b></h2>
            <h3 className='p-2'><b>
              {`${formatDateTime(weatherData.current.time).dayOfWeek} ${
                formatDateTime(weatherData.current.time).hour
              }:${formatDateTime(weatherData.current.time).minutes}`}</b>
            </h3>
            <p className='p-2'>{getWeatherIcon(weatherData.current.weatherCode)}</p>
            <h3 className='p-2'>{getWeatherDescription(weatherData.current.weatherCode)}</h3>
            <h2 className='p-2'>Wind speed {(weatherData.current.windSpeed10m).toFixed(1)}m/s</h2>
          </div>
          <div className="w-2/3 h-2/3 p-4 bg-white rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-4 mt-4">Weekly highlight</h2>
            <div className="flex">
              {weatherData.daily.time.slice(0,7).map((day, index) => (
                <div key={index} className=" p-4 border-solid border-2  mr-2 shadow-lg rounded-md">
                  <h3>{formatDate(day)}</h3>
                  <p>{getWeatherIcon(weatherData.daily.weatherCode[index])}</p>
                  <p>{getWeatherDescription(weatherData.daily.weatherCode[index])}</p>
                  <p><b>
                    <TemperatureDisplay
                      temperature={weatherData.daily.temperature2mMax && weatherData.daily.temperature2mMax[index]}
                      temperatureUnit={temperatureUnit}
                    />
                    </b> 
                    <TemperatureDisplay
                      temperature={weatherData.daily.temperature2mMin && weatherData.daily.temperature2mMin[index]}
                      temperatureUnit={temperatureUnit}
                    />   
                  </p>
                </div>
              ))}
            </div>
            <div className='mt-8'>
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>
        </div>
      ) : (
        <p>Loading..</p>
      )}
    </div>
  );
});

export default WeatherComponent;
