// ======================================================
// AARAMBH LUMINOUS LEARNING
// ADMIN DASHBOARD - FULL BACKEND INTEGRATION
// ======================================================

const USE_LOCAL_BACKEND =
    window.location.protocol === "file:" ||
    ["5500", "5173", "3000"].includes(window.location.port);
const API_BASE_URL =
    USE_LOCAL_BACKEND
        ? "http://localhost:8080/api"
        : "/api";

let leads = [];
let payments = [];
let importedPayments = [];
const PAYMENT_IMPORT_STORAGE_KEY =
    "aarambhImportedPayments";


// ======================================================
// DOM ELEMENTS
// ======================================================

const menuItems = document.querySelectorAll("#menu li");
const pages = document.querySelectorAll(".page");

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const logoutBtn = document.getElementById("logoutBtn");

const leadList = document.getElementById("leadList");
const deleteLeadList = document.getElementById("deleteLeadList");
const leadSearchInput = document.getElementById("leadSearchInput");
const leadDateFilter = document.getElementById("leadDateFilter");
const leadFilterBtn = document.getElementById("leadFilterBtn");
const leadClearFilterBtn = document.getElementById("leadClearFilterBtn");
const leadFilterStatus = document.getElementById("leadFilterStatus");

const excelBtn = document.getElementById("excelBtn");
const csvBtn = document.getElementById("csvBtn");

const paymentList = document.getElementById("paymentList");
const paymentFileInput = document.getElementById("paymentFileInput");
const paymentUploadStatus = document.getElementById("paymentUploadStatus");
const paymentSearchInput = document.getElementById("paymentSearchInput");
const paymentSearchBtn = document.getElementById("paymentSearchBtn");
const paymentClearSearchBtn = document.getElementById("paymentClearSearchBtn");
const paymentSearchStatus = document.getElementById("paymentSearchStatus");

const viewModal = document.getElementById("viewModal");
const viewDetails = document.getElementById("viewLeadDetails");
const closeViewBtn = document.getElementById("closeViewBtn");

const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const resetModal = document.getElementById("resetModal");
const closeResetBtn = document.getElementById("closeResetBtn");
const sendVerificationBtn = document.getElementById("sendVerificationBtn");
const adminEmailInput = document.getElementById("adminEmail");


// ======================================================
// PAGE START
// ======================================================

document.addEventListener("DOMContentLoaded", async function () {

    protectDashboard();

    importedPayments = loadImportedPayments();

    await Promise.all([
        loadLeads(),
        loadPayments()
    ]);
});


// ======================================================
// ADMIN SESSION PROTECTION
// ======================================================

function protectDashboard() {

    const adminLoggedIn =
        localStorage.getItem("adminLoggedIn");

    const adminRole =
        localStorage.getItem("adminRole");

    if (
        adminLoggedIn !== "true" ||
        adminRole !== "ADMIN"
    ) {

        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminLoginTime");

        window.location.replace("login.html");
    }
}


// ======================================================
// SIDEBAR NAVIGATION
// ======================================================

menuItems.forEach(function (item) {

    item.addEventListener("click", function () {

        const pageName =
            item.getAttribute("data-page");

        pages.forEach(function (page) {
            page.classList.remove("active-page");
        });

        const selectedPage =
            document.getElementById(pageName);

        if (selectedPage) {
            selectedPage.classList.add("active-page");
        }

        if (pageName === "leads") {
            loadLeads();
        }

        menuItems.forEach(function (menuItem) {
            menuItem.classList.remove("active");
        });

        item.classList.add("active");

        if (sidebar) {
            sidebar.classList.remove("show");
        }
    });
});


// ======================================================
// MOBILE MENU
// ======================================================

if (menuBtn && sidebar) {

    menuBtn.addEventListener("click", function () {
        sidebar.classList.toggle("show");
    });
}


// ======================================================
// LOGOUT
// ======================================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", function () {

        const confirmed =
            confirm("Are you sure you want to logout?");

        if (!confirmed) {
            return;
        }

        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminEmail");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminLoginTime");

        window.location.replace("login.html");
    });
}


// ======================================================
// LOAD ALL LEADS FROM BACKEND
// ======================================================

async function loadLeads() {

    if (leadList) {
        leadList.innerHTML =
            createMessageBox("Loading leads...");
    }

    try {

        const response = await fetch(
            API_BASE_URL + "/leads"
        );

        if (!response.ok) {

            const message =
                await readErrorMessage(response);

            throw new Error(
                message || "Unable to load leads."
            );
        }

        const data = await response.json();

        leads = Array.isArray(data) ? data : [];

        applyLeadFilters();
        displayDeleteLeads();
        updateDashboardCards();

    } catch (error) {

        console.error("Load leads error:", error);

        if (leadList) {

            leadList.innerHTML =
                createMessageBox(
                    error.message ||
                    "Unable to load leads."
                );
        }

        if (deleteLeadList) {

            deleteLeadList.innerHTML =
                createMessageBox(
                    "Unable to load lead records."
                );
        }
    }
}


// ======================================================
// DISPLAY LEADS
// ======================================================

function displayLeads(leadData) {

    if (!leadList) {
        return;
    }

    leadList.innerHTML = "";

    if (!leadData || leadData.length === 0) {

        leadList.innerHTML =
            createMessageBox("No leads found.");

        return;
    }

    leadData.forEach(function (lead) {

        leadList.innerHTML +=
            createLeadCard(lead, false);
    });
}


// ======================================================
// FILTER VIEW LEADS
// ======================================================

if (leadFilterBtn) {

    leadFilterBtn.addEventListener(
        "click",
        applyLeadFilters
    );
}


if (leadSearchInput) {

    leadSearchInput.addEventListener(
        "input",
        applyLeadFilters
    );

    leadSearchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                applyLeadFilters();
            }
        }
    );
}


if (leadDateFilter) {

    leadDateFilter.addEventListener(
        "change",
        applyLeadFilters
    );
}


if (leadClearFilterBtn) {

    leadClearFilterBtn.addEventListener(
        "click",
        function () {

            if (leadSearchInput) {
                leadSearchInput.value = "";
            }

            if (leadDateFilter) {
                leadDateFilter.value = "";
            }

            displayLeads(leads);
            showLeadFilterStatus("");
        }
    );
}


function applyLeadFilters() {

    const searchValue =
        leadSearchInput
            ? leadSearchInput.value.trim()
            : "";

    const selectedDate =
        leadDateFilter
            ? leadDateFilter.value
            : "";

    if (searchValue === "" && selectedDate === "") {

        displayLeads(leads);
        showLeadFilterStatus("");
        return;
    }

    const normalizedSearch =
        normalizeSearchText(searchValue);

    const normalizedPhoneSearch =
        normalizePhoneText(searchValue);

    const filteredLeads =
        leads.filter(function (lead) {

            const textMatches =
                searchValue === "" ||
                [
                    lead.fullName,
                    lead.email,
                    lead.city,
                    lead.college,
                    lead.course,
                    lead.service,
                    lead.interest,
                    lead.source
                ]
                    .filter(Boolean)
                    .some(function (value) {

                        return normalizeSearchText(value)
                            .includes(normalizedSearch);
                    });

            const phoneMatches =
                searchValue === "" ||
                (
                    normalizedPhoneSearch !== "" &&
                    normalizePhoneText(lead.phone)
                        .includes(normalizedPhoneSearch)
                );

            const dateMatches =
                selectedDate === "" ||
                String(lead.createdAt || "")
                    .substring(0, 10) === selectedDate;

            return (
                (textMatches || phoneMatches) &&
                dateMatches
            );
        });

    displayLeads(filteredLeads);

    showLeadFilterStatus(
        filteredLeads.length +
        " lead record(s) found."
    );
}


function showLeadFilterStatus(message) {

    if (!leadFilterStatus) {
        return;
    }

    leadFilterStatus.textContent =
        message || "";
}


// ======================================================
// CREATE LEAD CARD
// ======================================================

function createLeadCard(lead, showDeleteButton) {

    const name =
        escapeHtml(lead.fullName || "Not Available");

    const email =
        escapeHtml(lead.email || "Not Available");

    const course =
        escapeHtml(
            lead.course ||
            lead.service ||
            lead.interest ||
            "Not Available"
        );

    const phone =
        escapeHtml(lead.phone || "Not Available");

    const source =
        escapeHtml(lead.source || "Website");

    const createdDate =
        formatDateTime(lead.createdAt);

    const leadId =
        Number(lead.id);

    return `
        <div class="lead-card">

            <h3>${name}</h3>

            <p>
                <strong>Email:</strong>
                ${email}
            </p>

            <p>
                <strong>Phone:</strong>
                ${phone}
            </p>

            <p>
                <strong>Course/Service:</strong>
                ${course}
            </p>

            <p>
                <strong>Source:</strong>
                ${source}
            </p>

            <p>
                <strong>Date:</strong>
                ${createdDate}
            </p>

            ${
                showDeleteButton
                    ? `
                        <button
                            class="delete-btn"
                            onclick="deleteLead(${leadId})">
                            Delete Lead
                        </button>
                      `
                    : `
                        <button
                            class="view-btn"
                            onclick="viewLead(${leadId})">
                            View Details
                        </button>
                      `
            }

        </div>
    `;
}


// ======================================================
// VIEW COMPLETE LEAD DETAILS
// ======================================================

function viewLead(id) {

    const lead = leads.find(function (item) {
        return Number(item.id) === Number(id);
    });

    if (!lead) {

        alert("Lead details not found.");

        return;
    }

    if (!viewDetails || !viewModal) {
        return;
    }

    viewDetails.innerHTML = `

        <h3>
            ${escapeHtml(lead.fullName || "Not Available")}
        </h3>

        <p>
            <strong>Email:</strong>
            ${escapeHtml(lead.email || "Not Available")}
        </p>

        <p>
            <strong>Phone:</strong>
            ${escapeHtml(lead.phone || "Not Available")}
        </p>

        <p>
            <strong>City:</strong>
            ${escapeHtml(lead.city || "Not Available")}
        </p>

        <p>
            <strong>College:</strong>
            ${escapeHtml(lead.college || "Not Available")}
        </p>

        <p>
            <strong>Course:</strong>
            ${escapeHtml(lead.course || "Not Available")}
        </p>

        <p>
            <strong>Year of Study:</strong>
            ${escapeHtml(lead.yearOfStudy || "Not Available")}
        </p>

        <p>
            <strong>Interest:</strong>
            ${escapeHtml(lead.interest || "Not Available")}
        </p>

        <p>
            <strong>Research Experience:</strong>
            ${escapeHtml(
                lead.researchExperience ||
                "Not Available"
            )}
        </p>

        <p>
            <strong>Service:</strong>
            ${escapeHtml(lead.service || "Not Available")}
        </p>

        <p>
            <strong>Message:</strong>
            ${escapeHtml(lead.message || "Not Available")}
        </p>

        <p>
            <strong>Source:</strong>
            ${escapeHtml(lead.source || "Website")}
        </p>

        <p>
            <strong>Submitted On:</strong>
            ${formatDateTime(lead.createdAt)}
        </p>
    `;

    viewModal.style.display = "flex";
}


window.viewLead = viewLead;


if (closeViewBtn && viewModal) {

    closeViewBtn.addEventListener("click", function () {
        viewModal.style.display = "none";
    });
}


// ======================================================
// DELETE LEAD LIST
// ======================================================

function displayDeleteLeads() {

    if (!deleteLeadList) {
        return;
    }

    deleteLeadList.innerHTML = "";

    if (leads.length === 0) {

        deleteLeadList.innerHTML =
            createMessageBox(
                "No lead records available."
            );

        return;
    }

    leads.forEach(function (lead) {

        deleteLeadList.innerHTML +=
            createLeadCard(lead, true);
    });
}


// ======================================================
// DELETE LEAD FROM BACKEND
// ======================================================

async function deleteLead(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this lead?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            API_BASE_URL + "/leads/" + id,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const message =
                await readErrorMessage(response);

            throw new Error(
                message || "Unable to delete lead."
            );
        }

        leads = leads.filter(function (lead) {
            return Number(lead.id) !== Number(id);
        });

        applyLeadFilters();
        displayDeleteLeads();
        updateDashboardCards();

        alert("Lead deleted successfully.");

    } catch (error) {

        console.error("Delete lead error:", error);

        alert(
            error.message ||
            "Unable to delete lead."
        );
    }
}


window.deleteLead = deleteLead;


// ======================================================
// LOAD PAYMENTS FROM BACKEND
// ======================================================

async function loadPayments() {

    if (paymentList) {

        paymentList.innerHTML =
            createMessageBox("Loading payments...");
    }

    try {

        const response = await fetch(
            API_BASE_URL + "/payments"
        );

        if (!response.ok) {

            const message =
                await readErrorMessage(response);

            throw new Error(
                message || "Unable to load payments."
            );
        }

        const data = await response.json();

        const backendPayments =
            Array.isArray(data) ? data : [];

        payments = backendPayments.concat(importedPayments);

        displayPayments();
        updateDashboardCards();

    } catch (error) {

        console.error("Load payments error:", error);

        if (paymentList) {

            if (importedPayments.length > 0) {

                payments = importedPayments.slice();
                displayPayments();
                updateDashboardCards();

                showPaymentUploadStatus(
                    "Showing uploaded payments. Backend payments could not be loaded.",
                    true
                );

            } else {

                paymentList.innerHTML =
                    createMessageBox(
                        error.message ||
                        "Unable to load payments."
                    );
            }
        }
    }
}


// ======================================================
// DISPLAY PAYMENTS
// ======================================================

function displayPayments(paymentRecords) {

    if (!paymentList) {
        return;
    }

    const recordsToDisplay =
        Array.isArray(paymentRecords)
            ? paymentRecords
            : payments;

    paymentList.innerHTML = "";

    if (recordsToDisplay.length === 0) {

        paymentList.innerHTML =
            createMessageBox(
                "No payment records found."
            );

        return;
    }

    recordsToDisplay.forEach(function (payment) {

        const paymentId =
            payment.id;

        const deleteAction =
            escapeHtml(String(paymentId));

        const name =
            escapeHtml(
                payment.fullName || "Not Available"
            );

        const email =
            escapeHtml(
                payment.email || "Not Available"
            );

        const phone =
            escapeHtml(
                payment.phone || "Not Available"
            );

        const course =
            escapeHtml(
                payment.courseName || "Not Available"
            );

        const amount =
            formatPaymentAmount(payment.amount);

        const status =
            escapeHtml(
                payment.status || "UNKNOWN"
            );

        const orderId =
            escapeHtml(
                payment.razorpayOrderId ||
                "Not Available"
            );

        const razorpayPaymentId =
            escapeHtml(
                payment.razorpayPaymentId ||
                "Pending"
            );

        const paymentMethod =
            escapeHtml(
                payment.paymentMethod ||
                "Pending"
            );

        const date =
            formatDateTime(
                payment.paidAt ||
                payment.createdAt
            );

        const importedDetails =
            createImportedPaymentDetails(payment);

        paymentList.innerHTML += `

            <div class="payment-card">

                <h3>${name}</h3>

                <p>
                    <strong>Email:</strong>
                    ${email}
                </p>

                <p>
                    <strong>Phone:</strong>
                    ${phone}
                </p>

                <p>
                    <strong>Course:</strong>
                    ${course}
                </p>

                <p>
                    <strong>Amount:</strong>
                    ${amount}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${status}
                </p>

                <p>
                    <strong>Method:</strong>
                    ${paymentMethod}
                </p>

                <p>
                    <strong>Order ID:</strong>
                    ${orderId}
                </p>

                <p>
                    <strong>Payment ID:</strong>
                    ${razorpayPaymentId}
                </p>

                <p>
                    <strong>Date:</strong>
                    ${date}
                </p>

                ${importedDetails}

                <button
                    class="delete-btn"
                    onclick="deletePayment('${deleteAction}')">
                    Delete Payment
                </button>

            </div>
        `;
    });
}


// ======================================================
// DELETE PAYMENT RECORD
// ======================================================

async function deletePayment(id) {

    const paymentId =
        String(id);

    const confirmed =
        confirm(
            "Are you sure you want to delete this payment record?"
        );

    if (!confirmed) {
        return;
    }

    if (paymentId.startsWith("imported-")) {

        importedPayments =
            importedPayments.filter(function (payment) {

                return String(payment.id) !== paymentId;
            });

        saveImportedPayments();

        payments =
            payments.filter(function (payment) {

                return String(payment.id) !== paymentId;
            });

        displayPayments();
        updateDashboardCards();

        showPaymentUploadStatus(
            "Uploaded payment record removed.",
            false
        );

        return;
    }

    try {

        const response = await fetch(
            API_BASE_URL + "/payments/" + paymentId,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            const message =
                await readErrorMessage(response);

            throw new Error(
                message ||
                "Unable to delete payment record."
            );
        }

        payments = payments.filter(function (payment) {

            return Number(payment.id) !== Number(paymentId);
        });

        displayPayments();
        updateDashboardCards();

        alert(
            "Payment record deleted successfully."
        );

    } catch (error) {

        console.error(
            "Delete payment error:",
            error
        );

        alert(
            error.message ||
            "Unable to delete payment record."
        );
    }
}


window.deletePayment = deletePayment;


// ======================================================
// FILTER PAYMENTS
// ======================================================

if (paymentSearchBtn) {

    paymentSearchBtn.addEventListener(
        "click",
        filterPayments
    );
}


if (paymentSearchInput) {

    paymentSearchInput.addEventListener(
        "input",
        filterPayments
    );

    paymentSearchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {
                filterPayments();
            }
        }
    );
}


if (paymentClearSearchBtn) {

    paymentClearSearchBtn.addEventListener(
        "click",
        function () {

            if (paymentSearchInput) {
                paymentSearchInput.value = "";
            }

            displayPayments();
            showPaymentSearchStatus("");
        }
    );
}


function filterPayments() {

    const searchValue =
        paymentSearchInput
            ? paymentSearchInput.value.trim()
            : "";

    if (searchValue === "") {

        displayPayments();
        showPaymentSearchStatus("");
        return;
    }

    const normalizedSearch =
        normalizeSearchText(searchValue);

    const normalizedPhoneSearch =
        normalizePhoneText(searchValue);

    const filteredPayments =
        payments.filter(function (payment) {

            const name =
                normalizeSearchText(payment.fullName);

            const phone =
                normalizePhoneText(payment.phone);

            const uploadedDetails =
                getPaymentImportedSearchText(payment);

            const nameMatches =
                name.includes(normalizedSearch);

            const uploadedTextMatches =
                uploadedDetails.includes(normalizedSearch);

            const phoneMatches =
                normalizedPhoneSearch !== "" &&
                (
                    phone.includes(normalizedPhoneSearch) ||
                    normalizePhoneText(uploadedDetails)
                        .includes(normalizedPhoneSearch)
                );

            return (
                nameMatches ||
                uploadedTextMatches ||
                phoneMatches
            );
        });

    displayPayments(filteredPayments);

    showPaymentSearchStatus(
        filteredPayments.length +
        " payment record(s) found."
    );
}


function normalizeSearchText(value) {

    return String(value || "")
        .toLowerCase()
        .trim();
}


function normalizePhoneText(value) {

    return String(value || "")
        .replace(/\D/g, "");
}


function getPaymentImportedSearchText(payment) {

    if (!Array.isArray(payment.importedDetails)) {
        return "";
    }

    return payment.importedDetails
        .map(function (detail) {

            return [
                detail.label,
                detail.value
            ].join(" ");
        })
        .join(" ")
        .toLowerCase();
}


function showPaymentSearchStatus(message) {

    if (!paymentSearchStatus) {
        return;
    }

    paymentSearchStatus.textContent =
        message || "";
}


// ======================================================
// IMPORT PAYMENTS FROM EXCEL OR CSV
// ======================================================

if (paymentFileInput) {

    paymentFileInput.addEventListener(
        "change",
        handlePaymentFileUpload
    );
}


async function handlePaymentFileUpload(event) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }

    try {

        showPaymentUploadStatus(
            "Reading payment file...",
            false
        );

        const rows =
            await readPaymentRowsFromFile(file);

        const normalizedPayments =
            normalizeImportedPayments(rows);

        if (normalizedPayments.length === 0) {
            throw new Error(
                "No payment rows found. Include columns like Name, Email, Phone, Course, Amount, Status, Payment ID, and Date."
            );
        }

        importedPayments = normalizedPayments;
        saveImportedPayments();

        await loadPayments();

        showPaymentUploadStatus(
            "Imported " + normalizedPayments.length + " payment record(s).",
            false
        );

    } catch (error) {

        console.error("Payment upload error:", error);

        showPaymentUploadStatus(
            error.message ||
            "Unable to import payment file.",
            true
        );
    }

    event.target.value = "";
}


function readPaymentRowsFromFile(file) {

    const fileName =
        file.name.toLowerCase();

    if (fileName.endsWith(".csv")) {

        return file
            .text()
            .then(function (content) {

                return parseCsvRows(content);
            });
    }

    if (
        fileName.endsWith(".xlsx") ||
        fileName.endsWith(".xls")
    ) {

        if (!window.XLSX) {
            return Promise.reject(
                new Error(
                    "Excel reader is still loading. Please try again in a moment."
                )
            );
        }

        return file
            .arrayBuffer()
            .then(function (buffer) {

                const workbook =
                    window.XLSX.read(buffer, {
                        type: "array"
                    });

                const firstSheetName =
                    workbook.SheetNames[0];

                const worksheet =
                    workbook.Sheets[firstSheetName];

                return window.XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: "",
                        raw: false
                    }
                );
            });
    }

    return Promise.reject(
        new Error(
            "Please upload a CSV, XLSX, or XLS file."
        )
    );
}


function parseCsvRows(content) {

    const rows = [];
    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let index = 0; index < content.length; index += 1) {

        const character =
            content[index];

        const nextCharacter =
            content[index + 1];

        if (character === "\"" && insideQuotes && nextCharacter === "\"") {

            value += "\"";
            index += 1;

        } else if (character === "\"") {

            insideQuotes = !insideQuotes;

        } else if (character === "," && !insideQuotes) {

            row.push(value);
            value = "";

        } else if (
            (character === "\n" || character === "\r") &&
            !insideQuotes
        ) {

            if (character === "\r" && nextCharacter === "\n") {
                index += 1;
            }

            row.push(value);
            rows.push(row);
            row = [];
            value = "";

        } else {

            value += character;
        }
    }

    if (value !== "" || row.length > 0) {
        row.push(value);
        rows.push(row);
    }

    const headerRow =
        rows.shift() || [];

    return rows
        .filter(function (dataRow) {

            return dataRow.some(function (cell) {

                return String(cell).trim() !== "";
            });
        })
        .map(function (dataRow) {

            const record = {};

            headerRow.forEach(function (header, index) {

                record[String(header).trim()] =
                    dataRow[index] || "";
            });

            return record;
        });
}


function normalizeImportedPayments(rows) {

    return rows
        .map(function (row, index) {

            const payment = {
                id: "imported-" + Date.now() + "-" + index,
                fullName: getPaymentField(row, [
                    "fullName",
                    "name",
                    "studentName",
                    "customerName"
                ]),
                email: getPaymentField(row, [
                    "email",
                    "mail",
                    "emailId",
                    "studentEmail",
                    "personalEmailId"
                ]),
                phone: getPaymentField(row, [
                    "phone",
                    "phoneNumber",
                    "mobile",
                    "mobileNumber",
                    "contact",
                    "contactNumber",
                    "contactNo"
                ]),
                courseName: getPaymentField(row, [
                    "courseName",
                    "course",
                    "service",
                    "program",
                    "courseService"
                ]),
                amount: parseImportedAmount(
                    getPaymentField(row, [
                        "amount",
                        "paidAmount",
                        "paymentAmount",
                        "price",
                        "fees",
                        "totalAmount"
                    ])
                ),
                currency: getPaymentField(row, [
                    "currency"
                ]) || "INR",
                status: getPaymentField(row, [
                    "status",
                    "paymentStatus"
                ]) || "IMPORTED",
                paymentMethod: getPaymentField(row, [
                    "paymentMethod",
                    "method",
                    "mode",
                    "paymentMode"
                ]),
                razorpayOrderId: getPaymentField(row, [
                    "razorpayOrderId",
                    "orderId",
                    "razorpay_order_id"
                ]),
                razorpayPaymentId: getPaymentField(row, [
                    "razorpayPaymentId",
                    "paymentId",
                    "transactionId",
                    "txnId",
                    "razorpay_payment_id"
                ]),
                receiptNumber: getPaymentField(row, [
                    "receiptNumber",
                    "receipt"
                ]),
                paidAt: getPaymentField(row, [
                    "paidAt",
                    "paymentDate",
                    "date",
                    "doj",
                    "d.o.j"
                ]),
                createdAt: getPaymentField(row, [
                    "createdAt",
                    "createdDate"
                ]),
                bankAccountNo: getPaymentField(row, [
                    "bankAccountNo",
                    "accountNo",
                    "accountNumber",
                    "bankAccountNumber"
                ]),
                ifscCode: getPaymentField(row, [
                    "ifscCode",
                    "ifsc"
                ]),
                branchName: getPaymentField(row, [
                    "branchName",
                    "branch"
                ]),
                importedDetails: getImportedDetails(row)
            };

            return payment;
        })
        .filter(function (payment) {

            return [
                payment.fullName,
                payment.email,
                payment.phone,
                payment.courseName,
                payment.amount,
                payment.razorpayPaymentId,
                payment.razorpayOrderId,
                payment.bankAccountNo,
                payment.ifscCode,
                payment.branchName
            ].some(function (value) {

                return String(value || "").trim() !== "";
            });
        });
}


function getImportedDetails(row) {

    const details = [];

    Object.keys(row).forEach(function (key) {

        const label =
            String(key).trim();

        const value =
            row[key];

        if (label === "" || String(value || "").trim() === "") {
            return;
        }

        details.push({
            label: label,
            value: String(value).trim()
        });
    });

    return details;
}


function createImportedPaymentDetails(payment) {

    const details =
        Array.isArray(payment.importedDetails)
            ? payment.importedDetails
            : [];

    const extraDetails =
        details.filter(function (detail) {

            return (
                detail &&
                String(detail.label || "").trim() !== "" &&
                String(detail.value || "").trim() !== ""
            );
        });

    if (extraDetails.length === 0) {
        return "";
    }

    const rows =
        extraDetails
            .map(function (detail) {

                return `
                    <p>
                        <strong>${escapeHtml(detail.label)}:</strong>
                        ${escapeHtml(detail.value)}
                    </p>
                `;
            })
            .join("");

    return `
        <div class="imported-payment-details">
            <h4>Uploaded File Details</h4>
            ${rows}
        </div>
    `;
}


function getPaymentField(row, aliases) {

    const normalizedRow = {};

    Object.keys(row).forEach(function (key) {

        normalizedRow[normalizeColumnName(key)] =
            row[key];
    });

    for (let index = 0; index < aliases.length; index += 1) {

        const value =
            normalizedRow[
                normalizeColumnName(aliases[index])
            ];

        if (value !== undefined && String(value).trim() !== "") {
            return String(value).trim();
        }
    }

    return "";
}


function normalizeColumnName(value) {

    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}


function parseImportedAmount(value) {

    const parsedAmount =
        Number(
            String(value || "")
                .replace(/[^0-9.-]/g, "")
        );

    return Number.isFinite(parsedAmount)
        ? parsedAmount
        : "";
}


function loadImportedPayments() {

    try {

        const savedPayments =
            JSON.parse(
                localStorage.getItem(PAYMENT_IMPORT_STORAGE_KEY) || "[]"
            );

        return Array.isArray(savedPayments)
            ? savedPayments
            : [];

    } catch (error) {

        console.error("Load imported payments error:", error);
        return [];
    }
}


function saveImportedPayments() {

    localStorage.setItem(
        PAYMENT_IMPORT_STORAGE_KEY,
        JSON.stringify(importedPayments)
    );
}


function showPaymentUploadStatus(message, isError) {

    if (!paymentUploadStatus) {
        return;
    }

    paymentUploadStatus.textContent =
        message || "";

    paymentUploadStatus.classList.toggle(
        "error",
        Boolean(isError)
    );
}


// ======================================================
// DASHBOARD SUMMARY CARDS
// ======================================================

function updateDashboardCards() {

    const dashboardCards =
        document.querySelectorAll(
            "#dashboard .cards .card h2"
        );

    const totalLeads =
        leads.length;

    const qualifiedLeads =
        leads.filter(function (lead) {

            const text = [
                lead.interest,
                lead.service,
                lead.course
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes("qualified");
        }).length;

    const pendingPayments =
        payments.filter(function (payment) {

            const status =
                String(payment.status || "")
                    .toUpperCase();

            return ![
                "PAID",
                "CAPTURED"
            ].includes(status);
        }).length;

    const successfulPayments =
        payments.filter(function (payment) {

            const status =
                String(payment.status || "")
                    .toUpperCase();

            return [
                "PAID",
                "CAPTURED"
            ].includes(status);
        }).length;

    if (dashboardCards.length >= 4) {

        dashboardCards[0].textContent =
            totalLeads;

        dashboardCards[1].textContent =
            qualifiedLeads;

        dashboardCards[2].textContent =
            pendingPayments;

        dashboardCards[3].textContent =
            successfulPayments;
    }
}


// ======================================================
// EXPORT CSV
// ======================================================

if (csvBtn) {

    csvBtn.addEventListener("click", function () {

        if (leads.length === 0) {

            alert("No lead data available to export.");

            return;
        }

        const headers = [
            "ID",
            "Full Name",
            "Phone",
            "Email",
            "City",
            "College",
            "Course",
            "Year Of Study",
            "Interest",
            "Research Experience",
            "Service",
            "Message",
            "Source",
            "Created At"
        ];

        const rows = leads.map(function (lead) {

            return [
                lead.id,
                lead.fullName,
                lead.phone,
                lead.email,
                lead.city,
                lead.college,
                lead.course,
                lead.yearOfStudy,
                lead.interest,
                lead.researchExperience,
                lead.service,
                lead.message,
                lead.source,
                lead.createdAt
            ];
        });

        downloadCsvFile(
            "aarambh-leads.csv",
            headers,
            rows
        );
    });
}


// ======================================================
// EXPORT EXCEL-COMPATIBLE CSV
// ======================================================

if (excelBtn) {

    excelBtn.addEventListener("click", function () {

        if (leads.length === 0) {

            alert("No lead data available to export.");

            return;
        }

        const headers = [
            "ID",
            "Full Name",
            "Phone",
            "Email",
            "City",
            "College",
            "Course",
            "Year Of Study",
            "Interest",
            "Research Experience",
            "Service",
            "Message",
            "Source",
            "Created At"
        ];

        const rows = leads.map(function (lead) {

            return [
                lead.id,
                lead.fullName,
                lead.phone,
                lead.email,
                lead.city,
                lead.college,
                lead.course,
                lead.yearOfStudy,
                lead.interest,
                lead.researchExperience,
                lead.service,
                lead.message,
                lead.source,
                lead.createdAt
            ];
        });

        downloadCsvFile(
            "aarambh-leads-excel.csv",
            headers,
            rows
        );
    });
}


// ======================================================
// CSV DOWNLOAD HELPER
// ======================================================

function downloadCsvFile(
    fileName,
    headers,
    rows
) {

    const allRows = [
        headers,
        ...rows
    ];

    const csvContent =
        allRows
            .map(function (row) {

                return row
                    .map(function (value) {

                        const safeValue =
                            value === null ||
                            value === undefined
                                ? ""
                                : String(value);

                        return (
                            '"' +
                            safeValue.replace(
                                /"/g,
                                '""'
                            ) +
                            '"'
                        );
                    })
                    .join(",");
            })
            .join("\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        {
            type:
                "text/csv;charset=utf-8;"
        }
    );

    const downloadUrl =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(downloadUrl);
}


// ======================================================
// COMMON HELPERS
// ======================================================

function formatCurrency(amount) {

    const numericAmount =
        Number(amount || 0);

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR"
        }
    ).format(numericAmount);
}


function formatPaymentAmount(amount) {

    if (
        amount === undefined ||
        amount === null ||
        String(amount).trim() === ""
    ) {

        return "Not Available";
    }

    return formatCurrency(amount);
}


function formatDateTime(value) {

    if (!value) {
        return "Not Available";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {

        return String(value);
    }

    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function createMessageBox(message) {

    return `
        <div class="box">
            ${escapeHtml(message)}
        </div>
    `;
}


async function readErrorMessage(response) {

    try {

        const contentType =
            response.headers.get("content-type") || "";

        if (
            contentType.includes(
                "application/json"
            )
        ) {

            const data =
                await response.json();

            return (
                data.message ||
                data.error ||
                JSON.stringify(data)
            );
        }

        return await response.text();

    } catch (error) {

        return "";
    }
}



const resetBtn = document.getElementById("resetPasswordBtn");

if (resetBtn) {

    resetBtn.addEventListener("click", async function () {

        const email = document.getElementById("resetEmail").value.trim();
        const newPassword = document.getElementById("resetNewPassword").value.trim();
        const message = document.getElementById("resetMessage");

        message.innerHTML = "";

        if (email === "" || newPassword === "") {

            message.style.color = "red";
            message.innerHTML = "Please fill all fields.";
            return;
        }

        try {

            const response = await fetch(API_BASE_URL + "/admin/reset-password", {
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
            } else {
                message.style.color = "red";
                message.innerHTML = result;
            }

        } catch (error) {
            message.style.color = "red";
            message.innerHTML = "Server Error.";
        }

    });

}
