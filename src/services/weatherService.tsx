import { WEATHER_BASE_URL } from "../utils/constants";
import { WeatherApiResponse, WeatherDay } from "../interfaces/Weather";

const API_KEY = import.meta.env.VITE_VISUAL_CROSSING_API_KEY;

export async function getWeatherForecast(city: string, date: string): Promise<WeatherDay | null> {
  const formattedDate = new Date(date).toISOString().split("T")[0];
  const url = `${WEATHER_BASE_URL}/${city}/${formattedDate}?unitGroup=metric&key=${API_KEY}&include=days`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    const data: WeatherApiResponse = await response.json();
    if (data && data.days && data.days.length > 0) {
      const day = data.days[0];
      return {
        city: data.resolvedAddress,
        conditions: day.conditions,
        description: day.description,
        temperature: day.temperature,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return null;
  }
}
