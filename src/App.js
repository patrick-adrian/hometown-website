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

  useEffect(() => {
    const dbRef = ref(db, "availabilities");
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAvailabilities(Object.values(data));
    });
  }, []);

  const toggleDate = (date) => {
    const key = date.toDateString();
    if (selectedDates.find(d => d.toDateString() === key)) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== key));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const undoSelection = () => setSelectedDates([]);

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

  const availabilitiesByDate = (date) => {
    return availabilities.filter(a => a.date === date.toDateString());
  };

  return (
    
    <div className="App">
      <div className="headline">
       <span>UPCOMING EVENTS: OCT 19 BALL INSPECTION</span>
      </div>
      <h1>Hometown Scheduler</h1>

      <Calendar
        value={selectedDates}
        onClickDay={toggleDate}
        tileClassName={({ date, view }) =>
          selectedDates.find(d => d.toDateString() === date.toDateString())
            ? "selected"
            : null
        }
      />

      <button onClick={undoSelection}>Undo Selection</button>

      <div className="form">
        <br></br>
        <select value={user} onChange={e => setUser(e.target.value)}>
          {Object.keys(USERS).map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <br></br>
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
      {selectedDates.map(date => (
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
  );
}
