// map size has to be an even number to prevent inconsistent border
const MAP_W = 24
const MAP_H = 24

// calculates when the generator should stop, when we've covered all tile positions
const MAP_TILES_MAX = (MAP_W * MAP_H)*.25
const MAP_TILE_SIZE = 32
const MAP_GEN_SPEED = 20.0

// tile types in reference to index in tileset
const TILE_NONE = -1
const TILE_FLOOR = 1
const TILE_WALL = 0

const START_POS = new Phaser.Math.Vector2(MAP_W/2,MAP_H/2)

class Main extends Phaser.Scene
    {
        
        visited_cells = []
        last_open_cells = []
        current_pos = START_POS
        map_gen_timer
        map_marker
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
                width: MAP_W+2,
                height:MAP_H+2,
                tileWidth: MAP_TILE_SIZE,
                tileHeight: MAP_TILE_SIZE,
            })
            const map_tileSet = this.game_map.addTilesetImage('mazey_tileset');
            const map_layer = this.game_map.createBlankLayer('map_layer_0',map_tileSet)
            this.game_map.setLayer(map_layer)

            //marker to show current location of generator
            this.map_marker = this.add.rectangle(0,0,MAP_TILE_SIZE,MAP_TILE_SIZE,0xff0000)
            this.map_marker.setOrigin(0,0)

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
                        this.map_marker.setVisible(false)
                        this.DrawBorder(TILE_WALL)
                        this.SpawnPlayer()
                    }
    
                }
            })

            //generate a new maze on mouse click
            this.input.on('pointerdown', () => {
                this.RestartGenerator()
            })

            this.RestartGenerator()

        }

        RestartGenerator(){
            this.game_map.fill(TILE_FLOOR)
            this.visited_cells = []
            this.last_open_cells = []
            this.current_pos = START_POS
            this.map_gen_timer.paused = false
            this.map_marker.setVisible(true)
            this.DrawBorder(TILE_NONE)
        }

        //draws a border around the maze
        DrawBorder(p_tile_index, p_border_inset_weight = 1){
            for (let i = 0; i <= MAP_W; i++) {
                for (let j = 0; j < p_border_inset_weight; j++){
                    this.game_map.putTileAt(p_tile_index,i,j)
                    this.game_map.putTileAt(p_tile_index,i,MAP_H-(j+1))
                }
            }
            for (let i = 0; i <= MAP_H; i++) {
                for (let j = 0; j < p_border_inset_weight; j++){
                    this.game_map.putTileAt(p_tile_index,j,i)
                    this.game_map.putTileAt(p_tile_index,MAP_W-(j+1),i)
                }
            }
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
        
        //gets and returns valid neighbor cells from the current generator position
        GetNeighborCells(){
            //get all adjacent cells
            //we only track even tiles to create the maze design
            let move_directions = [
                //left
                new Phaser.Math.Vector2(this.current_pos.x-2,this.current_pos.y),
                //right
                new Phaser.Math.Vector2(this.current_pos.x+2,this.current_pos.y),
                //top
                new Phaser.Math.Vector2(this.current_pos.x,this.current_pos.y-2),
                //bottom
                new Phaser.Math.Vector2(this.current_pos.x,this.current_pos.y+2)
            ]

            //filter out valid cells
            return move_directions.filter((neighbor_cell) => {
                try{
                    let tile_index = this.game_map.getTileAt(neighbor_cell.x,neighbor_cell.y).index
                    if (!this.HasVisitedCell(neighbor_cell) && tile_index == TILE_FLOOR){
                        return true
                    }
                } catch {}
                return false
            })
        }

        // for each iteration while generating the map/maze
        GenerateMap()
        {
            let move_directions = this.GetNeighborCells()
                        
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
        
        //move the generation position to a valid cell, and places a tile in the appropriate cells
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
            this.map_marker.setPosition(this.current_pos.x*MAP_TILE_SIZE,this.current_pos.y*MAP_TILE_SIZE)
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