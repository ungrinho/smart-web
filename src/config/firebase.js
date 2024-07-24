// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB42wihw54cts78k4H8XRrJjm8Lmjvek20",
  authDomain: "web-login-c3046.firebaseapp.com",
  projectId: "web-login-c3046",
  storageBucket: "web-login-c3046.appspot.com",
  messagingSenderId: "176109342044",
  appId: "1:176109342044:web:cb32fe8c2c69862de78599",
  measurementId: "G-KPXFYC82V6"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);

// const auth = firebase.auth();
// const auth = getAuth(firebaseApp);
// 인증 SDK 추가
// export const auth = getAuth(app);
const auth = getAuth(app);



const analytics = getAnalytics(app);


export { auth };