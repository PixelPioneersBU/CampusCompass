
const db = window.supabaseClient;

const resetForm = document.getElementById("resetForm");
const resetError = document.getElementById("resetError");
const resetMessage = document.getElementById("resetMessage");

const updateButton = document.getElementById("updatePasswordButton");

let recoverySessionReady = false;

function showResetMessage(message, type) {
    resetMessage.textContent = message;
    resetMessage.className = type;
}

function showInvalidLink() {
    resetForm.classList.remove("active");
    resetError.style.display = "block";
}

// Supabase processes the recovery link and creates a session.
async function initializePasswordReset() {
    try {
        const { data, error } = await db.auth.getSession();

        if (error) throw error;

        if (!data.session) {
            showInvalidLink();
            return;
        }

        recoverySessionReady = true;
        resetForm.classList.add("active");

    } catch (error) {
        console.error("Password recovery error:", error);
        showInvalidLink();
    }
}

// Listen for the password recovery event as well.
db.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && session) {
        recoverySessionReady = true;
        resetForm.classList.add("active");
        resetError.style.display = "none";
    }
});

// Update password.
resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!recoverySessionReady) {
        showInvalidLink();
        return;
    }

    const password = document.getElementById("newPassword").value;
    const confirmPassword =
        document.getElementById("confirmNewPassword").value;

    if (password.length < 8) {
        showResetMessage(
            "Password must contain at least 8 characters.",
            "error"
        );
        return;
    }

    if (password !== confirmPassword) {
        showResetMessage("Passwords do not match.", "error");
        return;
    }

    updateButton.disabled = true;
    updateButton.textContent = "Updating...";

    try {
        const { error } = await db.auth.updateUser({
            password: password
        });

        if (error) throw error;

        showResetMessage(
            "Password updated successfully! Redirecting to login...",
            "success"
        );

        resetForm.reset();

        // End the recovery session after the password has been changed.
        await db.auth.signOut();

        setTimeout(() => {
            window.location.href = "auth.html";
        }, 2000);

    } catch (error) {
        console.error("Password update error:", error);

        showResetMessage(
            error.message || "Unable to update your password. Please try again.",
            "error"
        );

    } finally {
        updateButton.disabled = false;
        updateButton.textContent = "Update Password";
    }
});

initializePasswordReset();

console.log("CampusCompass password reset initialized.");
