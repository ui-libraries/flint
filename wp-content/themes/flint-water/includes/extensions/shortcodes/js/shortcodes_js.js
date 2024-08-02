jQuery(window).on('load', function(){
	jQuery('button.am_shortcodes').on('click',function(){
		var user_content = jQuery(this).parent().find('code').text();
		tinymceActive = (typeof tinyMCE != 'undefined') && tinyMCE.activeEditor && !tinyMCE.activeEditor.isHidden();
		if(!tinymceActive){
			var cursorPos = jQuery('.perfect-column-editor-active').prop('selectionStart');
			var v = jQuery('.perfect-column-editor-active').val();
			var textBefore = v.substring(0,  cursorPos);
			var textAfter  = v.substring(cursorPos, v.length);
			jQuery('.perfect-column-editor-active').val(textBefore + html_entity_decode(user_content) + textAfter);
		} else {
			tinyMCE.execCommand('mceInsertContent', false, user_content);
		}

		//close the thickbox after adding shortcode to editor
		self.parent.tb_remove();

	});
	jQuery('.perfect-column-btn').on('click',function(){
		jQuery('.perfect-column-editor-active').removeClass('perfect-column-editor-active');
		var $textarea = jQuery(this).parents('.wp-editor-tools').siblings('.wp-editor-container').find('textarea');
		try{
			tinyMCE.get($textarea.attr('id')).focus()
		} catch (err) {
			$textarea.addClass('perfect-column-editor-active');
		}
		setTimeout(function(){
			if (jQuery('#TB_ajaxContent').length){
				jQuery('#TB_ajaxContent').addClass('perfect-ajax-content')
			}else{
				console.log('not exists')
			}
		}, 25);
	});

})