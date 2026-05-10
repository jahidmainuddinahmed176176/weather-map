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

      {/* Weather Panel - Simple Design */}
      {loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 rounded-lg p-4 z-[1000]">
          <p className="text-white text-center">Loading...</p>
        </div>
      )}

      {weather && !loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-4 z-[1000] text-white">
          {/* Temperature */}
          <div className="text-center">
            <p className="text-5xl font-bold">{weather.temp}°C</p>
            <p className="text-sm mt-1">{weather.description}</p>
          </div>

          {/* Humidity & Wind */}
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <div>💧 {weather.humidity}%</div>
            <div>💨 {weather.wind} km/h</div>
          </div>

          {/* 7-Day Forecast */}
          {forecast.length > 0 && (
            <div className="flex justify-between mt-4 pt-3 border-t border-white/20">
              {forecast.map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs">{day.date}</p>
                  <p className="text-lg">{day.icon === '01d' ? '☀️' : day.icon === '02d' ? '⛅' : '🌧️'}</p>
                  <p className="text-sm font-bold">{day.temp}°</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!weather && !loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-3 z-[1000]">
          <p className="text-white text-center text-sm">Click anywhere on map</p>
        </div>
      )}
    </div>
  );