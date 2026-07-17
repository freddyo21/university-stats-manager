// Import the functions you need from the SDKs you need
import { getApp, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA1IWyYr4KdIzNLwIFTTQapMjoh84Kk63I",
    authDomain: "university-statistics-manager.firebaseapp.com",
    projectId: "university-statistics-manager",
    storageBucket: "university-statistics-manager.firebasestorage.app",
    messagingSenderId: "607550904250",
    appId: "1:607550904250:web:1c632362ac092ba3912f83",
    measurementId: "G-WWDZ7FTV6E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

const firebaseApp = getApp(app.name);

export const analytics = getAnalytics(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const database = getDatabase(firebaseApp);
export const auth = getAuth(firebaseApp);