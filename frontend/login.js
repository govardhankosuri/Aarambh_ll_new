// =====================================
// AARAMBH LUMINOUS LEARNING
// ADMIN LOGIN - BACKEND INTEGRATION
// =====================================

const USE_LOCAL_BACKEND =
    window.location.protocol === "file:" ||
    ["5500", "5173", "3000"].includes(window.location.port);
const API_BASE_URL =
    USE_LOCAL_BACKEND
        ? "http://localhost:8080/api"
        : "/api";

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");


// =====================================
// CHECK EXISTING ADMIN SESSION
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    const adminLoggedIn =
        localStorage.getItem("adminLoggedIn");

    if (adminLoggedIn === "true") {

        window.location.href = "dashboard.html";
    }
});


// =====================================
// ADMIN LOGIN
// =====================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            errorMessage.textContent = "";

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            if (email === "") {

                errorMessage.textContent =
                    "Please enter admin email.";

                return;
            }

            if (password === "") {

                errorMessage.textContent =
                    "Please enter admin password.";

                return;
            }

            const loginButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );

            const originalButtonText =
                loginButton.textContent;

            loginButton.disabled = true;

            loginButton.textContent =
                "Logging in...";

            try {

                const response = await fetch(
                    API_BASE_URL + "/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                let data;

                try {

                    data = await response.json();

                } catch (jsonError) {

                    throw new Error(
                        "Invalid response received from server."
                    );
                }

                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Invalid admin email or password."
                    );
                }

                // Create admin login session

                localStorage.setItem(
                    "adminLoggedIn",
                    "true"
                );

                localStorage.setItem(
                    "adminName",
                    data.adminName
                );

                localStorage.setItem(
                    "adminRole",
                    data.role
                );

                localStorage.setItem(
                    "adminLoginTime",
                    new Date().toISOString()
                );

                // Open dashboard

                window.location.href =
                    "dashboard.html";

            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );

                errorMessage.textContent =
                    error.message ||
                    "Unable to connect to the server.";

            } finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    originalButtonText;
            }
        }
    );
}


// =====================================
// RESET PASSWORD
// =====================================

function resetPassword() {

    alert(
        "Please contact the administrator to reset the password."
    );
}
