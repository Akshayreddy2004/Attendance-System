// This is the script for the attendance page

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
const currentDateEl = document.getElementById('current-date');
const employeeListContainer = document.getElementById('employee-list-container');

// --- Authentication Check ---
auth.onAuthStateChanged((user) => {
    if (user) {
        loadEmployeesForAttendance();
    } else {
        window.location.href = 'index.html';
    }
});

// --- Logout Functionality ---
logoutButton.addEventListener('click', () => {
    auth.signOut();
});

// --- Display Current Date ---
const today = new Date();
const dateString = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const todayDateStringForDb = today.toISOString().slice(0, 10); // YYYY-MM-DD format
currentDateEl.textContent = dateString;

// --- Load Employees for Attendance ---
async function loadEmployeesForAttendance() {
    employeeListContainer.innerHTML = '<h5>Loading...</h5>';

    // Get today's attendance records to see who is already marked
    const attendanceRecords = await db.collection('attendance').where('date', '==', todayDateStringForDb).get();
    const markedEmployeeIds = attendanceRecords.docs.map(doc => doc.data().employeeId);

    // Get all employees
    db.collection('employees').orderBy('name').get().then((querySnapshot) => {
        employeeListContainer.innerHTML = '';
        if (querySnapshot.empty) {
            employeeListContainer.innerHTML = '<h5>No employees found. Please add employees first.</h5>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const employee = doc.data();
            const isMarked = markedEmployeeIds.includes(doc.id);

            const card = `
                <div class="card mb-3">
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">${employee.name}</h5>
                            <p class="card-text text-muted">${employee.department} (ID: ${employee.employeeId})</p>
                        </div>
                        <div id="actions-${doc.id}">
                            ${isMarked ? '<span class="badge bg-success fs-6">Marked</span>' : `
                            <button class="btn btn-success" onclick="markAttendance('${doc.id}', 'Present')">Present</button>
                            <button class="btn btn-danger mx-2" onclick="markAttendance('${doc.id}', 'Absent')">Absent</button>
                            <button class="btn btn-warning" onclick="markAttendance('${doc.id}', 'On Leave')">On Leave</button>
                            `}
                        </div>
                    </div>
                </div>
            `;
            employeeListContainer.innerHTML += card;
        });
    });
}

// --- Mark Attendance Functionality ---
function markAttendance(employeeId, status) {
    // Add a new document to the 'attendance' collection
    db.collection('attendance').add({
        employeeId: employeeId,
        status: status,
        date: todayDateStringForDb,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log(`Marked ${employeeId} as ${status}`);
        // Update the UI to show the employee is marked
        const actionDiv = document.getElementById(`actions-${employeeId}`);
        actionDiv.innerHTML = `<span class="badge bg-success fs-6">Marked as ${status}</span>`;
    })
    .catch((error) => {
        console.error("Error marking attendance: ", error);
        alert("Could not mark attendance. See console for details.");
    });
}