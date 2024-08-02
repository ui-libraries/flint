<?php $document_viewer_title = get_sub_field('document_viewer_title'); ?>

<section class="section">
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

    <?php if ($documents = get_posts(['post_type' => 'document','post_status' => 'publish'])) { ?>
        <div class="pdf-viewer">
            <div class="container">
                <div class="pdf-viewer_container">
                    <div class="pdf-viewer_col" data-aos="fade-up">
                        <div class="pdf-viewer_box">
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


                                <?php if ($url) { ?>

                                    <article data-type="pdf" data-src="<?php echo $url; ?>" class="text-card">
                                        <div class="text-card_box">
                                            <?php echo $document->post_title; ?>
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
                                    </article>
                                <?php } ?>
                            <?php } ?>

                        </div>
                        <nav class="pagination">
                            <span class="pagination_label">
                                Pages
                            </span>
                            <ul class="pagination_list list-reset">
                                <li class="pagination_item">
                                    <a class="pagination_link" href="#">Prev</a>
                                </li>
                                <li class="pagination_item">
                                    <a class="pagination_link _active" href="#">1</a>
                                </li>
                                <li class="pagination_item">
                                    <a class="pagination_link" href="#">2</a>
                                </li>
                                <li class="pagination_item">
                                    <a class="pagination_link" href="#">3</a>
                                </li>
                                <li class="pagination_item">
                                    <a class="pagination_link" href="#">4</a>
                                </li>
                                <li class="pagination_item">
                                    <a class="pagination_link" href="#">5</a>
                                </li>
                                <li class="pagination_item">
                                    <a class="pagination_link" href="#">6</a>
                                </li>
                                <li class="pagination_item">
                                    <a class="pagination_link" href="#">Next</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                    <div class="pdf-viewer_col" data-aos="fade-up">
                        <div class="pdf-viewer_holder">
                            <div class="pdf-viewer_bar">
                                <div>
                                    <a href="#" class="pdf-viewer_link" target="_blank">Open in new tab</a>
                                </div>
                                <?php if ($document_viewer_title) { ?>
                                    <div>
                                        <h2 class="pdf-viewer_title">
                                            <?php echo $document_viewer_title; ?>
                                        </h2>
                                    </div>
                                <?php } ?>
                            </div>
                            <div class="pdf-viewer_iframe-wrap">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    <?php } ?>
</section>