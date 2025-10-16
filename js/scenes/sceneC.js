var SceneC = new Phaser.Class({

    Extends: Phaser.Scene,
  
    initialize:
  
    function SceneC ()
    {
        Phaser.Scene.call(this, { key: 'sceneC' });
    },
  
    preload: function(){
        // Images
        this.load.image('mapa0', 'assets/mapa0.png');
        this.load.image('mapa0d', 'assets/mapa0.png');
        this.load.image('mapa0a', 'assets/mapa0a.png');
        this.load.image('mapa0n', 'assets/mapa0n.png');
        this.load.image('mapa1', 'assets/mapa1.png');
        this.load.image('mapa2', 'assets/mapa2.png');
        this.load.image("limits0", "assets/limits0.png");
        this.load.image("limits1", "assets/limits1.png");
        this.load.image("limits2", "assets/limits2.png");
        this.load.image("roofs1", "assets/roofs1.png");
        this.load.image("foreground", "assets/fr.png");
        this.load.image("round", "assets/mobileround.png");
        this.load.image("analog", "assets/mobileanalog.png");
        this.load.image("guns", "assets/gun.png");
        this.load.image("dashs", "assets/dash.png");
        // Personas
        this.load.spritesheet('hitbox', 'assets/fake.png', { frameWidth: 22, frameHeight: 15 });
        this.load.spritesheet('hitboxP', 'assets/fake.png', { frameWidth: 30, frameHeight: 50 });
        this.load.spritesheet('fake', 'assets/fake.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('isaac', 'assets/isaac all.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('joaquim', 'assets/joaquim all.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('hyoma', 'assets/hyoma all.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('peko', 'assets/peko all.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('master', 'assets/master all.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('bullet', 'assets/hado.png', { frameWidth: 2, frameHeight: 2 });
        // Audios
        this.load.audio('gun', 'assets/sounds/gun.mp3');
        this.load.audio('death', 'assets/sounds/death.mp3');
        this.load.audio('master', 'assets/sounds/master.mp3');
    },
  
    create: function(){
        this.physics.world.setFPS(90);
        this.input.addPointer(5);

        gun = this.sound.add('gun');
        death = this.sound.add('death');
        master = this.sound.add('master');

        Game.playerMap = {};
        Game.playerHb = {};
        Game.playerHp = {};
        Game.bulletsP = {};
        
        Cthis = this;
        
        this.cameras.main.width = cw;
        this.cameras.main.height = ch;
        this.cameras.main.setBounds(0, 0, w , h);

        this.physics.world.setBounds(0, 0, w, h);

        bg = this.physics.add.staticImage(midw, midh, "mapa0").setDepth(0);
        bgaux = this.physics.add.staticImage(midw, midh, "fake").setDepth(1).setAlpha(0);
        fg = this.physics.add.staticImage(midw, midh, "foreground").setDepth(1921).setAlpha(0);
        limits = this.physics.add.staticImage(midw, midh, "limits0").setDepth(-1);
        player = this.physics.add.sprite(100, 150, spriteMe);
        hp1 = this.physics.add.sprite(100, 175, 'hitbox');
        hc1 = this.physics.add.sprite(100, 155, 'hitboxP');
        
        Client.askNewPlayer(spriteMe);

        setCursors();

        hp1.setCollideWorldBounds(true);

        hc1.setCollideWorldBounds(true);

        limitsTopLeft = limits.getTopLeft();
        collider = this.physics.add.overlap(
            limits,
            hp1,
            function overlap(_limits, _hp1) {
                hp1.setVelocityX(0);
                hp1.setVelocityY(0);
                dash = 0;
                collided = true;    
                recharged = false;            
            },
            function process(_limits, _hp1) {
                // It would be more efficient to create a CanvasTexture and check that instead.
                // But getPixelAlpha() is convenient for an example.
        
                return (
                this.textures.getPixelAlpha(
                    Math.floor(hp1.body.center.x - limitsTopLeft.x),
                    Math.floor(hp1.body.center.y - limitsTopLeft.y),
                    "limits0"
                ) === 255
                );
            },
            Cthis
            );


        createComponets(player);

        
    },
  
    update: Game.update
  
});