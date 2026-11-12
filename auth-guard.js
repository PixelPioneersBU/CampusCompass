
/* ==========================================
   CampusCompass - Authentication Guard
   ========================================== */

(async function protectCampusCompass() {
    if (window.campusCompassGuardRunning) return;
    window.campusCompassGuardRunning = true;

    if (!window.supabaseClient) {
        console.error("Supabase client not initialized.");
        window.campusCompassGuardRunning = false;
        return;
    }

    try {
        const { data, error } =
            await window.supabaseClient.auth.getSession();

        if (error) throw error;

        if (!data.session) {
            console.warn("No active session. Redirecting to login.");

            if (!window.location.pathname.endsWith("/auth.html")) {
                window.location.replace(
                    new URL("auth.html", window.location.href).href
                );
            }
            return;
        }

        window.currentStudent = data.session.user;

        // Update student profile on every protected page
        const fullName =
            window.currentStudent.user_metadata?.full_name || "Student";

        const studentName = document.getElementById("student-name");
        const studentAvatar = document.getElementById("student-avatar");
        const welcomeName = document.getElementById("welcome-name");

        if (studentName) {
            studentName.textContent = fullName;
        }

        if (studentAvatar) {
            studentAvatar.textContent = fullName.charAt(0).toUpperCase();
        }

        if (welcomeName) {
            welcomeName.textContent = fullName;
        }

        // Logout button on every protected page
        const logoutButton = document.getElementById("logout-btn");

        if (logoutButton) {
            logoutButton.addEventListener("click", async () => {
                await window.campusCompassLogout();
            });
        }

        console.log(
            "CampusCompass: Student authenticated:",
            fullName
        );

    } catch (error) {
        console.error("Authentication guard error:", error);
        window.campusCompassGuardRunning = false;
        alert("Unable to verify your login session. Please try again.");
    }
})();

window.campusCompassLogout = async function () {
    try {
        const { error } =
            await window.supabaseClient.auth.signOut();

        if (error) throw error;

        window.location.replace("auth.html");

    } catch (error) {
        console.error("Logout error:", error);
        alert("Unable to sign out. Please try again.");
    }
};

console.log("CampusCompass authentication guard loaded.");
