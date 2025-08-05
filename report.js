// This is the script for the report page

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
const filterForm = document.getElementById('filter-form');
const reportTableBody = document.getElementById('report-table-body');
const exportCsvButton = document.getElementById('export-csv-button');

let reportData = []; // To store the current report data for export

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

// --- Filter Form Submission ---
filterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!startDate || !endDate) {
        alert('Please select both a start and end date.');
        return;
    }

    reportTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading report...</td></tr>';

    try {
        // Step 1: Get all employees and store them in a map for easy lookup
        const employeesSnapshot = await db.collection('employees').get();
        const employeesMap = new Map();
        employeesSnapshot.forEach(doc => {
            employeesMap.set(doc.id, doc.data());
        });

        // Step 2: Get attendance records within the date range
        const attendanceSnapshot = await db.collection('attendance')
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'desc')
            .get();

        if (attendanceSnapshot.empty) {
            reportTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No records found for this date range.</td></tr>';
            reportData = [];
            return;
        }

        // Step 3: Process the data
        reportData = []; // Clear previous report data
        reportTableBody.innerHTML = '';
        attendanceSnapshot.forEach(doc => {
            const record = doc.data();
            const employee = employeesMap.get(record.employeeId);

            if (employee) {
                const rowData = {
                    date: record.date,
                    name: employee.name,
                    employeeId: employee.employeeId,
                    status: record.status
                };
                reportData.push(rowData); // Add to data for CSV export

                const row = `
                    <tr>
                        <td>${record.date}</td>
                        <td>${employee.name}</td>
                        <td>${employee.employeeId}</td>
                        <td>${record.status}</td>
                    </tr>
                `;
                reportTableBody.innerHTML += row;
            }
        });
    } catch (error) {
        console.error("Error fetching report: ", error);
        reportTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Error loading report. Check console.</td></tr>';
    }
});

// --- Export to CSV Functionality ---
exportCsvButton.addEventListener('click', () => {
    if (reportData.length === 0) {
        alert("No data to export. Please filter for a report first.");
        return;
    }

    const headers = ['Date', 'Employee Name', 'Employee ID', 'Status'];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    reportData.forEach(row => {
        const rowArray = [row.date, row.name, row.employeeId, row.status];
        csvContent += rowArray.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
