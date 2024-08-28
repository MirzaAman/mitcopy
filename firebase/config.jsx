import { initializeApp } from "firebase/app";
import { getAuth,initializeAuth, getReactNativePersistence  } from "firebase/auth";
import {getFirestore} from  'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDGA5DBrII1hi355yZOIQ4TIC2ST9eMfJA",
    authDomain: "myappmit-ecd6e.firebaseapp.com",
    projectId: "myappmit-ecd6e",
    storageBucket: "myappmit-ecd6e.appspot.com",
    messagingSenderId: "977950458970",
    appId: "1:977950458970:web:cc59cdc34cd9f53a97c463"
};

const app = initializeApp(firebaseConfig);

const persistence = getReactNativePersistence(AsyncStorage);

const auth = initializeAuth(app, { persistence });

const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };