// Firebase configuration and initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
// REPLACE the placeholders below with your actual Firebase config keys from the Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyB9AanYqJf9nWT44xbs7LYIk_C9SsKe-kI",
    authDomain: "greenworldstore-e00c4.firebaseapp.com",
    projectId: "greenworldstore-e00c4",
    storageBucket: "greenworldstore-e00c4.firebasestorage.app",
    messagingSenderId: "G-WEN12J8DT2",
    appId: "1:1062777777569:web:385dc7ad92836b3ecb6fe0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
