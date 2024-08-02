const MAP_W = 100
const MAP_H = 100
const MAP_TILE_SIZE = 32
const MAP_GEN_SPEED = 0.5
const TILE_FLOOR = 0
const TILE_WALL = 1
const START_POS = new Phaser.Math.Vector2(0,0)

class Main extends Phaser.Scene
    {
        
        visited_cells = []
        last_open_cells = []
        current_pos = START_POS
        generator_position = this.current_pos
        map_gen_timer
        game_map

        preload ()
        {
            this.load.setBaseURL('assets')
            this.load.image('tile', 'tile.png');
            this.load.image('mazey_tileset', 'mazey_tileset.png');

        }

        create ()
        {

            let pos = new Phaser.Math.Vector2(0,0)
            this.tile = this.add.image(pos.x,pos.y,'tile')
            
            this.game_map = this.make.tilemap({
                width: MAP_W,
                height:MAP_H,
                tileWidth: MAP_TILE_SIZE,
                tileHeight: MAP_TILE_SIZE,
            })
            const map_tileSet = this.game_map.addTilesetImage('mazey_tileset');
            const map_layer = this.game_map.createBlankLayer('map_layer_0',map_tileSet)
            let pos_x = this.game_map.worldToTileX(0);
            let pos_y = this.game_map.worldToTileY(0);
            this.game_map.putTileAt(new Phaser.Math.Vector2(pos_x,pos_y),TILE_WALL)

            //timer to control generation speed
            this.map_gen_timer = this.time.addEvent({
                delay: MAP_GEN_SPEED,
                loop: true,
                callback: () => {

                    let visited_cells_count = this.visited_cells.length
        
                    if (visited_cells_count != (MAP_W * MAP_H)){
                        console.log("GENERATION: IN PROCESS..."  + visited_cells_count)
                        this.GenerateMap()
                    }
                    else{
                        console.log("GENERATION: DONE.")
                        this.map_gen_timer.paused = true
                    }
    
                }
            })

            //to show the current position of the generator
            this.generator_position = this.add.rectangle(START_POS.x, START_POS.y, MAP_TILE_SIZE, MAP_TILE_SIZE, 0xff0000)
        
        }

        update()
        {
            //this.tile.x += 1
            //this.tile.y += 1
            let pos_x = this.game_map.worldToTileX(game.input.mousePointer.x)
            let pos_y = this.game_map.worldToTileY(game.input.mousePointer.y);
            this.game_map.putTileAt(new Phaser.Math.Vector2(pos_x,pos_y),TILE_WALL)
        }

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
            let move_directions = []
            let left_pos = new Phaser.Math.Vector2(this.current_pos.x-1,this.current_pos.y)
            let right_pos = new Phaser.Math.Vector2(this.current_pos.x+1,this.current_pos.y)
            let up_pos = new Phaser.Math.Vector2(this.current_pos.x,this.current_pos.y-1)
            let down_pos = new Phaser.Math.Vector2(this.current_pos.x,this.current_pos.y+1)
            
            let left_tile = this.game_map.getTileAt(left_pos)
            let right_tile = this.game_map.getTileAt(right_pos)
            let top_tile = this.game_map.getTileAt(up_pos)
            let bottom_tile = this.game_map.getTileAt(down_pos)

            //only add cells to the move array that are valid
            if (!this.HasVisitedCell(left_pos) && left_tile != TILE_WALL) {
                move_directions.push(left_pos)
            }
        
            if (!this.HasVisitedCell(right_pos) && right_tile != TILE_WALL) {
                move_directions.push(right_pos)
            }
        
            if (!this.HasVisitedCell(up_pos) && top_tile != TILE_WALL) {
                move_directions.push(up_pos)
            }
        
            if (!this.HasVisitedCell(down_pos) && bottom_tile != TILE_WALL) {
                move_directions.push(down_pos)
            }
                        
            //if we have nowhere to move, go back to previous position
            if (move_directions.length == 0 && this.last_open_cells.length != 0) {
                console.log("GENERATION: REVERSING POSITION...")
                this.current_pos = this.last_open_cells[this.last_open_cells.length-1]
                this.last_open_cells.pop()
                this.generator_position.setPosition(this.current_pos)
            }
                
            //if we do have somewhere to move, set the new position and add it to the history
            else if (move_directions.length != 0) {
                console.log("GENERATION: MOVING POSITION...")
                let randomized_move_direction = Math.floor(Math.random() * move_directions.length)

                this.last_open_cells.push(move_directions[randomized_move_direction])
                this.MovePosition(move_directions[randomized_move_direction])
            } 
        
        }
        
        
        MovePosition(new_pos,move_dir = new Phaser.Math.Vector2())
        {
            let prev_pos = this.current_pos
            this.current_pos = new_pos
            this.visited_cells.push(this.current_pos)
            
            let between_pos = (this.current_pos-prev_pos)*.5

            let pos_x = this.game_map.worldToTileX(new Phaser.Math.Vector2(this.current_pos+between_pos).x);
            let pos_y = this.game_map.worldToTileY(new Phaser.Math.Vector2(this.current_pos+between_pos).y);

            this.game_map.putTileAt(this.current_pos+between_pos,TILE_WALL)
            this.game_map.putTileAt(this.current_pos,TILE_WALL)

            this.generator_position.setPosition(this.current_pos)
        }
        

    }

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        backgroundColor: '#2d2d2d',
        scene: Main,
        pixelArt: true
    };

    const game = new Phaser.Game(config)