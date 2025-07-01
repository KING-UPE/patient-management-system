$(document).ready(function() {
    showSpinner();
    initTagInputs();

    if (window.location.pathname.includes('add-patient.html')) {
        initAddPatientForm();
    }
    
    // Update Patient Form Submission (only for update-patient.html)
    if (window.location.pathname.includes('update-patient.html')) {
        initUpdatePatientForm();
    }

    // Load patients for view page
    if ($('#patientsTable').length) {
        initPatientListView();
    }

    // Load dashboard stats
    if ($('#totalPatients').length) {
        loadDashboardStats();
        loadRecentPatients();
    }

    // Load doctors dropdown for forms
    if ($('#doctor').length) {
        loadDoctorsDropdown();
    }

    setTimeout(function() {
        $('#spinner').fadeOut();
    }, 5000);
});

/* ========== SHARED FUNCTIONS ========== */

function initTagInputs() {
    $('.tag-input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            addTag($(this));
        }
    });

    $('.add-tag-btn').click(function() {
        const input = $(this).siblings('.tag-input');
        addTag(input);
    });
}

function addTag(input) {
    const value = input.val().trim();
    if (!value) return;  // Don't add empty tags
    
    let container;
    if (input.attr('id') === 'conditionInput') {
        container = $('#conditionsContainer');
    } else if (input.attr('id') === 'medicationInput') {
        container = $('#medicationsContainer');
    } else if (input.attr('id') === 'allergyInput') {
        container = $('#allergiesContainer');
    } else {
        return;
    }

    const existingTags = container.find('.badge').map(function() {
        return $(this).text().replace('×', '').trim();
    }).get();
    
    if (existingTags.includes(value)) {
        input.val('');
        return;
    }

    const tag = $(`
        <span class="badge bg-primary me-1 mb-1">
            ${value}
            <span class="ms-1 remove-tag" style="cursor:pointer;">×</span>
        </span>
    `);
    
    container.append(tag);
    input.val('');
    
    tag.find('.remove-tag').click(function() {
        tag.remove();
    });
}

function collectTags(containerSelector) {
    const tags = [];
    $(`${containerSelector} .badge`).each(function() {
        tags.push($(this).text().replace('×', '').trim());
    });
    return tags;
}

function loadDoctorsDropdown() {
    $.get('/api/doctors?isActive=true', function(doctors) {
        const doctorSelect = $('#doctor');
        doctorSelect.empty().append('<option value="">Select Doctor</option>');
        
        doctors.forEach(doctor => {
            doctorSelect.append(`<option value="${doctor._id}">${doctor.name} - ${doctor.specialization}</option>`);
        });
    }).fail(function() {
        console.error('Failed to load doctors');
    });
}

/* ========== ADD PATIENT FUNCTIONS ========== */

function initAddPatientForm() {
    // Set PID field to "Auto-generated" and readonly
    $('#pid').val('Auto-generated').prop('readonly', true);
    
    $('#patientForm').submit(function(e) {
        e.preventDefault();
        handleAddPatient();
    });
}

function handleAddPatient() {
    showSpinner();
    const submitBtn = $('#patientForm button[type="submit"]');
    submitBtn.prop('disabled', true);
    
    // Collect form data
    const formData = {
        FirstName: $('#firstName').val().trim(),
        LastName: $('#lastName').val().trim(),
        Email: $('#email').val().trim(),
        NearCity: $('#city').val().trim(),
        Doctor: $('#doctor').val(),
        Guardian: $('#guardian').val().trim(),
        Status: $('#status').val(),
        MedicalConditions: collectTags('#conditionsContainer'),
        Medications: collectTags('#medicationsContainer'),
        Allergies: collectTags('#allergiesContainer')
    };

    // Client-side validation
    if (!formData.FirstName || !formData.LastName) {
        showAlert('danger', 'First Name and Last Name are required');
        hideSpinner();
        submitBtn.prop('disabled', false);
        return;
    }

    createPatient(formData, submitBtn);
}

function createPatient(formData, submitBtn) {
    $.ajax({
        url: '/api/patients',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            showAlert('success', `Patient created successfully! ID: ${response.PID}`);
            // Reset form
            $('#patientForm')[0].reset();
            $('.tag-container').empty();
            
            setTimeout(() => {
                window.location.href = 'view-patients.html';
            }, 2000);
        },
        error: function(xhr) {
            let errorMsg = 'Error creating patient';
            if (xhr.responseJSON) {
                if (xhr.responseJSON.error === 'Validation failed') {
                    errorMsg = 'Validation errors:<ul>';
                    for (const [field, message] of Object.entries(xhr.responseJSON.details)) {
                        errorMsg += `<li>${field}: ${message}</li>`;
                    }
                    errorMsg += '</ul>';
                } else {
                    errorMsg = xhr.responseJSON.error || errorMsg;
                }
            }
            showAlert('danger', errorMsg);
        },
        complete: function() {
            hideSpinner();
            submitBtn.prop('disabled', false);
        }
    });
}

/* ========== UTILITY FUNCTIONS ========== */

function showAlert(type, message) {
    const alert = $(`
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    
    $('#formResponse').html(alert);
    
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

function showSpinner() {
    $('#spinner').css({
        'opacity': '1',
        'visibility': 'visible'
    });
}

function hideSpinner() {
    $('#spinner').css({
        'opacity': '0',
        'visibility': 'hidden'
    });
}$(document).ready(function() {
    showSpinner();
    initTagInputs();

    if (window.location.pathname.includes('add-patient.html')) {
        initAddPatientForm();
    }
    
    if (window.location.pathname.includes('update-patient.html')) {
        initUpdatePatientForm();
    }

    if ($('#patientsTable').length) {
        initPatientListView();
    }

    if ($('#totalPatients').length) {
        loadDashboardStats();
        loadRecentPatients();
    }

    if ($('#doctor').length || $('#doctorSelect').length) {
        loadDoctorsDropdown();
    }

    setTimeout(function() {
        $('#spinner').fadeOut();
    }, 5000);
});

/* ========== SHARED FUNCTIONS ========== */

function initTagInputs() {
    $('.tag-input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            addTag($(this));
        }
    });

    $('.add-tag-btn').click(function() {
        const input = $(this).siblings('.tag-input');
        addTag(input);
    });
}

function addTag(input) {
    const value = input.val().trim();
    if (!value) return;  // Don't add empty tags
    
    let container;
    if (input.attr('id') === 'conditionInput') {
        container = $('#conditionsContainer');
    } else if (input.attr('id') === 'medicationInput') {
        container = $('#medicationsContainer');
    } else if (input.attr('id') === 'allergyInput') {
        container = $('#allergiesContainer');
    } else {
        return;
    }

    const existingTags = container.find('.badge').map(function() {
        return $(this).text().replace('×', '').trim();
    }).get();
    
    if (existingTags.includes(value)) {
        input.val('');
        return;
    }

    const tag = $(`
        <span class="badge bg-primary me-1 mb-1">
            ${value}
            <span class="ms-1 remove-tag" style="cursor:pointer;">×</span>
        </span>
    `);
    
    container.append(tag);
    input.val('');
    
    tag.find('.remove-tag').click(function() {
        tag.remove();
    });
}

function collectTags(containerSelector) {
    const tags = [];
    $(`${containerSelector} .badge`).each(function() {
        tags.push($(this).text().replace('×', '').trim());
    });
    return tags;
}

function loadDoctorsDropdown() {
    $.get('/api/doctors?isActive=true', function(doctors) {
        // For add patient form
        if ($('#doctor').length) {
            const doctorSelect = $('#doctor');
            doctorSelect.empty().append('<option value="">Select Doctor</option>');
            
            doctors.forEach(doctor => {
                doctorSelect.append(`<option value="${doctor._id}">${doctor.name} - ${doctor.specialization}</option>`);
            });
        }
        
        // For update patient form
        if ($('#doctorSelect').length) {
            const doctorSelect = $('#doctorSelect');
            doctorSelect.empty().append('<option value="">Select Doctor</option>');
            
            doctors.forEach(doctor => {
                doctorSelect.append(`<option value="${doctor._id}">${doctor.name} - ${doctor.specialization}</option>`);
            });
        }
    }).fail(function() {
        console.error('Failed to load doctors');
    });
}

function showAlert(type, message) {
    const alert = $(`
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);
    
    $('#formResponse').html(alert);
    
    setTimeout(() => {
        alert.alert('close');
    }, 5000);
}

function showSpinner() {
    $('#spinner').css({
        'opacity': '1',
        'visibility': 'visible'
    });
}

function hideSpinner() {
    $('#spinner').css({
        'opacity': '0',
        'visibility': 'hidden'
    });
}

/* ========== ADD PATIENT FUNCTIONS ========== */

function initAddPatientForm() {
    $('#pid').val('Auto-generated').prop('readonly', true);
    
    $('#patientForm').submit(function(e) {
        e.preventDefault();
        handleAddPatient();
    });
}

function handleAddPatient() {
    showSpinner();
    const submitBtn = $('#patientForm button[type="submit"]');
    submitBtn.prop('disabled', true);
    
    const formData = {
        FirstName: $('#firstName').val().trim(),
        LastName: $('#lastName').val().trim(),
        Email: $('#email').val().trim(),
        NearCity: $('#city').val().trim(),
        Doctor: $('#doctor').val(),
        Guardian: $('#guardian').val().trim(),
        Status: $('#status').val(),
        MedicalConditions: collectTags('#conditionsContainer'),
        Medications: collectTags('#medicationsContainer'),
        Allergies: collectTags('#allergiesContainer')
    };

    if (!formData.FirstName || !formData.LastName) {
        showAlert('danger', 'First Name and Last Name are required');
        hideSpinner();
        submitBtn.prop('disabled', false);
        return;
    }

    createPatient(formData, submitBtn);
}

function createPatient(formData, submitBtn) {
    $.ajax({
        url: '/api/patients',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            showAlert('success', `Patient created successfully! ID: ${response.PID}`);
            $('#patientForm')[0].reset();
            $('.tag-container').empty();
            
            setTimeout(() => {
                window.location.href = 'view-patients.html';
            }, 2000);
        },
        error: function(xhr) {
            let errorMsg = 'Error creating patient';
            if (xhr.responseJSON) {
                if (xhr.responseJSON.error === 'Validation failed') {
                    errorMsg = 'Validation errors:<ul>';
                    for (const [field, message] of Object.entries(xhr.responseJSON.details)) {
                        errorMsg += `<li>${field}: ${message}</li>`;
                    }
                    errorMsg += '</ul>';
                } else {
                    errorMsg = xhr.responseJSON.error || errorMsg;
                }
            }
            showAlert('danger', errorMsg);
        },
        complete: function() {
            hideSpinner();
            submitBtn.prop('disabled', false);
        }
    });
}

/* ========== UPDATE PATIENT FUNCTIONS ========== */

function initUpdatePatientForm() {
    // Get patient ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('pid');
    
    if (!pid) {
        showAlert('danger', 'No patient ID provided in URL');
        return;
    }
    
    loadPatientData(pid);
    initDoctorSelectionUI();
    
    $('#patientForm').submit(function(e) {
        e.preventDefault();
        handleUpdatePatient(pid);
    });
}

function loadPatientData(pid) {
    showSpinner();
    
    $.get(`/api/patients/${pid}`, function(patient) {
        $('#pid').val(patient.PID);
        $('#firstName').val(patient.FirstName);
        $('#lastName').val(patient.LastName);
        $('#email').val(patient.Email);
        $('#city').val(patient.NearCity);
        $('#guardian').val(patient.Guardian);
        $('#status').val(patient.Status);
        
        // Set doctor if exists
        if (patient.Doctor) {
            $('#doctorId').val(patient.Doctor._id);
            $('#doctorDisplay').val(patient.Doctor.name);
        }
        
        // Load arrays (conditions, medications, allergies)
        loadTags(patient.MedicalConditions, '#conditionsContainer');
        loadTags(patient.Medications, '#medicationsContainer');
        loadTags(patient.Allergies, '#allergiesContainer');
    }).fail(function(xhr) {
        showAlert('danger', xhr.responseJSON?.error || 'Failed to load patient data');
    }).always(function() {
        hideSpinner();
    });
}

function loadTags(items, containerSelector) {
    if (items && items.length > 0) {
        const container = $(containerSelector);
        container.empty();
        
        items.forEach(item => {
            const tag = $(`
                <span class="badge bg-primary me-1 mb-1">
                    ${item}
                    <span class="ms-1 remove-tag" style="cursor:pointer;">×</span>
                </span>
            `);
            
            container.append(tag);
            
            tag.find('.remove-tag').click(function() {
                tag.remove();
            });
        });
    }
}

function initDoctorSelectionUI() {
    $('#changeDoctorBtn').click(function() {
        $('#doctorDisplay').hide();
        $('#doctorSelectContainer').show();
    });
    
    $('#saveDoctorBtn').click(function() {
        const selected = $('#doctorSelect').val();
        const selectedText = $('#doctorSelect option:selected').text();
        
        if (selected) {
            $('#doctorId').val(selected);
            $('#doctorDisplay').val(selectedText.split(' - ')[0]).show();
            $('#doctorSelectContainer').hide();
        }
    });
    
    $('#cancelDoctorBtn').click(function() {
        $('#doctorSelectContainer').hide();
        $('#doctorDisplay').show();
    });
}

function handleUpdatePatient(pid) {
    showSpinner();
    const submitBtn = $('#patientForm button[type="submit"]');
    submitBtn.prop('disabled', true);
    
    const formData = {
        FirstName: $('#firstName').val().trim(),
        LastName: $('#lastName').val().trim(),
        Email: $('#email').val().trim(),
        NearCity: $('#city').val().trim(),
        Doctor: $('#doctorId').val() || null,
        Guardian: $('#guardian').val().trim(),
        Status: $('#status').val(),
        MedicalConditions: collectTags('#conditionsContainer'),
        Medications: collectTags('#medicationsContainer'),
        Allergies: collectTags('#allergiesContainer')
    };

    if (!formData.FirstName || !formData.LastName) {
        showAlert('danger', 'First Name and Last Name are required');
        hideSpinner();
        submitBtn.prop('disabled', false);
        return;
    }

    updatePatient(pid, formData, submitBtn);
}

function updatePatient(pid, formData, submitBtn) {
    $.ajax({
        url: `/api/patients/${pid}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            showAlert('success', 'Patient updated successfully!');
            setTimeout(() => {
                window.location.href = 'view-patients.html';
            }, 1500);
        },
        error: function(xhr) {
            let errorMsg = 'Error updating patient';
            if (xhr.responseJSON) {
                if (xhr.responseJSON.error === 'Validation failed') {
                    errorMsg = 'Validation errors:<ul>';
                    for (const [field, message] of Object.entries(xhr.responseJSON.details)) {
                        errorMsg += `<li>${field}: ${message}</li>`;
                    }
                    errorMsg += '</ul>';
                } else {
                    errorMsg = xhr.responseJSON.error || errorMsg;
                }
            }
            showAlert('danger', errorMsg);
        },
        complete: function() {
            hideSpinner();
            submitBtn.prop('disabled', false);
        }
    });
}

/* ========== VIEW PATIENTS FUNCTIONS ========== */

function initPatientListView() {
    // Check if DataTable is already initialized
    const dataTable = $('#patientsTable').DataTable();
    if (dataTable) {
        dataTable.destroy();
    }

    const table = $('#patientsTable').DataTable({
        ajax: {
            url: '/api/patients',
            dataSrc: ''
        },
        columns: [
            { data: 'PID' },
            { 
                data: null,
                render: function(data) {
                    return `${data.FirstName} ${data.LastName}`;
                }
            },
            { data: 'Email' },
            { data: 'NearCity' },
            { 
                data: 'Doctor',
                render: function(data) {
                    return data ? data.name : 'None';
                }
            },
            { data: 'Guardian' },
            { 
                data: 'Status',
                render: function(data) {
                    let badgeClass = 'bg-primary';
                    if (data === 'Inactive') badgeClass = 'bg-warning';
                    if (data === 'Deceased') badgeClass = 'bg-danger';
                    return `<span class="badge ${badgeClass}">${data}</span>`;
                }
            },
            {
                data: 'PID',
                render: function(data) {
                    return `
                        <a href="update-patient.html?pid=${data}" class="btn btn-sm btn-primary me-1">Edit</a>
                        <button class="btn btn-sm btn-danger delete-btn" data-pid="${data}">Delete</button>
                    `;
                }
            }
        ],
        responsive: true
    });

    // Search functionality
    $('#searchByName').keyup(function() {
        table.columns(1).search(this.value).draw();
    });

    $('#searchByPid').keyup(function() {
        table.columns(0).search(this.value).draw();
    });

    $('#searchByGuardian').keyup(function() {
        table.columns(5).search(this.value).draw();
    });

    // Filter by city
    $.get('/api/patients', function(patients) {
        const cities = [...new Set(patients.map(p => p.NearCity).filter(Boolean))];
        const citySelect = $('#filterByCity');
        citySelect.empty().append('<option value="">All Cities</option>');
        
        cities.forEach(city => {
            citySelect.append(`<option value="${city}">${city}</option>`);
        });
    });

    $('#filterByCity').change(function() {
        table.columns(3).search(this.value).draw();
    });

    // Filter by doctor
    $.get('/api/doctors', function(doctors) {
        const doctorSelect = $('#filterByDoctor');
        doctorSelect.empty().append('<option value="">All Doctors</option>');
        
        doctors.forEach(doctor => {
            if (doctor.isActive) {
                doctorSelect.append(`<option value="${doctor._id}">${doctor.name}</option>`);
            }
        });
    });

    $('#filterByDoctor').change(function() {
        table.columns(4).search(this.value).draw();
    });

    // Reset filters
    $('#resetFilters').click(function() {
        $('#searchByName').val('');
        $('#searchByPid').val('');
        $('#searchByGuardian').val('');
        $('#filterByCity').val('');
        $('#filterByDoctor').val('');
        table.search('').columns().search('').draw();
    });

    // Delete patient
    $('#patientsTable').on('click', '.delete-btn', function() {
        const pid = $(this).data('pid');
        if (confirm(`Are you sure you want to delete patient ${pid}?`)) {
            deletePatient(pid, table);
        }
    });
}

function deletePatient(pid, table) {
    showSpinner();
    
    $.ajax({
        url: `/api/patients/${pid}`,
        type: 'DELETE',
        success: function() {
            table.ajax.reload();
            showAlert('success', `Patient ${pid} deleted successfully`);
        },
        error: function(xhr) {
            showAlert('danger', xhr.responseJSON?.error || 'Failed to delete patient');
        },
        complete: function() {
            hideSpinner();
        }
    });
}

/* ========== DASHBOARD FUNCTIONS ========== */

function loadDashboardStats() {
    $.get('/api/patients/stats', function(stats) {
        $('#totalPatients').text(stats.totalPatients);
        $('#activePatients').text(stats.activePatients);
        $('#doctorsCount').text(stats.doctorsCount);
    }).fail(function() {
        console.error('Failed to load dashboard stats');
    });
}

function loadRecentPatients() {
    $.get('/api/patients?limit=5', function(patients) {
        const container = $('#recentPatients');
        container.empty();
        
        patients.forEach(patient => {
            container.append(`
                <div class="d-flex border-bottom py-2">
                    <div class="flex-grow-1">
                        <h6 class="mb-0 text-dark">${patient.FirstName} ${patient.LastName}</h6>
                        <small class="text-muted">PID: ${patient.PID}</small>
                    </div>
                    <div>
                        <span class="badge ${patient.Status === 'Active' ? 'bg-primary' : 'bg-secondary'}">
                            ${patient.Status}
                        </span>
                    </div>
                </div>
            `);
        });
    }).fail(function() {
        console.error('Failed to load recent patients');
    });
}