<?php while (have_rows('items')) { ?>
    
    <?php $i = $i ? $i+1 : 1; ?>
    
    <?php the_row(); ?>
    <section class="section _py-70">
        <div class="container">
            <div class="content-box<?php echo $i%2 ? '' : ' _reverse'; ?>">
                <div class="content-box_col">
                    <div class="box">
                        <?php am_the_sub_field('subtitle', '<div class="box_label text-jeans">', '</div>'); ?>
                        <?php am_the_sub_field('title', '<h2 class="mb-20">', '</h2>'); ?>
                        <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>

                        <?php if ($link = get_sub_field('link')) { ?>
                            <a class="arrow-link" href="<?php echo $link['url'] ?? '#'; ?>" target="<?php echo $link['target'] ?? '_self'; ?>">
                                <span><?php echo $link['title'] ?? ''; ?></span>
                                <svg class="arrow-link_arrow">
                                <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#arrow-right"></use>
                                </svg>
                            </a>
                        <?php } ?>
                    </div>
                </div>
                <div class="content-box_col">
                    <div class="content-box_images _grid-secondary">
                        <?php if ($image = get_sub_field('image')) { ?>
                            <?php am_the_fly_img($image, ['height' => 318, 'class' => 'content-box_img']); ?>
                        <?php } ?>
                        <?php if ($image_2 = get_sub_field('image_2')) { ?>
                            <?php am_the_fly_img($image_2, ['height' => 318, 'class' => 'content-box_img']); ?>
                        <?php } ?>
                    </div>
                </div>
            </div>
        </div>
    </section>
<?php } ?>
