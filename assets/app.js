(function( $ ) {

    /* -- global variables -- */
    var w_alive_blocks = [],
        w_canvas_paused = true,
        w_canvas_count = 0,
        w_canvas_amount_per_5 = 10,
        w_canvas_interval = setInterval( canvas_interval, ( 5000 / w_canvas_amount_per_5 ) );

    // /* -- Handlers. -- */
    $( document ).ready( function() {

        var canvas_container = $( '.canvas_container' );

        if ( canvas_container.length ) {

            // Checking if the canvas needs a responsive fix.
            // due to using a fixed width. Resetting those fixed values
            // upon detecting that the canvas is too big.
            if (
                window.innerWidth < canvas_container.width() ||
                window.innerHeight < canvas_container.height() ||
                ( window.innerWidth - 100 ) > canvas_container.width() ||
                ( window.innerHeight - 100 ) > canvas_container.height()
            ) {

                canvas_responsive_reset( canvas_container );
            }
        }

        var color_picker_inputs = $( '.color_picker' );

        if ( color_picker_inputs.length ) {
            $.each( color_picker_inputs, function(index,data) {

            } );
        }
    } );

    /* -- .on handlers. -- */
    $( document

    ).on( 'click', '.horizontal_block', function() {
        var $this = $(this);

        // Toggle the class.
        if ($this.length) {

            // Add the current clicked block to
            // the alive array and toggle its css properties.
            toggle_alive_horizontal_block($this);
        }
    }

    ).on( 'click', 'button[data-action="recalculate_canvas"]', function() {

        if ( $( '.horizontal_block' ).length ) {

            if(typeof w_canvas_count != 'undefined') {
                w_canvas_count=0;

                canvas_set_current_count();

                end_canvas_interval();
            }

            set_random_horizontal_alive_blocks();
        }
    }

    ).on( 'click', 'button[data-action="next_step_canvas"]', function() {

        if ( $( '.horizontal_block' ).length ) {

            set_next_step_canvas();
        }
    }

    ).on( 'click', 'button[data-action="play_canvas"]', function() {

        if (w_canvas_paused){
            w_canvas_paused = false;

            start_canvas_interval();
        }
    }

    ).on( 'click', 'button[data-action="pause_canvas"]', function() {

        if (!w_canvas_paused){
            w_canvas_paused = true;

            end_canvas_interval();
        }
    }

    ).on( 'click', 'button[data-action="reset_canvas"]', function() {
        if (!w_canvas_paused){
            w_canvas_paused = true;

            end_canvas_interval();
        }

        remove_alive_horizontal_block();
    }

    ).on( 'keyup, change', 'input.canvas_input', function() {
       var this_element = $( this );

       // @ToDo: make this more variable.
       if (
           this_element.length &&
           this_element.attr( 'name' ) != ''
       ) {

           switch( this_element.attr( 'name' ) ) {
               case 'canvas_amount_per_5':
                   if (
                       typeof w_canvas_amount_per_5 != 'undefined' &&
                       parseInt( this_element.val() )
                   ) {
                       w_canvas_amount_per_5 = parseInt( this_element.val() );

                       end_canvas_interval();

                       start_canvas_interval();
                   }

                   break;

               case 'canvas_block_color':

                   $( '#horizontal_block_single_style' ).remove();

                   $( '.page_container' ).append(
                       $(
                           '<style id="#horizontal_block_single_style">.vertical_row .horizontal_block.alive{background:#'+this_element.val()+'!important;}</style>'
                       )
                   );

                   break;
           }
       }

    } );

    // Functions.
    function get_blocks() {
        var horizontal_blocks = $( '.horizontal_block' );

        return ! horizontal_blocks.length ? false : horizontal_blocks;
    }

    function get_blocks_by_row( row ) {

        if ( ! row )
            return false;

        var horizontal_blocks = $( '.horizontal_block[data-vertical="'+row+'"]' );

        return ! horizontal_blocks.length ? false : horizontal_blocks;
    }

    function get_rows() {

        var vertical_rows = $( '.vertical_row' );

        return ! vertical_rows.length ? false : vertical_rows;
    }

    function get_random_from_array(arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    function start_canvas_interval() {

        if (!w_canvas_paused){
            w_canvas_interval = setInterval( canvas_interval, ( 5000 / w_canvas_amount_per_5 ) );
        }
    }

    function canvas_interval() {

        if(!w_canvas_paused){
            set_next_step_canvas();
        }
    }

    function end_canvas_interval() {

        clearInterval(w_canvas_interval);
    }

    function set_random_horizontal_alive_blocks() {
        var horizontal_blocks = get_blocks();

        // @ToDo:(question:in terms of warnings of the element
        // not existing?) do i have to make them a variable first?
        var existing_horizontal_blocks = $( '.horizontal_block.alive' );

        if ( existing_horizontal_blocks.length )
            existing_horizontal_blocks.removeClass( 'alive' );

        // @ToDo: Should be from some soft of variable
        //        which should be from a form on the page.
        var $horizontal_amount = 200;

        // Adding the class "alive" to make them appear colored
        // (and so making them active).
        var random_defined_alive = $( get_random_from_array( horizontal_blocks, $horizontal_amount )
        ).addClass( 'alive' );

        // Checking for the given possible neighbors/blocks.
        var possible_neighbors =
            ( typeof window.possible_neighbors != 'undefined' ) ?
                window.possible_neighbors : false;

        // Checking whether neighbors is defined.
        if ( possible_neighbors != false ) {

            // Resetting the alive blocks.
            if ( typeof w_alive_blocks != 'undefined' ) {
                $.each( w_alive_blocks, function( index, data ) {
                    $( '.horizontal_block[data-verical-horizontal="'+index+'"]' ).removeClass('alive');
                } );

                // Resetting the active blocks since new random blocks
                // need to be activated.
                w_alive_blocks = [];
            }

            // Looping over the amount of random defined blocks.
            $.each( random_defined_alive, function(index, element) {

                var combination_v_h = $(element).data('vertical') + '_' + $(element).data('horizontal');

                // Defining the supposed to be alive blocks in the w_alive_blocks.
                if ( typeof possible_neighbors[combination_v_h] == 'undefined' ) {
                    remove_alive_horizontal_block();
                }

                w_alive_blocks[combination_v_h] = {
                    status: 'alive',
                    neighbors: possible_neighbors[combination_v_h]
                };
            } );
        }

        if (!w_canvas_paused){
            w_canvas_paused = true;
        }
    }

    function amount_direct_alive_neighbors(v_block, h_block, neighbors) {
        if ( v_block && h_block && neighbors ) {
            var current_block_active_count = 0;

            for( var key_v in neighbors ) {
                var obj_v = neighbors[ key_v ];

                for ( var key_h in obj_v ) {
                    if (
                        ( v_block + '_' + h_block ) != ( key_v + '_' + key_h ) &&
                        w_alive_blocks[key_v+ '_' + key_h ] )
                    {
                        current_block_active_count++;
                    }
                }
            }

            return current_block_active_count;
        }

        return false;
    }

    function direct_eligible_alive_neighbors(neighbors) {

        var alive_blocks = typeof w_alive_blocks != 'undefined' ?
            w_alive_blocks : false;

        if ( neighbors ) {
            var new_alive_blocks = [];

            for ( var key_v in neighbors ) {
                var obj_v = neighbors[key_v];

                for ( var key_h in obj_v ) {
                    var iteration_key = key_v + '_' + key_h,
                        iteration_neighbors = window.possible_neighbors[iteration_key];

                    if ( iteration_neighbors ){
                        var iteration_direct_alive_amount = amount_direct_alive_neighbors(
                            key_v,
                            key_h,
                            iteration_neighbors
                        );

                        if (
                            iteration_direct_alive_amount == 3 &&
                            (
                                (
                                    alive_blocks !== false &&
                                    typeof alive_blocks[iteration_key] == 'undefined'
                                ) ||
                                alive_blocks == false &&
                                typeof new_alive_blocks[iteration_key] == 'undefined'
                            )
                        ) {
                            new_alive_blocks.push( iteration_key );
                        }
                    }
                }
            }

            if ( new_alive_blocks.length > 0 ) {
                return new_alive_blocks
            }
        }

        return false;
    }

    function set_next_step_canvas() {

        // Checking for the given possible neighbors/blocks.
        var possible_neighbors =
                ( typeof window.possible_neighbors != 'undefined' ) ?
                window.possible_neighbors : false,

            alive_blocks =
                ( typeof w_alive_blocks != 'undefined' ) ?
                    w_alive_blocks : false,

            deleted_blocks = [],

            added_blocks = [];

        if ( ! possible_neighbors || ! alive_blocks )
            return false;

        for ( var key in alive_blocks ) {
            var obj = alive_blocks[ key ],
                v_block = key.split('_')[0],
                h_block = key.split('_')[1],
                amount_alive_neighbors = amount_direct_alive_neighbors(v_block,h_block, obj.neighbors),
                possible_new_alive_blocks = direct_eligible_alive_neighbors(obj.neighbors);

            // Whenever a cell has less than 2 neighbors
            // or when its has more than 3 neighbors.
            if (
                amount_alive_neighbors < 2 ||
                amount_alive_neighbors > 3
            ) {
                deleted_blocks.push( key );
            }

            // Whenever a cell has 3 alive neighbors it should swap
            // to be alive itself.
            if ( possible_new_alive_blocks !== false ) {
                for( var key_new in possible_new_alive_blocks ) {
                    if ( added_blocks.indexOf(possible_new_alive_blocks[key_new]) == -1 ) {
                        added_blocks.push(possible_new_alive_blocks[key_new]);
                    }
                }
            }
        }

        if ( added_blocks.length ) {
            for ( var key_a in added_blocks ) {
                w_alive_blocks[added_blocks[key_a]] = {
                    status: 'alive',
                    neighbors: possible_neighbors[added_blocks[key_a]]
                };

                $( '.horizontal_block[data-vertical-horizontal="'+added_blocks[key_a]+'"]').addClass('alive');
            }
        }

        if ( deleted_blocks.length ) {
            for( var key_d in deleted_blocks ) {
                delete w_alive_blocks[deleted_blocks[key_d]];

                $( '.horizontal_block[data-vertical-horizontal="'+deleted_blocks[key_d]+'"]').removeClass( 'alive' );
            }
        }

        if(typeof w_canvas_count != 'undefined') {
            w_canvas_count++;

            canvas_set_current_count();
        }
    }

    function toggle_alive_horizontal_block( this_element ) {

        // Toggle alive class.
        this_element.toggleClass( 'alive' );

        var possible_neighbors = typeof window.possible_neighbors != 'undefined' ?
            window.possible_neighbors : false;

        if ( typeof w_alive_blocks != 'undefined' ) {

            var alive_blocks = w_alive_blocks;
            var this_element_pos = this_element.data('vertical-horizontal');

            // Checking whether the item existed.
            if ( typeof alive_blocks[this_element_pos] != 'undefined' ) {

                // since the active block existed within the window alive block delete it.
                delete w_alive_blocks[this_element_pos];
            } else {

                // The block did not exist within the alive blocks
                // so it needs to be added(the alive state was dead).
                w_alive_blocks[this_element_pos] = {
                    status: 'alive',
                    neighbors: possible_neighbors[this_element_pos]
                };
            }
        }
    }

    function remove_alive_horizontal_block() {
        // Resetting the alive blocks.
        if ( typeof w_alive_blocks != 'undefined' ) {

            for( var key_alive in w_alive_blocks ) {
                $( '.horizontal_block[data-vertical-horizontal="'+key_alive+'"]' ).removeClass('alive');
            }

            // Resetting the active blocks since new random blocks
            // need to be activated.
            w_alive_blocks = [];

            if(typeof w_canvas_count != 'undefined') {
                w_canvas_count=0;

                canvas_set_current_count();
            }
        }
    }

    function canvas_set_current_count() {

        var canvas_count_container = $( '.canvas_count__generations' );

        if ( canvas_count_container.length ) {
            var canvas_count_number = canvas_count_container.find(
                'span.number' );

            if ( canvas_count_number.length )
                $( canvas_count_number ).text(w_canvas_count );
        }
    }

    function canvas_responsive_reset( c_c ) {
        var c_c_v = c_c.data('v_blocks'),
            c_c_h = c_c.data('h_blocks');

        if ( c_c_h && c_c_v ) {
            var c_c_e = $( '#horizontal_block_style' ),
                c_c_b_d = ( window.innerWidth - 30 ) / c_c_h,
                c_c_d = ( window.innerWidth - 30 );

            if ( c_c_e.length && c_c_b_d ) {

                if ( window.innerWidth > window.innerHeight ) {
                    c_c_b_d = ( window.innerHeight - 30 ) / c_c_v;
                    c_c_d = ( window.innerHeight - 30 );
                }

                $( c_c ).closest('.canvas_container_outer').css( 'width', c_c_d + 'px' );

                $( 'style#horizontal_block_style' ).remove();
                $( '.page_container' ).append(
                    $(
                        '<style id="#horizontal_block_style">.vertical_row{height:'+c_c_b_d+'px!important;}.vertical_row .horizontal_block{width:'+c_c_b_d+'px!important;height:'+c_c_b_d+'px!important;}</style>'
                    )
                );
            }
        }
    }
})( jQuery );
