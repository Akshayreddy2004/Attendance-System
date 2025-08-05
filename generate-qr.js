// This is the script for the QR code generation page

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

// Get HTML Elements
const logoutButton = document.getElementById('logout-button');
const generateBtn = document.getElementById('generate-btn');
const qrcodeContainer = document.getElementById('qrcode-container');
const qrcodeDiv = document.getElementById('qrcode');

// --- Authentication Check ---
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'index.html';
    }
});

// --- Logout Functionality ---
logoutButton.addEventListener('click', () => {
    auth.signOut();
});

// --- QR Code Generation ---
generateBtn.addEventListener('click', async () => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Create a simple, unique token for the day
    const token = `ATTENDANCE_${today}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        // Save the token to Firestore in a special collection
        await db.collection('qr_tokens').doc(today).set({
            token: token,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Get the URL for the scan page
        const scanUrl = `${window.location.origin}${window.location.pathname.replace('generate-qr.html', 'scan.html')}?date=${today}&token=${token}`;

        // Generate the QR code
        qrcodeDiv.innerHTML = ""; // Clear previous QR code
        new QRCode(qrcodeDiv, {
            text: scanUrl,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        qrcodeContainer.classList.remove('d-none'); // Show the QR code
        generateBtn.textContent = "Re-generate Code"; // Change button text
        console.log("Generated Scan URL:", scanUrl);

    } catch (error) {
        console.error("Error generating QR code:", error);
        alert("Could not generate QR code. Please check console.");
    }
});
