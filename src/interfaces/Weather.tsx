export interface WeatherDay {
  conditions: string;
  description: string;
  temp: number;
}

export interface WeatherApiResponse {
  resolvedAddress: string;
  days: WeatherDay[];
}

export interface WeatherForecast {
  city: string;
  conditions: string;
  description: string;
  temperature: number;
}
