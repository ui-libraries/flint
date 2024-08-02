<?php

class Am_Shortcodes {

    public $shortcodes_array = array();

    function __construct() {
        $this->shortcodes_array_fill();
        //add the button to the tinymce editor
        add_action('media_buttons',  array( $this, 'add_am_tinymce_media_button') );
        add_action('admin_footer',  array( $this, 'am_shortcode_media_button_popup') );
        //javascript code needed to make shortcode appear in TinyMCE edtor
        add_action('admin_footer',  array( $this, 'am_shortcode_add_shortcode_to_editor') );
    }

    function shortcodes_array_fill() {
        $this->shortcodes_array[] = array(
            'title' => 'Audio Shortcode',
            'desc' => 'I have an old post that has an audio file in the Media Library attached to it, and I want to use the new shortcode:',
            'code' => '[audio]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'I have the URL for an MP3, from the Media Library or external, that I want to play:',
            'code' => '[audio src="audio-source.mp3"]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'I have an old post that has an audio file in the Media Library attached to it, and I want to use the new shortcode:',
            'code' => '[audio mp3="source.mp3" ogg="source.ogg" wav="source.wav"]'
            );
        $this->shortcodes_array[] = array(
            'title' => 'Caption Shortcode',
            'desc' => 'Practical usage is like this:',
            'code' => '[caption id="attachment_6" align="alignright" width="300"]<img src="http://localhost/wp-content/uploads/2010/07/800px-Great_Wave_off_Kanagawa2-300x205.jpg" alt="" title="The Great Wave" width="" height="" class="size-medium wp-image-6" /> The Great Wave[/caption]'
            );
        $this->shortcodes_array[] = array(
            'title' => 'Embed Shortcode',
            'desc' => 'I have an embedded item, and I want to set max dimensions:',
            'code' => '[embed width="123" height="456"]...[/embed]'
            );
        $this->shortcodes_array[] = array(
            'title' => 'Gallery Shortcode',
            'desc' => 'There are several options that may be specified using this syntax:',
            'code' => '[gallery option1="value1" option2="value2"]'
            );
        $this->shortcodes_array[] = array(
            'title' => 'Playlist Shortcode',
            'desc' => 'Basic, with default values:',
            'code' => '[playlist]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'Changing style to dark:',
            'code' => '[playlist style="dark"]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'Changing type to video:',
            'code' => '[playlist type="video"]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'Specifying ids of audio, it\'s the default, files out of the media library:',
            'code' => '[playlist ids="123,456,789"]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'Specifying ids of video files out of the media library and changing style:',
            'code' => '[playlist type="video" ids="123,456,789" style="dark"]'
            );
        $this->shortcodes_array[] = array(
            'title' => 'Video Shortcode',
            'desc' => 'I have an old post that has a video file in the Media Library attached to it, and I want to use the new shortcode:',
            'code' => '[video]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'I have the URL for an mp4, from the Media Library or external, that I want to play:',
            'code' => '[video src="video-source.mp4"]'
            );
        $this->shortcodes_array[] = array(
            'title' => '',
            'desc' => 'I have a source URL and fallbacks for other HTML5-supported filetypes:',
            'code' => '[video mp4="source.mp4" ogv="source.ogv" webm="source.webm"]'
            );

    }

    function add_am_tinymce_media_button($context){
        print "<a href=\"#TB_inline?width=640&inlineId=am_shortcode_popup&width=640&height=513\" class=\"button thickbox perfect-column-btn\" id=\"am_shortcode_popup_button\" title=\"All Shortcodes\"><span class=\"dashicons dashicons-media-code\"></span>".__('All Shortcodes','am')."</a>";
    }

    //Generate inline content for the popup window when the "my shortcode" button is clicked
    function am_shortcode_media_button_popup(){?>
      <div id="am_shortcode_popup" style="display:none;">
        <--".wrap" class div is needed to make thickbox content look good-->
        <div class="wrap">
            <div>
            <?php foreach($this->shortcodes_array as $item) : ?>
            <?php if(!empty($item['title'])) : ?><h1><?php echo $item['title']; ?></h1><?php endif; ?>
            <p><?php echo $item['desc']; ?></p>
            <div class="example example-pre">
                <pre>
<code><?php echo htmlentities($item['code']); ?></code>
                </pre>
                <button class="button-primary am_shortcodes">Add This Shortcode Variant</button>
            </div>
            <?php endforeach; ?>
        </div>
      </div>
    <?php
    }

    function am_shortcode_add_shortcode_to_editor(){?>
    <script>
        function am_get_html_translation_table (table, quote_style) {
          var entities = {},
            hash_map = {},
            decimal;
          var constMappingTable = {},
            constMappingQuoteStyle = {};
          var useTable = {},
            useQuoteStyle = {};

          // Translate arguments
          constMappingTable[0] = 'HTML_SPECIALCHARS';
          constMappingTable[1] = 'HTML_ENTITIES';
          constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
          constMappingQuoteStyle[2] = 'ENT_COMPAT';
          constMappingQuoteStyle[3] = 'ENT_QUOTES';

          useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
          useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

          if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
            throw new Error("Table: " + useTable + ' not supported');
            // return false;
          }

          entities['38'] = '&amp;';
          if (useTable === 'HTML_ENTITIES') {
            entities['160'] = '&nbsp;';
            entities['161'] = '&iexcl;';
            entities['162'] = '&cent;';
            entities['163'] = '&pound;';
            entities['164'] = '&curren;';
            entities['165'] = '&yen;';
            entities['166'] = '&brvbar;';
            entities['167'] = '&sect;';
            entities['168'] = '&uml;';
            entities['169'] = '&copy;';
            entities['170'] = '&ordf;';
            entities['171'] = '&laquo;';
            entities['172'] = '&not;';
            entities['173'] = '&shy;';
            entities['174'] = '&reg;';
            entities['175'] = '&macr;';
            entities['176'] = '&deg;';
            entities['177'] = '&plusmn;';
            entities['178'] = '&sup2;';
            entities['179'] = '&sup3;';
            entities['180'] = '&acute;';
            entities['181'] = '&micro;';
            entities['182'] = '&para;';
            entities['183'] = '&middot;';
            entities['184'] = '&cedil;';
            entities['185'] = '&sup1;';
            entities['186'] = '&ordm;';
            entities['187'] = '&raquo;';
            entities['188'] = '&frac14;';
            entities['189'] = '&frac12;';
            entities['190'] = '&frac34;';
            entities['191'] = '&iquest;';
            entities['192'] = '&Agrave;';
            entities['193'] = '&Aacute;';
            entities['194'] = '&Acirc;';
            entities['195'] = '&Atilde;';
            entities['196'] = '&Auml;';
            entities['197'] = '&Aring;';
            entities['198'] = '&AElig;';
            entities['199'] = '&Ccedil;';
            entities['200'] = '&Egrave;';
            entities['201'] = '&Eacute;';
            entities['202'] = '&Ecirc;';
            entities['203'] = '&Euml;';
            entities['204'] = '&Igrave;';
            entities['205'] = '&Iacute;';
            entities['206'] = '&Icirc;';
            entities['207'] = '&Iuml;';
            entities['208'] = '&ETH;';
            entities['209'] = '&Ntilde;';
            entities['210'] = '&Ograve;';
            entities['211'] = '&Oacute;';
            entities['212'] = '&Ocirc;';
            entities['213'] = '&Otilde;';
            entities['214'] = '&Ouml;';
            entities['215'] = '&times;';
            entities['216'] = '&Oslash;';
            entities['217'] = '&Ugrave;';
            entities['218'] = '&Uacute;';
            entities['219'] = '&Ucirc;';
            entities['220'] = '&Uuml;';
            entities['221'] = '&Yacute;';
            entities['222'] = '&THORN;';
            entities['223'] = '&szlig;';
            entities['224'] = '&agrave;';
            entities['225'] = '&aacute;';
            entities['226'] = '&acirc;';
            entities['227'] = '&atilde;';
            entities['228'] = '&auml;';
            entities['229'] = '&aring;';
            entities['230'] = '&aelig;';
            entities['231'] = '&ccedil;';
            entities['232'] = '&egrave;';
            entities['233'] = '&eacute;';
            entities['234'] = '&ecirc;';
            entities['235'] = '&euml;';
            entities['236'] = '&igrave;';
            entities['237'] = '&iacute;';
            entities['238'] = '&icirc;';
            entities['239'] = '&iuml;';
            entities['240'] = '&eth;';
            entities['241'] = '&ntilde;';
            entities['242'] = '&ograve;';
            entities['243'] = '&oacute;';
            entities['244'] = '&ocirc;';
            entities['245'] = '&otilde;';
            entities['246'] = '&ouml;';
            entities['247'] = '&divide;';
            entities['248'] = '&oslash;';
            entities['249'] = '&ugrave;';
            entities['250'] = '&uacute;';
            entities['251'] = '&ucirc;';
            entities['252'] = '&uuml;';
            entities['253'] = '&yacute;';
            entities['254'] = '&thorn;';
            entities['255'] = '&yuml;';
          }

          if (useQuoteStyle !== 'ENT_NOQUOTES') {
            entities['34'] = '&quot;';
          }
          if (useQuoteStyle === 'ENT_QUOTES') {
            entities['39'] = '&#39;';
          }
          entities['60'] = '&lt;';
          entities['62'] = '&gt;';


          // ascii decimals to real symbols
          for (decimal in entities) {
            if (entities.hasOwnProperty(decimal)) {
              hash_map[String.fromCharCode(decimal)] = entities[decimal];
            }
          }

          return hash_map;
        }

        function am_html_entity_decode (string, quote_style) {

          var hash_map = {},
            symbol = '',
            tmp_str = '',
            entity = '';
          tmp_str = string.toString();

          if (false === (hash_map = this.am_get_html_translation_table('HTML_ENTITIES', quote_style))) {
            return false;
          }

          // fix &amp; problem
          // http://phpjs.org/functions/am_get_html_translation_table:416#comment_97660
          delete(hash_map['&']);
          hash_map['&'] = '&amp;';

          for (symbol in hash_map) {
            entity = hash_map[symbol];
            tmp_str = tmp_str.split(entity).join(symbol);
          }
          tmp_str = tmp_str.split('&#039;').join("'");

          return tmp_str;
        }

    </script>
    <?php
    }

}

new Am_Shortcodes;
add_action( 'admin_enqueue_scripts', 'am_shortcodes_style');
function am_shortcodes_style() {
    wp_enqueue_style( 'am_shortcodes_style', get_theme_file_uri('includes/extensions/shortcodes/css/shortcodes_style.css'));
}
add_action( 'admin_footer', 'am_shortcodes_js');
function am_shortcodes_js() {
    wp_enqueue_script( 'am_shortcodes_js', get_theme_file_uri('includes/extensions/shortcodes/js/shortcodes_js.js'));
}
?>