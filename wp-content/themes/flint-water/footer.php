</main>

<footer class="footer">
    <div class="footer_body">
        <div class="container">
            <div class="footer_content">
                <?php if ($footer_logo = get_field('footer_logo', 'options')) { ?>
                    <a class="footer_logo" href="<?php echo site_url(); ?>">
                        <?php am_the_fly_img($footer_logo); ?>
                    </a>
                <?php } ?>
                <?php if (has_nav_menu('footermenu')) : ?>
                    <nav>
                        <?php wp_nav_menu(array('theme_location' => 'footermenu', 'menu_class' => 'footer_nav list-reset', 'menu_id' => '', 'container' => '', 'depth' => 1)); ?>
                    </nav>
                <?php endif; ?>

                <?php
                $social_facebook_url = get_field('social_facebook_url', 'option');
                $social_twitter_url = get_field('social_twitter_url', 'option');
                $social_linkedin_url = get_field('social_linkedin_url', 'option');
                $social_instagram_url = get_field('social_instagram_url', 'option');
                ?>

                <?php if ($social_facebook_url || $social_twitter_url || $social_linkedin_url || $social_instagram_url) { ?>
                    <div class="socials">
                        <?php if ($social_facebook_url) { ?>
                            <a class="socials_link" href="<?php echo $social_facebook_url; ?>" target="_blank">
                                <svg>
                                <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#facebook"></use>
                                </svg>
                            </a>
                        <?php } ?>
                        <?php if ($social_instagram_url) { ?>
                            <a class="socials_link" href="<?php echo $social_instagram_url; ?>" target="_blank">
                                <svg>
                                <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#instagram"></use>
                                </svg>
                            </a>
                        <?php } ?>
                        <?php if ($social_linkedin_url) { ?>
                            <a class="socials_link" href="<?php echo $social_linkedin_url; ?>" target="_blank">
                                <svg>
                                <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#linkedIn"></use>
                                </svg>
                            </a>
                        <?php } ?>
                        <?php if ($social_twitter_url) { ?>
                            <a class="socials_link" href="<?php echo $social_twitter_url; ?>" target="_blank">
                                <svg>
                                <use xlink:href="<?php echo get_template_directory_uri(); ?>/markup-template/markup/img/icons/sprite.svg#x"></use>
                                </svg>
                            </a>
                        <?php } ?>
                    </div>  
                <?php } ?>
            </div>
        </div>
    </div>
    <?php if ($footer_copyright = get_field('footer_copyright', 'option')) { ?>
        <div class="footer_copy">
            <div class="container">
                <p><?php echo $footer_copyright; ?></p>
            </div>
        </div>
    <?php } ?>
</footer>
</div>
<?php wp_footer(); ?>
<script src="<?php echo get_template_directory_uri(); ?>/markup-template/markup/js/main.js?<?php echo time(); ?>" charset="utf-8"></script>
</body>
</html>

