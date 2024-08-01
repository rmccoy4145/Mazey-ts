class Main extends Phaser.Scene
    {
        preload ()
        {
            this.load.setBaseURL('assets');
            this.load.image('tile', 'tile.png');
        }

        create ()
        {
            var pos = new Phaser.Math.Vector2(0,0);
            this.add.image(pos.x,pos.y,'tile');
        }
    }

    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: Main,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 200 }
            }
        }
    };

    const game = new Phaser.Game(config);