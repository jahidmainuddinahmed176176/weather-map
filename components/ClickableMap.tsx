const getWeatherByCoordinates = async (lat: number, lon: number) => {
  console.log('Clicked coordinates:', lat, lon); // Debug log
  setLoading(true);
  try {
    // Get city name
    console.log('Fetching city name...');
    const geoRes = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      { headers: { 'User-Agent': 'WeatherMapApp/1.0' } }
    );
    console.log('Geo response:', geoRes.data);
    
    const cityName = geoRes.data.address?.city || geoRes.data.address?.town || geoRes.data.address?.village || 'Unknown';
    setClickedLocation(cityName);
    console.log('City name:', cityName);

    // Get weather
    console.log('Fetching weather...');
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=dbb9748ee99dc3cac9d18fa817df4018`
    );
    console.log('Weather response:', weatherRes.data);
    
    setWeather({
      name: cityName,
      temp: Math.round(weatherRes.data.main.temp),
      humidity: weatherRes.data.main.humidity,
      wind: Math.round(weatherRes.data.wind.speed),
      description: weatherRes.data.weather[0].description,
      icon: weatherRes.data.weather[0].icon,
    });
    console.log('Weather set successfully');
  } catch (error) {
    console.error('Error details:', error);
  } finally {
    setLoading(false);
  }
};