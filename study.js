
/* ==========================================
   CAMPUSCOMPASS - STUDY PLANNER
   Supabase Integration
   ========================================== */

// Supabase client
const db = window.supabaseClient;

// Get HTML elements
const studyForm = document.getElementById("study-form");

const sessionIdInput = document.getElementById("study-session-id");
const studyTitleInput = document.getElementById("study-title");
const studySubjectInput = document.getElementById("study-subject");
const studyDateInput = document.getElementById("study-date");
const studyTimeInput = document.getElementById("study-time");
const studyDurationInput = document.getElementById("study-duration");
const studyNotesInput = document.getElementById("study-notes");

const studyContainer = document.getElementById("study-container");
const studyEmpty = document.getElementById("study-empty");
const studyResults = document.getElementById("study-results");

const totalSessionsElement = document.getElementById("total-sessions");
const plannedHoursElement = document.getElementById("planned-hours");
const completedHoursElement = document.getElementById("completed-hours");
const completionRateElement = document.getElementById("completion-rate");

const studyFormHeading = document.getElementById("study-form-heading");
const saveStudyButton = document.getElementById("save-study-btn");
const cancelStudyEditButton = document.getElementById("cancel-study-edit");
const studySortSelect = document.getElementById("study-sort");

// State
let studySessions = [];
let selectedStudyFilter = "all";
let currentUser = null;


// Format date
function formatStudyDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// Format time
function formatStudyTime(timeString) {
    const [hours, minutes] = timeString.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}


// Convert minutes into readable hours
function formatStudyHours(minutes) {
    const hours = minutes / 60;

    return Number.isInteger(hours)
        ? `${hours}h`
        : `${hours.toFixed(1)}h`;
}


// Update statistics
function updateStudyStats() {
    const totalSessions = studySessions.length;

    const plannedMinutes = studySessions.reduce(
        (total, session) => total + Number(session.duration),
        0
    );

    const completedSessions = studySessions.filter(
        session => session.completed
    );

    const completedMinutes = completedSessions.reduce(
        (total, session) => total + Number(session.duration),
        0
    );

    const completionRate = totalSessions === 0
        ? 0
        : Math.round((completedSessions.length / totalSessions) * 100);

    totalSessionsElement.textContent = totalSessions;
    plannedHoursElement.textContent = formatStudyHours(plannedMinutes);
    completedHoursElement.textContent = formatStudyHours(completedMinutes);
    completionRateElement.textContent = `${completionRate}%`;
}


// Display sessions
function displayStudySessions(sessionArray) {
    studyContainer.innerHTML = "";

    updateStudyStats();

    studyResults.textContent =
        `Showing ${sessionArray.length} of ${studySessions.length} sessions`;

    if (sessionArray.length === 0) {
        studyEmpty.classList.remove("hidden");
        return;
    }

    studyEmpty.classList.add("hidden");

    sessionArray.forEach(session => {
        const card = document.createElement("article");
        card.className = "study-session-card";

        const top = document.createElement("div");
        top.className = "study-session-top";

        const subject = document.createElement("span");
        subject.className = "study-subject-badge";
        subject.textContent = session.subject;

        const status = document.createElement("span");
        status.className = session.completed
            ? "study-status-badge study-status-completed"
            : "study-status-badge study-status-upcoming";

        status.textContent = session.completed
            ? "Completed"
            : "Upcoming";

        top.append(subject, status);

        const title = document.createElement("h3");
        title.textContent = session.title;

        const notes = document.createElement("p");
        notes.textContent = session.notes || "No notes added.";

        const details = document.createElement("div");
        details.className = "study-session-details";

        const date = document.createElement("span");
        date.textContent = `Date: ${formatStudyDate(session.session_date)}`;

        const time = document.createElement("span");
        time.textContent = `Time: ${formatStudyTime(session.session_time)}`;

        const duration = document.createElement("span");
        duration.textContent = `Duration: ${session.duration} minutes`;

        details.append(date, time, duration);

        const actions = document.createElement("div");
        actions.className = "study-session-actions";

        const completeButton = document.createElement("button");
        completeButton.className = "study-complete-btn";
        completeButton.dataset.id = session.id;
        completeButton.textContent = session.completed
            ? "Mark Upcoming"
            : "Mark Completed";

        const editButton = document.createElement("button");
        editButton.className = "study-edit-btn";
        editButton.dataset.id = session.id;
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.className = "study-delete-btn";
        deleteButton.dataset.id = session.id;
        deleteButton.textContent = "Delete";

        actions.append(completeButton, editButton, deleteButton);

        card.append(top, title, notes, details, actions);

        studyContainer.appendChild(card);
    });
}


// Filter and sort sessions
function filterAndSortStudySessions() {
    let filteredSessions = [...studySessions];

    if (selectedStudyFilter === "upcoming") {
        filteredSessions = filteredSessions.filter(
            session => !session.completed
        );
    }

    if (selectedStudyFilter === "completed") {
        filteredSessions = filteredSessions.filter(
            session => session.completed
        );
    }

    const sortValue = studySortSelect.value;

    if (sortValue === "date-asc") {
        filteredSessions.sort((a, b) =>
            (a.session_date + a.session_time).localeCompare(
                b.session_date + b.session_time
            )
        );
    } else if (sortValue === "date-desc") {
        filteredSessions.sort((a, b) =>
            (b.session_date + b.session_time).localeCompare(
                a.session_date + a.session_time
            )
        );
    } else if (sortValue === "subject") {
        filteredSessions.sort((a, b) =>
            a.subject.localeCompare(b.subject)
        );
    }

    displayStudySessions(filteredSessions);
}


// Load sessions from Supabase
async function loadStudySessions() {
    const { data, error } = await db
        .from("study_sessions")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("session_date", { ascending: true });

    if (error) {
        console.error("Error loading study sessions:", error);
        alert("Unable to load study sessions. Please refresh the page.");
        return;
    }

    studySessions = data || [];
    filterAndSortStudySessions();
}


// Reset form
function resetStudyForm() {
    studyForm.reset();
    sessionIdInput.value = "";

    studyFormHeading.textContent = "Plan a Study Session";
    saveStudyButton.textContent = "Add Session";

    cancelStudyEditButton.classList.add("hidden");
}


// Add or update a session
studyForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please log in again.");
        return;
    }

    const title = studyTitleInput.value.trim();
    const subject = studySubjectInput.value;
    const session_date = studyDateInput.value;
    const session_time = studyTimeInput.value;
    const duration = Number(studyDurationInput.value);
    const notes = studyNotesInput.value.trim();

    if (!title || !subject || !session_date || !session_time || !duration) {
        alert("Please fill in all required fields.");
        return;
    }

    const existingId = sessionIdInput.value;

    const sessionData = {
        title,
        subject,
        session_date,
        session_time,
        duration,
        notes,
        user_id: currentUser.id
    };

    saveStudyButton.disabled = true;

    try {
        let error;

        if (existingId) {
            const result = await db
                .from("study_sessions")
                .update(sessionData)
                .eq("id", existingId)
                .eq("user_id", currentUser.id);

            error = result.error;
        } else {
            const result = await db
                .from("study_sessions")
                .insert({
                    ...sessionData,
                    completed: false
                });

            error = result.error;
        }

        if (error) throw error;

        resetStudyForm();
        await loadStudySessions();

    } catch (error) {
        console.error("Error saving study session:", error);
        alert("Unable to save the study session. Please try again.");
    } finally {
        saveStudyButton.disabled = false;
    }
});


// Handle session actions
studyContainer.addEventListener("click", async function(event) {
    const button = event.target.closest("button");

    if (!button || !currentUser) return;

    const sessionId = button.dataset.id;

    // Mark completed / upcoming
    if (button.classList.contains("study-complete-btn")) {
        const session = studySessions.find(
            item => item.id === sessionId
        );

        if (!session) return;

        button.disabled = true;

        const { error } = await db
            .from("study_sessions")
            .update({ completed: !session.completed })
            .eq("id", sessionId)
            .eq("user_id", currentUser.id);

        button.disabled = false;

        if (error) {
            console.error("Error updating session:", error);
            alert("Unable to update the session.");
            return;
        }

        await loadStudySessions();
    }

    // Edit session
    else if (button.classList.contains("study-edit-btn")) {
        const session = studySessions.find(
            item => item.id === sessionId
        );

        if (!session) return;

        sessionIdInput.value = session.id;
        studyTitleInput.value = session.title;
        studySubjectInput.value = session.subject;
        studyDateInput.value = session.session_date;
        studyTimeInput.value = session.session_time.slice(0, 5);
        studyDurationInput.value = String(session.duration);
        studyNotesInput.value = session.notes || "";

        studyFormHeading.textContent = "Edit Study Session";
        saveStudyButton.textContent = "Update Session";

        cancelStudyEditButton.classList.remove("hidden");

        studyForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // Delete session
    else if (button.classList.contains("study-delete-btn")) {
        const confirmDelete = confirm(
            "Are you sure you want to delete this study session?"
        );

        if (!confirmDelete) return;

        button.disabled = true;

        const { error } = await db
            .from("study_sessions")
            .delete()
            .eq("id", sessionId)
            .eq("user_id", currentUser.id);

        if (error) {
            console.error("Error deleting session:", error);
            alert("Unable to delete the session.");
            button.disabled = false;
            return;
        }

        if (sessionIdInput.value === sessionId) {
            resetStudyForm();
        }

        await loadStudySessions();
    }
});


// Cancel editing
cancelStudyEditButton.addEventListener("click", resetStudyForm);


// Filter buttons
document.querySelectorAll(".study-filter").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelectorAll(".study-filter").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
        selectedStudyFilter = this.dataset.filter;

        filterAndSortStudySessions();
    });
});


// Sorting
studySortSelect.addEventListener(
    "change",
    filterAndSortStudySessions
);


// Initialize Study Planner
async function initializeStudyPlanner() {
    try {
        const { data, error } = await db.auth.getSession();

        if (error) throw error;

        if (!data.session) {
            window.location.replace("auth.html");
            return;
        }

        currentUser = data.session.user;
        const fullName = 
            currentUser.user_metadata?.full_name || "Student";

        document.getElementById("student-name").textContent = fullName;
        document.getElementById("student-avatar").textContent =
            fullName.charAt(0).toUpperCase();

        await loadStudySessions();

        console.log("CampusCompass Study Planner loaded successfully.");

    } catch (error) {
        console.error("Study Planner initialization error:", error);
        alert("Unable to initialize Study Planner. Please refresh the page.");
    }
}
const studentName = document.getElementById("student-name");
const studentAvatar = document.getElementById("student-avatar");

const { data: { session } } =
    await db.auth.getSession();

if (session) {
    const fullName = session.user.user_metadata?.full_name || "Student";

    if (studentName) studentName.textContent = fullName;
    if (studentAvatar) {
        studentAvatar.textContent = fullName.charAt(0).toUpperCase();
    }
}
initializeStudyPlanner();


