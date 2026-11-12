
/* ==========================================
   CAMPUSCOMPASS - DASHBOARD
   Loads real data from Supabase
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase client not initialized.");
        return;
    }

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    function parseLocalDate(dateString) {
        const [year, month, day] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    function getTodayStart() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    function showEmptyMessage(container, message) {
        if (!container) return;

        container.innerHTML = "";

        const element = document.createElement("p");
        element.className = "dashboard-empty-message";
        element.textContent = message;

        container.appendChild(element);
    }

    function updateCount(id, count) {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = count;
        }
    }

    // ==========================================
    // CURRENT DATE
    // ==========================================

    const currentDateElement =
        document.getElementById("current-date");

    if (currentDateElement) {
        currentDateElement.textContent =
            new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
    }

    // ==========================================
    // FETCH REAL DATA
    // ==========================================

    try {

        const { data: userData, error: userError } =
            await supabase.auth.getUser();

        if (userError) throw userError;

        const user = userData.user;

        if (!user) {
            window.location.replace("auth.html");
            return;
        }

        const [eventsResult, deadlinesResult, studyResult] =
            await Promise.all([

                supabase
                    .from("events")
                    .select("*")
                    .gte("event_date", getTodayStart().toLocaleDateString("en-CA"))
                    .order("event_date", { ascending: true }),

                supabase
                    .from("deadlines")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("due_date", { ascending: true }),

                supabase
                    .from("study_sessions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("session_date", { ascending: true })

            ]);

        if (eventsResult.error) throw eventsResult.error;
        if (deadlinesResult.error) throw deadlinesResult.error;
        if (studyResult.error) throw studyResult.error;

        const events = eventsResult.data || [];
        const deadlines = deadlinesResult.data || [];
        const studySessions = studyResult.data || [];

        // ==========================================
        // DASHBOARD STATISTICS
        // ==========================================

        const pendingTasks =
            deadlines.filter(task => !task.completed);

        const completedTasks =
            deadlines.filter(task => task.completed);

        const pendingSessions =
            studySessions.filter(session => !session.completed);

        updateCount("event-count", events.length);
        updateCount("task-count", pendingTasks.length);
        updateCount("study-count", pendingSessions.length);
        updateCount("completed-count", completedTasks.length);

        // ==========================================
        // UPCOMING EVENTS
        // ==========================================

        const eventsList =
            document.getElementById("events-list");

        if (eventsList) {
            eventsList.innerHTML = "";

            if (events.length === 0) {
                showEmptyMessage(
                    eventsList,
                    "No upcoming events at the moment."
                );
            } else {

                events.slice(0, 3).forEach(event => {

                    const item = document.createElement("div");
                    item.className = "event-item";

                    const dateBox = document.createElement("div");
                    dateBox.className = "event-date";

                    const date = parseLocalDate(event.event_date);

                    const day = document.createElement("strong");
                    day.textContent = date.getDate();

                    const month = document.createElement("span");
                    month.textContent =
                        date.toLocaleDateString("en-IN", {
                            month: "short"
                        });

                    dateBox.append(day, month);

                    const info = document.createElement("div");
                    info.className = "event-info";

                    const title = document.createElement("h3");
                    title.textContent = event.title;

                    const detail = document.createElement("p");
                    detail.textContent =
                        `${event.category} • ${event.location}`;

                    info.append(title, detail);
                    item.append(dateBox, info);

                    eventsList.appendChild(item);
                });
            }
        }

        // ==========================================
        // PENDING DEADLINES
        // ==========================================

        const deadlinesList =
            document.getElementById("deadlines-list");

        if (deadlinesList) {
            deadlinesList.innerHTML = "";

            if (pendingTasks.length === 0) {
                showEmptyMessage(
                    deadlinesList,
                    "You're all caught up. No pending tasks!"
                );
            } else {

                pendingTasks.slice(0, 3).forEach(task => {

                    const item = document.createElement("div");
                    item.className = "deadline-item";

                    const indicator = document.createElement("div");
                    indicator.className = "deadline-indicator";

                    const info = document.createElement("div");
                    info.className = "deadline-info";

                    const title = document.createElement("h3");
                    title.textContent = task.title;

                    const subject = document.createElement("p");
                    subject.textContent = task.subject || "General";

                    info.append(title, subject);

                    const status = document.createElement("span");
                    status.className = "deadline-status";

                    const difference = Math.round(
                        (parseLocalDate(task.due_date) -
                        getTodayStart()) / 86400000
                    );

                    if (difference < 0) {
                        status.textContent = "Overdue";
                        status.classList.add("overdue");
                    } else if (difference === 0) {
                        status.textContent = "Due today";
                    } else {
                        status.textContent =
                            `${difference} days left`;
                    }

                    item.append(indicator, info, status);
                    deadlinesList.appendChild(item);
                });
            }
        }

        console.log("CampusCompass dashboard data loaded.");

    } catch (error) {

        console.error("Dashboard loading error:", error);

        showEmptyMessage(
            document.getElementById("events-list"),
            "Unable to load events. Please try again."
        );

        showEmptyMessage(
            document.getElementById("deadlines-list"),
            "Unable to load deadlines. Please try again."
        );
    }

});

console.log("CampusCompass dashboard initialized.");
