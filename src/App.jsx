import React from 'react';
import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WeatherComponent from './components/WeatherComponent';

function App() {
  const BASE_URL = "https://api.open-meteo.com/v1/forecast?latitude=65.01&longitude=25.47";
  const url = "&hourly=temperature_2m";
  

  return (
    <>
    <header>
      <h1>Weather </h1>
    </header>
    <div>
      <div>
        <h1 className="text-3xl font-bold underline text-center">Current weather</h1>
      </div>
      <div>
      <WeatherComponent />
      </div>
    </div>
      
    </>
  )
}

export default App
