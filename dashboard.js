// This is the script for the dashboard page

// IMPORTANT: Paste your own firebaseConfig object here
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