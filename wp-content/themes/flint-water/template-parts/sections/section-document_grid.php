<section class="section bg-mercury">
    <div class="section_head">
        <div class="container _width-830">
            <div class="box text-center">
                <?php am_the_sub_field('subtitle', '<div class="box_label ' . am_get_accent_text_color_class() . '">', '</div>'); ?>
                <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>
            </div>
        </div>
    </div>
    <?php if ($documents = get_sub_field('documents')) { ?>
        <div class="container">
            <div class="text-cards-grid">
                <?php foreach ($documents as $document) { ?>
                    <?php
                    $is_external_link = get_field('external_link', $document);
                    if ($is_external_link) {
                        $url = get_field('link', $document);
                    } else {
                        $file = get_field('file', $document);
                        $url = $file['url'] ?? '#';
                    }
                    ?>
                    <a class="text-card" href="<?php echo $url; ?>">
                        <div class="text-card_box">
                            <h2><?php echo $document->post_title; ?></h2>
                            <span class="icon-arrow-box _dark">
                                <svg>
                                <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#arrow-right-long"></use>
                                </svg>
                            </span>
                        </div>
                        <?php
                        if ($description = get_field('description', $document)) {
                            ?>
                            <div class="text-card_text">
                                <p>
                                    <?php echo $description; ?>
                                </p>
                            </div>
                            <?php
                        }
                        ?>
                    </a>
                <?php } ?>
            </div>
        </div>
    <?php } ?>
</section>