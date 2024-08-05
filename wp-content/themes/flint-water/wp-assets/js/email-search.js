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
        let page = 1  // Start with the first page
        let pageSize = 50  // Number of records per page, can be adjusted

        let filters = []

        if (search_email) filters.push(`recipient_to,cs,${encodeURIComponent(search_email)}`)
        
        // Convert dates to Unix timestamps if provided
        if (date_from && date_to) {
            let date_from_timestamp = Math.floor(new Date(date_from).getTime() / 1000)
            let date_to_timestamp = Math.floor(new Date(date_to).getTime() / 1000)
            filters.push(`timestamp,bt,${date_from_timestamp},${date_to_timestamp}`)
        }

        if (subject) filters.push(`subject,cs,${encodeURIComponent(subject)}`)
        if (email_from) filters.push(`sender,cs,${encodeURIComponent(email_from)}`)
        if (email_to) filters.push(`recipient_to,cs,${encodeURIComponent(email_to)}`)
        if (email_body) filters.push(`full_text,cs,${encodeURIComponent(email_body)}`)

        let apiUrl = 'https://s-lib007.lib.uiowa.edu/flint/api/api.php/records/emails'
        if (filters.length > 0) {
            apiUrl += '?filter=' + filters.join(',')
        }

        // Add order and pagination parameters to the URL
        apiUrl += '&order=id&page=' + page + ',' + pageSize

        console.log('API URL:', apiUrl)
        console.log('Filters:', filters)

        // Function to fetch data
        function fetchData(url) {
            $.ajax({
                url: url,
                type: 'GET',
                headers: {
                    // Add any required headers here
                    // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
                    // 'Content-Type': 'application/json'
                },
                success: function(response) {
                    console.log('API Response:', response)
                    let resultsContainer = $('#search-results')
                    let paginationContainer = $('#pagination')
                    
                    // Clear previous results and pagination
                    if (page === 1) {
                        resultsContainer.empty()
                        paginationContainer.empty()
                    }

                    if (response.records.length === 0 && page === 1) {
                        resultsContainer.append('<p>No records found</p>')
                    } else {
                        // Append the new results
                        response.records.forEach(record => {
                            let resultHtml = `
                                <div class="email-result">
                                    <h3>${record.subject}</h3>
                                    <p><strong>From:</strong> ${record.sender}</p>
                                    <p><strong>To:</strong> ${record.recipient_to}</p>
                                    <p><strong>Date:</strong> ${new Date(record.timestamp * 1000).toLocaleString()}</p>
                                    <p>${record.body_text}</p>
                                </div>
                            `
                            resultsContainer.append(resultHtml)
                        })

                        // If there are more pages, show the "Load More" button
                        if (response.records.length === pageSize) {
                            let loadMoreButton = $('<button>Load More</button>').on('click', function() {
                                page++
                                let nextPageUrl = apiUrl.replace(/page=\d+,\d+/, `page=${page},${pageSize}`)
                                fetchData(nextPageUrl)
                            })
                            paginationContainer.append(loadMoreButton)
                        }
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error)
                    console.error('Status:', status)
                    console.error('Response Text:', xhr.responseText)
                    console.error('Full Response:', xhr)
                }
            })
        }

        // Initial data fetch
        fetchData(apiUrl)
    })
})

