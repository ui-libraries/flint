<section class="section _p-0 _overlap-top">
    <div class="container">
        <div class="form" data-aos="fade-up">
            <form id="email-search-form" method="POST">
                <div class="form_cols">
                    <div class="form_col _half">
                        <div>
                            <label for="input-1">Search Email</label>
                            <input id="input-1" name="search_email" type="text" placeholder="">
                        </div>
                        <div class="form_row range-datepicker">
                            <div>
                                <label for="date-from">Range of date</label>
                                <div class="form_icon _calendar">
                                    <input id="date-from" name="date_from" type="text" placeholder="01/01/2015">
                                </div>
                            </div>
                            <div>
                                <label for="date-to" class="form_label-hidden">Range of date</label>
                                <div class="form_icon _calendar">
                                    <input id="date-to" name="date_to" type="text" placeholder="12/12/2015">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="form_col _half">
                        <div>
                            <label for="input-4">Subject</label>
                            <input id="input-4" name="subject" type="text" placeholder="Subject">
                        </div>
                        <div class="form_row">
                            <div>
                                <label for="input-5">From</label>
                                <input id="input-5" name="email_from" type="text" placeholder="Enter Email Here">
                            </div>
                            <div>
                                <label for="input-6">To</label>
                                <input id="input-6" name="email_to" type="text" placeholder="Enter Email Here">
                            </div>
                        </div>
                    </div>
                    <div class="form_col">
                        <div>
                            <label for="textarea-1">Has the words</label>
                            <textarea id="textarea-1" name="email_body" placeholder=""></textarea>
                        </div>
                    </div>
                    <div class="form_col">
                        <div>
                            <button class="button" type="submit">Submit</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</section>
<section class="section _pt-60">
    <div class="container">
        <div id="search-results" class="posts-text-grid"></div>
        <nav id="pagination" class="pagination _center"></nav>
    </div>
</section>

