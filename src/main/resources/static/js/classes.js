let classModal;
let allClasses = [];
let allTrainerTypes = [];

$(document).ready(function() {
    classModal = new bootstrap.Modal(document.getElementById('classModal'));
    loadClasses();
    loadTrainerTypesDropdown();
});

// Load all classes
function loadClasses() {
    showLoadingSpinner();
    $.ajax({
        url: '/classes/alldata',
        type: 'GET',
        success: function(data) {
            allClasses = data;
            displayClasses(data);
            hideLoadingSpinner();
        },
        error: function() {
            hideLoadingSpinner();
            showAlert('Error loading classes', 'danger');
        }
    });
}

// Display classes in table
function displayClasses(classes) {
    let tableBody = $('#classTableBody');
    tableBody.empty();
    
    classes.forEach(function(classEntity) {
        let trainerTypeName = classEntity.trainerType ? classEntity.trainerType.name : 'N/A';
        let statusBadge = classEntity.status ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-danger">Inactive</span>';
        
        let row = `
            <tr>
                <td>${classEntity.id}</td>
                <td>${classEntity.name}</td>
                <td>${trainerTypeName}</td>
                <td>${classEntity.schedule || 'N/A'}</td>
                <td>${classEntity.maxCapacity || 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editClass(${classEntity.id})">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteClass(${classEntity.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

// Load trainer types dropdown
function loadTrainerTypesDropdown() {
    $.ajax({
        url: '/trainertype/alldata',
        type: 'GET',
        success: function(trainerTypes) {
            allTrainerTypes = trainerTypes;
            let select = $('#trainerType');
            select.empty();
            select.append('<option value="">Select Trainer Type...</option>');
            trainerTypes.forEach(function(tt) {
                select.append(`<option value="${tt.id}">${tt.name}</option>`);
            });
        },
        error: function() {
            showAlert('Error loading trainer types', 'danger');
        }
    });
}

// Show add class modal
function showAddModal() {
    $('#modalTitle').text('Add Class');
    $('#classForm')[0].reset();
    $('#classId').val('');
    loadTrainerTypesDropdown();
    classModal.show();
}

// Edit class
function editClass(id) {
    showLoadingSpinner();
    $.ajax({
        url: '/classes/byid/' + id,
        type: 'GET',
        success: function(classEntity) {
            $('#modalTitle').text('Edit Class');
            $('#classId').val(classEntity.id);
            $('#className').val(classEntity.name);
            $('#schedule').val(classEntity.schedule);
            $('#maxCapacity').val(classEntity.maxCapacity);
            $('#description').val(classEntity.description);
            $('#status').val(classEntity.status.toString());
            
            loadTrainerTypesDropdown();
            if (classEntity.trainerType) {
                $('#trainerType').val(classEntity.trainerType.id);
            }
            
            hideLoadingSpinner();
            classModal.show();
        },
        error: function() {
            hideLoadingSpinner();
            showAlert('Error loading class details', 'danger');
        }
    });
}

// Save class
function saveClass() {
    if (!validateForm('classForm')) {
        return;
    }
    
    let trainerTypeId = $('#trainerType').val();
    if (!trainerTypeId) {
        showAlert('Please select a trainer type', 'danger');
        return;
    }
    
    let classEntity = {
        id: $('#classId').val() ? parseInt($('#classId').val()) : null,
        name: $('#className').val(),
        trainerType: { id: parseInt(trainerTypeId) },
        schedule: $('#schedule').val(),
        maxCapacity: parseInt($('#maxCapacity').val()),
        description: $('#description').val(),
        status: $('#status').val() === 'true'
    };
    
    let url = classEntity.id ? '/classes/update' : '/classes/save';
    let type = classEntity.id ? 'PUT' : 'POST';
    
    $.ajax({
        url: url,
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(classEntity),
        success: function(response) {
            if (response === 'OK') {
                classModal.hide();
                loadClasses();
                showAlert('Class saved successfully!', 'success');
            } else {
                showAlert('Error: ' + response, 'danger');
            }
        },
        error: function() {
            showAlert('Error saving class', 'danger');
        }
    });
}

// Delete class
function deleteClass(id) {
    confirmAction('Are you sure you want to delete this class?', function() {
        $.ajax({
            url: '/classes/delete',
            type: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({id: id}),
            success: function(response) {
                if (response === 'OK') {
                    loadClasses();
                    showAlert('Class deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + response, 'danger');
                }
            },
            error: function() {
                showAlert('Error deleting class', 'danger');
            }
        });
    });
}

// Show/hide loading spinner
function showLoadingSpinner() {
    $('#loadingSpinner').show();
    $('#classTableContainer').hide();
}

function hideLoadingSpinner() {
    $('#loadingSpinner').hide();
    $('#classTableContainer').show();
}

// Form validation
function validateForm(formId) {
    let form = document.getElementById(formId);
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    return true;
}
