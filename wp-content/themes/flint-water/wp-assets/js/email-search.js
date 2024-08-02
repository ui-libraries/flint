jQuery(document).ready(function($) {
    $('#email-search-form').on('submit', function(event) {
        event.preventDefault()

        let search_email = $('#input-1').val()
        let date_from = $('#date-from').val()
        let date_to = $('#date-to').val()
        let subject = $('#input-4').val()
        let email_from = $('#input-5').val()
        let email_to = $('#input-6').val()
        let email_body = $('#textarea-1').val()

        let filters = []

        if (search_email) filters.push(`recipient_to,cs,${encodeURIComponent(search_email)}`)
        if (date_from && date_to) filters.push(`timestamp,bt,${encodeURIComponent(date_from)},${encodeURIComponent(date_to)}`)
        if (subject) filters.push(`subject,cs,${encodeURIComponent(subject)}`)
        if (email_from) filters.push(`sender,cs,${encodeURIComponent(email_from)}`)
        if (email_to) filters.push(`recipient_to,cs,${encodeURIComponent(email_to)}`)
        if (email_body) filters.push(`full_text,cs,${encodeURIComponent(email_body)}`)

        let apiUrl = 'https://s-lib007.lib.uiowa.edu/flint/api/api.php/records/emails'
        if (filters.length > 0) {
            apiUrl += '?filter=' + filters.join(',')
        }

        console.log('API URL:', apiUrl)

        // Send the form data to the API
        $.ajax({
            url: apiUrl,
            type: 'GET',
            success: function(response) {
                console.log('API Response:', response)
            },
            error: function(xhr, status, error) {
                console.error('Error:', error)
                console.error('Status:', status)
                console.error('Response Text:', xhr.responseText)
                console.error('Full Response:', xhr)
            }
        })
    })
})

