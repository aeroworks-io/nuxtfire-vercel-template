import { Plugin } from '@nuxt/types'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

declare module '@nuxt/types' {
  interface Context {
    $auth: firebase.auth.Auth
    $firestore: firebase.firestore.Firestore
  }
  interface NuxtAppOptions {
    $auth: firebase.auth.Auth
    $firestore: firebase.firestore.Firestore
  }
}

declare module '@nuxt/types/app' {
  interface Context {
    $auth: firebase.auth.Auth
    $firestore: firebase.firestore.Firestore
  }
  interface NuxtAppOptions {
    $auth: firebase.auth.Auth
    $firestore: firebase.firestore.Firestore
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $auth: firebase.auth.Auth
    $firestore: firebase.firestore.Firestore
  }
}

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  })
}

const FirebasePlugin: Plugin = (ctx, inject) => {
  inject('firestore', firebase.firestore())
  inject('auth', firebase.auth())

  ctx.$firestore = firebase.firestore()
  ctx.$auth = firebase.auth()
}

export default FirebasePlugin
