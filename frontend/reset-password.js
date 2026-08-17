// =====================================
// RESET PASSWORD
// =====================================

const USE_LOCAL_BACKEND =
    window.location.protocol === "file:" ||
    ["5500", "5173", "3000"].includes(window.location.port);
const API =
    USE_LOCAL_BACKEND
        ? "http://localhost:8080/api"
        : "/api";

const form = document.getElementById("resetForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    message.innerHTML = "";
    message.style.color = "black";

    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    if (email === "") {

        message.style.color = "red";
        message.innerHTML = "Please enter your email.";

        return;
    }

    if (newPassword === "") {

        message.style.color = "red";
        message.innerHTML = "Please enter a new password.";

        return;
    }

    try {

        const response = await fetch(API + "/admin/reset-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: email,
                newPassword: newPassword

            })

        });

        const result = await response.text();

        if (response.ok) {

            message.style.color = "green";
            message.innerHTML = result;

            setTimeout(function () {

                window.location.href = "login.html";

            }, 2000);

        } else {

            message.style.color = "red";
            message.innerHTML = result;

        }

    } catch (error) {

        console.error(error);

        message.style.color = "red";
        message.innerHTML = "Server Error! Please try again.";

    }

});
