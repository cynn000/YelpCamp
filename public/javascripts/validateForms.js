// File for validating forms

// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    // to use bs-custom-file-input
    // to have the edit and new forms display the name of image file
    bsCustomFileInput.init()

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form')

    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }

                form.classList.add('was-validated')
            }, false)
        })
})()