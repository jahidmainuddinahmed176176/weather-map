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

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  description: string;
}

interface ForecastDay {
  date: string;
  temp: number;
  description: string;
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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);

  const getWeatherByCoordinates = async (lat: number, lon: number) => {
    setLoading(true);
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
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      })));
      
    } catch (error) {
      console.error('Error:', error);
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

      {/* Current Weather Card */}
      {loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000]">
          <p className="text-center">Loading weather...</p>
        </div>
      )}

      {weather && !loading && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-[1000] space-y-3">
          {/* Current Weather */}
          <div>
            <p className="text-3xl font-bold">{weather.temp}°C</p>
            <p className="capitalize text-gray-600">{weather.description}</p>
            <div className="flex gap-4 mt-2 text-sm">
              <div>💧 {weather.humidity}%</div>
              <div>💨 {weather.wind} km/h</div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          {forecast.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm font-semibold mb-2">7-Day Forecast</p>
              <div className="flex overflow-x-auto gap-3 pb-2">
                {forecast.map((day, i) => (
                  <div key={i} className="text-center min-w-[60px]">
                    <p className="text-xs font-medium">{day.date}</p>
                    <p className="text-lg">
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
    </div>
  );
}