const firebaseConfig = {
	apiKey: "AIzaSyA0ZuqLRMQchkK7WFxBjmJ3bUbn8Bowt_4",
	authDomain: "test-3f35b.firebaseapp.com",
	databaseURL:
		"https://test-3f35b-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "test-3f35b",
	storageBucket: "test-3f35b.appspot.com",
	messagingSenderId: "932927794934",
	appId: "1:932927794934:web:bcdac8badb8bed415586d7",
	measurementId: "G-W70TYWZ8FF",
};

// const arr = [];

// Initialize Firebase

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// console.log("firebase");
// const todo = db
// 	.collection("TEST")
// 	.get()
// 	.then((resp) => {
// 		resp.forEach((doc) => {
// 			arr.push(doc.data());
// 		});
// 	});
// console.log(arr);
