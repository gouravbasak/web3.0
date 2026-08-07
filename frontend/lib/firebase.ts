import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // ✅ REQUIRED

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUGrxhwStqNGzgcZFb_SrW5jvl1JZ4Tb4",
  authDomain: "sports-store-c7541.firebaseapp.com",
  projectId: "sports-store-c7541",
  storageBucket: "sports-store-c7541.firebasestorage.app",
  appId: "1:862571549342:web:7ffa569385b4920aa0218f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export storage (THIS is what we need)
export const storage = getStorage(app);
