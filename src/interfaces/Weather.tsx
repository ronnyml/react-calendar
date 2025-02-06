export interface WeatherDay {
  city: string;
  conditions: string;
  description: string;
  temperature: number;
}

export interface WeatherApiResponse {
  resolvedAddress: string;
  days: WeatherDay[];
}
