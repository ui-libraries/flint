<?php $search_query = get_search_query(); ?>
<div id="search_block">
	<form method="get" action="<?php echo esc_url(home_url().'/'); ?>">
		<fieldset>
			<input type="text" placeholder="<?php echo esc_attr(__('Search', 'am')); ?>" value="<?php echo esc_attr($search_query); ?>" name="s" class="text" />
			<input type="submit" value="<?php echo esc_attr(__('Go', 'am')); ?>" class="submit" />
		</fieldset>
	</form>
</div><!-- /search_block -->