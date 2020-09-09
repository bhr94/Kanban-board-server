const admin = require("firebase-admin");
const firebase = require("firebase")
const serviceAccount = require("./service-account.json");
require("firebase/auth");


const firebaseConfig = {
    apiKey: "AIzaSyBK-r2yte589-ongIr8qEhBw0-VhRE00DY",
    authDomain: "kanban-3048a.firebaseapp.com",
    databaseURL: "https://kanban-3048a.firebaseio.com",
    projectId: "kanban-3048a",
    storageBucket: "kanban-3048a.appspot.com",
    messagingSenderId: "890765008169",
    appId: "1:890765008169:web:239befd2df5fa1e567eb38",
    measurementId: "G-XTVDVQP8LW"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://kanban-3048a.firebaseio.com"
  });

  const db = admin.database();


  module.exports = {firebase, admin}