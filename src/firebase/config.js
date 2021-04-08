import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyCsyFu2KXztH62eRyNNyLP_FlFc4pD5xJo",
    authDomain: "synapse-19320.firebaseapp.com",
    databaseURL: "https://synapse-19320-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "synapse-19320",
    storageBucket: "synapse-19320.appspot.com",
    messagingSenderId: "409978389635",
    appId: "1:409978389635:web:723eb7341a82223d0c87b6"
  };

  firebase.initializeApp(firebaseConfig)
  const projectfirestore = firebase.firestore()
  const timestamp = firebase.firestore.FieldValue.serverTimestamp

  export { projectfirestore, timestamp }