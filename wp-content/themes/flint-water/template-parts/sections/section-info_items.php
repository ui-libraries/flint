<?php if (have_rows('items')) { ?>
    <section class="section _pt-30">
        <div class="container _width-950">
            <div class="text-box-wrap">
                <?php while (have_rows('items')) { ?>
                    <?php the_row(); ?>
                    <div class="text-box">
                        <div class="text-box_col">
                            <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                        </div>
                        <div class="text-box_col">
                            <?php am_the_sub_field('text'); ?>
                        </div>
                    </div>
                <?php } ?>
            </div>
        </div>
    </section>
<?php } ?>