import React, { useState, useEffect } from "react";
import { ref, set, onValue, push } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

const USERS = {
  Patty: "blue",
  RJ: "black",
  Begino: "orange"
};

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [user, setUser] = useState("Patty");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const daysInMonth = [];
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    daysInMonth.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;

  useEffect(() => {
    const dbRef = ref(db, "availabilities");
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = [];
      Object.keys(data).forEach((key) => {
        list.push(data[key]);
      });
      setAvailabilities(list);
    });
  }, []);

  const toggleDate = (date) => {
    const key = date.toDateString();
    if (selectedDates.includes(key)) {
      setSelectedDates(selectedDates.filter(d => d !== key));
    } else {
      setSelectedDates([...selectedDates, key]);
    }
  };

  const undoSelection = () => {
    setSelectedDates([]);
  };

  const submitAvailability = () => {
    selectedDates.forEach(dateStr => {
      const newRef = push(ref(db, "availabilities"));
      set(newRef, {
        user,
        color: USERS[user],
        date: dateStr,
        allDay,
        startTime: allDay ? "" : startTime,
        endTime: allDay ? "" : endTime
      });
    });
    setSelectedDates([]);
  };

  const availabilitiesByDate = (date) => {
    return availabilities.filter(a => a.date === date.toDateString());
  };

  return (
    <div className="App">
      <h1>Hometown Scheduler</h1>
      <div className="calendar-nav">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>◀</button>
        <h2>{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</h2>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>▶</button>
      </div>
      <div className="calendar-grid">
        {daysInMonth.map(date => {
          const key = date.toDateString();
          const isSelected = selectedDates.includes(key);
          return (
            <div
              key={key}
              className={`day ${isSelected ? "selected" : ""}`}
              onClick={() => toggleDate(date)}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
      <button onClick={undoSelection}>Undo Selection</button>
      <div className="form">
        <select value={user} onChange={e => setUser(e.target.value)}>
          {Object.keys(USERS).map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <label>
          <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} /> All Day
        </label>
        {!allDay && (
          <>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </>
        )}
        <button onClick={submitAvailability}>Submit Availability</button>
      </div>
      <h3>Availabilities for selected dates:</h3>
      {selectedDates.map(dateStr => (
        <div key={dateStr}>
          <strong>{dateStr}</strong>
          <ul>
            {availabilitiesByDate(new Date(dateStr)).map((a, i) => (
              <li key={i} style={{ color: a.color }}>
                {a.user}: {a.allDay ? "All Day" : `${a.startTime} - ${a.endTime}`}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
