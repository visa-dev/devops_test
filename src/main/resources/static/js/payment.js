let paymentModal;
let allPayments = [];
let allMembers = [];
let allMemberships = [];

// Pagination variables
let paymentCurrentPage = 1;
let paymentPageSize = 10;
let paymentTotalPages = 1;
let memberStatusCurrentPage = 1;
let memberStatusPageSize = 10;
let memberStatusTotalPages = 1;

$(document).ready(function() {
    paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    loadPayments();
    loadMemberPaymentStatus();
    loadMembersDropdown();
    populateYearDropdown();
    
    let today = new Date().toISOString().split('T')[0];
    $('#filterEndDate').val(today);
    let firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    $('#filterStartDate').val(firstDay);
});

function loadPayments() {
    showLoadingSpinner();
    $.ajax({
        url: '/payments/alldata',
        type: 'GET',
        success: function(payments) {
            allPayments = payments;
            displayPayments(payments);
            updateStatistics(payments);
            hideLoadingSpinner();
        },
        error: function() {
            hideLoadingSpinner();
            showAlert('Error loading payments', 'danger');
        }
    });
}

function displayPayments(payments) {
    let tableBody = $('#paymentTableBody');
    tableBody.empty();
    
    // Calculate pagination
    let totalItems = payments.length;
    paymentTotalPages = Math.ceil(totalItems / paymentPageSize) || 1;
    
    // Ensure current page is valid
    if (paymentCurrentPage > paymentTotalPages) paymentCurrentPage = paymentTotalPages;
    if (paymentCurrentPage < 1) paymentCurrentPage = 1;
    
    let startIndex = (paymentCurrentPage - 1) * paymentPageSize;
    let endIndex = Math.min(startIndex + paymentPageSize, totalItems);
    let paginatedItems = payments.slice(startIndex, endIndex);
    
    // Update pagination info
    $('#paymentShowingInfo').text(`Showing ${totalItems > 0 ? startIndex + 1 : 0} to ${endIndex} of ${totalItems} entries`);
    $('#paymentPageInfo').text(`Page ${paymentCurrentPage} of ${paymentTotalPages}`);
    
    // Enable/disable buttons
    $('#paymentPrevBtn').prop('disabled', paymentCurrentPage === 1);
    $('#paymentNextBtn').prop('disabled', paymentCurrentPage === paymentTotalPages);
    
    // Display items
    paginatedItems.forEach(function(payment) {
        let memberName = payment.member ? payment.member.name : 'N/A';
        let membershipName = payment.membership ? payment.membership.name : 'N/A';
        let paymentDate = payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A';
        let paymentMonth = payment.paymentForMonth ? formatMonthYear(payment.paymentForMonth) : 
                          (payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-US', {month: 'long', year: 'numeric'}) : 'N/A');
        let statusBadge = getStatusBadge(payment.status);
        
        let row = `
            <tr>
                <td>${payment.id}</td>
                <td>${memberName}</td>
                <td>${membershipName}</td>
                <td>LKR ${payment.amount ? payment.amount.toFixed(2) : '0.00'}</td>
                <td>${paymentMonth}</td>
                <td>${payment.paymentMethod || 'N/A'}</td>
                <td>${paymentDate}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="printReceipt(${payment.id})">
                        <i class="fa-solid fa-print"></i> Print
                    </button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

function getStatusBadge(status) {
    switch(status) {
        case 'PAID':
            return '<span class="badge bg-success">Paid</span>';
        case 'PENDING':
            return '<span class="badge bg-warning text-dark">Pending</span>';
        case 'OVERDUE':
            return '<span class="badge bg-danger">Overdue</span>';
        default:
            return '<span class="badge bg-secondary">Unknown</span>';
    }
}

function loadMemberPaymentStatus() {
    $.ajax({
        url: '/api/member-payment-status/summary',
        type: 'GET',
        success: function(summary) {
            $('#totalMembersCount').text(summary.totalMembers || 0);
            $('#paidCount').text(summary.paidCount || 0);
            $('#notPaidCount').text(summary.notPaidCount || 0);
        },
        error: function() {
            console.error('Error loading member payment status');
        }
    });
}

function updateStatistics(payments) {
    let totalCount = payments.length;
    let totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    let pendingCount = payments.filter(p => p.status === 'PENDING').length;
    let overdueCount = payments.filter(p => p.status === 'OVERDUE').length;
    
    $('#totalPayments').text(totalCount);
    $('#totalAmount').text('LKR ' + totalAmount.toFixed(2));
    $('#pendingCount').text(pendingCount);
    $('#overdueCount').text(overdueCount);
}

function loadMembersDropdown() {
    $.ajax({
        url: '/members/alldata',
        type: 'GET',
        success: function(members) {
            allMembers = members;
            let select = $('#memberSelect');
            select.empty();
            select.append('<option value="">Select Member...</option>');
            members.forEach(function(member) {
                if (member.status) {
                    select.append(`<option value="${member.id}">${member.name} - ${member.nic}</option>`);
                }
            });
        },
        error: function() {
            showAlert('Error loading members', 'danger');
        }
    });
}

function populateYearDropdown() {
    let yearSelect = $('#filterYear');
    let currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
        yearSelect.append(`<option value="${i}">${i}</option>`);
    }
}

function formatMonthYear(monthYear) {
    if (!monthYear) return 'N/A';
    let [year, month] = monthYear.split('-');
    let date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function loadMemberDetails() {
    let memberId = $('#memberSelect').val();
    if (!memberId) {
        $('#membershipPackage').val('');
        $('#membershipId').val('');
        $('#amount').val('');
        $('#paymentForMonth').val('');
        $('#duplicateWarning').addClass('d-none');
        return;
    }
    
    let member = allMembers.find(m => m.id == memberId);
    if (!member) return;
    
    if (member.membership) {
        $('#membershipPackage').val(member.membership.name);
        $('#membershipId').val(member.membership.id);
        $('#amount').val(member.membership.price);
    } else {
        $('#membershipPackage').val('No Active Membership');
        $('#membershipId').val('');
        $('#amount').val('');
    }
    
    let currentMonth = new Date().toISOString().slice(0, 7);
    $('#paymentForMonth').val(currentMonth);
    
    checkDuplicatePayment();
    calculatePaymentStatus();
}

function checkDuplicatePayment() {
    let memberId = $('#memberSelect').val();
    let month = $('#paymentForMonth').val();
    
    if (!memberId || !month) {
        $('#duplicateWarning').addClass('d-none');
        return;
    }
    
    let duplicate = allPayments.find(p => {
        if (p.member && p.member.id == memberId && p.paymentForMonth === month) {
            return true;
        }
        if (p.member && p.member.id == memberId && p.paymentDate) {
            let paymentMonth = p.paymentDate.substring(0, 7);
            if (paymentMonth === month) return true;
        }
        return false;
    });
    
    if (duplicate && !$('#paymentId').val()) {
        $('#duplicateWarning').removeClass('d-none');
        $('#savePaymentBtn').prop('disabled', true);
    } else {
        $('#duplicateWarning').addClass('d-none');
        $('#savePaymentBtn').prop('disabled', false);
    }
}

function calculatePaymentStatus() {
    let paymentForMonth = $('#paymentForMonth').val();
    let paymentDate = $('#paymentDate').val();
    
    if (!paymentForMonth) return;
    
    let [year, month] = paymentForMonth.split('-').map(Number);
    let monthEndDate = new Date(year, month, 0);
    let today = new Date();
    
    let status = 'PAID';
    
    if (paymentDate) {
        let pDate = new Date(paymentDate);
        if (pDate > monthEndDate) {
            status = 'OVERDUE';
        }
    }
    
    if (today > monthEndDate && !paymentDate) {
        status = 'OVERDUE';
    }
    
    let monthStartDate = new Date(year, month - 1, 1);
    if (today >= monthStartDate && today <= monthEndDate && !paymentDate) {
        status = 'PENDING';
    }
    
    $('#paymentStatus').val(status);
}

function showAddPaymentModal() {
    $('#modalTitle').text('Add Payment');
    $('#paymentForm')[0].reset();
    $('#paymentId').val('');
    $('#duplicateWarning').addClass('d-none');
    $('#savePaymentBtn').prop('disabled', false);
    $('#membershipPackage').val('');
    $('#membershipId').val('');
    
    let now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    $('#paymentDate').val(now.toISOString().slice(0, 16));
    $('#paymentForMonth').val(now.toISOString().slice(0, 7));
    
    loadMembersDropdown();
    paymentModal.show();
}

function savePayment() {
    if (!validateForm('paymentForm')) {
        return;
    }
    
    let memberId = $('#memberSelect').val();
    let membershipId = $('#membershipId').val();
    
    if (!memberId || !membershipId) {
        showAlert('Please select a member with active membership', 'danger');
        return;
    }
    
    if (!$('#paymentId').val()) {
        let month = $('#paymentForMonth').val();
        let duplicate = allPayments.find(p => {
            return p.member && p.member.id == memberId && 
                   (p.paymentForMonth === month || (p.paymentDate && p.paymentDate.startsWith(month)));
        });
        
        if (duplicate) {
            showAlert('Payment already exists for this member and month!', 'danger');
            return;
        }
    }
    
    let payment = {
        id: $('#paymentId').val() ? parseInt($('#paymentId').val()) : null,
        member: { id: parseInt(memberId) },
        membership: { id: parseInt(membershipId) },
        amount: parseFloat($('#amount').val()),
        paymentMethod: $('#paymentMethod').val(),
        status: $('#paymentStatus').val(),
        description: $('#description').val(),
        paymentDate: $('#paymentDate').val(),
        paymentForMonth: $('#paymentForMonth').val()
    };
    
    let url = payment.id ? '/payments/update' : '/payments/save';
    let type = payment.id ? 'PUT' : 'POST';
    
    $.ajax({
        url: url,
        type: type,
        contentType: 'application/json',
        data: JSON.stringify(payment),
        success: function(response) {
            if (response === 'OK') {
                paymentModal.hide();
                loadPayments();
                loadMemberPaymentStatus();
                showAlert('Payment saved successfully!', 'success');
            } else {
                showAlert('Error: ' + response, 'danger');
            }
        },
        error: function() {
            showAlert('Error saving payment', 'danger');
        }
    });
}

function applyFilters() {
    let startDate = $('#filterStartDate').val();
    let endDate = $('#filterEndDate').val();
    let year = $('#filterYear').val();
    let month = $('#filterMonth').val();
    let memberName = $('#filterMemberName').val().toLowerCase();
    
    let filtered = allPayments;
    
    // Member name filter
    if (memberName) {
        filtered = filtered.filter(p => {
            let name = p.member ? p.member.name.toLowerCase() : '';
            return name.includes(memberName);
        });
    }
    
    if (startDate && endDate) {
        let start = new Date(startDate);
        let end = new Date(endDate);
        end.setHours(23, 59, 59);
        
        filtered = filtered.filter(p => {
            if (!p.paymentDate) return false;
            let pDate = new Date(p.paymentDate);
            return pDate >= start && pDate <= end;
        });
    }
    
    if (year) {
        filtered = filtered.filter(p => {
            let paymentYear = p.paymentForMonth ? p.paymentForMonth.substring(0, 4) : 
                             (p.paymentDate ? p.paymentDate.substring(0, 4) : '');
            return paymentYear === year;
        });
    }
    
    if (month) {
        filtered = filtered.filter(p => {
            let paymentMonth = p.paymentForMonth ? p.paymentForMonth.substring(5, 7) : 
                              (p.paymentDate ? p.paymentDate.substring(5, 7) : '');
            return paymentMonth === month;
        });
    }
    
    // Reset to first page when filters change
    paymentCurrentPage = 1;
    
    displayPayments(filtered);
    updateStatistics(filtered);
}

function clearFilters() {
    $('#filterMemberName').val('');
    $('#filterYear').val('');
    $('#filterMonth').val('');
    let today = new Date().toISOString().split('T')[0];
    $('#filterEndDate').val(today);
    let firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    $('#filterStartDate').val(firstDay);
    // Reset pagination
    paymentCurrentPage = 1;
    displayPayments(allPayments);
    updateStatistics(allPayments);
}

function loadMemberPaymentDetails(filterType) {
    $('#memberStatusLoading').show();
    $('#memberStatusTableContainer').hide();
    
    let url = '/api/member-payment-status/all';
    if (filterType === 'not-paid') {
        url = '/api/member-payment-status/not-paid';
    } else if (filterType === 'paid') {
        url = '/api/member-payment-status/paid';
    }
    
    $.ajax({
        url: url,
        type: 'GET',
        success: function(data) {
            displayMemberPaymentStatus(data);
            $('#memberStatusLoading').hide();
            $('#memberStatusTableContainer').show();
        },
        error: function() {
            $('#memberStatusLoading').hide();
            showAlert('Error loading member payment status', 'danger');
        }
    });
}

function displayMemberPaymentStatus(members) {
    let tableBody = $('#memberStatusTableBody');
    tableBody.empty();
    
    if (members.length === 0) {
        tableBody.append('<tr><td colspan="6" class="text-center">No members found</td></tr>');
        updateMemberStatusPagination(0, 0, 0);
        return;
    }
    
    // Calculate pagination
    let totalItems = members.length;
    memberStatusTotalPages = Math.ceil(totalItems / memberStatusPageSize) || 1;
    
    // Ensure current page is valid
    if (memberStatusCurrentPage > memberStatusTotalPages) memberStatusCurrentPage = memberStatusTotalPages;
    if (memberStatusCurrentPage < 1) memberStatusCurrentPage = 1;
    
    let startIndex = (memberStatusCurrentPage - 1) * memberStatusPageSize;
    let endIndex = Math.min(startIndex + memberStatusPageSize, totalItems);
    let paginatedItems = members.slice(startIndex, endIndex);
    
    // Update pagination info
    updateMemberStatusPagination(startIndex + 1, endIndex, totalItems);
    
    // Enable/disable buttons
    $('#memberStatusPrevBtn').prop('disabled', memberStatusCurrentPage === 1);
    $('#memberStatusNextBtn').prop('disabled', memberStatusCurrentPage === memberStatusTotalPages);
    
    // Display items
    paginatedItems.forEach(function(member) {
        let statusBadge = '';
        switch(member.status) {
            case 'PAID':
                statusBadge = '<span class="badge bg-success">Paid</span>';
                break;
            case 'NOT_PAID':
                statusBadge = '<span class="badge bg-warning text-dark">Not Paid</span>';
                break;
            default:
                statusBadge = '<span class="badge bg-secondary">Unknown</span>';
        }
        
        let row = `
            <tr>
                <td>${member.memberId}</td>
                <td>${member.memberName}</td>
                <td>${member.membershipName || 'N/A'}</td>
                <td>LKR ${member.monthlyAmount ? member.monthlyAmount.toFixed(2) : '0.00'}</td>
                <td>${member.lastPaymentMonth || 'Never'}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
        tableBody.append(row);
    });
}

function printReceipt(id) {
    showAlert('Receipt printing feature coming soon!', 'info');
}

function validateForm(formId) {
    let form = document.getElementById(formId);
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    return true;
}

function showLoadingSpinner() {
    $('#loadingSpinner').show();
    $('#paymentTableContainer').hide();
}

function hideLoadingSpinner() {
    $('#loadingSpinner').hide();
    $('#paymentTableContainer').show();
}

function showAlert(message, type) {
    if (typeof window.showAlert === 'function') {
        window.showAlert(message, type);
    } else {
        alert(message);
    }
}

// Payment pagination controls
function changePaymentPage(direction) {
    paymentCurrentPage += direction;
    applyFilters();
}

// Member status pagination controls
function changeMemberStatusPage(direction) {
    memberStatusCurrentPage += direction;
    loadMemberPaymentDetails('all');
}

function updateMemberStatusPagination(start, end, total) {
    $('#memberStatusShowingInfo').text(`Showing ${total > 0 ? start : 0} to ${end} of ${total} entries`);
    $('#memberStatusPageInfo').text(`Page ${memberStatusCurrentPage} of ${memberStatusTotalPages}`);
}
