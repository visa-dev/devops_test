const selectDesignationElement = document.querySelector("#selectDesignation");
const selectTrainertypeElement = document.querySelector("#trainerTypeSelect");
let textFirstnameElement = document.querySelector("#firstName");
let textLastnameElement = document.querySelector("#lastName");

// const textFullnameElement = document.getElementById("textFullname");
let textNicElement = document.querySelector("#textNic");
let selectGenderElement = document.querySelector("#genderSelect");
let textDobElement = document.querySelector("#dob");
let textContactnoElement = document.querySelector("#mobileno");
let textEmailElement = document.querySelector("#email");
let textJoindateElement = document.querySelector("#dateJoin");





let employee = {};
// access browser load event
window.addEventListener("load", () => {
  //call refresh table function
  //browser refresh weddi table refresh wenwa - browser,submit,update and delete 's ends
  refreshEmployeeTable();

  divButtonEmpUpdate.style.display = "none";

  //create empty object
  employee = new Object();

  $.ajax({
    url: "/designation/alldata",
    type: "GET",
    dataType: "json",
    success: function(designations) {
      if (designations && Array.isArray(designations) && designations.length > 0) {
        fillDataIntoSelect(
          selectDesignationElement,
          "Select Designations...!",
          designations,
          "name"
        );
      }
    },
    error: function(xhr, status, error) {
      showAlert('Error loading designations', 'danger');
    }
  });

  $.ajax({
    url: "/trainertype/alldata",
    type: "GET",
    dataType: "json",
    success: function(trainertypes) {
      if (trainertypes && Array.isArray(trainertypes) && trainertypes.length > 0) {
        fillDataIntoSelect(
          selectTrainertypeElement,
          "Select Trainer Type...!",
          trainertypes,
          "name"
        );
      }
    },
    error: function(xhr, status, error) {
      showAlert('Error loading trainer types', 'danger');
    }
  });
});


const getTrainertype = (dataOb) => {
  if (dataOb.trainertype_id) {
    return dataOb.trainertype_id.name;
  }
  return "N/A";
};


const getDesignation = (dataOb) => {
  if (dataOb.designation_id) {
    return dataOb.designation_id.name;
  }
  return "N/A";
};

const getFullName = (dataOb) => {
  if (!dataOb.firstname && !dataOb.lastname) return "N/A";

  const first = dataOb.firstname || "";
  const last = dataOb.lastname || "";

  return (first + " " + last).trim();
};

const getDob = (dataOb) => {
  if (dataOb.dob) {
    return dataOb.dob;
  }
  return "N/A";
};

const refreshEmployeeTable = () => {
  $.ajax({
    url: "/employee/alldata",
    type: "GET",
    success: function(employees) {
      let displayProperty = [
        { dataType: "function", propertyName: getFullName },
        { dataType: "string", propertyName: "nic" },
        { dataType: "string", propertyName: "mobileno" },
        { dataType: "function", propertyName: getDob },
        { dataType: "string", propertyName: "email" },
        { dataType: "function", propertyName: getDesignation },
        { dataType: "function", propertyName: getTrainertype },
      ];

      let tableBodyElement = document.querySelector("#tableBodyEmployee");
      fillDataIntoTable(
        tableBodyElement,
        employees,
        displayProperty,
        refillEmployeeForm,
        deleteEmployee,
        printEmployee
      );
    },
    error: function(xhr, status, error) {
      showAlert('Error loading employees', 'danger');
    }
  });
}

const refillEmployeeForm = (dataOb) => {
  $.ajax({
    url: "/employee/byid/" + dataOb.id,
    type: "GET",
    success: function(employeeData) {
      employee = employeeData;
      oldEmployee = JSON.parse(JSON.stringify(employeeData));

      $("#modalEmployeeForm").modal("show");

      textFirstnameElement.value = employee.firstname;
      textLastnameElement.value = employee.lastname;
      textNicElement.value = employee.nic;
      textDobElement.value = employee.dob;
      textContactnoElement.value = employee.mobileno;
      textEmailElement.value = employee.email;
      textJoindateElement.value = employee.addeddate;

      setElementColor([
        textFirstnameElement, textLastnameElement, textNicElement,
        textContactnoElement, textEmailElement, textDobElement, textJoindateElement
      ], "2px solid green");

      selectDesignationElement.value = JSON.stringify(employee.designation_id);
      selectDesignationElement.style.border = "2px solid green";

      selectGenderElement.value = employee.gender;
      selectGenderElement.style.border = "2px solid green";

      const divTrainerType = document.querySelector("#divTrainerType");
      if (employee.designation_id && employee.designation_id.name.toLowerCase() === "trainer") {
        divTrainerType.style.display = "block";
        if (employee.trainertype_id) {
          selectTrainertypeElement.value = JSON.stringify(employee.trainertype_id);
          selectTrainertypeElement.style.border = "2px solid green";
        }
      } else {
        divTrainerType.style.display = "none";
      }
      divButtonEmpSubmit.style.display = "none";
      divButtonEmpUpdate.style.removeProperty("display");
    },
    error: function(xhr, status, error) {
      showAlert('Error loading employee details', 'danger');
    }
  });
}

const checkEmployeeFormUpdate = () => {
  let updates = "";

  if (employee.fullname != oldEmployee.fullname) {
    updates = updates + "Fullname is changed..! \n";
  }
  if (employee.callingname != oldEmployee.callingname) {
    updates = updates + "callingname is changed..! \n";
  }
  if (employee.nic != oldEmployee.nic) {
    updates =
      updates +
      "NIC is changed..!" +
      oldEmployee.nic +
      "into" +
      employee.nic +
      "\n ";
  }

  if (employee.designation_id.id != oldEmployee.designation_id.id) {
    updates =
      updates +
      "Designation is changed..!" +
      oldEmployee.designation_id.name +
      "-->" +
      employee.designation_id.name +
      "\n ";
  }

  return updates;
};

const buttonEmployeeUpdate = async () => {
  let errors = checkEmployeeFormErrors();

  if (errors !== "") {
    showError("Validation Error", errors);
    return;
  }

  const confirmed = await confirmAction({
    title: "Update Employee?",
    html: `<b>Name:</b> ${employee.firstname} ${employee.lastname}<br><b>NIC:</b> ${employee.nic}`,
    icon: "question",
    confirmText: "Update",
    confirmColor: "#0d6efd"
  });

  if (!confirmed) return;

  $.ajax({
    url: "/employee/update",
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(employee),
    success: function(response) {
      if (response === "OK") {
        $("#modalEmployeeForm").modal("hide");
        refreshEmployeeTable();
        showSuccess("UPDATED!", "Employee updated successfully.");
      } else {
        showError("Update Failed", response);
      }
    },
    error: function(xhr, status, error) {
      showError("Error", "Failed to update employee. Please try again.");
    }
  });
};

const printEmployee = (dataOb) => {
  $.ajax({
    url: "/employee/byid/" + dataOb.id,
    type: "GET",
    success: function(empData) {
      let newTab = window.open();
      newTab.document.write(
        "<html><head><title>Print Employee</title><link rel='stylesheet' href='/projectResources/bootstrap-5.3.7/css/bootstrap.min.css'></head>" +
        "<body>" +
        "<div class='card'>" +
        "<div class='card-header bg-primary text-center'>" +
        `<h2>${empData.firstname} ${empData.lastname} Details</h2>` +
        "</div>" +
        "<div class='card-body'>" +
        "<table class='table table-bordered'>" +
        `<tr><th>Fullname</th><td>${empData.firstname} ${empData.lastname}</td></tr>` +
        `<tr><th>NIC</th><td>${empData.nic}</td></tr>` +
        `<tr><th>Mobile</th><td>${empData.mobileno}</td></tr>` +
        `<tr><th>Email</th><td>${empData.email}</td></tr>` +
        `<tr><th>Designation</th><td>${empData.designation_id ? empData.designation_id.name : 'N/A'}</td></tr>` +
        "</table>" +
        "</div>" +
        "</div>" +
        "</body>" +
        "</html>"
      );
      setTimeout(() => {
        newTab.print();
        newTab.close();
      }, 500);
    },
    error: function(xhr, status, error) {
      showError("Error", "Failed to load employee details for printing.");
    }
  });
};

textNicElement.addEventListener("input", () => {
  let nicValue = textNicElement.value.trim();
  // Combined pattern that supports both 10-char (e.g., 901234567V) and 12-char formats
  let regPattern = new RegExp("^(([0-9]{9}[vVxX]|[0-9]{12}))$");

  if (nicValue !== "") {
    if (regPattern.test(nicValue)) {
      textNicElement.style.border = "2px solid green";
      employee.nic = nicValue;

      let birthYear = 0;
      let noOfDays = 0;

      if (nicValue.length === 10) {
        birthYear = "19" + nicValue.substring(0, 2);
        noOfDays = parseInt(nicValue.substring(2, 5));
      } else {
        birthYear = nicValue.substring(0, 4);
        noOfDays = parseInt(nicValue.substring(4, 7));
      }

      // Generate Gender
      if (noOfDays > 500) {
        employee.gender = "Female";
        selectGenderElement.value = "Female";
        noOfDays = noOfDays - 500;
      } else {
        employee.gender = "Male";
        selectGenderElement.value = "Male";
      }
      selectGenderElement.style.border = "2px solid green";

      // Age Validation
      let currentYear = new Date().getFullYear();
      let age = currentYear - parseInt(birthYear);
      if (age < 18 || age > 60) {
        textNicElement.style.border = "2px solid red";
      }
    } else {
      textNicElement.style.border = "2px solid red";
      employee.nic = null;
      // Clear gender if NIC becomes invalid
      employee.gender = null;
      selectGenderElement.value = "";
      selectGenderElement.style.border = "1px solid #ced4da";
    }
  } else {
    textNicElement.style.border = "1px solid #ced4da";
    employee.nic = null;
    // Clear gender if NIC is cleared
    employee.gender = null;
    selectGenderElement.value = "";
    selectGenderElement.style.border = "1px solid #ced4da";
  }
});

selectGenderElement.addEventListener("change", () => {
  let genderValue = selectGenderElement.value;

  if (genderValue !== "") {
    employee.gender = genderValue;
    selectGenderElement.style.border = "2px solid green";
  } else {
    employee.gender = null;
    selectGenderElement.style.border = "2px solid red";
  }
});

const checkEmployeeFormErrors = () => {
  let errors = "";

  if (employee.firstname == null) {
    errors = errors + "Please Enter Valid fullname..! \n";
    textFirstnameElement.style.borderBottom = "2px solid red";
  }
  if (employee.lastname == null) {
    errors = errors + "Please Enter Valid Lastname..! \n";
  }
  if (employee.nic == null) {
    errors = errors + "Please Enter Valid nic..! \n";
  }
  if (employee.gender == null) {
    errors += "Please Select Gender..! \n";
    selectGenderElement.style.border = "2px solid red";
  }

  if (employee.designation_id == null) {
    errors = errors + "Please Select Designation..! \n";
  } else {
    if (employee.designation_id.name.toLowerCase() === "trainer") {
      if (employee.trainertype_id == null) {
        errors = errors + "Please Select Trainer Type..! \n";
      }
    }
  }

  return errors;
};

const buttonEmployeeSubmit = async () => {
  let errors = checkEmployeeFormErrors();

  if (errors !== "") {
    showError("Validation Error", errors);
    return;
  }

  const confirmed = await confirmAction({
    title: "Add New Employee?",
    html: `<b>Name:</b> ${employee.firstname} ${employee.lastname}<br><b>NIC:</b> ${employee.nic}`,
    icon: "info",
    confirmText: "Submit",
    confirmColor: "#198754"
  });

  if (!confirmed) return;

  $.ajax({
    url: "/employee/save",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(employee),
    success: function(response) {
      if (response === "OK") {
        $("#modalEmployeeForm").modal("hide");
        refreshEmployeeTable();
        showSuccess("ADDED!", "Employee added successfully.");
      } else {
        showError("Save Failed", response);
      }
    },
    error: function(xhr, status, error) {
      showError("Error", "Failed to save employee. Please try again.");
    }
  });
};

const deleteEmployee = async (dataOb) => {
  employee = dataOb;

  const confirmed = await confirmAction({
    title: "Delete Employee?",
    html: `<b>Name:</b> ${employee.firstname} ${employee.lastname}<br><b>NIC:</b> ${employee.nic}`,
    icon: "warning",
    confirmText: "Delete",
    confirmColor: "#d33"
  });

  if (!confirmed) return;

  $.ajax({
    url: "/employee/delete",
    type: "DELETE",
    contentType: "application/json",
    data: JSON.stringify(employee),
    success: function(response) {
      if (response === "OK") {
        refreshEmployeeTable();
        showSuccess("Deleted!", "Employee deleted successfully.");
      } else {
        showError("Delete Failed", response);
      }
    },
    error: function(xhr, status, error) {
      showError("Error", "Failed to delete employee. Please try again.");
    }
  });
};

const refreshEmployeeForm = () => {
  employee = {};
  document.querySelector("#formEmployee").reset();

  setElementColor([
    textFirstnameElement, textLastnameElement, textNicElement,
    textContactnoElement, textEmailElement, textDobElement, textJoindateElement,
    selectDesignationElement, selectTrainertypeElement,
    selectGenderElement
  ], "1px solid #ced4da");

  document.querySelector("#divTrainerType").style.display = "none";
  divButtonEmpUpdate.style.display = "none";
  divButtonEmpSubmit.style.display = "block";
};

// ... existing helper functions ...

const buttonEmployeeClear = async () => {
  const confirmed = await confirmAction({
    title: "Clear Form?",
    html: "All entered data will be removed.",
    icon: "warning",
    confirmText: "Clear",
    confirmColor: "#6c757d"
  });

  if (!confirmed) return;

  employee = {};
  document.querySelector("#formEmployee").reset();
  showInfo("Cleared", "Form cleared successfully.");
};

//ADD VALIDATIONS
textFirstnameElement.addEventListener("keyup", () => {
  textElementValidator(
    textFirstnameElement,
    "^[A-Za-z]{2,50}$",
    employee,
    "firstname");
});
textLastnameElement.addEventListener("keyup", () => {
  textElementValidator(
    textLastnameElement,
    "^[A-Za-z]{2,50}$",
    employee,
    "lastname");
});
// NIC Validation is now handled by a combined 'input' listener above
textContactnoElement.addEventListener("keyup", () => {

  textElementValidator(
    textContactnoElement,
    "^0[0-9]{9}$",
    employee,
    "mobileno");
});
textEmailElement.addEventListener("keyup", () => {

  textElementValidator(textEmailElement,
    "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
    employee,
    "email");
});
selectGenderElement.addEventListener("change", () => {
  selectElementValidator(selectGenderElement, employee, "gender");

});
textDobElement.addEventListener("change", () => {
  dateElementValidator(textDobElement, employee, "dob");
});

textJoindateElement.addEventListener("change", () => {
  dateElementValidator(textJoindateElement, employee, "addeddate");
});


selectDesignationElement.addEventListener("change", () => {
  selectForeignKeyValidator(selectDesignationElement, employee, "designation_id");

  // Conditional Trainer Type logic
  const divTrainerType = document.querySelector("#divTrainerType");
  if (employee.designation_id && employee.designation_id.name.toLowerCase() === "trainer") {
    divTrainerType.style.display = "block";
  } else {
    divTrainerType.style.display = "none";
    employee.trainertype_id = null; // Clear if not a trainer
    selectTrainertypeElement.value = "";
    selectTrainertypeElement.style.border = "1px solid #ced4da";
  }
});

selectTrainertypeElement.addEventListener("change", () => {
  selectForeignKeyValidator(selectTrainertypeElement, employee, "trainertype_id");
});
