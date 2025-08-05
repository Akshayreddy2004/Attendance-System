// This is the script for the public scan page

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
const db = firebase.firestore();

// Get HTML Elements
const scanForm = document.getElementById('scan-form');
const messageContainer = document.getElementById('message-container');
const statusMessage = document.getElementById('status-message');
const detailsMessage = document.getElementById('details-message');

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const date = urlParams.get('date');
const token = urlParams.get('token');

// --- Form Submission ---
scanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const enteredEmployeeId = document.getElementById('employeeId').value.trim();

    if (!date || !token) {
        showMessage('Error', 'Invalid or expired QR code link.', 'danger');
        return;
    }

    try {
        // Step 1: Verify the token
        const tokenDoc = await db.collection('qr_tokens').doc(date).get();
        if (!tokenDoc.exists || tokenDoc.data().token !== token) {
            showMessage('Error', 'This QR code is invalid or has expired.', 'danger');
            return;
        }

        // Step 2: Find the employee by their ID
        const employeeQuery = await db.collection('employees').where('employeeId', '==', enteredEmployeeId).get();
        if (employeeQuery.empty) {
            showMessage('Error', 'No employee found with that ID. Please try again.', 'danger');
            return;
        }
        const employeeDoc = employeeQuery.docs[0]; // Get the first match
        const employeeId = employeeDoc.id; // This is the document ID, e.g., 'aBcDeFg...'
        const employeeName = employeeDoc.data().name;

        // Step 3: Check if already marked today
        const todayDateString = new Date().toISOString().slice(0, 10);
        const attendanceQuery = await db.collection('attendance')
            .where('date', '==', todayDateString)
            .where('employeeId', '==', employeeId)
            .get();

        if (!attendanceQuery.empty) {
            showMessage('Already Marked!', `Hi ${employeeName}, your attendance has already been recorded for today.`, 'warning');
            return;
        }

        // Step 4: Mark attendance
        await db.collection('attendance').add({
            employeeId: employeeId,
            status: 'Present',
            date: todayDateString,
            method: 'QR Scan',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage('Success!', `Thank you, ${employeeName}. Your attendance has been marked as Present.`, 'success');

    } catch (error) {
        console.error("Error during scan process:", error);
        showMessage('Error', 'An unexpected error occurred. Please try again.', 'danger');
    }
});

function showMessage(status, details, type) {
    scanForm.classList.add('d-none'); // Hide the form
    messageContainer.classList.remove('d-none'); // Show the message area
    
    statusMessage.textContent = status;
    detailsMessage.textContent = details;
    statusMessage.className = `text-${type}`; // e.g., text-success, text-danger
}
