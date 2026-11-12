
/* ==========================================
   CAMPUSCOMPASS - DEADLINE TRACKER
   Supabase Integration
   ========================================== */

// Get HTML elements
const deadlineForm = document.getElementById("deadline-form");

const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title");
const taskSubjectInput = document.getElementById("task-subject");
const taskDateInput = document.getElementById("task-date");
const taskDescriptionInput = document.getElementById("task-description");

const deadlineContainer = document.getElementById("deadline-container");
const deadlineEmpty = document.getElementById("deadline-empty");
const deadlineResults = document.getElementById("deadline-results");

const totalTasksElement = document.getElementById("total-tasks");
const pendingTasksElement = document.getElementById("pending-tasks");
const completedTasksElement = document.getElementById("completed-tasks");
const overdueTasksElement = document.getElementById("overdue-tasks");

const formHeading = document.getElementById("form-heading");
const saveTaskButton = document.getElementById("save-task-btn");
const cancelEditButton = document.getElementById("cancel-edit-btn");
const sortSelect = document.getElementById("task-sort");

// Supabase client
const db = window.supabaseClient;

// Store tasks loaded from Supabase
let tasks = [];
let selectedFilter = "all";

// Current logged-in user
let currentUser = null;


// Get today's date without time
function getToday() {
    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}


// Convert YYYY-MM-DD into a local date
function parseTaskDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
}


// Calculate the number of days remaining
function getDaysRemaining(dateString) {
    const dueDate = parseTaskDate(dateString);
    const difference = dueDate - getToday();

    return Math.round(difference / (1000 * 60 * 60 * 24));
}


// Determine task status
function getTaskStatus(task) {
    if (task.completed) {
        return "completed";
    }

    if (getDaysRemaining(task.due_date) < 0) {
        return "overdue";
    }

    return "pending";
}


// Format date for display
function formatTaskDate(dateString) {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
}


// Update statistics
function updateTaskStats() {
    const pending = tasks.filter(task =>
        getTaskStatus(task) === "pending"
    ).length;

    const completed = tasks.filter(task =>
        getTaskStatus(task) === "completed"
    ).length;

    const overdue = tasks.filter(task =>
        getTaskStatus(task) === "overdue"
    ).length;

    totalTasksElement.textContent = tasks.length;
    pendingTasksElement.textContent = pending;
    completedTasksElement.textContent = completed;
    overdueTasksElement.textContent = overdue;
}


// Display tasks
function displayTasks(taskArray) {
    deadlineContainer.innerHTML = "";

    updateTaskStats();

    deadlineResults.textContent =
        `Showing ${taskArray.length} of ${tasks.length} tasks`;

    if (taskArray.length === 0) {
        deadlineEmpty.classList.remove("hidden");
        return;
    }

    deadlineEmpty.classList.add("hidden");

    taskArray.forEach(task => {
        const status = getTaskStatus(task);
        const daysRemaining = getDaysRemaining(task.due_date);

        let remainingText;

        if (status === "completed") {
            remainingText = "Task completed";
        } else if (status === "overdue") {
            remainingText = `${Math.abs(daysRemaining)} day(s) overdue`;
        } else if (daysRemaining === 0) {
            remainingText = "Due today";
        } else {
            remainingText = `${daysRemaining} day(s) remaining`;
        }

        const taskCard = document.createElement("article");
        taskCard.className = "deadline-task";

        const top = document.createElement("div");
        top.className = "deadline-task-top";

        const category = document.createElement("span");
        category.className = "task-category";
        category.textContent = task.subject;

        const statusBadge = document.createElement("span");
        statusBadge.className = `task-status status-${status}`;
        statusBadge.textContent =
            status.charAt(0).toUpperCase() + status.slice(1);

        top.append(category, statusBadge);

        const title = document.createElement("h3");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent =
            task.description || "No description provided.";

        const date = document.createElement("div");
        date.className = "deadline-task-date";
        date.textContent =
            `Due: ${formatTaskDate(task.due_date)} • ${remainingText}`;

        const bottom = document.createElement("div");
        bottom.className = "deadline-task-bottom";

        const actions = document.createElement("div");
        actions.className = "deadline-task-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-task-btn";
        completeButton.dataset.id = task.id;
        completeButton.textContent = task.completed
            ? "Mark Pending"
            : "Mark Completed";

        const editButton = document.createElement("button");
        editButton.className = "edit-task-btn";
        editButton.dataset.id = task.id;
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-task-btn";
        deleteButton.dataset.id = task.id;
        deleteButton.textContent = "Delete";

        actions.append(completeButton, editButton, deleteButton);
        bottom.append(actions);

        taskCard.append(top, title, description, date, bottom);
        deadlineContainer.appendChild(taskCard);
    });
}


// Filter and sort tasks
function filterAndSortTasks() {
    let filteredTasks = [...tasks];

    if (selectedFilter !== "all") {
        filteredTasks = filteredTasks.filter(task =>
            getTaskStatus(task) === selectedFilter
        );
    }

    const sortValue = sortSelect.value;

    if (sortValue === "date-asc") {
        filteredTasks.sort((a, b) =>
            a.due_date.localeCompare(b.due_date)
        );
    } else if (sortValue === "date-desc") {
        filteredTasks.sort((a, b) =>
            b.due_date.localeCompare(a.due_date)
        );
    } else if (sortValue === "title") {
        filteredTasks.sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    displayTasks(filteredTasks);
}


// Reset form
function resetTaskForm() {
    deadlineForm.reset();
    taskIdInput.value = "";

    formHeading.textContent = "Add a New Task";
    saveTaskButton.textContent = "Add Task";

    cancelEditButton.classList.add("hidden");
}


// Load tasks from Supabase
async function loadTasks() {
    const { data, error } = await db
        .from("deadlines")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("due_date", { ascending: true });

    if (error) {
        console.error("Error loading deadlines:", error);
        alert("Unable to load your deadlines. Please refresh the page.");
        return;
    }

    tasks = data || [];
    filterAndSortTasks();
}


// Add or update task
deadlineForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const title = taskTitleInput.value.trim();
    const subject = taskSubjectInput.value;
    const dueDate = taskDateInput.value;
    const description = taskDescriptionInput.value.trim();

    if (!title || !subject || !dueDate) {
        alert("Please fill in all required fields.");
        return;
    }

    if (parseTaskDate(dueDate) < getToday()) {
        alert("Please select today or a future date.");
        return;
    }

    saveTaskButton.disabled = true;

    try {
        const existingId = taskIdInput.value;

        if (existingId) {
            const { error } = await db
                .from("deadlines")
                .update({
                    title,
                    subject,
                    due_date: dueDate,
                    description
                })
                .eq("id", existingId)
                .eq("user_id", currentUser.id);

            if (error) throw error;

        } else {
            const { error } = await db
                .from("deadlines")
                .insert({
                    user_id: currentUser.id,
                    title,
                    subject,
                    due_date: dueDate,
                    description,
                    completed: false
                });

            if (error) throw error;
        }

        resetTaskForm();
        await loadTasks();

    } catch (error) {
        console.error("Error saving deadline:", error);
        alert("Unable to save the task. Please try again.");
    } finally {
        saveTaskButton.disabled = false;
    }
});


// Handle task buttons
deadlineContainer.addEventListener("click", async function(event) {
    const button = event.target.closest("button");

    if (!button) return;

    const taskId = button.dataset.id;

    if (!taskId) return;

    if (button.classList.contains("complete-task-btn")) {
        const task = tasks.find(item => item.id === taskId);

        if (!task) return;

        const { error } = await db
            .from("deadlines")
            .update({
                completed: !task.completed
            })
            .eq("id", taskId)
            .eq("user_id", currentUser.id);

        if (error) {
            console.error("Error updating task:", error);
            alert("Unable to update task.");
            return;
        }

        await loadTasks();
    }

    else if (button.classList.contains("edit-task-btn")) {
        const task = tasks.find(item => item.id === taskId);

        if (!task) return;

        taskIdInput.value = task.id;
        taskTitleInput.value = task.title;
        taskSubjectInput.value = task.subject;
        taskDateInput.value = task.due_date;
        taskDescriptionInput.value = task.description || "";

        formHeading.textContent = "Edit Task";
        saveTaskButton.textContent = "Update Task";
        cancelEditButton.classList.remove("hidden");

        deadlineForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    else if (button.classList.contains("delete-task-btn")) {
        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) return;

        const { error } = await db
            .from("deadlines")
            .delete()
            .eq("id", taskId)
            .eq("user_id", currentUser.id);

        if (error) {
            console.error("Error deleting task:", error);
            alert("Unable to delete task.");
            return;
        }

        if (taskIdInput.value === taskId) {
            resetTaskForm();
        }

        await loadTasks();
    }
});


// Cancel editing
cancelEditButton.addEventListener("click", resetTaskForm);


// Filter buttons
document.querySelectorAll(".deadline-filter").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelectorAll(".deadline-filter").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
        selectedFilter = this.dataset.filter;

        filterAndSortTasks();
    });
});


// Sort dropdown
sortSelect.addEventListener("change", filterAndSortTasks);


// Set minimum selectable date to today
const today = getToday();

const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

taskDateInput.min = localToday;


// Initialize after authentication check
async function initializeDeadlineTracker() {
    try {
        const { data, error } =
            await db.auth.getSession();

        if (error) throw error;

        if (!data.session) {
            window.location.replace("auth.html");
            return;
        }

        currentUser = data.session.user;

        await loadTasks();

        console.log("CampusCompass Deadline Tracker connected to Supabase.");

    } catch (error) {
        console.error("Deadline Tracker initialization error:", error);
        alert("Unable to initialize Deadline Tracker. Please refresh.");
    }
}

initializeDeadlineTracker();
