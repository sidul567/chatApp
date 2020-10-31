// // Give the service worker access to Firebase Messaging. 
// // Note that you can only use Firebase Messaging here, other Firebase libraries 
// // are not available in the service worker. 
// importScripts ( 'https://www.gstatic.com/firebasejs/7.21.1/firebase-app.js' );
// importScripts ( 'https://www.gstatic.com/firebasejs/7.21.1/firebase-messaging.js' );

// // Your web app's Firebase configuration
// var firebaseConfig = {
//   apiKey: "AIzaSyDxIpX9fjz-Or93zjeg1FMILGG6Vfokj_c",
//   authDomain: "chat-app-61162.firebaseapp.com",
//   databaseURL: "https://chat-app-61162.firebaseio.com",
//   projectId: "chat-app-61162",
//   storageBucket: "chat-app-61162.appspot.com",
//   messagingSenderId: "997977577270",
//   appId: "1:997977577270:web:f0e9c17733d6d8699bc597"
// };
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

//   // Retrieve an instance of Firebase Messaging so that it can handle background
// // messages.
// const messaging = firebase.messaging();

// messaging.setBackgroundMessageHandler(function (payload) {
//     console.log('[firebase-messaging-sw.js] Received background message ', payload);
//     // Customize notification here
//     const notificationTitle = 'You have new message';
//     const notificationOptions = {
//         body: payload.data.message,
//         icon: "payload.data.icon"
//     };

//     return self.registration.showNotification(notificationTitle,
//         notificationOptions);
// });


importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.6/firebase-messaging.js');

var firebaseConfig = {
    apiKey: "AIzaSyDxIpX9fjz-Or93zjeg1FMILGG6Vfokj_c",
    authDomain: "chat-app-61162.firebaseapp.com",
    databaseURL: "https://chat-app-61162.firebaseio.com",
    projectId: "chat-app-61162",
    storageBucket: "chat-app-61162.appspot.com",
    messagingSenderId: "997977577270",
    appId: "1:997977577270:web:f0e9c17733d6d8699bc597"
};

firebase.initializeApp(firebaseConfig);
const messaging=firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log(payload);
    // const notification=JSON.parse(payload);
    const notificationTitle = `You have new message from ${payload.data.name}`;
    const notificationOption={
        body:payload.data.message,
        icon:payload.data.icon
    };
    return self.registration.showNotification(notificationTitle,notificationOption);
});

 