<?php $frequency_chart = get_sub_field('frequency_chart'); ?>

<section class="section _pb-30">
    <div class="section_head" data-aos="fade-up">
        <div class="container _width-830">
            <div class="box text-center">

                <?php am_the_sub_field('subtitle', '<div class="box_label">', '</div>'); ?>
                <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>

                <div class="box_search">
                    <div class="search-form">
                        <form>
                            <div class="search-form_box">
                                <input type="text" placeholder="Search Email Chart">
                                <button class="button">Search</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="info" data-aos="fade-up">
            <div class="info_head">
                <div class="info_box">

                    <?php if (!empty($frequency_chart['subtitle'])) { ?>
                        <span class="info_label">
                            <span><?php echo $frequency_chart['subtitle']; ?></span>
                        </span>
                    <?php } ?>

                    <?php if (!empty($frequency_chart['title'])) { ?>
                        <h2 class="info_title"><?php echo $frequency_chart['title']; ?></h2>
                    <?php } ?>
                </div>
                <div class="info_box">
                    <select>
                        <option value="" disabled="" selected="">Date</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                    </select>
                </div>
            </div>
            <div class="info_body _chart">
                <div class="info_legend">
                    <span>VALUE 2</span> <span class="info_legend-sm">(2)</span>
                </div>
                <div class="info-chart-holder _secondary">                 
                    <canvas id="detailedChart" class="chart _full-width" data-months="[
                            { &quot;month&quot;: &quot;Jan&quot;, &quot;emails&quot;: 95 },
                            { &quot;month&quot;: &quot;Feb&quot;, &quot;emails&quot;: 60 },
                            { &quot;month&quot;: &quot;Mar&quot;, &quot;emails&quot;: 40 },
                            { &quot;month&quot;: &quot;Apr&quot;, &quot;emails&quot;: 70 },
                            { &quot;month&quot;: &quot;May&quot;, &quot;emails&quot;: 30 },
                            { &quot;month&quot;: &quot;Jun&quot;, &quot;emails&quot;: 110 }
                            ]"></canvas>
                </div>
            </div>
        </div>
    </div>
</section>