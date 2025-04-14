import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPBnfM88z60GNrjWBEI__bf0F2Zh2UNqs",
  authDomain: "aivestor-5b849.firebaseapp.com",
  projectId: "aivestor-5b849",
  storageBucket: "aivestor-5b849.firebasestorage.app",
  messagingSenderId: "550291891510",
  appId: "1:550291891510:web:54f6a790c0fbcb68cabf97",
  measurementId: "G-YMQY82CE4D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  client_id: "1079895264057-jt31pt273m5t5nulunpis261ukeg2ecp.apps.googleusercontent.com"
});

export { auth, db, googleProvider, analytics };
export default app; 