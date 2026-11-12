
/* ==========================================
   CampusCompass - Authentication System
   ========================================== */

// Use the existing Supabase client from supabase.js.


// ==========================================
// HTML ELEMENTS
// ==========================================

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

const switchAuth = document.getElementById("switchAuth");
const switchText = document.getElementById("switchText");
const authSwitchContainer = document.getElementById("authSwitchContainer");

const authMessage = document.getElementById("authMessage");
const emailPreview = document.getElementById("emailPreview");
const signupEnrollment = document.getElementById("signupEnrollment");

const forgotPasswordLink = document.getElementById("forgotPasswordLink");
const backToLogin = document.getElementById("backToLogin");


// ==========================================
// NORMALIZE ENROLLMENT / EMAIL
// ==========================================

function normalizeEnrollment(value) {
    let input = value.trim();

    if (input.includes("@")) {
        const parts = input.split("@");

        if (
            parts.length !== 2 ||
            parts[1].trim().toLowerCase() !== "bennett.edu.in"
        ) {
            return null;
        }

        input = parts[0].trim();
    }

    input = input.toUpperCase();

    if (!/^[A-Z0-9]+$/.test(input)) {
        return null;
    }

    return input;
}


// ==========================================
// DISPLAY MESSAGES
// ==========================================

function showMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = type;
}


// ==========================================
// SHOW AUTH FORM
// ==========================================

function showAuthForm(form) {
    signupForm.classList.remove("active");
    loginForm.classList.remove("active");
    forgotPasswordForm.classList.remove("active");

    form.classList.add("active");

    authMessage.className = "";
    authMessage.textContent = "";

    authSwitchContainer.style.display =
        form === forgotPasswordForm ? "none" : "block";
}


// ==========================================
// SWITCH SIGNUP / LOGIN
// ==========================================

switchAuth.addEventListener("click", () => {
    const signupActive = signupForm.classList.contains("active");

    showAuthForm(signupActive ? loginForm : signupForm);

    switchText.textContent = signupActive
        ? "Don't have an account?"
        : "Already have an account?";

    switchAuth.textContent = signupActive
        ? "Create Account"
        : "Sign In";
});


// ==========================================
// OPEN FORGOT PASSWORD FORM
// ==========================================

forgotPasswordLink.addEventListener("click", () => {
    const loginEnrollment =
        document.getElementById("loginEnrollment").value.trim();

    document.getElementById("forgotEnrollment").value =
        loginEnrollment;

    showAuthForm(forgotPasswordForm);
});


// ==========================================
// BACK TO LOGIN
// ==========================================

backToLogin.addEventListener("click", () => {
    showAuthForm(loginForm);
});


// ==========================================
// UNIVERSITY EMAIL PREVIEW
// ==========================================

signupEnrollment.addEventListener("input", () => {
    const enrollment = normalizeEnrollment(signupEnrollment.value);

    emailPreview.textContent = enrollment
        ? `${enrollment.toLowerCase()}@bennett.edu.in`
        : "your-enrollment@bennett.edu.in";
});


// ==========================================
// SIGN UP
// ==========================================

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.getElementById("signupButton");

    const fullName = document
        .getElementById("signupName")
        .value.trim();

    const enrollment = normalizeEnrollment(signupEnrollment.value);

    const password = document.getElementById("signupPassword").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (!fullName) {
        showMessage("Please enter your full name.", "error");
        return;
    }

    if (!enrollment) {
        showMessage(
            "Enter a valid enrollment number or Bennett university email.",
            "error"
        );
        return;
    }

    if (password.length < 8) {
        showMessage(
            "Password must contain at least 8 characters.",
            "error"
        );
        return;
    }

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "error");
        return;
    }

    const email = `${enrollment.toLowerCase()}@bennett.edu.in`;

    button.disabled = true;
    button.textContent = "Creating Account...";
    authMessage.className = "";

    try {
        const { data, error } =
            await window.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo:
                        `${window.location.origin}/index.html`,
                    data: {
                        full_name: fullName,
                        enrollment_number: enrollment
                    }
                }
            });

        if (error) throw error;

        if (data.session) {
            showMessage(
                "Account created successfully! Redirecting...",
                "success"
            );

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } else {
            showMessage(
                `Account created! Check ${email} for your verification email. Verify your email before signing in.`,
                "success"
            );

            signupForm.reset();
            emailPreview.textContent =
                "your-enrollment@bennett.edu.in";
        }

    } catch (error) {
        console.error("Signup error:", error);

        showMessage(
            error.message || "Something went wrong during signup.",
            "error"
        );

    } finally {
        button.disabled = false;
        button.textContent = "Create Account";
    }
});


// ==========================================
// LOGIN
// ==========================================

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.getElementById("loginButton");

    const enrollment = normalizeEnrollment(
        document.getElementById("loginEnrollment").value
    );

    const password =
        document.getElementById("loginPassword").value;

    if (!enrollment) {
        showMessage(
            "Enter a valid enrollment number or Bennett university email.",
            "error"
        );
        return;
    }

    if (!password) {
        showMessage("Please enter your password.", "error");
        return;
    }

    const email = `${enrollment.toLowerCase()}@bennett.edu.in`;

    button.disabled = true;
    button.textContent = "Signing In...";
    authMessage.className = "";

    try {
        const { data, error } =
            await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) throw error;

        showMessage(
            "Login successful! Redirecting...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch (error) {
        console.error("Login error:", error);

        if (
            error.message &&
            error.message.toLowerCase().includes("email not confirmed")
        ) {
            showMessage(
                "Please verify your university email before signing in.",
                "error"
            );
        } else {
            showMessage(
                "Login failed. Check your enrollment number and password.",
                "error"
            );
        }

    } finally {
        button.disabled = false;
        button.textContent = "Sign In";
    }
});


// ==========================================
// FORGOT PASSWORD
// ==========================================

forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = document.getElementById("resetEmailButton");

    const enrollment = normalizeEnrollment(
        document.getElementById("forgotEnrollment").value
    );

    if (!enrollment) {
        showMessage(
            "Enter a valid enrollment number or Bennett university email.",
            "error"
        );
        return;
    }

    const email = `${enrollment.toLowerCase()}@bennett.edu.in`;

    button.disabled = true;
    button.textContent = "Sending...";

    authMessage.className = "";

    try {
        const { error } =
            await window.supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        `${window.location.origin}/reset-password.html`
                }
            );

        if (error) throw error;

        showMessage(
            `If an account exists for ${email}, a password reset link will be sent. Check your inbox and spam folder.`,
            "success"
        );

    } catch (error) {
        console.error("Password reset request error:", error);

        showMessage(
            error.message || "Unable to send the reset email. Please try again.",
            "error"
        );

    } finally {
        button.disabled = false;
        button.textContent = "Send Reset Link";
    }
});


console.log("CampusCompass authentication initialized.");
