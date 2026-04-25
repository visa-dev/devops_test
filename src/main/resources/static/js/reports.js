// Chart instances
let incomeChart, memberGrowthChart;

// Data storage
let allPayments = [];
let allMembers = [];
let allEmployees = [];
let allMemberships = [];

$(document).ready(function() {
    // Set default dates
    let today = new Date().toISOString().split('T')[0];
    let firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    $('#endDate').val(today);
    $('#startDate').val(firstDay);
    
    // Load all data
    loadAllData();
});

// Load all data for reports
function loadAllData() {
    showLoadingSpinner();
    
    // Load members
    $.ajax({
        url: '/members/alldata',
        type: 'GET',
        success: function(members) {
            allMembers = members;
            updateMemberStats();
        },
        error: function() {
            console.error('Error loading members');
        }
    });
    
    // Load employees
    $.ajax({
        url: '/employee/alldata',
        type: 'GET',
        success: function(employees) {
            allEmployees = employees;
            updateEmployeeStats();
        },
        error: function() {
            console.error('Error loading employees');
        }
    });
    
    // Load payments
    $.ajax({
        url: '/payments/alldata',
        type: 'GET',
        success: function(payments) {
            allPayments = payments;
            updatePaymentStats();
            createIncomeChart();
        },
        error: function() {
            console.error('Error loading payments');
        }
    });
    
    // Load memberships
    $.ajax({
        url: '/memberships/alldata',
        type: 'GET',
        success: function(memberships) {
            allMemberships = memberships;
            updateMembershipStats();
        },
        error: function() {
            console.error('Error loading memberships');
        }
    });
    
    hideLoadingSpinner();
}

// Update member statistics
function updateMemberStats() {
    let totalMembers = allMembers.length;
    let activeMembers = allMembers.filter(m => m.status).length;
    
    // Count members by month for growth chart
    let membersByMonth = {};
    let today = new Date();
    for (let i = 5; i >= 0; i--) {
        let d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        let key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        membersByMonth[key] = 0;
    }
    
    allMembers.forEach(member => {
        if (member.addeddatetime) {
            let date = new Date(member.addeddatetime);
            let key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (membersByMonth.hasOwnProperty(key)) {
                membersByMonth[key]++;
            }
        }
    });
    
    $('#totalMembers').text(totalMembers);
    $('#activeMemberships').text(activeMembers);
    
    // Create member growth chart
    createMemberGrowthChart(membersByMonth);
}

// Update employee statistics
function updateEmployeeStats() {
    let totalEmployees = allEmployees.length;
    let trainers = allEmployees.filter(e => 
        e.designation_id && e.designation_id.name.toLowerCase() === 'trainer'
    ).length;
    
    $('#totalEmployees').text(totalEmployees);
    $('#totalTrainers').text(trainers);
}

// Update payment statistics
function updatePaymentStats() {
    let totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    let pendingCount = allPayments.filter(p => p.status === 'PENDING').length;
    
    $('#totalRevenue').text('LKR ' + totalRevenue.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    }));
    $('#pendingPayments').text(pendingCount);
}

// Create Monthly Income Chart
function createIncomeChart() {
    let ctx = document.getElementById('incomeChart').getContext('2d');
    
    // Calculate income by month
    let incomeByMonth = {};
    let today = new Date();
    for (let i = 5; i >= 0; i--) {
        let d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        let key = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        incomeByMonth[key] = 0;
    }
    
    allPayments.forEach(payment => {
        if (payment.paymentDate && payment.status === 'PAID') {
            let date = new Date(payment.paymentDate);
            let key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            if (incomeByMonth.hasOwnProperty(key)) {
                incomeByMonth[key] += payment.amount || 0;
            }
        }
    });
    
    let labels = Object.keys(incomeByMonth);
    let data = Object.values(incomeByMonth);
    
    if (incomeChart) {
        incomeChart.destroy();
    }
    
    incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Income (LKR)',
                data: data,
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'LKR ' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'LKR ' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Create Member Growth Chart
function createMemberGrowthChart(membersByMonth) {
    let ctx = document.getElementById('memberGrowthChart').getContext('2d');
    
    let labels = Object.keys(membersByMonth);
    let data = Object.values(membersByMonth);
    
    if (memberGrowthChart) {
        memberGrowthChart.destroy();
    }
    
    memberGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Members',
                data: data,
                backgroundColor: 'rgba(13, 202, 240, 0.2)',
                borderColor: 'rgba(13, 202, 240, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Generate report
function generateReport() {
    let reportType = $('#reportType').val();
    let startDate = $('#startDate').val();
    let endDate = $('#endDate').val();
    
    showLoadingSpinner();
    
    // Filter data by date range
    let filteredData = filterDataByDateRange(startDate, endDate);
    
    let tableHead = $('#reportTableHead');
    let tableBody = $('#reportTableBody');
    
    tableHead.empty();
    tableBody.empty();
    
    switch(reportType) {
        case 'members':
            generateMembersReport(filteredData.members, tableHead, tableBody);
            break;
        case 'payments':
            generatePaymentsReport(filteredData.payments, tableHead, tableBody);
            break;
        case 'memberships':
            generateMembershipsReport(filteredData.memberships, tableHead, tableBody);
            break;
        case 'classes':
            generateClassesReport(tableHead, tableBody);
            break;
    }
    
    hideLoadingSpinner();
}

// Filter data by date range
function filterDataByDateRange(startDate, endDate) {
    let start = startDate ? new Date(startDate) : new Date('2000-01-01');
    let end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59);
    
    return {
        members: allMembers.filter(m => {
            if (!m.addeddatetime) return false;
            let date = new Date(m.addeddatetime);
            return date >= start && date <= end;
        }),
        payments: allPayments.filter(p => {
            if (!p.paymentDate) return false;
            let date = new Date(p.paymentDate);
            return date >= start && date <= end;
        }),
        memberships: allMemberships
    };
}

// Generate Members Report
function generateMembersReport(members, tableHead, tableBody) {
    tableHead.html(`
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>NIC</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Membership</th>
            <th>Status</th>
            <th>Join Date</th>
        </tr>
    `);
    
    if (members.length === 0) {
        tableBody.html('<tr><td colspan="8" class="text-center">No members found in this date range</td></tr>');
        return;
    }
    
    members.forEach(member => {
        let membershipName = member.membership ? member.membership.name : 'N/A';
        let status = member.status ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-danger">Inactive</span>';
        let joinDate = member.addeddatetime ? 
            new Date(member.addeddatetime).toLocaleDateString() : 'N/A';
        
        tableBody.append(`
            <tr>
                <td>${member.id}</td>
                <td>${member.name}</td>
                <td>${member.nic || 'N/A'}</td>
                <td>${member.mobileno || 'N/A'}</td>
                <td>${member.email || 'N/A'}</td>
                <td>${membershipName}</td>
                <td>${status}</td>
                <td>${joinDate}</td>
            </tr>
        `);
    });
}

// Generate Payments Report
function generatePaymentsReport(payments, tableHead, tableBody) {
    tableHead.html(`
        <tr>
            <th>ID</th>
            <th>Member</th>
            <th>Membership</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Payment Date</th>
        </tr>
    `);
    
    if (payments.length === 0) {
        tableBody.html('<tr><td colspan="7" class="text-center">No payments found in this date range</td></tr>');
        return;
    }
    
    payments.forEach(payment => {
        let memberName = payment.member ? payment.member.name : 'N/A';
        let membershipName = payment.membership ? payment.membership.name : 'N/A';
        let statusBadge = getStatusBadge(payment.status);
        let paymentDate = payment.paymentDate ? 
            new Date(payment.paymentDate).toLocaleDateString() : 'N/A';
        
        tableBody.append(`
            <tr>
                <td>${payment.id}</td>
                <td>${memberName}</td>
                <td>${membershipName}</td>
                <td>LKR ${payment.amount ? payment.amount.toFixed(2) : '0.00'}</td>
                <td>${payment.paymentMethod || 'N/A'}</td>
                <td>${statusBadge}</td>
                <td>${paymentDate}</td>
            </tr>
        `);
    });
}

// Generate Memberships Report
function generateMembershipsReport(memberships, tableHead, tableBody) {
    tableHead.html(`
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Duration (Months)</th>
            <th>Status</th>
            <th>Sales Count</th>
            <th>Total Revenue</th>
        </tr>
    `);
    
    memberships.forEach(membership => {
        // Count sales for this membership
        let salesCount = allPayments.filter(p => 
            p.membership && p.membership.id === membership.id && p.status === 'PAID'
        ).length;
        
        let totalRevenue = allPayments.reduce((sum, p) => {
            if (p.membership && p.membership.id === membership.id && p.status === 'PAID') {
                return sum + (p.amount || 0);
            }
            return sum;
        }, 0);
        
        let status = membership.status ? 
            '<span class="badge bg-success">Active</span>' : 
            '<span class="badge bg-danger">Inactive</span>';
        
        tableBody.append(`
            <tr>
                <td>${membership.id}</td>
                <td>${membership.name}</td>
                <td>${membership.description || 'N/A'}</td>
                <td>LKR ${membership.price ? membership.price.toFixed(2) : '0.00'}</td>
                <td>${membership.durationMonths || 'N/A'}</td>
                <td>${status}</td>
                <td>${salesCount}</td>
                <td>LKR ${totalRevenue.toFixed(2)}</td>
            </tr>
        `);
    });
}

// Generate Classes Report
function generateClassesReport(tableHead, tableBody) {
    $.ajax({
        url: '/classes/alldata',
        type: 'GET',
        success: function(classes) {
            tableHead.html(`
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Trainer Type</th>
                    <th>Schedule</th>
                    <th>Capacity</th>
                    <th>Status</th>
                </tr>
            `);
            
            if (classes.length === 0) {
                tableBody.html('<tr><td colspan="6" class="text-center">No classes found</td></tr>');
                return;
            }
            
            classes.forEach(classEntity => {
                let trainerTypeName = classEntity.trainerType ? classEntity.trainerType.name : 'N/A';
                let status = classEntity.status ? 
                    '<span class="badge bg-success">Active</span>' : 
                    '<span class="badge bg-danger">Inactive</span>';
                
                tableBody.append(`
                    <tr>
                        <td>${classEntity.id}</td>
                        <td>${classEntity.name}</td>
                        <td>${trainerTypeName}</td>
                        <td>${classEntity.schedule || 'N/A'}</td>
                        <td>${classEntity.maxCapacity || 'N/A'}</td>
                        <td>${status}</td>
                    </tr>
                `);
            });
        },
        error: function() {
            tableBody.html('<tr><td colspan="6" class="text-center text-danger">Error loading classes</td></tr>');
        }
    });
}

// Get status badge HTML
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

// Export report to CSV
function exportReport() {
    let reportType = $('#reportType').val();
    let table = document.getElementById('reportTable');
    let rows = table.querySelectorAll('tr');
    
    if (rows.length <= 1) {
        showAlert('No data to export', 'warning');
        return;
    }
    
    let csv = [];
    rows.forEach(row => {
        let cols = row.querySelectorAll('td, th');
        let rowData = [];
        cols.forEach(col => {
            rowData.push('"' + col.innerText.replace(/"/g, '""') + '"');
        });
        csv.push(rowData.join(','));
    });
    
    let csvContent = '\uFEFF' + csv.join('\n');
    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement('a');
    let url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show/hide loading spinner
function showLoadingSpinner() {
    $('#loadingSpinner').show();
    $('#reportTableContainer').hide();
}

function hideLoadingSpinner() {
    $('#loadingSpinner').hide();
    $('#reportTableContainer').show();
}
