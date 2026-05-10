'use client';

import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import axios from 'axios';
import L from 'leaflet';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ForecastDay {
  date: string;
  temp: number;
  icon: string;
}

function MapClickHandler({ onLocationClick }: { onLocationClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function ClickableMap() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getWeatherByCoordinates = async (lat: number, lon: number) => {
    setLoading(true);
    setError('');
    try {
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      // Current weather
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      setWeather({
        temp: Math.round(weatherRes.data.main.temp),
        humidity: weatherRes.data.main.humidity,
        wind: Math.round(weatherRes.data.wind.speed),
        description: weatherRes.data.weather[0].description,
      });

      // 7-day forecast
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      // Get one forecast per day (every 8th item = 24 hours)
      const dailyForecasts = forecastRes.data.list.filter((_: any, i: number) => i % 8 === 0).slice(0, 7);
      
      setForecast(dailyForecasts.map((item: any) => ({
        date: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
      })));
      
    } catch (err: any) {
      console.error('Error:', err);
      setError('Failed to load weather. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full">
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

      {/* Weather Panel */}
      {loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000]">
          <p className="text-center text-gray-500">Loading weather...</p>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 rounded-lg shadow-xl p-4 z-[1000]">
          <p className="text-center text-red-600">{error}</p>
        </div>
      )}

      {weather && !loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 z-[1000] space-y-3">
          {/* Current Weather */}
          <div className="text-center">
            <p className="text-4xl font-bold">{weather.temp}°C</p>
            <p className="capitalize text-gray-600">{weather.description}</p>
            <div className="flex justify-center gap-6 mt-2 text-sm">
              <div>💧 {weather.humidity}%</div>
              <div>💨 {weather.wind} km/h</div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          {forecast.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 text-center mb-2">7-Day Forecast</p>
              <div className="flex justify-between gap-1">
                {forecast.map((day, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xs font-medium">{day.date}</p>
                    <p className="text-xl">
                      {day.icon === '01d' ? '☀️' : day.icon === '02d' ? '⛅' : '🌧️'}
                    </p>
                    <p className="text-sm font-bold">{day.temp}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!weather && !loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-2 z-[1000]">
          <p className="text-white text-center text-sm">Click anywhere on the map to see weather</p>
        </div>
      )}
    </div>
  );
}