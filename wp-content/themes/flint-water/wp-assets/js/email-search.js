jQuery(document).ready(function($) {
    // Initialize variables
    let page = 1  // Start with the first page
    let pageSize = 50  // Number of records per page, can be adjusted
    let apiUrl = ''  // Base API URL will be constructed dynamically
    let flintChart

    function countEmailsPerDay(emails) {
        const counts = {}
        
        emails.forEach(email => {
            const date = moment.unix(email.timestamp).format("YYYY-MM-DD")
            counts[date] = (counts[date] || 0) + 1
        })
        
        return counts
    }

    // Function to add a new search row
    const newRowTemplate = `
        <tr class="searchRow">
            <td>
                <select class="form-control logicOperator">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                    <option value="NOT">NOT</option>
                </select>
            </td>
            <td><input type="text" placeholder="Enter search term..." class="form-control" /></td>
            <td>
                <select class="form-control">
                    <option value="sender/receiver">Sender/Receiver</option>
                    <option value="subject">Subject Line</option>
                    <option value="keyword">Keyword</option>
                </select>
            </td>
            <td><button class="btn btn-danger removeRow" type="button">-</button></td>
        </tr>
    `

    // Add a new row when "Add Search Field" button is clicked
    $('#addRow').on('click', function() {
        let lastRow = $('#searchTable tbody tr:last')
        $(newRowTemplate).insertAfter(lastRow)
    })

    // Remove a search row when the "-" button is clicked
    $('#searchTable').on('click', '.removeRow', function() {
        let currentRow = $(this).closest('.searchRow')
        if ($("#searchTable .searchRow").length > 1) { 
            currentRow.remove()
        }
    })

    // Handle the form submission
    $('#email-search-form').on('submit', function(event) {
        event.preventDefault()
        console.log("submitting form")

        // Gather form data
        let searchData = []

        $('#searchTable .searchRow').each(function() {
            let searchTerm = $(this).find('input').val()
            let criteria = $(this).find('select:not(.logicOperator)').val()
            let logicOperator = $(this).find('.logicOperator').val()

            let row = {
                searchTerm: searchTerm,
                criteria: criteria,
                logicOperator: logicOperator
            }

            searchData.push(row)
        })

        let minDate = $('#min').val()
        let maxDate = $('#max').val()

        let allData = {
            search: searchData,
            minDate: minDate,
            maxDate: maxDate
        }

        // Construct the API URL
        apiUrl = constructApiUrl(allData)

        console.log('API URL:', apiUrl)

        // Fetch data and render results
        fetchData(apiUrl)
            .then(response => {
                renderResults(response)
                setupLoadMoreButton(response)
                renderChart(response)
            })
            .catch(error => {
                console.error('Failed to fetch data:', error)
            })
    })

    // Function to construct the API URL
    function constructApiUrl(params) {
        const baseApiUrl = "https://s-lib007.lib.uiowa.edu/flint/api/api.php/records/emails"
        const filters = []

        params.search.forEach(term => {
            const value = encodeURIComponent(term.searchTerm)
            let filterKey = 'filter'
            
            switch (term.criteria) {
                case "sender/receiver":
                    filters.push(`filter1=sender,cs,${formatName(value)}`)
                    filters.push(`filter2=recipient_to,cs,${formatName(value)}`)
                    break
                case "keyword":
                    filters.push(`${filterKey}=full_text,cs,${value}`)
                    break
                case "subject":
                    filters.push(`${filterKey}=subject,cs,${value}`)
                    break
                default:
                    throw new Error(`Unsupported criteria: ${term.criteria}`)
            }

            if (term.logicOperator === "NOT") {
                const lastIndex = filters.length - 1
                filters[lastIndex] = `${filterKey}=!${filters[lastIndex].split('=')[1]}`
            }
        })

        if (params.minDate) {
            filters.push(`filter=timestamp,ge,${toUnixTimestamp(params.minDate)}`)
        }
        if (params.maxDate) {
            filters.push(`filter=timestamp,le,${toUnixTimestamp(params.maxDate)}`)
        }

        return `${baseApiUrl}?${filters.join('&')}&order=id&page=${page},${pageSize}`
    }

    // Fetch data from the API
    function fetchData(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    console.log('API Response:', response)
                    resolve(response)
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error)
                    console.error('Status:', status)
                    console.error('Response Text:', xhr.responseText)
                    reject(error)  // Rejecting the promise with the error
                }
            })
        })
    }

    // Render search results
    function renderResults(response) {
        console.log('inside renderResults')
        let resultsContainer = $('#emailTable tbody')
        let paginationContainer = $('#pagination')
        
        // Clear previous results and pagination if on the first page
        if (page === 1) {
            resultsContainer.empty()
            paginationContainer.empty()
        }
    
        if (response.records.length === 0 && page === 1) {
            resultsContainer.append('<tr><td colspan="5">No records found</td></tr>')
        } else {
            // Append the new results to the table
            console.log('appending')
            response.records.forEach(record => {
                let resultRow = `
                    <tr>
                        <td>${record.sender}</td>
                        <td>${record.recipient_to}</td>
                        <td>${record.subject}</td>
                        <td>${new Date(record.timestamp * 1000).toLocaleString()}</td>
                        <td><a href="${record.bookmark_url}" target="_blank" title="Open PDF"><i class="fas fa-file-pdf fa-2x" style="color: #FF0000;"></i></a></td>
                    </tr>
                `
                resultsContainer.append(resultRow)
            })
            console.log('trying to render the chart...')
            renderChart(response)
        }
    }
    

    // Setup "Load More" button for pagination
    function setupLoadMoreButton(response) {
        let paginationContainer = $('#pagination')

        // If there are more pages, show the "Load More" button
        if (response.records.length === pageSize) {
            let loadMoreButton = $('<button>Load More</button>').on('click', function() {
                page++
                let nextPageUrl = apiUrl.replace(/page=\d+,\d+/, `page=${page},${pageSize}`)
                fetchData(nextPageUrl)
                    .then(newResponse => {
                        renderResults(newResponse)
                        setupLoadMoreButton(newResponse)
                    })
                    .catch(error => {
                        console.error('Failed to fetch data for next page:', error)
                    })
            })
            paginationContainer.append(loadMoreButton)
        }
    }

    function renderChart(results) {
        //console.log(JSON.stringify(results))
        console.log('inside renderChart')
        const emails = results.records
        const emailCounts = countEmailsPerDay(emails)
    
        const labels = Object.keys(emailCounts).map(date => moment(date).format("YYYY-MM-DD"))
        const data = Object.values(emailCounts)
    
        const ctx = document.getElementById('emailChart').getContext('2d')
        if (flintChart) flintChart.destroy()
        
    
        flintChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Number of emails per day`,
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'category',
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })
        console.log('the chart', flintChart)
    }

    // Utility function to format the name
    function formatName(encodedName) {
        const inputName = decodeURIComponent(encodedName)
        const trimmedName = inputName.trim()
        const lastSpaceIndex = trimmedName.lastIndexOf(' ')

        if (lastSpaceIndex === -1) return trimmedName

        const firstName = trimmedName.substring(0, lastSpaceIndex).trim()
        const lastName = trimmedName.substring(lastSpaceIndex).trim()

        return encodeURIComponent(`${lastName}, ${firstName}`)
    }

    // Utility function to convert date to UNIX timestamp
    function toUnixTimestamp(dateString) {
        return Math.floor(new Date(dateString).getTime() / 1000)
    }
})
