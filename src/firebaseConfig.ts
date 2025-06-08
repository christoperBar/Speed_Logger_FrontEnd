import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxjmrdPL_tTV_-n9pD61g02OOTZiFHoF8",
  authDomain: "iot-speed-logger.firebaseapp.com",
  projectId: "iot-speed-logger",
  storageBucket: "iot-speed-logger.firebasestorage.app",
  messagingSenderId: "876699857742",
  appId: "1:876699857742:web:a2eb34e6e08d11157ea41f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const database = getDatabase(app)