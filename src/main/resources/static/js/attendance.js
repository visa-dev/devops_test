let allMembers = [];
let allAttendance = [];
let selectedMember = null;

$(document).ready(function() {
    // Set current date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Set default dates
    let today = new Date().toISOString().split('T')[0];
    $('#attendanceDate').val(today);
    $('#historyEndDate').val(today);
    let firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    $('#historyStartDate').val(firstDay);
    
    // Load initial data
    loadMembers();
    loadTodayAttendance();
    loadAttendanceHistory();
});

// Update current date/time display
function updateDateTime() {
    let now = new Date();
    $('#currentDate').text(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    }));
    $('#currentTime').text(now.toLocaleTimeString('en-US'));
}

// Load all members
function loadMembers() {
    $.ajax({
        url: '/members/alldata',
        type: 'GET',
        success: function(data) {
            allMembers = data.filter(m => m.status === true); // Only active members
            $('#totalMembersCount').text(allMembers.length);
        },
        error: function() {
            showAlert('Error loading members', 'danger');
        }
    });
}

// Search member by ID or name
function searchMember() {
    let searchTerm = $('#memberSearch').val().toLowerCase().trim();
    let resultsDiv = $('#searchResults');
    
    if (searchTerm.length < 2) {
        resultsDiv.empty();
        return;
    }
    
    let filtered = allMembers.filter(m => 
        m.id.toString().includes(searchTerm) || 
        m.name.toLowerCase().includes(searchTerm) ||
        (m.nic && m.nic.toLowerCase().includes(searchTerm))
    );
    
    resultsDiv.empty();
    if (filtered.length === 0) {
        resultsDiv.append('<div class="list-group-item text-muted">No members found</div>');
    } else {
        filtered.slice(0, 10).forEach(member => {
            let item = `
                <button class="list-group-item list-group-item-action" onclick="selectMember(${member.id})">
                    <div class="d-flex justify-content-between">
                        <span><strong>${member.name}</strong> (ID: ${member.id})</span>
                        <span class="text-muted">${member.nic || 'N/A'}</span>
                    </div>
                </button>
            `;
            resultsDiv.append(item);
        });
    }
}

// Select a member for attendance
function selectMember(memberId) {
    selectedMember = allMembers.find(m => m.id === memberId);
    if (!selectedMember) return;
    
    $('#searchResults').empty();
    $('#memberSearch').val('');
    
    // Show selected member info
    $('#selectedMemberName').text(selectedMember.name);
    $('#selectedMemberId').text(selectedMember.id);
    $('#selectedMemberNic').text(selectedMember.nic || 'N/A');
    $('#selectedMemberInfo').removeClass('d-none');
    
    // Show attendance form
    $('#attendanceForm').removeClass('d-none');
    
    // Check today's attendance
    checkTodayAttendance(memberId);
}

// Check if member already marked today
function checkTodayAttendance(memberId) {
    $.ajax({
        url: '/attendance/today/' + memberId,
        type: 'GET',
        success: function(attendance) {
            if (attendance) {
                $('#todayStatus').removeClass('bg-secondary').addClass('bg-success');
                $('#todayStatus').text('Already Marked: ' + attendance.status);
                
                // Pre-fill form
                $('#checkInTime').val(attendance.checkInTime);
                $('#checkOutTime').val(attendance.checkOutTime || '');
                $('#attendanceStatus').val(attendance.status);
                $('#attendanceNotes').val(attendance.notes || '');
            } else {
                $('#todayStatus').removeClass('bg-success').addClass('bg-secondary');
                $('#todayStatus').text('Not Marked');
                
                // Reset form
                $('#checkInTime').val(new Date().toTimeString().slice(0, 5));
                $('#checkOutTime').val('');
                $('#attendanceStatus').val('PRESENT');
                $('#attendanceNotes').val('');
            }
        },
        error: function() {
            console.error('Error checking today attendance');
        }
    });
}

// Mark attendance
function markAttendance() {
    if (!selectedMember) {
        showAlert('Please select a member first', 'warning');
        return;
    }
    
    let attendance = {
        member: { id: selectedMember.id },
        date: $('#attendanceDate').val(),
        checkInTime: $('#checkInTime').val(),
        checkOutTime: $('#checkOutTime').val() || null,
        status: $('#attendanceStatus').val(),
        notes: $('#attendanceNotes').val()
    };
    
    $.ajax({
        url: '/attendance/mark',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(attendance),
        success: function(response) {
            if (response === 'OK') {
                showAlert('Attendance marked successfully!', 'success');
                loadTodayAttendance();
                loadAttendanceHistory();
                
                // Update status badge
                $('#todayStatus').removeClass('bg-secondary').addClass('bg-success');
                $('#todayStatus').text('Marked: ' + attendance.status);
            } else {
                showAlert('Error: ' + response, 'danger');
            }
        },
        error: function() {
            showAlert('Error marking attendance', 'danger');
        }
    });
}

// Load today's attendance
function loadTodayAttendance() {
    let today = new Date().toISOString().split('T')[0];
    
    $.ajax({
        url: '/attendance/bydate?date=' + today,
        type: 'GET',
        success: function(data) {
            allAttendance = data;
            
            // Update statistics
            let present = data.filter(a => a.status === 'PRESENT').length;
            let late = data.filter(a => a.status === 'LATE').length;
            let absent = data.filter(a => a.status === 'ABSENT').length;
            
            $('#presentCount').text(present);
            $('#lateCount').text(late);
            $('#absentCount').text(absent);
        },
        error: function() {
            console.error('Error loading today attendance');
        }
    });
}

// Load attendance history
function loadAttendanceHistory() {
    showLoadingSpinner();
    
    let startDate = $('#historyStartDate').val();
    let endDate = $('#historyEndDate').val();
    
    $.ajax({
        url: '/attendance/bydaterange?startDate=' + startDate + '&endDate=' + endDate,
        type: 'GET',
        success: function(data) {
            displayAttendanceHistory(data);
            hideLoadingSpinner();
        },
        error: function() {
            hideLoadingSpinner();
            showAlert('Error loading attendance history', 'danger');
        }
    });
}

// Display attendance history in table
function displayAttendanceHistory(attendanceList) {
    let tableBody = $('#attendanceTableBody');
    tableBody.empty();
    
    if (attendanceList.length === 0) {
        tableBody.append('<tr><td colspan="9" class="text-center">No attendance records found</td></tr>');
        return;
    }
    
    attendanceList.forEach(function(attendance) {
        let memberName = attendance.member ? attendance.member.name : 'N/A';
        let markedBy = attendance.markedBy ? attendance.markedBy.username : 'System';
        let statusBadge = getStatusBadge(attendance.status);
        
        let row = `
            <tr>
                <td>${attendance.id}</td>
                <td>${memberName}</td>
                <td>${attendance.date}</td>
                <td>${attendance.checkInTime || '-'}</td>
                <td>${attendance.checkOutTime || '-'}</td>
                <td>${statusBadge}</td>
                <td>${markedBy}</td>
                <td>${attendance.notes || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editAttendance(${attendance.id})">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAttendance(${attendance.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tableBody.append(row);
    });
}

// Get status badge HTML
function getStatusBadge(status) {
    switch(status) {
        case 'PRESENT':
            return '<span class="badge bg-success">Present</span>';
        case 'LATE':
            return '<span class="badge bg-warning text-dark">Late</span>';
        case 'ABSENT':
            return '<span class="badge bg-danger">Absent</span>';
        default:
            return '<span class="badge bg-secondary">Unknown</span>';
    }
}

// Edit attendance
function editAttendance(id) {
    let attendance = allAttendance.find(a => a.id === id);
    if (!attendance) return;
    
    // Populate form for editing
    selectMember(attendance.member.id);
    $('#attendanceDate').val(attendance.date);
    $('#checkInTime').val(attendance.checkInTime);
    $('#checkOutTime').val(attendance.checkOutTime || '');
    $('#attendanceStatus').val(attendance.status);
    $('#attendanceNotes').val(attendance.notes || '');
    
    // Scroll to form
    $('html, body').animate({
        scrollTop: $('#attendanceForm').offset().top - 100
    }, 500);
}

// Delete attendance
function deleteAttendance(id) {
    confirmAction('Are you sure you want to delete this attendance record?', function() {
        $.ajax({
            url: '/attendance/delete/' + id,
            type: 'DELETE',
            success: function(response) {
                if (response === 'OK') {
                    showAlert('Attendance record deleted!', 'success');
                    loadTodayAttendance();
                    loadAttendanceHistory();
                } else {
                    showAlert('Error: ' + response, 'danger');
                }
            },
            error: function() {
                showAlert('Error deleting attendance', 'danger');
            }
        });
    });
}

// Clear history filter
function clearHistoryFilter() {
    let today = new Date().toISOString().split('T')[0];
    $('#historyEndDate').val(today);
    let firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    $('#historyStartDate').val(firstDay);
    loadAttendanceHistory();
}

// Show/hide loading spinner
function showLoadingSpinner() {
    $('#loadingSpinner').show();
    $('#attendanceTableContainer').hide();
}

function hideLoadingSpinner() {
    $('#loadingSpinner').hide();
    $('#attendanceTableContainer').show();
}
