import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { ref, set, onValue, push } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

const USERS = {
  Patty: "blue",
  RJ: "black",
  Begino: "orange"
};

export default function App() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [user, setUser] = useState("Patty");
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Firebase: load availabilities
  useEffect(() => {
    const dbRef = ref(db, "availabilities");
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAvailabilities(Object.values(data));
    });
  }, []);

  // --- RANGE SELECTION LOGIC ---
  const handleDateClick = (date) => {
    const key = date.toDateString();

    if (selectedDates.length === 0) {
      // First click
      setSelectedDates([date]);
    } else if (selectedDates.length === 1) {
      const firstDate = selectedDates[0];
      if (date < firstDate) {
        // Clicked earlier → becomes new first date
        setSelectedDates([date]);
      } else {
        // Select range
        const range = [];
        let current = new Date(firstDate);
        while (current <= date) {
          range.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
        setSelectedDates(range);
      }
    } else {
      // Already had a range → reset to this new first date
      setSelectedDates([date]);
    }
  };

  // Undo selection
  const undoSelection = () => setSelectedDates([]);

  // Submit availability to Firebase
  const submitAvailability = () => {
    selectedDates.forEach(date => {
      const newRef = push(ref(db, "availabilities"));
      set(newRef, {
        user,
        color: USERS[user],
        date: date.toDateString(),
        allDay,
        startTime: allDay ? "" : startTime,
        endTime: allDay ? "" : endTime
      });
    });
    setSelectedDates([]);
  };

  // Filter availabilities by date
  const availabilitiesByDate = (date) => {
    return availabilities.filter(a => a.date === date.toDateString());
  };

  return (
    <div className="App">
      <div className="headline">
       <span>OCT 19 BALL INSPECTION</span>
      </div>
      <h1>Hometown Scheduler</h1>

<Calendar
  value={selectedDates}
  onClickDay={handleDateClick}
  tileClassName={({ date, view }) =>
    selectedDates.some(d => d.toDateString() === date.toDateString())
      ? "selected"
      : null
  }
  minDetail="month"
  maxDetail="month"
  next2Label={null}   // remove ">>" (skip year forward)
  prev2Label={null}   // remove "<<" (skip year backward)
/>





      <button onClick={undoSelection}>Undo Selection</button>

      <div className="form">
        <br />
        <select value={user} onChange={e => setUser(e.target.value)}>
          {Object.keys(USERS).map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <br />
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
<div className="availabilities-container">
  {selectedDates
    .filter(date => availabilitiesByDate(date).length > 0) // only show dates with availabilities
    .map(date => (
      <div key={date.toDateString()}>
        <strong>{date.toDateString()}</strong>
        <ul>
          {availabilitiesByDate(date).map((a, i) => (
            <li key={i} style={{ color: a.color }}>
              {a.user}: {a.allDay ? "All Day" : `${a.startTime} - ${a.endTime}`}
            </li>
          ))}
        </ul>
      </div>
    ))}
</div>


    </div>
  );
}
