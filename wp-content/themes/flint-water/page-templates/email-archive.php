<?php
/*
  Template Name: Email Archive
  Template Post Type: page
 */
get_header('email-archive');
if (have_posts()) :
    while (have_posts()) : the_post();
        if (post_password_required()) :
            // if your post is password protected
            ?>
            <div class="container">
                <?php echo get_the_password_form(); ?>
            </div>
            <?php
        else :
            ?>
            <section class="section">

                <div class="container">
                    <div class="row mb-3">
                        <div class="col">
                            <h3>Search the Flint Water Crisis Email Archive</h3>
                            <table id="searchTable" class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Search For </th>
                                        <td colspan="2"><button id="addRow" class="btn btn-primary">Add Search Field</button></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="searchRow">
                                        <td><input type="text" placeholder="Enter search term..." class="form-control"></td>
                                        <td>
                                            <select class="form-control">
                                                <option value="sender/receiver">Sender/Receiver</option>
                                                <option value="subject">Subject Line</option>
                                                <option value="keyword">Keyword</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label>Minimum date:</label>
                            <input type="text" id="min" name="min" class="form-control" placeholder="2011-01-01">
                        </div>
                        <div class="col-md-6">
                            <label>Maximum date:</label>
                            <input type="text" id="max" name="max" class="form-control" placeholder="2020-01-01">
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <button id="searchBtn" class="btn btn-success">Search</button>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <canvas id="emailChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table id="emailTable" class="display table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Sender</th>
                                        <th>Receiver</th>
                                        <th>Subject Line</th>
                                        <th>Time</th>
                                        <th>PDF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <!-- Data will go here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        <?php
        endif;
    endwhile;
endif;
get_footer('email-archive');
?>