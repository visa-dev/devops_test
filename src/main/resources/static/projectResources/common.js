// Enhanced Common JavaScript functions for the Gym Management System

// Loading spinner functions
function showLoadingSpinner(containerId = 'main-content') {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.opacity = '0.5';
        container.style.pointerEvents = 'none';
        
        // Create spinner if it doesn't exist
        let spinner = document.getElementById('globalSpinner');
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'globalSpinner';
            spinner.className = 'position-fixed top-50 start-50 translate-middle';
            spinner.style.zIndex = '9999';
            spinner.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            `;
            document.body.appendChild(spinner);
        }
        spinner.style.display = 'block';
    }
}

function hideLoadingSpinner(containerId = 'main-content') {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
    }
    
    const spinner = document.getElementById('globalSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

// AJAX wrapper with loading states
function ajaxWithLoading(options) {
    const defaultOptions = {
        beforeSend: function() {
            showLoadingSpinner();
        },
        complete: function() {
            hideLoadingSpinner();
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', error);
            hideLoadingSpinner();
            showAlert('Error: ' + (xhr.responseText || error), 'danger');
        }
    };
    
    return $.ajax($.extend({}, defaultOptions, options));
}

// Alert functions
function showAlert(message, type = 'info', duration = 5000) {
    // Remove existing alerts
    $('.alert').remove();
    
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3" 
             style="z-index: 9999; min-width: 300px;" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    $('body').prepend(alertHtml);
    
    // Auto-dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            $('.alert').alert('close');
        }, duration);
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusClass = status ? 'bg-success' : 'bg-danger';
    const statusText = status ? 'Active' : 'Inactive';
    return `<span class="badge ${statusClass}">${statusText}</span>`;
}

// Initialize tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize modals
function initializeModals() {
    // This can be called after page load to initialize all modals
    document.querySelectorAll('.modal').forEach(modal => {
        new bootstrap.Modal(modal);
    });
}

// Common table initialization
function initializeDataTable(tableId, options = {}) {
    const defaultOptions = {
        responsive: true,
        pageLength: 10,
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        language: {
            search: "Search:",
            lengthMenu: "Show _MENU_ entries",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            paginate: {
                first: "First",
                last: "Last",
                next: "Next",
                previous: "Previous"
            }
        }
    };
    
    if (typeof $ !== 'undefined' && $.fn.DataTable) {
        return $(`#${tableId}`).DataTable($.extend({}, defaultOptions, options));
    }
    
    return null;
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Clear form
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
            el.classList.remove('is-invalid', 'is-valid');
        });
    }
}

// Export functions
function exportToCSV(data, filename) {
    const csv = convertToCSV(data);
    downloadFile(csv, filename, 'text/csv');
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',');
    });
    
    return csvHeaders + '\n' + csvRows.join('\n');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Legacy function for backward compatibility
const getServiceRequest = (url) => {
    let getResponses = [];
    
    $.ajax({
        url: url,
        type: "GET",
        async: false,
        dataType: "json",
        success: function (response) {
            console.log("Data received:", response);
            getResponses = response;
        },
        error: function(xhr, status, error) {
            console.error('Error in getServiceRequest:', error);
            showAlert('Error loading data', 'danger');
        }
    });
    
    return getResponses;
};

//Define function for request POST, PUT DELETE services
const getHTTPServiceRequest = (url, method, data) => {
    let serviceResponses = "";

    $.ajax({
        url: url,
        type: method,
        async: false,
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function (response) {
            console.log("Data received:", response);
            serviceResponses = response;
        },
        error: function(xhr, status, error) {
            console.error("AJAX error:", status, error);
            serviceResponses = "AJAX error:" + status + " ," + error;
        },
        complete: function() {
            console.log("AJAX request complete.");
        }
    });

    return serviceResponses;
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTooltips();
    initializeModals();
});

//define function for filldatainto select element


const fillDataIntoSelect = (elementId, message, dataList, property) => {

  elementId.innerHTML = "";

  if (message != "") {
    let optionSmsg = document.createElement("option");
    optionSmsg.innerText = message;
    optionSmsg.value = "";
    optionSmsg.selected = "selected";
    optionSmsg.disabled = "disabled";
    elementId.appendChild(optionSmsg);
  }

dataList.forEach(dataOb => {
  let option = document.createElement("option");
  //option.value = dataOb;
  option.value = JSON.stringify(dataOb); //convert js object into json string
  option.innerText = dataOb[property];
  elementId.appendChild(option);
  });

}

// define function for set default color
const setElementColor = (elementArray, color) => {

  elementArray.forEach(element => {
    element.style.border = color;
  });
}

//define function for set color for table row

const setColorForTableRow = (tableBodyElement , rowIndex , color) => {
  for (const trelement of tableBodyElement.children) {
    trelement.removeAttribute("style");
  }
  tableBodyElement.children[rowIndex].style.backgroundColor = color;
}



//define function for filldataintotable
const fillDataIntoTable = (tableBody , dataList , displayPropertyList , editFunctionName , deleteFunctionName , printFunctionName) => {
  tableBody.innerHTML = ""; // Clean Table Body Inner HTML

  dataList.forEach((dataOb, index) => {
    // tr
    let tr = document.createElement("tr");

    // td - 8
    let tdIndex = document.createElement("td");
    tdIndex.innerText = index + 1;
    tr.appendChild(tdIndex);

    displayPropertyList.forEach((column) => {
      let td = document.createElement("td");
      if (column.dataType === "string") {
        td.innerText = dataOb[column.propertyName]; //object eken illa ganna
      }
      if (column.dataType === "function") {
        td.innerHTML = column.propertyName(dataOb); //function eka call karanawa
      }
      tr.appendChild(td);
    });


    let tdButton = document.createElement("td");

      const clearElement = (elements) => {
          if (!elements) return;

          // if single element
          if (!Array.isArray(elements)) {
              elements.innerHTML = "";
              return;
          }

          // if array of elements
          elements.forEach(el => {
              if (el) el.innerHTML = "";
          });
      };


    let buttonEdit = document.createElement("button");
    buttonEdit.className = "btn  fw-bold me-1";
    buttonEdit.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: #4d79ff;"></i> ';
    buttonEdit.onclick = () => {
      console.log("edit");
      setColorForTableRow( tableBody, index, "lightgreen");
      // massege box ek en ek parakku krann time out ekk danwa
      setTimeout(() => {
        editFunctionName(dataOb);   //call deleteFunctionName parameter
      } , 100);
      // window.confirm("Are you sure to edit");

    }

    let buttonDelete = document.createElement("button");
    buttonDelete.className = "btn  fw-bold me-1";
    buttonDelete.innerHTML = ' <i class="fa-solid fa-trash" style="color: #f78d8d;"></i> ';
    buttonDelete.onclick = () => {
      console.log("delete");

      setColorForTableRow(tableBody, index, "lightpink");

      //
      setTimeout(() => {
        deleteFunctionName(dataOb);   //call deleteFunctionName parameter
      } , 100);
      // window.confirm("Are you sure to delete");


    }

    let buttonPrint = document.createElement("button");
    buttonPrint.className = "btn btn-outline-success fw-bold";
    buttonPrint.innerHTML = '<i class="fa-solid fa-print" style="color: #bef4c4;"></i> ';
    buttonPrint.onclick = () => {
      console.log("print");
      setColorForTableRow( tableBody, index, "lightblue");
      // for (const trelement of tableBody.children) {
      //   trelement.removeAttribute("style");
      // }

      // tableBody.children[index].style.backgroundColor = "pink";
      // tableBody.children[index].style.borderColor = "pink";
      // tableBody.children[index].style.border = "pink";
      setTimeout(() => {
        printFunctionName(dataOb);   //call deleteFunctionName parameter
      } , 100);
      // window.confirm("Are you sure to print");

    }



    tdButton.appendChild(buttonEdit);
    tdButton.appendChild(buttonDelete);
    tdButton.appendChild(buttonPrint);

    // td apend into tr

    tr.appendChild(tdButton);

    // tr apend into table body
    tableBody.appendChild(tr);
  });
};


//Sweet Alert Function

// Confirmation Popup
const confirmAction = (options) => {

    return Swal.fire({
        title: options.title || "Are you sure?",
        html: options.html || "",
        icon: options.icon || "question",
        showCancelButton: true,
        confirmButtonText: options.confirmText || "Confirm",
        cancelButtonText: "Cancel",
        confirmButtonColor: options.confirmColor || "#0d6efd",
        cancelButtonColor: "#6c757d"
    }).then(result => result.isConfirmed);

};


// Success Alert
const showSuccess = (title, text) => {
    Swal.fire({
        icon: "success",
        title: title,
        text: text,
        timer: 2000,
        showConfirmButton: false
    });
};


// Error Alert
const showError = (title, text) => {
    Swal.fire({
        icon: "error",
        title: title,
        text: text
    });
};


// Info Alert
const showInfo = (title, text) => {
    Swal.fire({
        icon: "info",
        title: title,
        text: text
    });
};



//define function for text element validate
const textElementValidator = (element, pattern, objectRef, property) => {

    const value = element.value.trim();
    const regPattern = new RegExp(pattern);

    if (value !== "") {

        if (regPattern.test(value)) {
            objectRef[property] = value;
            element.style.border = "2px solid green";
        } else {
            objectRef[property] = null;
            element.style.border = "2px solid red";
        }

    } else {

        objectRef[property] = null;

        if (element.required) {
            element.style.border = "2px solid red";
        } else {
            element.style.border = "1px solid #ced4da";
        }
    }
};

//select validate
const selectElementValidator = (element, objectRef, property) => {

    if (element.value !== "") {

        objectRef[property] = element.value;
        element.style.border = "2px solid green";

    } else {

        objectRef[property] = null;
        element.style.border = "2px solid red";
    }
};

//FK validate
const selectForeignKeyValidator = (element, objectRef, property) => {

    if (element.value !== "") {

        const selectedObject = JSON.parse(element.value);
        objectRef[property] = selectedObject;

        element.style.border = "2px solid green";

    } else {

        objectRef[property] = null;
        element.style.border = "2px solid red";
    }
};

// date validator
const dateElementValidator = (element, objectRef, property) => {

    if (element.value !== "") {

        objectRef[property] = element.value;
        element.style.border = "2px solid green";

    } else {

        objectRef[property] = null;
        element.style.border = "2px solid red";
    }
};

//password validate
const matchPasswordValidator = (passwordEl, rePasswordEl, objectRef) => {

    if (!passwordEl.value || !rePasswordEl.value) return;

    if (passwordEl.value !== rePasswordEl.value) {
        rePasswordEl.classList.add("is-invalid");
        rePasswordEl.classList.remove("is-valid");
        objectRef.repassword = null;
    } else {
        rePasswordEl.classList.add("is-valid");
        rePasswordEl.classList.remove("is-invalid");
        objectRef.repassword = rePasswordEl.value;
    }
};


const passwordElementValidator = (element, pattern, objectRef, property) => {

    const value = element.value.trim();
    const regex = new RegExp(pattern);

    // EMPTY → invalid
    if (value === "") {
        element.classList.add("is-invalid");
        element.classList.remove("is-valid");
        objectRef[property] = null;
        return;
    }

    // PATTERN MATCH → valid
    if (regex.test(value)) {
        element.classList.add("is-valid");
        element.classList.remove("is-invalid");
        objectRef[property] = value; // 🔥 BIND TO OBJECT
    }
    // PATTERN FAIL → invalid
    else {
        element.classList.add("is-invalid");
        element.classList.remove("is-valid");
        objectRef[property] = null;
    }
};




