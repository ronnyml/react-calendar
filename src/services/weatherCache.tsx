import { WeatherDay } from "../interfaces/Weather";

const weatherCache: Map<string, WeatherDay> = new Map();

export const getCachedWeather = (city: string, date: string) => {
  return weatherCache.get(`${city}-${date}`);
}

export const setCachedWeather = (city: string, date: string, weatherData: WeatherDay) => {
  weatherCache.set(`${city}-${date}`, weatherData);
}
