jQuery(document).ready(function($) {
    // Initialize variables
    let page = 1; // Start with the first page
    const pageSize = 50; // Number of records per page
    let apiUrl = ''; // Base API URL
    let flintChart, table;
    let allRecords = []; // Store all records

    // Add loading spinner to HTML
    $('#emailTable').before('<div id="loadingSpinner" class="loading-spinner" style="display: none;"><i class="fas fa-spinner fa-spin fa-3x"></i> Loading...</div>');

    function countEmailsPerDay(emails) {
        const counts = {};
        
        // Sort emails by timestamp (oldest to newest)
        emails.sort((a, b) => a.timestamp - b.timestamp);
        
        emails.forEach(email => {
            const date = moment.unix(email.timestamp).format("YYYY-MM-DD");
            counts[date] = (counts[date] || 0) + 1;
        });
        
        // Sort dates chronologically (YYYY-MM-DD)
        return Object.fromEntries(
            Object.entries(counts).sort()
        );
    }

    // New row template for search form
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
    `;

    // Add row
    $('#addRow').on('click', function() {
        let lastRow = $('#searchTable tbody tr:last');
        $(newRowTemplate).insertAfter(lastRow);
    });

    // Remove row
    $('#searchTable').on('click', '.removeRow', function() {
        let currentRow = $(this).closest('.searchRow');
        if ($("#searchTable .searchRow").length > 1) { 
            currentRow.remove();
        }
    });

    // Form submission
    $('#email-search-form').on('submit', function(event) {
        event.preventDefault();
        console.log("submitting form");
        page = 1; // Reset to first page
        allRecords = []; // Reset all records

        let searchData = [];
        $('#searchTable .searchRow').each(function() {
            let searchTerm = $(this).find('input').val();
            let criteria = $(this).find('select:not(.logicOperator)').val();
            let logicOperator = $(this).find('.logicOperator').val();

            let row = {
                searchTerm: searchTerm,
                criteria: criteria,
                logicOperator: logicOperator || "AND"
            };
            searchData.push(row);
        });

        let minDate = $('#min').val();
        let maxDate = $('#max').val();

        let allData = {
            search: searchData,
            minDate: minDate,
            maxDate: maxDate
        };

        apiUrl = constructApiUrl(allData);
        $('#loadingSpinner').show(); // Show spinner before fetching
        fetchAllPages(apiUrl)
            .then(() => {
                renderResults({ records: allRecords, results: allRecords.length });
                renderChart({ records: allRecords });
                $('#loadingSpinner').hide(); // Hide spinner after rendering
            })
            .catch(error => {
                console.error('Failed to fetch all data:', error);
                $('#loadingSpinner').hide(); // Hide spinner on error
            });
    });

    // Construct API URL (without page initially, but used per page in fetchAllPages)
    function constructApiUrl(params) {
        const baseApiUrl = "https://s-lib007.lib.uiowa.edu/flint/api/api.php/records/emails";
        const filters = [];

        params.search.forEach(term => {
            const value = encodeURIComponent(term.searchTerm);
            let filterKey = 'filter';
            
            switch (term.criteria) {
                case "sender/receiver":
                    filters.push(`filter1=sender,cs,${formatName(value)}`);
                    filters.push(`filter2=recipient_to,cs,${formatName(value)}`);
                    break;
                case "keyword":
                    filters.push(`${filterKey}=full_text,cs,${value}`);
                    break;
                case "subject":
                    filters.push(`${filterKey}=subject,cs,${value}`);
                    break;
                default:
                    throw new Error(`Unsupported criteria: ${term.criteria}`);
            }

            if (term.logicOperator === "NOT") {
                const lastIndex = filters.length - 1;
                filters[lastIndex] = `${filterKey}=!${filters[lastIndex].split('=')[1]}`;
            }
        });

        if (params.minDate) {
            filters.push(`filter=timestamp,ge,${toUnixTimestamp(params.minDate)}`);
        }
        if (params.maxDate) {
            filters.push(`filter=timestamp,le,${toUnixTimestamp(params.maxDate)}`);
        }

        return `${baseApiUrl}?${filters.join('&')}&order=id`; // Remove page for fetchAllPages to handle
    }

    // Fetch all pages until no more records
    function fetchAllPages(baseUrl) {
        return new Promise((resolve, reject) => {
            let currentPage = 1;
            const maxRecords = 10000;
            const fetchPage = () => {
                if (allRecords.length >= maxRecords) {
                    resolve(); // Stop if max reached
                    return;
                }
                const url = `${baseUrl}&page=${currentPage},${pageSize}`;
                fetchData(url)
                    .then(response => {
                        if (response.records && response.records.length > 0) {
                            allRecords = allRecords.concat(response.records);
                            currentPage++;
                            fetchPage(); // Fetch next page
                        } else {
                            resolve(); // No more records, done
                        }
                    })
                    .catch(error => reject(error));
            };
            fetchPage(); // Start fetching
        });
    }

    // Fetch data (unchanged, used by fetchAllPages)
    function fetchData(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                type: 'GET',
                success: function(response) {
                    console.log('API Response:', response);
                    resolve(response);
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    console.error('Status:', status);
                    console.error('Response Text:', xhr.responseText);
                    reject(error);
                }
            });
        });
    }

    // Render results with DataTables
    function renderResults(response) {
        console.log('inside renderResults');
        const resultsContainer = $('#emailTable tbody');
        const tableHeader = $('#emailTable thead'); // Reference to the header

        if (table) table.destroy(); // Clear existing table

        if (page === 1) {
            resultsContainer.empty();
            tableHeader.hide(); // Hide header by default on page 1
        }

        if (response.records.length === 0 && page === 1) {
            resultsContainer.append('<tr><td colspan="5">No records found</td></tr>');
        } else {
            // Sort records by timestamp (oldest to newest)
            const sortedRecords = response.records.sort((a, b) => a.timestamp - b.timestamp);
            
            // Show header only if there are records
            tableHeader.show();
            resultsContainer.empty(); // Clear previous results
            sortedRecords.forEach(record => {
                let resultRow = `
                    <tr>
                        <td>${record.sender}</td>
                        <td>${record.recipient_to}</td>
                        <td>${record.subject}</td>
                        <td>${new Date(record.timestamp * 1000).toLocaleString()}</td>
                        <td><a href="${record.bookmark_url}" target="_blank" title="Open PDF"><i class="fas fa-file-pdf fa-2x" style="color: #FF0000;"></i></a></td>
                    </tr>
                `;
                resultsContainer.append(resultRow);
            });
            // In renderResults, after table = $('#emailTable').DataTable(...)
            table = $('#emailTable').DataTable({
                pageLength: 50, // Sync with API
                paging: true,
                searching: true,
                ordering: true,
                info: true,
                order: [[3, 'asc']]
            });
        }
    }

    // Render chart
    function renderChart(results) {
        console.log('inside renderChart');
        const emails = results.records.sort((a, b) => a.timestamp - b.timestamp); // Sort emails chronologically
        const emailCounts = countEmailsPerDay(emails);

        const labels = Object.keys(emailCounts).map(date => moment(date).format("YYYY-MM-DD"));
        const data = Object.values(emailCounts);

        const ctx = document.getElementById('emailChart').getContext('2d');
        if (flintChart) flintChart.destroy();

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
                    x: { type: 'category' },
                    y: { beginAtZero: true }
                }
            }
        });
        console.log('the chart', flintChart);
    }

    // Utility functions
    function formatName(encodedName) {
        const inputName = decodeURIComponent(encodedName);
        const trimmedName = inputName.trim();
        const lastSpaceIndex = trimmedName.lastIndexOf(' ');

        if (lastSpaceIndex === -1) return trimmedName;

        const firstName = trimmedName.substring(0, lastSpaceIndex).trim();
        const lastName = trimmedName.substring(lastSpaceIndex).trim();

        return encodeURIComponent(`${lastName}, ${firstName}`);
    }

    function toUnixTimestamp(dateString) {
        return Math.floor(new Date(dateString).getTime() / 1000);
    }
});