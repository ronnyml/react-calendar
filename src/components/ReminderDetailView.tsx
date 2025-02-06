import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ReminderDetailProps } from "../interfaces/Reminder";
import { WeatherDay } from "../interfaces/Weather";
import { getWeatherForecast } from "../services/weatherService";
import { getCachedWeather, setCachedWeather } from "../services/weatherCache";

const ReminderDetailView: React.FC<ReminderDetailProps> = ({
  detail,
  setShowReminderForm,
  closeDetail,
  openDeleteConfirmation
}) => {
  const { reminder, date } = detail;
  const formattedDate = dayjs(date).format("dddd, MMMM D");
  const [weather, setWeather] = useState<WeatherDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      const cachedWeather = getCachedWeather(reminder.city, date);
      if (cachedWeather) {
        setWeather(cachedWeather);
        setLoading(false);
        return;
      }

      const weatherData = await getWeatherForecast(reminder.city, date);
      if (weatherData) {
        setCachedWeather(reminder.city, date, weatherData);
      }
      setWeather(weatherData);
      setLoading(false);
    }

    if (reminder.city) {
      fetchWeather();
    }
  }, [reminder.city, date]);

  return (
    <div className="reminder-popup">
      <div className="reminder-details">
        <button className="close-button" onClick={closeDetail}>
          X
        </button>
        <div className="details-icons">
          <button
            className="icon-button edit-icon"
            onClick={() => {
              closeDetail();
              setShowReminderForm({
                detail,
                isEditMode: true,
              });
            }}
          ></button>
          <button
            className="icon-button delete-icon"
            onClick={openDeleteConfirmation}
          ></button>
        </div>
        <h3>{reminder.text}</h3>
        <p>
          {formattedDate} - {reminder.time}
        </p>
        <p>
          <strong>{reminder.city}</strong>
        </p>
        {loading ? (
          <p>Loading weather...</p>
        ) : weather ? (
          <div>
            <p>
              <strong>Weather Conditions for:</strong> {weather.city}
            </p>
            <p>
              <strong>Conditions:</strong> {weather.conditions}
            </p>
            <p>
              <strong>Temperature:</strong> {weather.temperature}
            </p>
            <p>{weather.description}</p>
          </div>
        ) : (
          <p>Weather information not available.</p>
        )}
      </div>
    </div>
  );
};

export default ReminderDetailView;
