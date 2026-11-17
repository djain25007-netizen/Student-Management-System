
document.addEventListener("DOMContentLoaded", function () {

    // ==================================
    // GET HTML ELEMENTS
    // ==================================

    const studentForm = document.getElementById("studentForm");
    const studentModal = document.getElementById("studentModal");

    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const cancelModalBtn = document.getElementById("cancelModal");

    const studentTable = document.getElementById("studentTable");
    const emptyMessage = document.getElementById("emptyMessage");

    const searchInput = document.getElementById("searchInput");
    const courseFilter = document.getElementById("courseFilter");
    const statusFilter = document.getElementById("statusFilter");

    const modalTitle = document.getElementById("modalTitle");
    const saveButton = document.getElementById("saveButton");
    const formError = document.getElementById("formError");

    // Form fields
    const editId = document.getElementById("editId");
    const studentName = document.getElementById("studentName");
    const rollNumber = document.getElementById("rollNumber");
    const course = document.getElementById("course");
    const semester = document.getElementById("semester");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const studentStatus = document.getElementById("status");

    // Check important HTML elements
    if (!studentForm || !studentModal || !openModalBtn ||
        !studentTable || !searchInput || !courseFilter ||
        !statusFilter || !emptyMessage) {

        console.error("Some HTML elements are missing. Check your HTML IDs.");
        return;
    }

    // ==================================
    // LOCAL STORAGE
    // ==================================

    let students = [];

    try {
        students = JSON.parse(localStorage.getItem("students")) || [];

        if (!Array.isArray(students)) {
            students = [];
        }
    } catch (error) {
        students = [];
    }

    function saveToLocalStorage() {
        localStorage.setItem("students", JSON.stringify(students));
    }

    // ==================================
    // OPEN MODAL
    // ==================================

    function openStudentModal() {

        studentForm.reset();

        editId.value = "";
        formError.textContent = "";

        modalTitle.textContent = "Add New Student";
        saveButton.textContent = "Save Student";

        studentModal.classList.add("show");
    }

    // ==================================
    // CLOSE MODAL
    // ==================================

    function closeStudentModal() {

        studentModal.classList.remove("show");

        studentForm.reset();
        editId.value = "";
        formError.textContent = "";
    }

    // Button events
    openModalBtn.addEventListener("click", openStudentModal);

    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", closeStudentModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener("click", closeStudentModal);
    }

    // Close when clicking outside
    studentModal.addEventListener("click", function (event) {

        if (event.target === studentModal) {
            closeStudentModal();
        }

    });

    // ==================================
    // ADD / UPDATE STUDENT
    // ==================================

    studentForm.addEventListener("submit", function (event) {

        event.preventDefault();

        formError.textContent = "";

        const student = {

            id: editId.value || Date.now().toString(),

            name: studentName.value.trim(),

            roll: rollNumber.value.trim(),

            course: course.value,

            semester: semester.value,

            email: email.value.trim(),

            phone: phone.value.trim(),

            status: studentStatus.value

        };

        // Check duplicate roll number
        const duplicate = students.some(function (s) {

            return s.roll.toLowerCase() === student.roll.toLowerCase()
                && s.id !== student.id;

        });

        if (duplicate) {

            formError.textContent = "Roll number already exists!";

            return;
        }

        // Update student
        if (editId.value) {

            students = students.map(function (s) {

                return s.id === editId.value ? student : s;

            });

        }

        // Add new student
        else {

            student.createdAt = new Date().toISOString();

            students.push(student);

        }

        saveToLocalStorage();

        displayStudents();

        closeStudentModal();

    });

    // ==================================
    // DISPLAY STUDENTS
    // ==================================

    function displayStudents() {

        studentTable.innerHTML = "";

        const searchValue = searchInput.value.toLowerCase();

        const selectedCourse = courseFilter.value;

        const selectedStatus = statusFilter.value;

        const filteredStudents = students.filter(function (student) {

            const matchesSearch =

                student.name.toLowerCase().includes(searchValue) ||

                student.roll.toLowerCase().includes(searchValue) ||

                student.email.toLowerCase().includes(searchValue);

            const matchesCourse =

                selectedCourse === "" ||
                student.course === selectedCourse;

            const matchesStatus =

                selectedStatus === "" ||
                student.status === selectedStatus;

            return matchesSearch && matchesCourse && matchesStatus;

        });

        filteredStudents.forEach(function (student) {

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>${escapeHTML(student.name)}</td>

                <td>${escapeHTML(student.roll)}</td>

                <td>${escapeHTML(student.course)}</td>

                <td>${escapeHTML(student.semester)}</td>

                <td>${escapeHTML(student.email)}</td>

                <td>
                    <span class="status-badge ${student.status.toLowerCase()}">
                        ${escapeHTML(student.status)}
                    </span>
                </td>

                <td>
                    <button class="edit-btn"
                        data-action="edit"
                        data-id="${escapeHTML(student.id)}">
                        Edit
                    </button>

                    <button class="delete-btn"
                        data-action="delete"
                        data-id="${escapeHTML(student.id)}">
                        Delete
                    </button>
                </td>

            `;

            studentTable.appendChild(row);

        });

        emptyMessage.style.display =
            filteredStudents.length === 0 ? "block" : "none";

        document.getElementById("studentCount").textContent =
            `Showing ${filteredStudents.length} students`;

        updateDashboard();

    }

    // ==================================
    // ESCAPE HTML
    // ==================================

    function escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, function (char) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"

            }[char];

        });

    }

    // ==================================
    // EDIT AND DELETE
    // ==================================

    studentTable.addEventListener("click", function (event) {

        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const id = button.dataset.id;

        const action = button.dataset.action;

        if (action === "edit") {

            editStudent(id);

        }

        if (action === "delete") {

            deleteStudent(id);

        }

    });

    // Edit student
    function editStudent(id) {

        const student = students.find(function (s) {

            return s.id === id;

        });

        if (!student) return;

        editId.value = student.id;

        studentName.value = student.name;

        rollNumber.value = student.roll;

        course.value = student.course;

        semester.value = student.semester;

        email.value = student.email;

        phone.value = student.phone || "";

        studentStatus.value = student.status;

        modalTitle.textContent = "Edit Student";

        saveButton.textContent = "Update Student";

        formError.textContent = "";

        studentModal.classList.add("show");

    }

    // Delete student
    function deleteStudent(id) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this student?"
        );

        if (!confirmDelete) return;

        students = students.filter(function (s) {

            return s.id !== id;

        });

        saveToLocalStorage();

        displayStudents();

    }

    // ==================================
    // SEARCH AND FILTER
    // ==================================

    searchInput.addEventListener("input", displayStudents);

    courseFilter.addEventListener("change", displayStudents);

    statusFilter.addEventListener("change", displayStudents);

    // ==================================
    // DASHBOARD STATISTICS
    // ==================================

    function updateDashboard() {

        document.getElementById("totalStudents").textContent =
            students.length;

        const activeCount = students.filter(function (s) {

            return s.status === "Active";

        }).length;

        document.getElementById("activeStudents").textContent =
            activeCount;

        const uniqueCourses = new Set(

            students.map(function (s) {

                return s.course;

            })

        );

        document.getElementById("totalCourses").textContent =
            uniqueCourses.size;

        const today = new Date();

        const newCount = students.filter(function (s) {

            if (!s.createdAt) return false;

            const createdDate = new Date(s.createdAt);

            return createdDate.toDateString() === today.toDateString();

        }).length;

        document.getElementById("newStudents").textContent =
            newCount;

    }

    // ==================================
    // INITIAL DISPLAY
    // ==================================

    displayStudents();

    console.log("Student Management System loaded successfully!");

});
