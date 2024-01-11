import React from 'react';
import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WeatherComponent from './components/WeatherComponent';

function App() {
  const [temperatureUnit, setTemperatureUnit] = useState('Celsius');

  function toggleTemperatureUnit() {
    setTemperatureUnit((prevUnit) => (prevUnit === 'Celsius' ? 'Fahrenheit' : 'Celsius'));
  }

  

  return (
    <div class="container w-100 h-100 bg-neutral-200 p-4 overflow-hidden">
    <header>
      <div>
        <h1 class="text-2xl font-bold text-left">Weather</h1>
        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleTemperatureUnit}>C</button>
        <button class="bg-white-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded">F</button>
      </div>
    
    </header>
    <div>
      <div>
      <WeatherComponent />
      </div>
    </div>
      
    </div>
  )
}

export default App
