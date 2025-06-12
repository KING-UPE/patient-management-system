$(document).ready(function() {
    showSpinner();
    
    // Shared tag functionality
    initTagInputs();
    
    // Add Patient Form Submission (only for add-patient.html)
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
    $('#patientForm').submit(function(e) {
        e.preventDefault();
        handleAddPatient();
    });
}

function handleAddPatient() {
    showSpinner();
    
    const formData = {
        PID: $('#pid').val(),
        FirstName: $('#firstName').val(),
        LastName: $('#lastName').val(),
        Email: $('#email').val(),
        NearCity: $('#city').val(),
        Doctor: $('#doctor').val(),
        Guardian: $('#guardian').val(),
        Status: $('#status').val(),
        MedicalConditions: collectTags('#conditionsContainer'),
        Medications: collectTags('#medicationsContainer'),
        Allergies: collectTags('#allergiesContainer'),
        LastVisitDate: new Date()
    };

    // Validate required fields
    if (!formData.PID || !formData.FirstName || !formData.LastName) {
        showAlert('danger', 'PID, First Name, and Last Name are required');
        hideSpinner();
        return;
    }

    // Validate doctor exists if provided
    if (formData.Doctor) {
        $.get(`/api/doctors/${formData.Doctor}`)
            .then(function() {
                createPatient(formData);
            })
            .catch(function() {
                showAlert('danger', 'Selected doctor not found');
                hideSpinner();
            });
    } else {
        createPatient(formData);
    }
}

function createPatient(formData) {
    $.ajax({
        url: '/api/patients',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            showAlert('success', 'Patient created successfully!');
            setTimeout(() => {
                window.location.href = 'view-patients.html';
            }, 1500);
        },
        error: function(xhr) {
            let errorMsg = xhr.responseJSON?.error || 'Error creating patient';
            if (xhr.responseJSON?.errmsg && xhr.responseJSON.errmsg.includes('duplicate key')) {
                errorMsg = 'Patient ID already exists. Please use a unique PID.';
            }
            showAlert('danger', errorMsg);
        },
        complete: function() {
            hideSpinner();
        }
    });
}

/* ========== UPDATE PATIENT FUNCTIONS ========== */

function initUpdatePatientForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const pid = urlParams.get('pid');
    
    if (!pid) {
        showAlert('danger', 'No patient ID provided');
        setTimeout(() => window.location.href = 'view-patients.html', 2000);
        return;
    }

    // Load patient data
    loadPatientData(pid);

    // Set up form submission
    $('#patientForm').submit(function(e) {
        e.preventDefault();
        handleUpdatePatient(pid);
    });
}

function loadPatientData(pid) {
    showSpinner();
    
    $.get(`/api/patients/${pid}`)
        .then(function(patient) {
            // Populate form fields
            $('#pid').val(patient.PID).prop('readonly', true);
            $('#firstName').val(patient.FirstName);
            $('#lastName').val(patient.LastName);
            $('#email').val(patient.Email);
            $('#city').val(patient.NearCity);
            $('#guardian').val(patient.Guardian);
            $('#status').val(patient.Status || 'Active');
            
            // Handle doctor field
            let doctorDisplay = "No doctor assigned";
            let doctorId = null;
            
            if (patient.Doctor) {
                if (typeof patient.Doctor === 'object') {
                    doctorDisplay = `${patient.Doctor.name} - ${patient.Doctor.specialization}`;
                    doctorId = patient.Doctor._id;
                } else {
                    doctorDisplay = "[Doctor not found]";
                }
            }
            
            $('#doctorDisplay').val(doctorDisplay);
            $('#doctorId').val(doctorId);
            
            // Initialize tags
            initTags('#conditionsContainer', patient.MedicalConditions);
            initTags('#medicationsContainer', patient.Medications);
            initTags('#allergiesContainer', patient.Allergies);
        })
        .fail(function(error) {
            console.error('Error loading patient:', error);
            showAlert('danger', 'Failed to load patient data');
            setTimeout(() => window.location.href = 'view-patients.html', 2000);
        })
        .always(function() {
            hideSpinner();
        });
}

function initTags(containerId, tags) {
    const container = $(containerId);
    container.empty();
    
    if (tags && tags.length > 0) {
        tags.forEach(tag => {
            container.append(`
                <span class="badge bg-primary me-1 mb-1">
                    ${tag}
                    <span class="ms-1 remove-tag" style="cursor:pointer;">×</span>
                </span>
            `);
        });
        
        $('.remove-tag').click(function() {
            $(this).parent().remove();
        });
    }
}

function handleUpdatePatient(pid) {
    showSpinner();
    
    const formData = {
        FirstName: $('#firstName').val(),
        LastName: $('#lastName').val(),
        Email: $('#email').val(),
        NearCity: $('#city').val(),
        Doctor: $('#doctorId').val(),
        Guardian: $('#guardian').val(),
        Status: $('#status').val(),
        MedicalConditions: collectTags('#conditionsContainer'),
        Medications: collectTags('#medicationsContainer'),
        Allergies: collectTags('#allergiesContainer'),
        LastVisitDate: new Date()
    };

    // Validate doctor exists if provided
    if (formData.Doctor) {
        $.get(`/api/doctors/${formData.Doctor}`)
            .then(function() {
                updatePatient(pid, formData);
            })
            .catch(function() {
                showAlert('danger', 'Selected doctor not found');
                hideSpinner();
            });
    } else {
        updatePatient(pid, formData);
    }
}

function updatePatient(pid, formData) {
    $.ajax({
        url: `/api/patients/${pid}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function(response) {
            showAlert('success', 'Patient updated successfully!');
        },
        error: function(xhr) {
            let errorMsg = xhr.responseJSON?.error || 'Error updating patient';
            if (xhr.responseJSON?.errmsg && xhr.responseJSON.errmsg.includes('duplicate key')) {
                errorMsg = 'Patient ID already exists. Please use a unique PID.';
            }
            showAlert('danger', errorMsg);
        },
        complete: function() {
            hideSpinner();
        }
    });
}

/* ========== PATIENT LIST VIEW FUNCTIONS ========== */

function initPatientListView() {
    loadPatients();
    loadFilters();
    
    // Set up search/filter event handlers
    $('#searchByName, #searchByPid, #searchByGuardian').on('keyup', function() {
        loadPatients(
            $('#searchByName').val(),
            $('#searchByPid').val(),
            $('#searchByGuardian').val(),
            $('#filterByCity').val(),
            $('#filterByDoctor').val()
        );
    });
    
    $('#filterByCity, #filterByDoctor').on('change', function() {
        loadPatients(
            $('#searchByName').val(),
            $('#searchByPid').val(),
            $('#searchByGuardian').val(),
            $('#filterByCity').val(),
            $('#filterByDoctor').val()
        );
    });
    
    $('#resetFilters').click(function() {
        $('#searchByName, #searchByPid, #searchByGuardian').val('');
        $('#filterByCity, #filterByDoctor').val('');
        loadPatients();
    });
}

function loadPatients(name = '', pid = '', guardian = '', city = '', doctor = '') {
    showSpinner();
    
    $.get(`/api/patients?name=${name}&pid=${pid}&guardian=${guardian}&city=${city}&doctor=${doctor}`, function(patients) {
        const tableBody = $('#patientsTable tbody');
        tableBody.empty();
        
        if (!patients || patients.length === 0) {
            tableBody.append('<tr><td colspan="8" class="text-center">No patients found</td></tr>');
            hideSpinner();
            return;
        }
        
        patients.forEach(patient => {
            let doctorName = '-';
            if (patient.Doctor) {
                doctorName = typeof patient.Doctor === 'object' 
                    ? patient.Doctor.name 
                    : `Doctor ID: ${patient.Doctor}`;
            }

            const row = `
                <tr>
                    <td>${patient.PID}</td>
                    <td>${patient.FirstName} ${patient.LastName}</td>
                    <td>${patient.Email || '-'}</td>
                    <td>${patient.NearCity || '-'}</td>
                    <td>${doctorName}</td>
                    <td>${patient.Guardian || '-'}</td>
                    <td><span class="badge ${getStatusBadgeClass(patient.Status)}">${patient.Status}</span></td>
                    <td>
                        <a href="update-patient.html?pid=${patient.PID}" class="btn btn-sm btn-primary">Edit</a>
                        <button class="btn btn-sm btn-danger delete-patient" data-pid="${patient.PID}">Delete</button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
        
        $('.delete-patient').click(function() {
            const pid = $(this).data('pid');
            if (confirm(`Are you sure you want to delete patient ${pid}?`)) {
                deletePatient(pid);
            }
        });
        
        hideSpinner();
    }).fail(function(error) {
        console.error('Error loading patients:', error);
        showAlert('danger', 'Failed to load patients');
        hideSpinner();
    });
}

function loadFilters() {
    $.get('/api/patients', function(patients) {
        const cities = [...new Set(patients.map(p => p.NearCity).filter(c => c))];
        const guardians = [...new Set(patients.map(p => p.Guardian).filter(g => g))];
        
        const citySelect = $('#filterByCity');
        citySelect.empty().append('<option value="">All Cities</option>');
        cities.forEach(city => {
            citySelect.append(`<option value="${city}">${city}</option>`);
        });
        
        const guardianSelect = $('#filterByGuardian');
        guardianSelect.empty().append('<option value="">All Guardians</option>');
        guardians.forEach(guardian => {
            guardianSelect.append(`<option value="${guardian}">${guardian}</option>`);
        });
    });
    
    $.get('/api/doctors', function(doctors) {
        const doctorSelect = $('#filterByDoctor');
        doctorSelect.empty().append('<option value="">All Doctors</option>');
        
        doctors.forEach(doctor => {
            if (doctor.isActive) {
                doctorSelect.append(`<option value="${doctor._id}">${doctor.name}</option>`);
            }
        });
    });
}

function deletePatient(pid) {
    showSpinner();
    
    $.ajax({
        url: `/api/patients/${pid}`,
        type: 'DELETE',
        success: function() {
            showAlert('success', 'Patient deleted successfully');
            loadPatients(
                $('#searchByName').val(),
                $('#searchByPid').val(),
                $('#searchByGuardian').val(),
                $('#filterByCity').val(),
                $('#filterByDoctor').val()
            );
        },
        error: function(xhr) {
            showAlert('danger', xhr.responseJSON?.error || 'Error deleting patient');
        },
        complete: function() {
            hideSpinner();
        }
    });
}

/* ========== DASHBOARD FUNCTIONS ========== */

function loadDashboardStats() {
    $.get('/api/patients/stats', function(stats) {
        $('#totalPatients').text(stats.totalPatients || 0);
        $('#activePatients').text(stats.activePatients || 0);
        $('#doctorsCount').text(stats.doctorsCount || 0);
    }).fail(function() {
        $('#totalPatients').text('0');
        $('#activePatients').text('0');
        $('#doctorsCount').text('0');
    });
}

function loadRecentPatients() {
    $.get('/api/patients?limit=5', function(patients) {
        const container = $('#recentPatients');
        container.empty();
        
        if (!patients || patients.length === 0) {
            container.html('<p class="text-muted">No patients found</p>');
            return;
        }
        
        const list = $('<div class="list-group"></div>');
        
        patients.forEach(patient => {
            list.append(`
                <a href="update-patient.html?pid=${patient.PID}" class="list-group-item list-group-item-action">
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${patient.FirstName} ${patient.LastName}</h5>
                        <small>${patient.PID}</small>
                    </div>
                    <p class="mb-1">${patient.Doctor?.name || 'No doctor assigned'}</p>
                    <small class="text-muted">Last visit: ${patient.LastVisitDate ? new Date(patient.LastVisitDate).toLocaleDateString() : 'Never'}</small>
                </a>
            `);
        });
        
        container.append(list);
    });
}

/* ========== UTILITY FUNCTIONS ========== */

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Active': return 'bg-success';
        case 'Inactive': return 'bg-warning text-dark';
        case 'Deceased': return 'bg-secondary';
        default: return 'bg-primary';
    }
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