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
}