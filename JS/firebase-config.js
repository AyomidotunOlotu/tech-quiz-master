import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBsNfDh3zuaxBShMC_h0h4P0Iv8VKm1hVA",
  authDomain: "tech-quizmaster.firebaseapp.com",
  projectId: "tech-quizmaster",
  storageBucket: "tech-quizmaster.firebasestorage.app",
  messagingSenderId: "760861788007",
  appId: "1:760861788007:web:ae4e25b4b3101b24b0d1c2",
  measurementId: "G-99LZ92PW67"
};

const app = initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);
export default app;
