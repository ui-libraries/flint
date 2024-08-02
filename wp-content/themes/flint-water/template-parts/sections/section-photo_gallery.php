<section class="section">
    <div class="section_head">
        <div class="container _width-830">
            <div class="box text-center">
                <?php am_the_sub_field('subtitle', '<div class="box_label ' . am_get_accent_text_color_class() . '">', '</div>'); ?>
                <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>
            </div>
        </div>
    </div>

    <?php if ( $exhibits = get_sub_field('exhibits')) { ?>
        <div class="container">
            <div class="posts-grid">
                <?php foreach($exhibits as $exhibit ){ ?>
                    <article class="post">
                        <a class="post_link" href="<?php echo get_the_permalink($exhibit); ?>">
                            <?php if (has_post_thumbnail($exhibit)) { ?>
                                <?php am_the_fly_post_img($exhibit->ID, ['class' => 'post_img', 'width' => 768]); ?>
                            <?php } ?>
                            <div class="post_text">
                                <h2><?php echo $exhibit->post_title; ?></h2>
                                <p><?php echo get_the_excerpt($exhibit); ?></p>
                            </div>
                        </a>
                    </article>
                <?php } ?>
            </div>
        </div>
    <?php } ?>
</section>