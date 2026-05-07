'use client';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import axios from 'axios';

// Fix for default marker icons in Leaflet
import L from 'leaflet';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onLocationClick }: { onLocationClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      console.log('Map clicked!', e.latlng);
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface WeatherData {
  name: string;
  temp: number;
  humidity: number;
  wind: number;
  description: string;
}

export default function MapComponent() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<string>('');

  const getWeatherByCoordinates = async (lat: number, lon: number) => {
    console.log('Getting weather for:', lat, lon);
    setLoading(true);
    try {
      // Get weather using coordinates directly
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=dbb9748ee99dc3cac9d18fa817df4018`
      );
      
      // Get city name from weather response
      const cityName = weatherRes.data.name || 'Unknown Location';
      setClickedLocation(cityName);
      
      setWeather({
        name: cityName,
        temp: Math.round(weatherRes.data.main.temp),
        humidity: weatherRes.data.main.humidity,
        wind: Math.round(weatherRes.data.wind.speed),
        description: weatherRes.data.weather[0].description,
      });
      console.log('Weather set successfully', weatherRes.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather({
        name: 'Error',
        temp: 0,
        humidity: 0,
        wind: 0,
        description: 'Failed to fetch weather',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[23.8103, 90.4125]}
        zoom={6}
        style={{ height: '100%', width: '100%', cursor: 'pointer' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapClickHandler onLocationClick={getWeatherByCoordinates} />
      </MapContainer>

      {/* Weather Card - Fixed visibility with high z-index */}
      {loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000]">
          <p className="text-center text-gray-500">Loading weather...</p>
        </div>
      )}

      {weather && !loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000]">
          <h2 className="text-xl font-bold text-black">{clickedLocation || weather.name}</h2>
          <p className="text-3xl font-bold my-2 text-black">{weather.temp}°C</p>
          <p className="capitalize text-gray-600">{weather.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl">💧</p>
              <p className="font-semibold text-black">{weather.humidity}%</p>
              <p className="text-xs text-gray-500">Humidity</p>
            </div>
            <div className="text-center">
              <p className="text-2xl">💨</p>
              <p className="font-semibold text-black">{weather.wind} km/h</p>
              <p className="text-xs text-gray-500">Wind</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}