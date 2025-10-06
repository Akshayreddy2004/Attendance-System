// This is the script for the employees page

// IMPORTANT: Paste your own firebaseConfig object here from Firebase
// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Get HTML Elements
const logoutButton = document.getElementById('logout-button');
const addEmployeeForm = document.getElementById('add-employee-form');
const employeeTableBody = document.getElementById('employee-table-body');

// --- Authentication Check ---
auth.onAuthStateChanged((user) => {
    if (user) {
        loadEmployees();
    } else {
        window.location.href = 'index.html';
    }
});

// --- Logout Functionality ---
logoutButton.addEventListener('click', () => {
    auth.signOut();
});

// --- Add Employee Functionality ---
addEmployeeForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const name = document.getElementById('employeeName').value;
    const id = document.getElementById('employeeId').value;
    const department = document.getElementById('department').value;

    db.collection('employees').add({
        name: name,
        employeeId: id,
        department: department,
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Employee added with ID: ", docRef.id);
        addEmployeeForm.reset(); 
        
        const addEmployeeModal = document.getElementById('addEmployeeModal');
        const modal = bootstrap.Modal.getInstance(addEmployeeModal);
        if (modal) {
            modal.hide();
        }
    })
    .catch((error) => {
        console.error("Error adding employee: ", error);
        alert("Error adding employee. Please check the console for details.");
    });
});

// --- Load and Display Employees from Firestore ---
function loadEmployees() {
    db.collection('employees').orderBy('name').onSnapshot((querySnapshot) => {
        if (querySnapshot.empty) {
            employeeTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No employees found. Add one to get started!</td></tr>';
            return;
        }
        employeeTableBody.innerHTML = ''; 
        querySnapshot.forEach((doc) => {
            const employee = doc.data();
            const row = `
                <tr>
                    <td>${employee.name}</td>
                    <td>${employee.employeeId}</td>
                    <td>${employee.department}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
            employeeTableBody.innerHTML += row;
        });
    });
}

// --- Delete Employee Functionality ---
function deleteEmployee(docId) {
    if (confirm("Are you sure you want to delete this employee?")) {
        db.collection('employees').doc(docId).delete()
        .then(() => {
            console.log("Employee successfully deleted!");
        }).catch((error) => {
            console.error("Error removing employee: ", error);
        });
    }
}
