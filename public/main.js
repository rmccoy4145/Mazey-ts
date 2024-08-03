// map size has to be an even number to prevent inconsistent border
const MAP_W = 14
const MAP_H = 14

// calculates when the generator should stop, when we've covered all tile positions
const MAP_TILES_MAX = (MAP_W * MAP_H)*.25
const MAP_TILE_SIZE = 32
const MAP_GEN_SPEED = 20.0
const TILE_FLOOR = 1
const TILE_WALL = 0
const START_POS = new Phaser.Math.Vector2(MAP_W/2,MAP_H/2)

class Main extends Phaser.Scene
    {
        
        visited_cells = []
        last_open_cells = []
        current_pos = START_POS
        map_gen_timer
        game_map

        preload ()
        {
            this.load.setBaseURL('assets')
            this.load.image('mazey_tileset', 'mazey_tileset.png');
        }

        create ()
        {
            // setting up game tilemap, tileset, layer   
            this.game_map = this.make.tilemap({
                width: MAP_W,
                height:MAP_H,
                tileWidth: MAP_TILE_SIZE,
                tileHeight: MAP_TILE_SIZE,
            })
            const map_tileSet = this.game_map.addTilesetImage('mazey_tileset');
            const map_layer = this.game_map.createBlankLayer('map_layer_0',map_tileSet)
            this.game_map.setLayer(map_layer)
            this.game_map.fill(TILE_FLOOR)

            //timer to control generation speed
            this.map_gen_timer = this.time.addEvent({
                delay: MAP_GEN_SPEED,
                loop: true,
                callback: () => {

                    let visited_cells_count = this.visited_cells.length

                    if (visited_cells_count != MAP_TILES_MAX){
                        console.log("GENERATING... ("  + visited_cells_count + " / " + MAP_TILES_MAX + ")")
                        this.GenerateMap()
                    }
                    else{
                        console.log("GENERATION: DONE.")
                        this.map_gen_timer.paused = true
                    }
    
                }
            })

            //generate a new maze on mouse click
            this.input.on('pointerdown', () => {
                
                this.game_map.fill(TILE_FLOOR)
                this.visited_cells = []
                this.last_open_cells = []
                this.current_pos = START_POS
                this.map_gen_timer.paused = false

            })
        }

        //checks if the generator has already visited a cell
        HasVisitedCell(p_vec)
        {
            for (let i = 0; i < this.visited_cells.length; i++) {
                if (p_vec.equals(this.visited_cells[i])){
                    return true
                }
            }
            return false
        }
        
        // for each iteration while generating the map/maze
        GenerateMap()
        {
            //get all adjacent cells
            //we only track even tiles to create the maze design
            let move_directions = []
            let left_pos = new Phaser.Math.Vector2(this.current_pos.x-2,this.current_pos.y)
            let right_pos = new Phaser.Math.Vector2(this.current_pos.x+2,this.current_pos.y)
            let up_pos = new Phaser.Math.Vector2(this.current_pos.x,this.current_pos.y-2)
            let down_pos = new Phaser.Math.Vector2(this.current_pos.x,this.current_pos.y+2)

            //check if all adjacent cells are valid cells
            //if so, add them
            //otherwise, just leave them alone
            if (!this.HasVisitedCell(left_pos)) {
                try{
                    let left_tile_index = this.game_map.getTileAt(left_pos.x,left_pos.y).index
                    if (left_tile_index == TILE_FLOOR){
                        move_directions.push(left_pos)
                    }
                } catch {}
            }
        
            if (!this.HasVisitedCell(right_pos)) {
                try{
                    let right_tile_index = this.game_map.getTileAt(right_pos.x,right_pos.y).index
                    if (right_tile_index == TILE_FLOOR){
                        move_directions.push(right_pos)
                    }
                } catch {}
            }
        
            if (!this.HasVisitedCell(up_pos)) {
                try{
                    let top_tile_index = this.game_map.getTileAt(up_pos.x,up_pos.y).index
                    if (top_tile_index == TILE_FLOOR){
                        move_directions.push(up_pos)
                    }
                } catch {}
            }
        
            if (!this.HasVisitedCell(down_pos)) {
                try{
                    let bottom_tile_index = this.game_map.getTileAt(down_pos.x,down_pos.y).index
                    if (bottom_tile_index == TILE_FLOOR){
                        move_directions.push(down_pos)
                    }
                } catch {}
            }
                        
            //if we have nowhere to move, go back to previous position
            if (move_directions.length == 0 && this.last_open_cells.length != 0) {
                this.current_pos = this.last_open_cells[this.last_open_cells.length-1]
                this.last_open_cells.pop()
            }
                
            //if we do have somewhere to move
            //get a random new position
            //add it to the history (so we can return to it when we have nowhere to go)
            else if (move_directions.length != 0) {
                let randomized_move_direction = Math.floor(Math.random() * move_directions.length)
                let next_move_direction = move_directions[randomized_move_direction]

                this.last_open_cells.push(next_move_direction)
                this.MovePosition(next_move_direction)
            } 
        }
        
        //move the generation position and place a tile in the appropriate cells
        MovePosition(new_pos)
        {
            let prev_pos = this.current_pos
            let between_pos = new Phaser.Math.Vector2().copy(new_pos)
            between_pos = between_pos.subtract(prev_pos).multiply(new Phaser.Math.Vector2(.5,.5))
            let final_between_pos = new Phaser.Math.Vector2().copy(new_pos).add(between_pos)

            this.current_pos = new_pos
            this.visited_cells.push(this.current_pos)
            this.game_map.putTileAt(TILE_WALL,final_between_pos.x,final_between_pos.y)
            this.game_map.putTileAt(TILE_WALL,this.current_pos.x,this.current_pos.y)
        }
        

    }

    const config = {
        type: Phaser.AUTO,
        width: MAP_W*MAP_TILE_SIZE,
        height: MAP_H*MAP_TILE_SIZE,
        backgroundColor: '#2d2d2d',
        scene: Main,
        pixelArt: true
    };

    const game = new Phaser.Game(config)