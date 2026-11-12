
/* ==========================================
   CampusCompass - Edit Profile
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("edit-profile-modal");
    const openButton = document.getElementById("edit-profile-btn");
    const closeButton = document.getElementById("close-profile-modal");
    const cancelButton = document.getElementById("cancel-profile-edit");
    const profileForm = document.getElementById("edit-profile-form");

    const nameInput = document.getElementById("profile-full-name");
    const enrollmentInput = document.getElementById("profile-enrollment");
    const emailInput = document.getElementById("profile-email");

    const message = document.getElementById("profile-message");
    const saveButton = document.getElementById("save-profile-btn");

    if (!modal || !openButton || !profileForm) {
        console.error("Edit Profile elements not found.");
        return;
    }

    let currentUser = null;
    let originalName = "";

    // DISPLAY UPDATED NAME
    function updateProfileDisplay(fullName) {
        const studentName = document.getElementById("student-name");
        const studentAvatar = document.getElementById("student-avatar");
        const welcomeName = document.getElementById("welcome-name");

        if (studentName) studentName.textContent = fullName;

        if (studentAvatar) {
            studentAvatar.textContent = fullName.charAt(0).toUpperCase();
        }

        if (welcomeName) {
            welcomeName.textContent = fullName;
        }
    }

    // SHOW MESSAGE
    function showProfileMessage(text, type) {
        message.textContent = text;
        message.className = type;
    }

    // CLOSE MODAL
    function closeModal() {
        modal.classList.remove("active");
        showProfileMessage("", "");
    }

    // OPEN MODAL AND LOAD PROFILE
    openButton.addEventListener("click", async () => {

        showProfileMessage("Loading profile...", "");

        modal.classList.add("active");

        openButton.disabled = true;

        try {
            const { data: userData, error: userError } =
                await window.supabaseClient.auth.getUser();

            if (userError) throw userError;

            currentUser = userData.user;

            if (!currentUser) {
                throw new Error("Please sign in again.");
            }

            const { data: profile, error: profileError } =
                await window.supabaseClient
                    .from("profiles")
                    .select("full_name, enrollment_number, email")
                    .eq("id", currentUser.id)
                    .single();

            if (profileError) throw profileError;

            originalName = profile.full_name || "";

            nameInput.value = originalName;
            enrollmentInput.value = profile.enrollment_number || "";
            emailInput.value = profile.email || currentUser.email || "";

            showProfileMessage("", "");

        } catch (error) {
            console.error("Profile loading error:", error);

            showProfileMessage(
                error.message || "Unable to load your profile.",
                "error"
            );

        } finally {
            openButton.disabled = false;
        }
    });

    // CLOSE BUTTONS
    closeButton.addEventListener("click", closeModal);
    cancelButton.addEventListener("click", closeModal);

    // CLOSE WHEN CLICKING OUTSIDE
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // SAVE PROFILE
    profileForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const newName = nameInput.value.trim();

        if (!newName) {
            showProfileMessage("Please enter your name.", "error");
            return;
        }

        if (newName === originalName) {
            showProfileMessage("No changes were made.", "error");
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {

            if (!currentUser) {
                throw new Error("Please sign in again.");
            }

            // Update Supabase Auth metadata
            const { error: authError } =
                await window.supabaseClient.auth.updateUser({
                    data: {
                        full_name: newName
                    }
                });

            if (authError) throw authError;

            // Update the profiles table
            const { data: updatedProfile, error: profileError } =
                await window.supabaseClient
                    .from("profiles")
                    .update({
                        full_name: newName
                    })
                    .eq("id", currentUser.id)
                    .select("full_name")
                    .single();

            if (profileError) {
                // Restore the previous Auth metadata if database update fails
                await window.supabaseClient.auth.updateUser({
                    data: {
                        full_name: originalName
                    }
                });

                throw profileError;
            }

            originalName = updatedProfile.full_name;

            updateProfileDisplay(originalName);

            showProfileMessage(
                "Profile updated successfully!",
                "success"
            );

            setTimeout(closeModal, 1200);

        } catch (error) {
            console.error("Profile update error:", error);

            showProfileMessage(
                error.message || "Unable to update your profile.",
                "error"
            );

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Save Changes";
        }
    });

    console.log("CampusCompass: Edit Profile initialized.");

});
