jQuery(document).ready(function($) {
    console.log('✅ heatmap-emails.js loaded')
  
    function waitForDataTables(callback) {
      if (typeof $.fn.DataTable === 'function') {
        callback()
      } else {
        console.warn('⏳ Waiting for DataTables...')
        setTimeout(() => waitForDataTables(callback), 50)
      }
    }
  
    function renderDataTable(records) {
      const container = $('#email-table-container')
      container.empty()
  
      if (!records || records.length === 0) {
        container.html('<p>No emails found for this date.</p>')
        return
      }
  
      const tableId = 'heatmapEmailTable'
      const table = $(`
        <table id="${tableId}" class="display table table-bordered" width="100%">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      `)
  
      const tbody = table.find('tbody')
  
      records.forEach(record => {
        const date = record.timestamp
          ? new Date(record.timestamp * 1000).toLocaleString()
          : ''
        const pdfUrl = record.bookmark_url
          ? record.bookmark_url.replace('http://s-lib007.lib.uiowa.edu/flint/', 'https://fwcpublicarchive.lib.uiowa.edu/')
          : null
  
        const pdfIcon = pdfUrl
          ? `<a href="${pdfUrl}" target="_blank"><img src="https://fwcpublicarchive.lib.uiowa.edu/wp-content/uploads/2024/10/file.png" alt="PDF" style="width:20px; height:20px;"></a>`
          : ''
  
        tbody.append(`
          <tr>
            <td>${date}</td>
            <td>${record.sender || ''}</td>
            <td>${record.recipient_to || ''}</td>
            <td>${record.subject || ''}</td>
            <td>${pdfIcon}</td>
          </tr>
        `)
      })
  
      container.append(table)
  
      waitForDataTables(() => {
        console.log('🚀 Initializing DataTable...')
        $(`#${tableId}`).DataTable({
          pageLength: 50,
          order: [[0, 'asc']],
          paging: true,
          searching: true,
          ordering: true,
          info: true
        })
      })
    }
  
    function initCalendarHeatmap() {
      const heatmapElement = document.querySelectorAll('.heatmap')
      const plugins = [
        [
          Tooltip,
          {
            text: function(date, value, dayjsDate) {
              return (value ? value + ' emails' : 'No emails') + ' on ' + dayjsDate.format('LL')
            }
          }
        ]
      ]
  
      heatmapElement.forEach(item => {
        if (!item.dataset.dates) return
  
        const data = JSON.parse(item.dataset.dates)
        const heatmap = item.querySelector('#heatmap')
        const cal = new CalHeatmap()
  
        function paintHeatmap(year) {
          const startOfYear = new Date(`${year}-01-01`)
          const options = {
            data: {
              source: data,
              x: 'date',
              y: d => +d['value']
            },
            range: 12,
            date: { start: startOfYear },
            scale: {
              color: {
                range: ['#a1cbac', '#1f700f'],
                domain: [0, 160]
              }
            },
            domain: {
              type: 'month',
              gutter: 25,
              label: {
                text: 'MMM',
                offset: { y: 9 }
              }
            },
            subDomain: {
              type: 'day',
              radius: 2,
              label: 'DD',
              width: 12,
              height: 12,
              gutter: 3,
              color: '#fff'
            }
          }
  
          cal.paint({ ...options, itemSelector: heatmap }, plugins).then(() => {
            cal.on('click', function(event, date) {
              const formattedDate = dayjs(date).utc().format('YYYY-MM-DD')
              console.log(`📅 Date clicked: ${formattedDate}`)
  
              const start = dayjs(date).utc().startOf('day').unix()
              const end = dayjs(date).utc().endOf('day').unix()
              fetchDataForDate(start, end)
            })
          })
        }
  
        function fetchDataForDate(start, end) {
          const url = `https://fwcpublicarchive.lib.uiowa.edu/api/api.php/records/emails?filter=timestamp,bt,${start},${end}`
          fetch(url)
            .then(res => res.json())
            .then(data => {
              console.log(`✅ ${data.records.length} records fetched`)
              renderDataTable(data.records)
            })
            .catch(err => {
              console.error('❌ Error loading data:', err)
              $('#email-table-container').html('<p>Error loading data.</p>')
            })
        }
  
        // Initial paint
        paintHeatmap('2014')
  
        // Navigation
        const navButtonNext = item.querySelector('.heatmap_nav-button._next')
        const navButtonPrev = item.querySelector('.heatmap_nav-button._prev')
        const yearDropdown = document.querySelector('select')
  
        navButtonNext.addEventListener('click', e => {
          e.preventDefault()
          cal.next().then(() => {
            cal.on('click', function(event, date) {
              const start = dayjs(date).startOf('day').unix()
              const end = dayjs(date).endOf('day').unix()
              fetchDataForDate(start, end)
            })
          })
        })
  
        navButtonPrev.addEventListener('click', e => {
          e.preventDefault()
          cal.previous().then(() => {
            cal.on('click', function(event, date) {
              const start = dayjs(date).startOf('day').unix()
              const end = dayjs(date).endOf('day').unix()
              fetchDataForDate(start, end)
            })
          })
        })
  
        yearDropdown.addEventListener('change', function() {
          const selectedYear = this.value
          if (selectedYear) {
            paintHeatmap(selectedYear)
          }
        })
      })
    }
  
    initCalendarHeatmap()
  })
  