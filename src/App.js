import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./App.css";

const USERS = {
  Patty: "#007bff",
  RJ: "#000000",
  Begino: "#ff8c00"
};

export default function App() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [availabilities, setAvailabilities] = useState({});
  const [formData, setFormData] = useState({
    user: "Patty",
    allDay: true,
    startTime: "",
    endTime: ""
  });

  // toggle date selection (multi-select + undo)
  const handleDateClick = (date) => {
    const key = date.toDateString();
    setSelectedDates((prev) =>
      prev.find((d) => d.toDateString() === key)
        ? prev.filter((d) => d.toDateString() !== key) // deselect
        : [...prev, date] // select
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (selectedDates.length === 0) return;
    const newAvailabilities = { ...availabilities };

    selectedDates.forEach((date) => {
      const key = date.toDateString();
      const newEntry = {
        ...formData,
        name: formData.user,
        color: USERS[formData.user],
        date: key,
        id: Date.now() + Math.random()
      };
      newAvailabilities[key] = [...(newAvailabilities[key] || []), newEntry];
    });

    setAvailabilities(newAvailabilities);

    // reset form except user
    setFormData((prev) => ({
      ...prev,
      allDay: true,
      startTime: "",
      endTime: ""
    }));
    setSelectedDates([]); // clear selection after submit
  };

  const selectedEntries =
    selectedDates.length > 0
      ? availabilities[selectedDates[0].toDateString()] || []
      : [];

  // Highlight selected days in calendar
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      return selectedDates.find((d) => d.toDateString() === date.toDateString())
        ? "selected-day"
        : null;
    }
  };

  return (
    <div className="container">
      <h2>📅 Group Outing Scheduler (Multi-day with Undo)</h2>

      <Calendar
        onClickDay={handleDateClick} // handle single clicks
        tileClassName={tileClassName}
      />
      <p>
        Selected:{" "}
        {selectedDates.map((d) => d.toDateString()).join(", ") || "None"}
      </p>

      <div className="form">
        <label>
          Name:
          <select name="user" value={formData.user} onChange={handleChange}>
            {Object.keys(USERS).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            name="allDay"
            checked={formData.allDay}
            onChange={handleChange}
          />
          All Day
        </label>

        {!formData.allDay && (
          <>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
            <span>to</span>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
          </>
        )}

        <button onClick={handleSubmit}>Submit Availability</button>
      </div>

      <div className="list">
        <h3>
          Availabilities on{" "}
          {selectedDates.length > 0
            ? selectedDates[0].toDateString()
            : "None"}
        </h3>
        {selectedEntries.length === 0 ? (
          <p>No availabilities yet.</p>
        ) : (
          <ul>
            {selectedEntries.map((entry) => (
              <li
                key={entry.id}
                style={{ borderLeft: `5px solid ${entry.color}` }}
              >
                <strong>{entry.name}</strong> —{" "}
                {entry.allDay
                  ? "All Day"
                  : `${entry.startTime} to ${entry.endTime}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
