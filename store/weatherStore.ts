import { create } from 'zustand'

interface WeatherState {
  weather: any
  forecast: any[]
  loading: boolean
  setWeather: (data: any) => void
  setForecast: (data: any[]) => void
  setLoading: (loading: boolean) => void
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  forecast: [],
  loading: false,
  setWeather: (data) => set({ weather: data }),
  setForecast: (data) => set({ forecast: data }),
  setLoading: (loading) => set({ loading }),
}))