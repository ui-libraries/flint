<?php
function am_the_background_class($color = ''){
    echo am_get_background_class($color);
}
function am_get_background_class($color = ''){
    $color = $color ? $color : get_sub_field('background_color');
    
    $color_class = '';
    
    if( $color === 'grey' ){
        $color_class = 'bg-athens-gray';
    } else if( $color === 'black' ){
        $color_class = 'bg-black';
    } else if( $color === 'mercury'  ){
         $color_class = 'bg-mercury';
    }
    
    return $color_class;
}
function am_the_accent_text_color_class($color = ''){
    echo am_get_accent_text_color_class($color);
}
function am_get_accent_text_color_class($color = ''){
    $color = $color ? $color : get_sub_field('accent_text_color');
    
    $color_class = '';
    
    if( $color === 'blue' ){
        $color_class = 'text-jeans';
    } else if( $color === 'red' ){
        $color_class = 'text-orange';
    } else if( $color === 'orange'  ){
         $color_class = 'text-yellow';
    } else if( $color === 'green'  ){
         $color_class = 'text-green';
    }
    
    return $color_class;
}

?>