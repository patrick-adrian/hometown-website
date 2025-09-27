// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  authDomain: "hometown-scheduler.firebaseapp.com",
  databaseURL: "https://hometown-scheduler-default-rtdb.firebaseio.com",
  projectId: "hometown-scheduler",
  storageBucket: "hometown-scheduler.appspot.com",
  messagingSenderId: "751813097799",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
