import React from 'react'
import { StyleSheet, Platform, Image, Text, View } from 'react-native'
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import * as firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyBmzPwHQaLtwOAZfb1ADeTgouJcr-bfC4s",
    authDomain: "dm-potsapp.firebaseapp.com",
    databaseURL: "https://dm-potsapp.firebaseio.com",
    projectId: "dm-potsapp",
    storageBucket: "dm-potsapp.appspot.com",
    messagingSenderId: "148008369486",
    appId: "1:148008369486:web:6dad8d0a6e0669e28a721f",
    measurementId: "G-82L2MLMX9T"
  };
  
firebase.initializeApp(firebaseConfig);

// import the different screens
import Loading from './registration/Loading'
import SignUp from './registration/SignUp'
import Login from './registration/Login'
import CreateRoom from './rooms/CreateRoom'
import JoinRoom from './rooms/JoinRoom'
import WaitingRoom from './rooms/WaitingRoom'
import GameRoom from './rooms/GameRoom'
import Main from './Main'


// create our app's navigation stack
const App = createSwitchNavigator(
  {
    Loading,
    SignUp,
    Login,
    CreateRoom,
    JoinRoom,
    WaitingRoom,
    GameRoom,
    Main
  },
  {
    initialRouteName: 'Loading'
  }
)
export default createAppContainer(App)