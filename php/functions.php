<?php
/**
 * @param $v_blocks     int
 * @param $h_blocks     int
 * @param $iteration_v  int
 * @param $iteration_h  int
 *
 * @return false|array
 */
function bvd_gol_generate_block_neighbors($v_blocks, $h_blocks, $iteration_v, $iteration_h ){

    // Variable checks.
    if (
        ! bvd_gol_is_positive_int( $iteration_v ) ||
        ! bvd_gol_is_positive_int( $iteration_h )
    ) return false;

    $iteration_neighbors = [];

    // Looping over the possible amount of vertical rows
    // where direct neighbours could be at.
    // @ToDo: the way the following switch is being is absolutely not how it should
    // be done. dont judge haha.
    for($v_i=1;$v_i<4;$v_i++){
        switch($v_i){
            case 1:
                $iteration_neighbors[($iteration_v - 1)] = [
                    $iteration_h - 1 < 1 ?
                        1 : $iteration_h - 1
                    => [
                        'status' => 'dead'
                    ],

                    $iteration_h => [
                        'status' => 'dead'
                    ],
                    $iteration_h + 1 > $h_blocks ?
                        $h_blocks : $iteration_h + 1
                    => [
                        'status' => 'dead'
                    ]
                ];
                break;

            case 2:
                $iteration_neighbors[$iteration_v] = [
                    $iteration_h - 1 < 1 ?
                        1 : $iteration_h - 1
                    => [
                        'status' => 'dead'
                    ],
                    $iteration_h => [
                        'status' => 'dead'
                    ],
                    $iteration_h + 1 > $h_blocks ?
                        $h_blocks : $iteration_h + 1
                    => [
                        'status' => 'dead'
                    ]
                ];
                break;

            case 3:
                $iteration_neighbors[($iteration_v + 1)] = [
                    $iteration_h - 1 < 1 ?
                        1 : $iteration_h - 1
                    => [
                        'status' => 'dead'
                    ],
                    $iteration_h => [
                        'status' => 'dead'
                    ],
                    $iteration_h + 1 > $h_blocks ?
                        $h_blocks : $iteration_h + 1
                    => [
                        'status' => 'dead'
                    ]
                ];
                break;
        }
    }

    if ( ! empty ( $iteration_neighbors ) ) {
        return ['key'=>$iteration_v.'_'.$iteration_h,'neighbors'=>$iteration_neighbors];
    }

    return false;
}

/**
 * @param $v_blocks int
 * @param $h_blocks int
 * @param $height   int
 * @param $width    int
 *
 * @return false|string
 */
function bvd_gol_generate_canvas_display($v_blocks = 0, $h_blocks = 0, $height = 0, $width = 0 )
{

    // Variable checks.
    if (
        ! bvd_gol_is_positive_int($v_blocks) ||
        ! bvd_gol_is_positive_int($h_blocks) ||
        ! bvd_gol_is_positive_int($height) ||
        ! bvd_gol_is_positive_int($width)
    ) return false;

    $canvas_possible_neighbors  = [];
    $block_width                = 100 / $h_blocks;
    $block_height               = 100 / $v_blocks;


    $html_canvas = '<style id="horizontal_block_style">.vertical_row .horizontal_block{width:'.$block_width.'%!important;height:'.$block_height.'%!important;}</style>';

    $html_canvas .= '<div class="canvas_container_outer" style="width:'.$width.'px;">';
    $html_canvas .=
        '<div 
                            class="canvas_container" 
                            data-v_blocks="'.$v_blocks.'"
                            data-h_blocks="'.$h_blocks.'"
                        >
                    ';

    // Looping over the amount of vertical/horizontal blocks.
    // in order to create the necessary html structure.
    for($v_i = 1; ( $v_i - 1 ) < $v_blocks; $v_i++) {
        $html_canvas .= '<div class="vertical_row" data-vertical="'.$v_i.'">';

        for ($h_i = 1; ( $h_i - 1 ) < $h_blocks; $h_i++) {

            // Getting the neighbors for the current
            // block, and there for preparing for the later die/alive decisions.
            $neighbors = bvd_gol_generate_block_neighbors($v_blocks, $h_blocks, $v_i, $h_i);

            if ( ! empty ( $neighbors ) ) {
                $canvas_possible_neighbors[$neighbors['key']] = $neighbors['neighbors'];
            }

            $html_canvas .= '
                            <div 
                                class="horizontal_block" 
                                data-horizontal="'.$h_i.'" 
                                data-vertical="'.$v_i.'"
                                data-vertical-horizontal="'.$v_i.'_'.$h_i.'"
                            ></div>
                        ';
        }

        $html_canvas .= '</div>';
    }

    $html_canvas .= '</div>';

    $html_canvas .= '<div class="canvas_footer">';
    $html_canvas .= bvd_gol_generate_input_display();

    $html_canvas .= bvd_gol_generate_tools_display();
    $html_canvas .= '</div>';

    $html_canvas .= '</div>';

    $html_canvas .= '
                    <script type="text/javascript">
                        var possible_neighbors = '.json_encode($canvas_possible_neighbors).';
                    </script>
                ';

    return $html_canvas;
}

/**
 * @return string
 */
function bvd_gol_generate_tools_display(){

    ob_start();

    print '<div class="canvas_controls">';
    print '<div class="canvas_controls__single">';
    print '<button data-action="recalculate_canvas">Generate</button>';
    print '</div>';

    print '<div class="canvas_controls__single">';
    print '<button data-action="reset_canvas">Reset</button>';
    print '</div>';

    print '<div class="canvas_controls__single">';
    print '<button data-action="next_step_canvas">Next step</button>';
    print '</div>';

    print '<div class="canvas_controls__single">';
    print '<button data-action="play_canvas">Play</button>';
    print '</div>';

    print '<div class="canvas_controls__single">';
    print '<button data-action="pause_canvas">Pause</button>';
    print '</div>';
    print '</div>';

    return ob_get_clean();
}

/**
 * @return string
 */
function bvd_gol_generate_input_display(){

    ob_start();

    print '<div class="canvas_inputs">';
        print '<div class="canvas_inputs__single">';
            print '<label>Actions per 5 sec</label>';
            print '<input type="number" class="canvas_input" name="canvas_amount_per_5">';
        print '</div>';

        print '<div class="canvas_inputs__single">';
            print '<label>Background color alive block</label>';
            print '<input type="text" class="jscolor canvas_input color_picker" name="canvas_block_color">';
        print '</div>';
    print '</div>';

    return ob_get_clean();
}

/**
 * @return string
 */
function bvd_gol_generate_count_display() {
    ob_start();

    print '<div class="canvas_count">';
    print '<div class="canvas_count__generations">';
    print '<div class="container">';
    print '<span class="text">Generations</span>';
    print '<span class="number">0</span>';
    print '</div>';
    print '</div>';
    print '</div>';

    return ob_get_clean();
}

/**
 * @return false|int
 */
function bvd_gol_is_positive_int( $int ){
    return is_int( $int ) && $int > 0 ? $int : false;
}

/**
 * @param $variable array
 *
 * @return string
 */
function printr( $variable ) {
    ob_start();

    print '<pre>';
    print_r( $variable );
    print '</pre>';

    print ob_get_clean();
}