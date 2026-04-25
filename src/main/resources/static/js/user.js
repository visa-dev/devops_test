

//4. identify the element declare functions for dynamic data
const selectEmployeeElement = document.querySelector("#selectEmployee");
const textuserNameElement = document.querySelector("#textUsername");
const textPasswordElement = document.querySelector("#textPassword");
const textRePasswordElement = document.querySelector("#textRePassword");
const textEmailElement = document.querySelector("#textEmail");
const textNoteElement = document.querySelector("#textNote");
const textchkUserStatusElement = document.querySelector("#checkUserStatus");
const textlblUserStatusElement = document.querySelector("#lblUserStatus");
const divRole = document.querySelector("#divRolesParent");



let user = {};
let oldUser = {}; // Global oldUser for edit tracking
let rolesList = []; // Global roles list to avoid repeated fetching
// 1.browser load event
window.addEventListener("load", () => {
    $.ajax({
        url: "/role/alldatawithoutadmin",
        type: "GET",
        success: function(response) {
            rolesList = response;
        },
        error: function(xhr, status, error) {
            showAlert('Error loading roles', 'danger');
        }
    });

    refreshUserTable();
    refreshUserForm();
});


function clearElement(elements) {
    elements.forEach(el => {
        if (!el) return;

        if (el.type === "checkbox") {
            el.checked = false;
        } else if (el.tagName === "SELECT") {
            el.selectedIndex = 0;
        } else if ("value" in el) {
            el.value = "";
        }

        el.style.border = "1px solid #ced4da";
    });
}

const refreshUserTable = () => {
    $.ajax({
        url: "/user/alldata",
        type: "GET",
        success: function(users) {
            let displayProperty = [
                { dataType: "function", propertyName: getEmployee },
                { dataType: "string", propertyName: "username" },
                { dataType: "string", propertyName: "email" },
                { dataType: "function", propertyName: getRoles },
                { dataType: "function", propertyName: getUserStatus },
            ];

            let tableBodyElement = document.querySelector("#tableBodyUser");
            fillDataIntoTable(
                tableBodyElement,
                users,
                displayProperty,
                refillUserForm,
                deleteUser,
                printUser
            );
        },
        error: function(xhr, status, error) {
            showAlert('Error loading users', 'danger');
        }
    });
}
// //function to get fullaname in user js
// const getEmployeeFullName = (userOb) => {
//     const emp = userOb.employee_id;
//
//     if (!emp) return "-";
//
//     // adjust keys if backend uses different names
//     return `${emp.first_name ?? emp.firstname ?? ""} ${emp.last_name ?? emp.lastname ?? ""}`.trim();
// };

const getEmployeeName = (emp) => {
    if (!emp) return "-";
    return (emp.firstname + " " + emp.lastname).trim();
};

const getEmployee = (dataOb) => {
    const emp = dataOb.employee_id;
    return getEmployeeName(emp);
};
const getRoles = (dataOb) => {
    if (!dataOb.roles) return "-";
    let roles = "";
    dataOb.roles.forEach(role => {
        roles = roles + role.name + ", ";
    });
    return roles.replace(/, $/, "");
}
const getUserStatus = (dataOb) => {
    if (dataOb.status) {
        return `Active <i class='fa-solid fa-circle-check' style='color: rgb(99, 230, 190);'></i> 
                <button class="btn btn-sm btn-outline-danger ms-2 py-0" onclick="deactivateUser(${dataOb.id})">
                    <i class="fa-solid fa-power-off"></i> Deactivate
                </button>`;
    } else {
        return `Inactive <i class='fa-solid fa-circle-xmark' style='color: rgb(230, 117, 99);'></i> 
                <button class="btn btn-sm btn-outline-success ms-2 py-0" onclick="reactivateUser(${dataOb.id})">
                    <i class="fa-solid fa-power-off"></i> Activate
                </button>`;
    }
}

const refillUserForm = (dataOb) => {
    $.ajax({
        url: "/user/byid/" + dataOb.id,
        type: "GET",
        success: function(receivedUser) {
            if (!receivedUser || Array.isArray(receivedUser) || typeof receivedUser !== 'object') {
                user = dataOb;
            } else {
                user = receivedUser;
            }

            oldUser = JSON.parse(JSON.stringify(user));
            user.password = null;
            user.repassword = null;

            let exists = false;
            if (user.employee_id) {
                for (let i = 0; i < selectEmployeeElement.options.length; i++) {
                    let optVal = selectEmployeeElement.options[i].value;
                    if (optVal) {
                        let optObj = JSON.parse(optVal);
                        if (optObj.id === user.employee_id.id) {
                            exists = true;
                            user.employee_id = optObj;
                            break;
                        }
                    }
                }
            }

            if (!exists && user.employee_id) {
                let opt = document.createElement("option");
                opt.value = JSON.stringify(user.employee_id);
                opt.innerText = (user.employee_id.firstname || "") + " " + (user.employee_id.lastname || "");
                selectEmployeeElement.appendChild(opt);
            }

            const empJson = JSON.stringify(user.employee_id);
            $(selectEmployeeElement).val(empJson).trigger("change.select2");
            selectEmployeeElement.disabled = true;

            textuserNameElement.value = user.username || "";
            textuserNameElement.disabled = true;

            textPasswordElement.value = "";
            textRePasswordElement.value = "";
            textEmailElement.value = user.email || "";
            textEmailElement.disabled = true;

            if (user.note != undefined)
                textNoteElement.value = user.note;
            else
                textNoteElement.value = "";
            textNoteElement.disabled = true; // Read-only during edit

            if (user.status) {
                textchkUserStatusElement.checked = true;
                textlblUserStatusElement.innerText = "User Account Active";
            } else {
                textchkUserStatusElement.checked = false;
                textlblUserStatusElement.innerText = "User Account InActive";
            }
            textchkUserStatusElement.disabled = true; // Read-only during edit

            buttonUpdateUser.style.display = "block";
            buttonSubmitUser.style.display = "none";

            // Rebuild roles checkboxes
            divRole.innerHTML = "";
            rolesList.forEach(role => {
                let div = document.createElement("div");
                div.className = "form-check form-check-inline";
                let inputElement = document.createElement("input");
                inputElement.type = "checkbox";
                inputElement.className = "form-check-input";
                inputElement.disabled = false; // Manual change allowed

                // Ensure user.roles is an array
                if (!user.roles || !Array.isArray(user.roles)) {
                    user.roles = [];
                }

                // Check if user already has this role
                let hasRole = user.roles.some(rl => rl.id === role.id || rl.name === role.name);
                if (hasRole) {
                    inputElement.checked = true;
                }

                // Handle manual change
                inputElement.onclick = () => {
                    if (inputElement.checked) {
                        user.roles.push(role);
                    } else {
                        user.roles = user.roles.filter(rl => (rl.id !== role.id && rl.name !== role.name));
                    }
                };

                let labelElement = document.createElement("label");
                labelElement.className = "form-check-label fw-bold";
                labelElement.innerText = role.name;

                div.appendChild(inputElement);
                div.appendChild(labelElement);
                divRole.appendChild(div);
            });

            // Show modal AFTER everything is populated
            $("#modalUserForm").modal("show");
        },
        error: function(xhr, status, error) {
            console.error('Error loading user details:', error);
            showAlert('Error loading user details', 'danger');
        }
    });
}

const buttonUserUpdate = async () => {
    let errors = checkUserFormErrors();
    if (errors !== "") {
        showError("Validation Error", errors);
        return;
    }

    const confirmed = await confirmAction({
        title: "Update User?",
        html: `<b>Username:</b> ${user.username}<br><b>Email:</b> ${user.email}`,
        icon: "question",
        confirmText: "Update",
        confirmColor: "#0d6efd"
    });

    if (!confirmed) return;

    $.ajax({
        url: "/user/update",
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function(response) {
            if (response === "OK") {
                $("#modalUserForm").modal("hide");
                refreshUserTable();
                refreshUserForm();
                showSuccess("UPDATED!", "User updated successfully.");
            } else {
                showError("Update Failed", response);
            }
        },
        error: function(xhr, status, error) {
            showError("Error", "Failed to update user. Please try again.");
        }
    });
}
const deleteUser = async (dataOb) => {

    const user = dataOb;
    const fullname = getEmployee(user);

    const confirmed = await confirmAction({
        title: "PERMANENT Delete User?",
        html: `
            <div class="text-danger fw-bold">Warning: This action cannot be undone.</div>
            <b>Name:</b> ${fullname} <br>
            <b>Username:</b> ${user.username}
        `,
        icon: "warning",
        confirmText: "Delete Permanently",
        confirmColor: "#d33"
    });

    if (!confirmed) return;

    $.ajax({
        url: "/user/delete",
        type: "DELETE",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function(response) {
            if (response === "OK") {
                refreshUserTable();
                showSuccess("Deleted!", "User deleted successfully.");
            } else {
                showError("Delete Failed!", "User has following errors:\n" + response);
            }
        },
        error: function(xhr, status, error) {
            showError("Error", "Failed to delete user. Please try again.");
        }
    });
}

const printUser = (dataOb) => {

}

const reactivateUser = async (id) => {
    $.ajax({
        url: "/user/byid/" + id,
        type: "GET",
        success: async function(userToActivate) {
            if (!userToActivate) return;

            const confirmed = await confirmAction({
                title: "Reactivate User?",
                html: `Reactivate account for <b>${userToActivate.username}</b>?`,
                icon: "question",
                confirmText: "Activate",
                confirmColor: "#198754"
            });

            if (!confirmed) return;

            userToActivate.status = true;
            userToActivate.password = null;

            $.ajax({
                url: "/user/update",
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(userToActivate),
                success: function(response) {
                    if (response === "OK") {
                        showSuccess("Activated!", "User account reactivated successfully.");
                        refreshUserTable();
                    } else {
                        showError("Activation Failed", response);
                    }
                },
                error: function(xhr, status, error) {
                    showError("Error", "Failed to activate user. Please try again.");
                }
            });
        },
        error: function(xhr, status, error) {
            showAlert('Error loading user', 'danger');
        }
    });
}

const deactivateUser = async (id) => {
    $.ajax({
        url: "/user/byid/" + id,
        type: "GET",
        success: async function(userToDeactivate) {
            if (!userToDeactivate) return;

            const confirmed = await confirmAction({
                title: "Deactivate User?",
                html: `Deactivate account for <b>${userToDeactivate.username}</b>?<br><small>User will no longer be able to login.</small>`,
                icon: "warning",
                confirmText: "Deactivate",
                confirmColor: "#f78d8d"
            });

            if (!confirmed) return;

            userToDeactivate.status = false;
            userToDeactivate.password = null;

            $.ajax({
                url: "/user/update",
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(userToDeactivate),
                success: function(response) {
                    if (response === "OK") {
                        showSuccess("Deactivated!", "User account deactivated successfully.");
                        refreshUserTable();
                    } else {
                        showError("Deactivation Failed", response);
                    }
                },
                error: function(xhr, status, error) {
                    showError("Error", "Failed to deactivate user. Please try again.");
                }
            });
        },
        error: function(xhr, status, error) {
            showAlert('Error loading user', 'danger');
        }
    });
}



const refreshUserForm = () => {
    formUser.reset();
    user = new Object();
    user.roles = new Array();

    buttonUpdateUser.style.display = "none";
    buttonSubmitUser.style.display = "block";

    $.ajax({
        url: "/employee/listwithoutuseraccount",
        type: "GET",
        success: function(employees) {
            selectEmployeeElement.innerHTML = "";

            let defaultOpt = document.createElement("option");
            defaultOpt.value = "";
            defaultOpt.innerText = "Select Employee...!";
            defaultOpt.selected = true;
            defaultOpt.disabled = true;
            selectEmployeeElement.appendChild(defaultOpt);

            employees.forEach(emp => {
                let opt = document.createElement("option");
                opt.value = JSON.stringify(emp);
                opt.innerText = (emp.firstname || "") + " " + (emp.lastname || "");
                selectEmployeeElement.appendChild(opt);
            });

            if (typeof $ !== "undefined" && $.fn.select2) {
                $("#selectEmployee").trigger("change.select2");
            }
        },
        error: function(xhr, status, error) {
            showAlert('Error loading employees', 'danger');
        }
    });

    clearElement([
        selectEmployeeElement,
        textuserNameElement,
        textPasswordElement,
        textRePasswordElement,
        textEmailElement,
        textNoteElement,
    ]);

    selectEmployeeElement.disabled = false;
    textuserNameElement.disabled = false;
    textEmailElement.disabled = false;
    textNoteElement.disabled = false;
    textchkUserStatusElement.disabled = false;

    textchkUserStatusElement.checked = true;
    textlblUserStatusElement.innerText = "User Account Active";
    user.status = true;

    $.ajax({
        url: "/role/alldatawithoutadmin",
        type: "GET",
        success: function(roles) {
            divRole.innerHTML = "";
            roles.forEach(role => {
                let div = document.createElement("div");
                div.className = "form-check form-check-inline";
                let inputElement = document.createElement("input");
                inputElement.type = "checkbox";
                inputElement.className = "form-check-input";
                inputElement.disabled = true;

                let labelElement = document.createElement("label");
                labelElement.className = "form-check-label fw-bold";
                labelElement.innerText = role.name;

                div.appendChild(inputElement);
                div.appendChild(labelElement);
                divRole.appendChild(div);
            });
        },
        error: function(xhr, status, error) {
            showAlert('Error loading roles', 'danger');
        }
    });
};

const checkUserFormErrors = () => {
    let errors = "";

    if (!user.employee_id) {
        errors += "• Employee is required<br>";
    }

    if (!user.username) {
        errors += "• Username is required <br>";
    }

    if (!user.email) {
        errors += "• Email is required<br>";
    }

    if (!user.id && !user.password) {
        errors += "• Password is required for new user<br>";
    }

    if (user.password && !user.repassword) {
        errors += "• Passwords do not match<br>";
    }

    return errors;
};

const buttonUserSubmit = async () => {
    let errors = checkUserFormErrors();

    if (errors !== "") {
        showError("Validation Error", errors);
        return;
    }

    const confirmed = await confirmAction({
        title: "Add New User?",
        html: `<b>Username:</b> ${user.username}<br><b>Email:</b> ${user.email}`,
        icon: "info",
        confirmText: "Submit",
        confirmColor: "#198754"
    });

    if (!confirmed) return;

    $.ajax({
        url: "/user/save",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function(response) {
            if (response === "OK") {
                showSuccess("ADDED!", "User added successfully.");
                refreshUserTable();
                refreshUserForm();
                $("#modalUserForm").modal("hide");
            } else {
                showError("Save Failed", response);
            }
        },
        error: function(xhr, status, error) {
            showError("Error", "Failed to save user. Please try again.");
        }
    });
};

//ADD VALIDATIONS

// Pre-fetch roles list once

// Employee selection change handler (handles both native and Select2 events)
const handleEmployeeChange = () => {
    const val = $("#selectEmployee").val();

    if (val) {
        user.employee_id = JSON.parse(val);
        $("#selectEmployee").next(".select2-container").find(".select2-selection").css("border", "2px solid green");
        $("#selectEmployee").css("border", "2px solid green");

        // Auto sync email from employee
        if (user.employee_id.email) {
            textEmailElement.value = user.employee_id.email;
            user.email = user.employee_id.email;
            textEmailElement.style.border = "2px solid green";
            textEmailElement.disabled = true; // Lock it if it comes from employee
        } else {
            textEmailElement.value = "";
            user.email = null;
            textEmailElement.disabled = false;
        }
    } else {
        user.employee_id = null;
        $("#selectEmployee").next(".select2-container").find(".select2-selection").css("border", "2px solid red");
        $("#selectEmployee").css("border", "2px solid red");
        user.roles = [];
        textEmailElement.value = "";
        user.email = null;
        textEmailElement.disabled = false;
    }

    // Role Sync logic
    const checkboxes = divRole.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false); // Reset

    if (user.employee_id && user.employee_id.designation_id) {
        let designationName = user.employee_id.designation_id.name.toLowerCase();

        // Use pre-fetched rolesList
        let roleToSelectName = designationName;
        if (designationName === "manager") roleToSelectName = "admin";
        if (designationName === "cleaner") roleToSelectName = "user";

        let matchingRole = rolesList.find(r => r.name.toLowerCase() === roleToSelectName);

        if (matchingRole) {
            user.roles = [matchingRole];
            checkboxes.forEach(cb => {
                const label = cb.nextElementSibling;
                if (label && label.innerText.trim().toLowerCase() === roleToSelectName) {
                    cb.checked = true;
                }
            });
            console.log("Synced role: " + matchingRole.name);
        } else {
            user.roles = [];
        }
    } else {
        user.roles = [];
    }
};

// Listen for both native and Select2 changes
$("#selectEmployee").on("change", handleEmployeeChange);

textuserNameElement.addEventListener("keyup", () => {
    textElementValidator(
        textuserNameElement,
        "^[a-zA-Z0-9_]{3,30}$",
        user,
        "username");
});

textEmailElement.addEventListener("keyup", () => {

    textElementValidator(textEmailElement,
        "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        user,
        "email");
});

// PASSWORD
textPasswordElement.addEventListener("keyup", () => {
    passwordElementValidator(
        textPasswordElement,
        "^.{5,20}$", // Relaxed: 5-20 characters any
        user,
        "password"
    );
    matchPasswordValidator(
        textPasswordElement,
        textRePasswordElement,
        user
    );
});

// RE-PASSWORD
textRePasswordElement.addEventListener("keyup", () => {
    matchPasswordValidator(
        textPasswordElement,
        textRePasswordElement,
        user
    );
});

textNoteElement.addEventListener("keyup", () => {

    textElementValidator(textNoteElement,
        "^([A-Za-z0-9\\.\\-\\/\\s\\,]{2,15})+$",
        user,
        "note");
});

// Clear button handler
const buttonUserClear = async () => {
    const confirmed = await confirmAction({
        title: "Clear Form?",
        html: "All entered data will be removed.",
        icon: "warning",
        confirmText: "Clear",
        confirmColor: "#6c757d"
    });
    if (!confirmed) return;
    refreshUserForm();
    showInfo("Cleared", "Form cleared successfully.");
};





