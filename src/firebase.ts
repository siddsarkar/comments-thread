// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBi83i1ObH2XmW7-q4un7sjs4cSMB0Rlrw",
  authDomain: "comment-thread-ad39f.firebaseapp.com",
  projectId: "comment-thread-ad39f",
  storageBucket: "comment-thread-ad39f.firebasestorage.app",
  messagingSenderId: "587918994715",
  appId: "1:587918994715:web:6ebf8616e914fc047df7be",
  databaseURL:
    "https://comment-thread-ad39f-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
