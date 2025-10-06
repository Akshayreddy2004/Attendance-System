// This is the main script for the login page.

// IMPORTANT: Paste your own firebaseConfig object here
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// ADD THIS INSTEAD:

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Get form elements from the HTML
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// Add an event listener to the form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    const email = emailInput.value;
    const password = passwordInput.value;

    // Sign in with Firebase
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Login successful!
            console.log('User logged in:', userCredential.user);
            // Redirect to the dashboard
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            // Handle Errors here.
            console.error('Login Error:', error);
            errorMessage.textContent = error.message;
        });
});