import { BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import LoginPage from './components/authPages/login/loginPage'
import SignupPage from './components/authPages/signup/signupPage'
import MainPage from './components/converter/converter';
import RootPage from './components/root/root';
import NotFound from './components/404/404';
import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import DiaryPage from './components/diary/diary';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/firestore";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBJsHeFLCIGZIoPqSmF0pdcoAcueCrIk2A",
  authDomain: "cu-ex-4ae1f.firebaseapp.com",
  projectId: "cu-ex-4ae1f",
  storageBucket: "cu-ex-4ae1f.appspot.com",
  messagingSenderId: "272235246043",
  appId: "1:272235246043:web:5092652800e3f74df677fe",
  measurementId: "G-9V99Y4HG3Q"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: 'ru',
  debug: true,
  detection: {
    order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain']
  },
  interpolation: {
    escapeValue: false
  }
})

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='' element={<RootPage />} />
      <Route path='login' element={<LoginPage db={db} />}/>
      <Route path='signup' element={<SignupPage db={db} />}/>
      <Route path='convert' element={<MainPage db={db} />}/>
      <Route path='diary' element={<DiaryPage db={db} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
