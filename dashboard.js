// This is the script for the dashboard page

// IMPORTANT: Paste your own firebaseConfig object here
const firebaseConfig = {
  apiKey: "AIzaSyCJDXlSxOBCVtnesCol7Ue68tWtPjI05w8",
  authDomain: "attendance-system-9f359.firebaseapp.com",
  projectId: "attendance-system-9f359",
  storageBucket: "attendance-system-9f359.firebasestorage.app",
  messagingSenderId: "73469437717",
  appId: "1:73469437717:web:9aae277e91ebf66969ab1c",
  measurementId: "G-LXNSVSL3FT"
};
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const logoutButton = document.getElementById('logout-button');
const welcomeMessage = document.getElementById('welcome-message');

// This function runs every time the user's login state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        console.log('User is logged in:', user);
        // Personalize the welcome message
        welcomeMessage.textContent = `Welcome, ${user.email}!`;
    } else {
        // User is signed out.
        console.log('User is logged out.');
        // Redirect them to the login page
        window.location.href = 'index.html';
    }
});

// Add event listener for the logout button
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        // Sign-out successful.
        // The onAuthStateChanged function will handle the redirect.
        console.log('User signed out successfully.');
    }).catch((error) => {
        // An error happened.
        console.error('Sign out error:', error);
    });
});