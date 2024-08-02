<aside id="sidebar">

	<?php if ( !dynamic_sidebar('sidebar-page-default') ) : ?>
		
		<?php the_widget( 'WP_Widget_Categories' ); ?>
		
		<?php the_widget( 'WP_Widget_Archives' ); ?>
		
		<?php the_widget( 'WP_Widget_Tag_Cloud' ); ?>	
		
	<?php endif; ?>

</aside>