let batchModal;
let allBatches = [];
let allTrainerTypes = [];

$(document).ready(function() {
    batchModal = new bootstrap.Modal(document.getElementById('batchModal'));
    loadBatches();
    loadTrainerTypesDropdown();
});

// Load all batches
function loadBatches() {
    showLoadingSpinner();
    $.ajax({
        url: '/batch/alldata',
        type: 'GET',
        success: function(data) {
            allBatches = data;
            displayBatches(data);
            hideLoadingSpinner();
        },
        error: function() {
            hideLoadingSpinner();
            showAlert('Error loading batches', 'danger');
        }
    });
}

// Display batches in table
function displayBatches(batches) {
    let tableBody = $('#batchTableBody');
    tableBody.empty();
    
    batches.forEach(function(batch) {
        let trainerTypeName = batch.trainerType ? batch.trainerType.name : 'N/A';
        let statusBadge = batch.status ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-danger">Inactive</span>';
        
        let row = `
            <tr>
                <td>${batch.id}</td>
                <td>${batch.name}</td>
                <td>${trainerTypeName}</td>
                <td>${batch.schedule || 'N/A'}</td>
                <td>${batch.maxCapacity || 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editBatch(${batch.id})">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBatch(${batch.id})">
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

// Show add batch modal
function showAddModal() {
    $('#modalTitle').text('Add Batch');
    $('#batchForm')[0].reset();
    $('#batchId').val('');
    loadTrainerTypesDropdown();
    batchModal.show();
}

// Edit batch
function editBatch(id) {
    showLoadingSpinner();
    $.ajax({
        url: '/batch/byid/' + id,
        type: 'GET',
        success: function(batch) {
            $('#modalTitle').text('Edit Batch');
            $('#batchId').val(batch.id);
            $('#batchName').val(batch.name);
            $('#schedule').val(batch.schedule);
            $('#maxCapacity').val(batch.maxCapacity);
            $('#description').val(batch.description);
            $('#status').val(batch.status.toString());
            
            loadTrainerTypesDropdown();
            if (batch.trainerType) {
                $('#trainerType').val(batch.trainerType.id);
            }
            
            hideLoadingSpinner();
            batchModal.show();
        },
        error: function() {
            hideLoadingSpinner();
            showAlert('Error loading batch details', 'danger');
        }
    });
}

// Save batch
function saveBatch() {
    if (!validateForm('batchForm')) {
        return;
    }
    
    let trainerTypeId = $('#trainerType').val();
    if (!trainerTypeId) {
        showAlert('Please select a trainer type', 'danger');
        return;
    }
    
    let batch = {
        id: $('#batchId').val() ? parseInt($('#batchId').val()) : null,
        name: $('#batchName').val(),
        trainerType: { id: parseInt(trainerTypeId) },
        schedule: $('#schedule').val(),
        maxCapacity: parseInt($('#maxCapacity').val()),
        description: $('#description').val(),
        status: $('#status').val() === 'true'
    };
    
    let url = batch.id ? '/batch/update' : '/batch/save';
    let type = batch.id ? 'PUT' : 'POST';
    
    $.ajax({
        url: url,
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(batch),
        success: function(response) {
            if (response === 'OK') {
                batchModal.hide();
                loadBatches();
                showAlert('Batch saved successfully!', 'success');
            } else {
                showAlert('Error: ' + response, 'danger');
            }
        },
        error: function() {
            showAlert('Error saving batch', 'danger');
        }
    });
}

// Delete batch
function deleteBatch(id) {
    confirmAction('Are you sure you want to delete this batch?', function() {
        $.ajax({
            url: '/batch/delete',
            type: 'DELETE',
            contentType: 'application/json',
            data: JSON.stringify({id: id}),
            success: function(response) {
                if (response === 'OK') {
                    loadBatches();
                    showAlert('Batch deleted successfully!', 'success');
                } else {
                    showAlert('Error: ' + response, 'danger');
                }
            },
            error: function() {
                showAlert('Error deleting batch', 'danger');
            }
        });
    });
}

// Show/hide loading spinner
function showLoadingSpinner() {
    $('#loadingSpinner').show();
    $('#batchTableContainer').hide();
}

function hideLoadingSpinner() {
    $('#loadingSpinner').hide();
    $('#batchTableContainer').show();
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
