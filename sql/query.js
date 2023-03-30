$(function () {

    // init the validator
    // validator files are included in the download package
    // otherwise download from http://1000hz.github.io/bootstrap-validator

    $('#search-form').validator();


    // when the form is submitted
    $('#search-form').on('submit', function (e) {

        var phrase = $('#search-form').find('input[id="form_phrase"]').val();
        var firstName = $('#search-form').find('input[id="form_name"]').val();
        var lastName = $('#search-form').find('input[id="form_lastname"]').val();
        var congress = $('#search-form').find('input[id="form_congress"]').val();
        var session = $('#search-form').find('input[id="form_session"]').val();
        var startDate = $('#search-form').find('input[id="form_start_date"]').val();
        var endDate = $('#search-form').find('input[id="form_end_date"]').val();

        var url = 'http://congressionalspeech.lib.uiowa.edu/api.php/speeches?filter=';

        if (phrase !== '') {
            url += 'speaking,cs,' + phrase
        } 

        if (firstName !== '') {
            url += '&filter=speaker_first,cs,' + firstName
        }

        if (lastName !== '') {
            url += '&filter=speaker_last,cs,' + lastName
        }

        if (congress !== '') {
            url += '&filter=congress,eq,' + congress
        }

        if (session !== '') {
            url += '&filter=congress,eq,' + session
        }

        if (startDate !== '') {
            url += '&filter=date,ge,' + startDate
        }

        if (endDate !== '') {
            url += '&filter=date,le,' + endDate
        }
        //url += 'date,gt,' + startDate

        //console.log(url)



        $.get( url, function( data ) {
            _.forEach(data, function(item) {
                _.forEach(item.records, function(record) {
                    var tr = '<tr>'
                    tr += '<td>' + record[11] + '</td>'
                    tr += '<td>' + record[12] + '</td>'
                    tr += '<td>' + record[2] + '</td>'
                    tr += '<td>' + record[16] + '</td>'
                    tr += '<td>' + record[6] + '</td>'
                    tr += '</tr>'
                    $('.table tr:last').after(tr)
                })
            })
          });        

        // if the validator does not prevent form submit

        if (!e.isDefaultPrevented()) {
            var url = "api.php";

            // POST values in the background the the script URL
            $.ajax({
                type: "POST",
                url: url,
                data: $(this).serialize(),
                success: function (data)
                {
                    // data = JSON object that contact.php returns

                    // we recieve the type of the message: success x danger and apply it to the 
                    var messageAlert = 'alert-' + data.type;
                    var messageText = data.message;

                    // let's compose Bootstrap alert box HTML
                    var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';
                    
                    // If we have messageAlert and messageText
                    if (messageAlert && messageText) {
                        // inject the alert to .messages div in our form
                        $('#search-form').find('.messages').html(alertBox);
                        // empty the form
                        $('#search-form')[0].reset();
                    }
                }
            });
            return false;
        }

    })
});