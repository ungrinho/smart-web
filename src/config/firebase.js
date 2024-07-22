// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-DATrhSpr2lJ-_UZ-qtj2y4vNg4N8VPs",
  authDomain: "smartfarm-image-f87b3.firebaseapp.com",
  projectId: "smartfarm-image-f87b3",
  storageBucket: "smartfarm-image-f87b3.appspot.com",
  messagingSenderId: "285795461096",
  appId: "1:285795461096:web:f8dcef6f51417c33f1665d",
  measurementId: "G-C1W5MXQTH5"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// const auth = firebase.auth();
// const auth = getAuth(firebaseApp);
// 인증 SDK 추가
// export const auth = getAuth(app);
const auth = getAuth(app);

export { auth };