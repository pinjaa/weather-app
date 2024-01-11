import React from 'react';
import { useState, useRef } from 'react'
import './App.css'
import WeatherComponent from './components/WeatherComponent';

function App() {
  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const weatherComponentRef = useRef(null); 

  const setTemperatureCelsius = () => {
    if(temperatureUnit !== 'celsius') {
      setTemperatureUnit('celsius');
    }
  }
  
  const setTemperatureFahrenheit = () => {
    if(temperatureUnit !== 'fahrenheit') {
      setTemperatureUnit('fahrenheit');
    }
  }

  const handleFetchData = () => {
    weatherComponentRef.current.fetchData();
  };

  return (
    <div className="container w-100 h-100 bg-neutral-200 p-4 overflow-hidden">
      <header >      
          <h1 className="text-2xl font-bold text-left">Weather</h1>
          <div className='flex justify-end'>
            <button 
              className="bg-white active:bg-blue-500 text-black font-bold py-2 px-4 rounded-md border-solid border-2 border-blue-500"
              onClick={handleFetchData}
            >
              Refresh
            </button>
            <button
              style={{
                backgroundColor: temperatureUnit === 'celsius' ? '#4299e1' : 'white',
                color: temperatureUnit === 'celsius' ? 'white' : 'black',
              }}
              className="focus:bg-blue-500 text-black font-bold py-2 px-4 rounded-md border-solid border-2 border-blue-500  mx-2"
              onClick={setTemperatureCelsius}
            >
              &deg;C
            </button>
            <button
              style={{
                backgroundColor: temperatureUnit === 'fahrenheit' ? '#4299e1' : 'white',
                color: temperatureUnit === 'fahrenheit' ? 'white' : 'black',
              }}
              className="focus:bg-blue-500 text-black font-bold py-2 px-4 rounded-md border-solid border-2 border-blue-500 mr-2"
              onClick={setTemperatureFahrenheit}
            >
              &deg;F
            </button>
          </div>
      </header>
      <div>
        <div>
        <WeatherComponent ref={weatherComponentRef} temperatureUnit={temperatureUnit}/>
        </div>
      </div>   
    </div>
  )
}

export default App
