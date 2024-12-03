import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBncAmhOOi0Z29UdXYOXCdoBfmY3WhXPB4",
    authDomain: "embedded-31c12.firebaseapp.com",
    databaseURL: "https://embedded-31c12-default-rtdb.asia-southeast1.firebasedatabase.app/", // Use your database URL here
    projectId: "embedded-31c12",
    storageBucket: "embedded-31c12.appspot.com",
    messagingSenderId: "631069403671",
    appId: "1:631069403671:web:af9441516147aeec230a52",
    measurementId: "G-HLRQCEGV5X"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    
} else {
    app = getApp();
}

// Export the database
const database = getDatabase(app);
export { app, database }; 