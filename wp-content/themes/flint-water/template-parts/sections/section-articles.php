<section class="section <?php am_the_background_class(); ?>" id="<?php am_the_section_id('articles'); ?>">
    <div class="section_head">
        <div class="container _width-830">
            <div class="box text-center">
                <?php am_the_sub_field('subtitle', '<div class="box_label ' . am_get_accent_text_color_class() . '">', '</div>'); ?>
                <?php am_the_sub_field('title', '<h2>', '</h2>'); ?>
                <?php am_the_sub_field('description', '<div class="box_text"><p>', '</p></div>'); ?>
            </div>
        </div>
    </div>

    <?php if ($articles = get_sub_field('articles')) { ?>
        <div class="container">

            <?php if (get_sub_field('is_first_featured')) { ?>

                <?php $featured_article = $articles[0]; ?>

                <div class="articles-cols">
                    <div class="article-col">
                        <div>
                            <article class="article">
                                <div class="article_img _whide">
                                    <?php if (has_post_thumbnail($featured_article)) { ?>
                                        <?php am_the_fly_post_img($featured_article->ID, ['width' => 768]); ?>
                                    <?php } ?>
                                </div>
                                <div class="article_inner">
                                    <div class="article_body">
                                        <?php if ($posttags = get_the_tags($featured_article)) { ?>
                                            <div class="article_tags">
                                                <?php foreach ($posttags as $posttag) { ?>
                                                    <a class="article_tag" href="<?php echo get_term_link($posttag, 'post_tag'); ?>">
                                                        <?php echo $posttag->name; ?>
                                                    </a>
                                                <?php } ?>
                                            </div>
                                        <?php } ?>
                                        <h2 class="article_title _xl">
                                            <a href="<?php echo get_the_permalink($featured_article); ?>">
                                                <?php echo $featured_article->post_title; ?>
                                            </a>
                                        </h2>
                                    </div>
                                    <div class="article_footer">
                                        <div class="article_box">
                                            <svg class="article_icon">
                                            <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#user"></use>
                                            </svg>
                                            <span class="article_caption">
                                                <?php echo get_the_author_meta('display_name', $featured_article->author); ?>
                                            </span>
                                        </div>
                                        <div class="article_box">
                                            <svg class="article_icon">
                                            <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#clock"></use>
                                            </svg>
                                            <span class="article_caption">5 mins</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                    <?php if (count($articles) > 1) { ?>
                        <div class="article-col">
                            <?php foreach ($articles as $i => $article) { ?>
                                <?php
                                if ($i == 0) {
                                    continue;
                                }
                                ?>
                                <div>
                                    <article class="article _horizontal">
                                        <div class="article_img">
                                            <?php if (has_post_thumbnail($article)) { ?>
                                                <?php am_the_fly_post_img($article->ID, ['width' => 768]); ?>
                                            <?php } ?>
                                        </div>
                                        <div class="article_inner">
                                            <div class="article_body">
                                                <?php if ($posttags = get_the_tags($article)) { ?>
                                                    <div class="article_tags">
                                                        <?php foreach ($posttags as $posttag) { ?>
                                                            <a class="article_tag" href="<?php echo get_term_link($posttag, 'post_tag'); ?>">
                                                                <?php echo $posttag->name; ?>
                                                            </a>
                                                        <?php } ?>
                                                    </div>
                                                <?php } ?>
                                                <h2 class="article_title _lg">
                                                    <a href="<?php echo get_the_permalink($article); ?>">
                                                        <?php echo $article->post_title; ?>
                                                    </a>
                                                </h2>
                                            </div>
                                            <div class="article_footer">
                                                <div class="article_box">
                                                    <svg class="article_icon">
                                                    <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#user"></use>
                                                    </svg>
                                                    <span class="article_caption">
                                                        <?php echo get_the_author_meta('display_name', $article->author); ?>
                                                    </span>
                                                </div>
                                                <div class="article_box">
                                                    <svg class="article_icon">
                                                    <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#clock"></use>
                                                    </svg>
                                                    <span class="article_caption">5 mins</span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            <?php } ?>
                        </div>
                    <?php } ?>
                </div>
            <?php } else { ?>
                <div class="articles-grid">
                    <?php foreach ($articles as $article) { ?>
                        <div>
                            <article class="article">
                                <div class="article_img">
                                    <?php if (has_post_thumbnail($article)) { ?>
                                        <?php am_the_fly_post_img($article->ID, ['width' => 768]); ?>
                                    <?php } ?>
                                </div>
                                <div class="article_inner">
                                    <div class="article_body">

                                        <?php if ($posttags = get_the_tags($article)) { ?>
                                            <div class="article_tags">
                                                <?php foreach ($posttags as $posttag) { ?>
                                                    <a class="article_tag" href="<?php echo get_term_link($posttag, 'post_tag'); ?>">
                                                        <?php echo $posttag->name; ?>
                                                    </a>
                                                <?php } ?>
                                            </div>
                                        <?php } ?>
                                        <h2 class="article_title">
                                            <a href="<?php echo get_the_permalink($article); ?>">
                                                <?php echo $article->post_title; ?>
                                            </a>
                                        </h2>
                                    </div>
                                    <div class="article_footer">
                                        <div class="article_box">
                                            <svg class="article_icon">
                                            <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#user"></use>
                                            </svg>
                                            <span class="article_caption">
                                                <?php echo get_the_author_meta('display_name', $article->author); ?>
                                            </span>
                                        </div>
                                        <div class="article_box">
                                            <svg class="article_icon">
                                            <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#clock"></use>
                                            </svg>
                                            <span class="article_caption">5 mins</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </div>
                    <?php } ?>
                </div>
            <?php } ?>
        </div>
    <?php } ?>
</section>