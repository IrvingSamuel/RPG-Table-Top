var Game = {};

Game.preload = function()
    {
        console.log('Game.preload iniciado');
        window.initDiagnostic.log('Game.preload', 'START');
        
        // Marca o tempo de início do carregamento
        window.gameLoadStartTime = Date.now();
        setTimeout(() => {
            console.log('⏳ Aguardando WebSocket conectar...');
        }, 1000);

        // Incrementa tentativas de carregamento
        window.loadingAttempts++;
        localStorage.setItem('rpg_loading_attempts', window.loadingAttempts.toString());
        console.log(`Tentativa de carregamento #${window.loadingAttempts}`);
        
        // Cache busting baseado em tentativas
        const shouldBustCache = window.loadingAttempts > 1 || window.location.search.includes('nocache');
        const cacheVersion = shouldBustCache ? `?v=${Date.now()}&attempt=${window.loadingAttempts}` : '';
        console.log('Cache busting:', shouldBustCache ? 'ATIVO' : 'DESABILITADO');
        
        // Adiciona listeners para detectar falhas de carregamento
        this.load.on('loaderror', function(file) {
            console.error('Erro ao carregar arquivo:', file.key, file.url);
            window.initDiagnostic.log('Asset Load Error', 'FAIL', `${file.key}: ${file.url}`);
            console.warn('Falha detectada - próximo carregamento usará cache busting');
        });
        
        this.load.on('filecomplete', function(key, type, data) {
            console.log('Arquivo carregado:', key, type);
            if (['fake', 'warrior', 'hospital', 'limitshospital'].includes(key)) {
                window.initDiagnostic.log('Critical Asset Loaded', 'OK', `${key} (${type})`);
            }
        });
        
        // Listener para quando todos os arquivos terminarem de carregar
        this.load.on('complete', function() {
            console.log('Todos os assets carregados');
            window.initDiagnostic.log('Assets Complete', 'OK');
            
            // Implementa delay mínimo para sincronização - AUMENTADO PARA 5 SEGUNDOS
            const startTime = window.gameLoadStartTime || Date.now();
            const elapsed = Date.now() - startTime;
            const minimumLoadTime = 5000; // 5 segundos mínimo para estabilidade
            const remainingTime = Math.max(0, minimumLoadTime - elapsed);
            
            console.log(`⏱️ Tempo de carregamento: ${elapsed}ms, aguardando mais ${remainingTime}ms (mínimo 5s)`);
            window.initDiagnostic.log('Assets Delay', 'START', `${elapsed}ms elapsed, waiting ${remainingTime}ms more (5s minimum)`);
            
            // Mostra progresso de loading durante os 5 segundos
            if (typeof showLoadingProgress === 'function') {
                showLoadingProgress(remainingTime);
            }
            
            setTimeout(() => {
                window.initDiagnostic.log('Assets Ready', 'OK', 'Minimum 5-second delay completed');
                console.log('✅ Loading mínimo de 5 segundos concluído - sistema estável');
                if (typeof updateLoadingStatus === 'function') {
                    updateLoadingStatus('assets', true);
                }
            }, remainingTime);
        });
        
        // Inicializa doorset como array vazio
        window.doorset = [];
        
        // AGUARDA CONEXÃO WEBSOCKET ANTES DE CONTINUAR
        console.log('⏳ Aguardando conexão WebSocket antes de buscar cena...');
        window.initDiagnostic.log('WebSocket Wait', 'START', 'Waiting for WebSocket connection before scene request');
        
        // Função para aguardar WebSocket e então buscar cena
        const waitForWebSocketAndGetScene = () => {
            if (window.socket && window.socket.connected) {
                console.log('✅ WebSocket conectado - buscando cena do servidor');
                window.initDiagnostic.log('WebSocket Ready', 'OK', 'WebSocket connected, requesting scene');
                Client.getLastScene();
            } else {
                console.log('⏳ WebSocket ainda não conectado, aguardando...');
                setTimeout(waitForWebSocketAndGetScene, 200); // Tenta novamente em 200ms
            }
        };
        
        // Inicia a verificação após um breve delay
        setTimeout(waitForWebSocketAndGetScene, 100);

        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        console.log('Dimensões da câmera no preload:', width, 'x', height);
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(140, height / 2 - 30, width * 0.8, 50);
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Carregando Texturas...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(150, height / 2 -20, (width * 0.8 - 20) * value, 30);
        });
                    
        this.load.on('fileprogress', function (file) {
            assetText.setText('Carregando asset: ' + file.key);
        });
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
        // Map Images (com cache busting se necessário)
        this.load.image('hospital', `assets/maps/hospital/terreo/mapad.png${cacheVersion}`);
        this.load.image('forestd', `assets/maps/jungle/jungled.png${cacheVersion}`);
        this.load.image('limitsforest', `assets/maps/jungle/limits.png${cacheVersion}`);
        this.load.image('roofsforest', `assets/maps/jungle/roofsd.png${cacheVersion}`);
        this.load.image('roofsforestd', `assets/maps/jungle/roofsd.png${cacheVersion}`);
        this.load.image('hospitald', 'assets/maps/hospital/terreo/mapad.png');
        this.load.image('hospitala', 'assets/maps/hospital/terreo/mapaa.png');
        this.load.image('hospitaln', 'assets/maps/hospital/terreo/mapan.png');
        this.load.image('escola', 'assets/maps/escola/terreo/mapad.png');
        this.load.image('escolad', 'assets/maps/escola/terreo/mapad.png');
        this.load.image('escolan', 'assets/maps/escola/terreo/mapan.png');
        // Map Limits
        this.load.image("limitshospital", "assets/maps/hospital/terreo/limits.png");
        this.load.image("limitsescola", "assets/maps/escola/terreo/limits.png");
        //Map Roofs
        this.load.image("roofshospital", "assets/maps/hospital/terreo/roofsd.png");
        this.load.image("roofshospitald", "assets/maps/hospital/terreo/roofsd.png");
        this.load.image("roofshospitala", "assets/maps/hospital/terreo/roofsa.png");
        this.load.image("roofshospitaln", "assets/maps/hospital/terreo/roofsn.png");
        this.load.image("roofsescola", "assets/maps/escola/terreo/roofsd.png");
        this.load.image("roofsescolad", "assets/maps/escola/terreo/roofsd.png");
        this.load.image("roofsescolan", "assets/maps/escola/terreo/roofsn.png");
        //Map Doors
        this.load.image("doorshospitald", "assets/maps/hospital/terreo/portad.png");
        this.load.image("doorshospitala", "assets/maps/hospital/terreo/portaa.png");
        this.load.image("doorshospitaln", "assets/maps/hospital/terreo/portan.png");
        // Assets
        this.load.image("foreground", "assets/sprites/fr.png");
        this.load.image("round", "assets/sprites/mobileround.png");
        this.load.image("analog", "assets/sprites/mobileanalog.png");
        this.load.image("guns", "assets/sprites/gun.png");
        this.load.image("dashs", "assets/sprites/dash.png");
        // Personas (com cache busting se necessário)
        this.load.spritesheet('hitbox', `assets/sprites/fake.png${cacheVersion}`, { frameWidth: 22, frameHeight: 15 });
        this.load.spritesheet('hitboxP', `assets/sprites/fake.png${cacheVersion}`, { frameWidth: 30, frameHeight: 50 });
        this.load.spritesheet('fake', `assets/sprites/fake.png${cacheVersion}`, { frameWidth: 64, frameHeight: 64 });
        // this.load.spritesheet('isaac', 'assets/sprites/isaac all.png', { frameWidth: 64, frameHeight: 64 });
        // this.load.spritesheet('joaquim', 'assets/sprites/joaquim all.png', { frameWidth: 64, frameHeight: 64 });
        // this.load.spritesheet('hyoma', 'assets/sprites/hyoma all.png', { frameWidth: 64, frameHeight: 64 });
        // this.load.spritesheet('peko', 'assets/sprites/peko all.png', { frameWidth: 64, frameHeight: 64 });
        // this.load.spritesheet('master', 'assets/sprites/master all.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('sapo', `assets/sprites/sapo.png${cacheVersion}`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('bullet', `assets/sprites/hado.png${cacheVersion}`, { frameWidth: 2, frameHeight: 2 });
        this.load.spritesheet('mage', `assets/sprites/mage.png${cacheVersion}`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('ranger', `assets/sprites/ranger.png${cacheVersion}`, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('warrior', `assets/sprites/warrior.png${cacheVersion}`, { frameWidth: 64, frameHeight: 64 });
        // Audios
        this.load.audio('gun', 'assets/sounds/gun.mp3');
        this.load.audio('death', 'assets/sounds/death.mp3');
        this.load.audio('master', 'assets/sounds/master.mp3');
}

Game.create = async function()
    {   
        console.log('Game.create iniciado');
        window.initDiagnostic.log('Game.create', 'START');
        
        // Expõe a função de inicialização no contexto da cena
        this.initializePlayerWithRetry = Game.initializePlayerWithRetry;
        
        // Verifica se os assets principais foram carregados
        const requiredAssets = ['fake', 'warrior', 'hospital', 'limitshospital'];
        const missingAssets = requiredAssets.filter(asset => !this.textures.exists(asset));
        
        if (missingAssets.length > 0) {
            console.error('❌ Assets obrigatórios não carregados:', missingAssets);
            window.initDiagnostic.log('Missing Assets', 'FAIL', missingAssets.join(', '));
            window.initDiagnostic.getReport();
            console.error('❌ Detectado problema de tela preta - forçando reload');
            
            // Incrementa contador de falhas e força reload
            window.loadingAttempts = (window.loadingAttempts || 0) + 1;
            localStorage.setItem('rpg_loading_attempts', window.loadingAttempts.toString());
            
            if (typeof addSystemMessage === 'function') {
                addSystemMessage('❌ Erro de carregamento detectado. Recarregando...');
            }
            
            setTimeout(() => {
                // window.location.reload();
            }, 1000);
            return;
        }
        
        window.initDiagnostic.log('Required Assets', 'OK', requiredAssets.join(', '));
        
        // Validação adicional: verifica se as texturas têm dimensões válidas
        const invalidTextures = requiredAssets.filter(asset => {
            const texture = this.textures.get(asset);
            return !texture || texture.source[0].width === 0 || texture.source[0].height === 0;
        });
        
        if (invalidTextures.length > 0) {
            console.error('❌ Texturas com dimensões inválidas:', invalidTextures);
            console.error('❌ Detectado problema de cache - forçando reload');
            
            window.loadingAttempts = (window.loadingAttempts || 0) + 1;
            localStorage.setItem('rpg_loading_attempts', window.loadingAttempts.toString());
            
            setTimeout(() => {
                // window.location.reload();
            }, 1000);
            return;
        }
        
        // Inicializa cena padrão se necessário
        Game.initializeDefaultScene();

        this.physics.world.setFPS(90);
        this.input.addPointer(5);

        gun = this.sound.add('gun');
        death = this.sound.add('death');
        master = this.sound.add('master');

        Game.playerMap = {};
        Game.playerHb = {};
        Game.playerHp = {};
        Game.playerSprites = {}; // Armazena o sprite de cada jogador
        Game.playerNames = {}; // Armazena os textos de nome de cada jogador
        Game.bulletsP = {};
        Game.doors = {};
        Game.doorsaux = {};
        Game.doors2 = {};
        Game.doorsaux2 = {};
        
        Cthis = this;
        
        this.cameras.main.width = cw;
        this.cameras.main.height = ch;
        this.cameras.main.setBounds(0, 0, w , h);
        
        // 🎭 MODO ESPECTADOR: Configuração inicial
        if (typeof isMaster !== 'undefined' && isMaster) {
            console.log('🎭 Configurando câmera para modo espectador');
            
            // Configurações de câmera livre
            Game.spectatorMode = {
                enabled: true,
                followingPlayer: null,
                zoomLevel: 0.3, // Zoom inicial (será ajustado pelo minZoom dinâmico)
                panSpeed: 8,
                zoomSpeed: 0.02, // Mais suave
                minZoom: 0.1,    // Será recalculado abaixo
                maxZoom: 2.0
            };
            
            // Calcula minZoom dinâmico para evitar bordas fora do mundo
            // minZoom = max(viewport/world) para garantir que não apareça espaço além do mapa
            const viewW = this.cameras.main.width;
            const viewH = this.cameras.main.height;
            const worldW = w;
            const worldH = h;
            const dynamicMinZoom = Math.max(viewW / worldW, viewH / worldH);
            Game.spectatorMode.minZoom = dynamicMinZoom;
            // Começa ligeiramente acima do mínimo para permitir pan
            const startZoom = Game.spectatorMode.minZoom + 0.02;
            Game.spectatorMode.zoomLevel = Math.max(Game.spectatorMode.zoomLevel, startZoom);

            // Define zoom inicial respeitando o minZoom calculado
            this.cameras.main.setZoom(Game.spectatorMode.zoomLevel);
            
            // Centraliza câmera no mapa
            this.cameras.main.centerOn(w / 2, h / 2);
            // Garante que não há follow no modo espectador
            this.cameras.main.stopFollow();
            
            console.log('✅ Modo espectador ativado - Controles: Scroll = Zoom, Setas/WASD = Movimentar');
        } else {
            Game.spectatorMode = {
                enabled: false
            };
        }

        this.physics.world.setBounds(0, 0, w, h);

        // Verifica se lastScene está definido, senão usa valores padrão
        // SEMPRE INICIA NO HOSPITAL para evitar problemas com texturas não carregadas
        // A transferência para o mapa real será feita depois via Game.transferToScene
        const defaultScene = {
            x: midw,
            y: midh,
            nome: 'hospital', // SEMPRE hospital no início
            horario: 'd', // Sempre dia (hospitald existe no preload)
            estado: '0'
        };
        
        const currentScene = defaultScene; // Ignora lastScene aqui
        
        // Verificação de segurança para coordenadas do jogador
        const playerX = parseInt(currentScene.x) || midw || 960;
        const playerY = parseInt(currentScene.y) || midh || 960;
        
        console.log(`🎮 Posicionando jogador em cena temporária: ${currentScene.nome} (será transferido depois)`);
        console.log(`📍 Posição inicial: x=${playerX}, y=${playerY}`);
        
        // 🎭 MODO ESPECTADOR: Não cria sprite de jogador
        if (Game.spectatorMode.enabled) {
            console.log('🎭 Modo espectador: Pulando criação de sprite do jogador');
            
            // Cria sprites invisíveis apenas para compatibilidade
            player = this.physics.add.sprite(playerX, playerY, 'fake').setAlpha(0).setDepth(-1000);
            hp1 = this.physics.add.sprite(playerX, playerY + 25, 'fake').setAlpha(0).setDepth(-1000);
            hc1 = this.physics.add.sprite(playerX, playerY + 5, 'fake').setAlpha(0).setDepth(-1000);
            
            // Desabilita física para os sprites invisíveis
            player.body.enable = false;
            hp1.body.enable = false;
            hc1.body.enable = false;
        } else {
            // Modo normal: cria sprites normalmente
            player = this.physics.add.sprite(playerX, playerY, spriteMe);
            hp1 = this.physics.add.sprite(playerX, playerY + 25, 'hitbox');
            hc1 = this.physics.add.sprite(playerX, playerY + 5, 'hitboxP');
        }
        
        // Cria animações básicas para evitar erros quando me ainda é -1
        Game.createDefaultAnimations.call(this);
        // Adiciona o 'sapo' como inimigo no canto inferior esquerdo do mapa
        this.enemies = this.physics.add.group();
        const enemyX = parseInt(currentScene.x) - 50;
        const enemyY = parseInt(currentScene.y);
        const enemy = this.enemies.create(enemyX, enemyY, 'sapo').setFrame(0);
        enemy.setCollideWorldBounds(true);
        console.log('Sapo posicionado em:', enemyX, enemyY);
        // doorset = [{'x': 541, 'y': 1600, 'auxx': 635, 'auxy': 1600, 'mode': 0}, {'x': 695, 'y': 580, 'auxx': 695, 'auxy': 487, 'mode': -1.55}];
        doorvars = [];
        
        // Inicializa doorset com array vazio se não estiver definido
        if (typeof doorset === 'undefined') {
            doorset = [];
            console.warn('doorset não definido, usando array vazio');
        }

        // Verifica se as texturas necessárias existem ANTES de tentar usá-las
        // SEMPRE USA HOSPITAL NO INÍCIO (garantido pelo preload)
        const requiredTextureKeys = {
            bg: 'hospitald', // Sempre hospital dia
            limits: 'limitshospital',
            roofs: 'roofshospitald'
        };
        
        // Não precisa verificar faltando, pois são texturas do preload
        console.log('🖼️ Usando texturas temporárias do hospital (transferência será feita depois)');
        
        try {
            // Usa texturas garantidas do hospital
            const bgKey = 'hospitald';
            const limitsKey = 'limitshospital';
            const roofsKey = 'roofshospitald';
            
            console.log(`🖼️ Aplicando texturas temporárias: bg=${bgKey}, limits=${limitsKey}, roofs=${roofsKey}`);
            
            window.bg = bg = this.physics.add.staticImage(midw, midh, bgKey).setDepth(0);
            // bgaux deve ficar acima do bg (0) e abaixo de roofs (1919/1920). Usaremos 2 conforme solicitado
            bgaux = this.physics.add.staticImage(midw, midh, "fake").setDepth(2).setAlpha(0).setBlendMode(Phaser.BlendModes.NORMAL);
            fg = this.physics.add.staticImage(midw, midh, "foreground").setDepth(1921).setAlpha(1); // COMEÇA COM ALPHA 1 (TELA PRETA)
            window.limits = limits = this.physics.add.staticImage(midw, midh, limitsKey).setDepth(-1);
            roofs = this.physics.add.staticImage(midw, midh, roofsKey).setDepth(1919);
            roofsaux = this.physics.add.staticImage(midw, midh, "fake").setDepth(1920).setAlpha(0).setBlendMode(Phaser.BlendModes.NORMAL);
            
            console.log('✅ Texturas temporárias aplicadas - aguardando transferência para mapa real');
            
        } catch (error) {
            console.error('❌ ERRO CRÍTICO: Falha ao criar imagens de fundo:', error.message);
            console.error('❌ Isso não deveria acontecer com texturas do preload');
            
            if (typeof addSystemMessage === 'function') {
                addSystemMessage('❌ Problema crítico de textura. Recarregando...');
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 500);
            return;
        }
        // Doors
        addDoors(doorset);
        
        // End Doors
        
        
        // Adiciona verificação visual após um breve delay
        setTimeout(() => {
            Game.verifyVisualIntegrity(this);
        }, 1000);
        
        // Adiciona inicialização do jogador à fila coordenada
        if (typeof queueInitialization === 'function') {
            console.log('Adicionando inicialização do jogador à fila');
            // A inicialização será feita quando todos os componentes estiverem prontos
        } else {
            // Fallback se a função não existir
            setTimeout(() => {
                Game.initializePlayerWithRetry(spriteMe);
            }, 1000);
        }

        setCursors();

        hp1.setCollideWorldBounds(true);

        hc1.setCollideWorldBounds(true);

        // Não criamos o collider no hospital temporário.
        // Ele será criado corretamente em Game.transferToScene/ChangeScene com as dimensões e textura finais do mapa.
        console.log('ℹ️ Collider inicial omitido (será criado após transferência de cena)');
        
        // Criar grupo de colisões estáticas se não existir
        if (!Game.collisionGroup) {
            Game.collisionGroup = this.physics.add.staticGroup();
        }
        Game.collisionBodies = [];

        // Não seguir o "player" no modo espectador para permitir pan livre
        if (!Game.spectatorMode.enabled) {
            createComponets(player);
        }
}
    
Game.update = function(signal, direction)
    {       
            // 🎭 MODO ESPECTADOR: Controles de câmera livre
            if (Game.spectatorMode && Game.spectatorMode.enabled) {
                Game.updateSpectatorControls.call(this);
                return; // Não processa controles de jogador
            }
            
            // Verifica se cursors foi inicializado
            if (!cursors || !cursors.left) {
                // Tenta inicializar se Cthis estiver disponível
                if (Cthis && Cthis.input && Cthis.input.keyboard) {
                    setCursors();
                }
                // Se ainda não tiver, retorna e aguarda próxima chamada
                if (!cursors || !cursors.left) {
                    return;
                }
            }
            
            // Verifica se algum input está em foco (chat)
            const isTyping = Game.isPlayerTyping();
            
            if(spriteMe == 'fake'){
                spriteMe = spriteMe;
            }
            else if (dead == true){
                if(danim == false){
                    movement = 'dead';
                    player.x = hp1.x;
                    player.y = hp1.y - 25;
                    hc1.x = hp1.x;
                    hc1.y = hp1.y - 20;
                    player.setDepth(parseInt(hp1.y));
                    hp1.setVelocityY(20);
                    timedEvent = this.time.delayedCall(500, function () { danim = true; hp1.setVelocityY(0); }, [], this);
                    const animSuffix1 = (me === -1) ? -1 : -1; // Always use -1 for now
                    const animKey1 = `${movement}${animSuffix1}`;
                    if(safePlayAnimation(player, animKey1)){
                        Client.sendClick(player.x, player.y, animKey1);
                    }
                }
                else{
                    movement = 'body';
                    hp1.setVelocityY(200);
                    const animSuffix2 = (me === -1) ? -1 : -1; // Always use -1 for now
                    const animKey2 = `${movement}${animSuffix2}`;
                    if(safePlayAnimation(player, animKey2)){
                        Client.sendClick(player.x, player.y, animKey2);
                    }
                }
                if(verifyed == 0){
                    verifyed = 1;
                    Client.verifyPlayers();
                    timedEvent = this.time.delayedCall(3000, function () { verifyed = 0}, [], this);
                }
            }
            else if (collided == true){
                hp1.setVelocityX(0);
                hp1.setVelocityY(0);
                if(sprinted == true)
                {
                    repulse = 0.83;
                }
                else if(!isTyping && cursors.dash.isDown)
                {
                    repulse = 4.2;
                }
                else if(!isTyping && cursors.run.isDown)
                {
                    repulse = 4.2;
                }
                else{
                    repulse = 1.8;
                }
                if(pressedV == "up"){
                    hp1.y = hp1.y + repulse;
                }
                else if(pressedV == "down"){
                    hp1.y = hp1.y - repulse;
                }
                if(pressedH == "right"){
                    hp1.x = hp1.x - repulse;
                }
                else if(pressedH == "left"){
                    hp1.x = hp1.x + repulse;
                }
                player.x = hp1.x;
                player.y = hp1.y - 25;
                hc1.x = hp1.x;
                hc1.y = hp1.y - 20;
                player.setDepth(parseInt(hp1.y));
                collided = false
                // Use -1 for animation suffix since default animations are created with -1
                const animSuffix = (me === -1) ? -1 : -1; // Always use -1 for now
                const animKey3 = `${movement}${animSuffix}`;
                if(safePlayAnimation(player, animKey3)){
                    Client.sendClick(player.x, player.y, animKey3);
                }
                recharged = false;
                rechargedH = false;
                timedEvent = this.time.delayedCall(500, function () { recharged = true; rechargedH = true; }, [], this);
            }
            else if(pause == true){
                movement = 'turnup';
                hp1.setVelocityX(0);
                hp1.setVelocityY(0);
                player.anims.play(`${movement}${me}`, true);
                Client.sendClick(player.x, player.y, `${movement}${me}`);
            }
            else{
                if(doorset != 0){
                    for(x = 0; x < doorset.length; x++){
                        doorsVerify(x);
                    }
                }
                
                // ts.tilePositionX = Math.cos(-iter) * 40;
                // ts.tilePositionY = Math.sin(-iter) * 40;
                // 
                // iter += 0.01;
                // 
                player.x = hp1.x;
                player.y = hp1.y - 25;
                hc1.x = hp1.x;
                hc1.y = hp1.y - 20;
                player.setDepth(parseInt(hp1.y));
                
                // Atualiza a posição do nome do jogador local
                if(me !== -1 && Game.playerNames[me]){
                    Game.playerNames[me].x = player.x;
                    Game.playerNames[me].y = player.y - 40;
                }

                if(mobile == true){ 
                    pointer = this.input.activePointer;
                    if (pointer.isDown == true) {
                        if(touched == false && pointer.x < (cw / 2)){
                            touchX = pointer.x;
                            touchY = pointer.y;
                            touched = true;
                        }
                        else if(touched == true){
                            apx = parseInt(this.cameras.main.midPoint.x - (cw /2) + 170);
                            apy = parseInt(this.cameras.main.midPoint.y + (ch /2) - 120);
                            if(pointer.x < (cw / 2)){
                                movePx = parseInt(pointer.x - touchX);
                                movePy = parseInt(pointer.y - touchY);
                            }
                            
                            if(movePx > 50){
                                movePx = 50;
                            }
                            else if(movePx < -50){
                                movePx = -50;
                            }
                            if(movePy > 50){
                                movePy = 50;
                            }
                            else if(movePy < -50){
                                movePy = -50;
                            }

                            dw = parseInt(movePx);
                            dh = parseInt(movePy);

                            if(movePx < 0){
                                dw = dw * (-1);
                            }
                            if(movePy < 0){
                                dh = dh * (-1);
                            }

                            analog.x = apx + movePx;
                            analog.y = apy + movePy;
                            round.x = apx;
                            round.y = apy;
                        }
                        
                    }
                    else if (pointer.isDown == false && touched == true) {
                        apx = parseInt(this.cameras.main.midPoint.x - (cw /2) + 170);
                        apy = parseInt(this.cameras.main.midPoint.y + (ch /2) - 120);
                        touchX = 0;
                        touchY = 0;
                        touched = false;
                        movePx = 0;
                        movePy = 0;
                        dw = 0;
                        dh = 0;
                        analog.x = apx + movePx;
                        analog.y = apy + movePy;
                        round.x = apx;
                        round.y = apy;
                    }   
                    // buttonG.x = Cthis.cameras.main.midPoint.x + (cw * 0.32);
                    // buttonG.y = Cthis.cameras.main.midPoint.y + (ch * 0.30);
                    // buttonD.x = Cthis.cameras.main.midPoint.x + (cw * 0.32);
                    // buttonD.y = Cthis.cameras.main.midPoint.y + (ch * 0.10);
                    // guns.x = Cthis.cameras.main.midPoint.x + (cw * 0.32);
                    // guns.y = Cthis.cameras.main.midPoint.y + (ch * 0.30);
                    // dashs.x = Cthis.cameras.main.midPoint.x + (cw * 0.32);
                    // dashs.y = Cthis.cameras.main.midPoint.y + (ch * 0.10);
                }
                

                if (!isTyping && cursors && cursors.test && cursors.test.isDown){
                    if(send_test == 0){
                        send_test = 1;
                        Client.sendTest();
                        timedEvent = this.time.delayedCall(1000, function () { send_test = 0}, [], this);
                    }
                }

                if(verifyed == 0){
                    verifyed = 1;
                    Client.verifyPlayers();
                    timedEvent = this.time.delayedCall(3000, function () { verifyed = 0}, [], this);
                }
                // if (cursors.dash.isDown)
                // {   
                //     if(recharged == true){
                //         dash = 400;
                //         recharged = false;
                //         movement = `dash${movement}`;
                //         timedEvent = this.time.delayedCall(300, function () { dash = 0 }, [], this);
                //         timedEvent = this.time.delayedCall(1000, onEvent, [], this);
                //     }
                // }
                // if (cursors.sprint.isDown)
                // {   
                //     if (p == false){
                //         if(sprinted == true)
                //         {
                //             sprinted = false;
                //         }
                //         else
                //         {
                //             sprinted = true;
                //         }
                //     }
                //     p = true;
                // }
                // if (cursors.sprint.isUp){
                //     p = false;
                // }
                // if (cursors.run.isDown && sprinted == false)
                // {
                //     velocity = 250;
                //     fr = 20;
                // }
                // *ADD IF NOVAMENTE CASO DESCOMENTAR*
                if (sprinted == true)
                {
                    velocity = 50;
                    fr = 5;
                }
                else
                {
                    velocity = 150;
                    fr = 10;
                }
                if (!isTyping && (cursors.left.isDown || movePx < 0))
                {
                    saque =false;

                    hp1.setVelocityX(-velocity);

                    if(movePx < 0){
                        hp1.setVelocityX(-dw*3);
                    }

                    if(dash >=1){
                        if(mobile == true){
                            if(dw > dh){
                                hp1.setVelocityX(-dash);
                            }
                        }
                        else{
                            hp1.setVelocityX(-dash);
                        }
                    }
                    else{
                        movement = 'left';
                        
                    }

                    pressed = "left";
                    pressedH = "left";

                    if(kv == 0 || dw > dh){
                        player.anims.play(`${movement}${me}`, true);
                        Client.sendClick(player.x, player.y, `${movement}${me}`);
                    }
                    
                    
                    kh = 1;
                    
                    

                }
                else if (!isTyping && (cursors.right.isDown  || movePx > 0))
                {
                    
                    saque =false;
                    hp1.setVelocityX(velocity);

                    if(movePx > 0){
                        hp1.setVelocityX(dw*3);
                    }

                    if(dash >=1){
                        if(mobile == true){
                            if(dw > dh){
                                hp1.setVelocityX(dash);
                            }
                        }
                        else{
                            hp1.setVelocityX(dash);
                        }
                    }
                    else{
                        movement = 'right';
                    }
                    
                    pressed = "right";
                    pressedH = "right";

                    if(kv == 0 || dw > dh){
                        player.anims.play(`${movement}${me}`, true);
                        Client.sendClick(player.x, player.y, `${movement}${me}`);
                    }
                    
                    

                    kh = 1;                  

                }

                else
                {
                    pressedH = "";
                    hp1.setVelocityX(0);
                    kh = 0;
                }

                if (!isTyping && (cursors.up.isDown  || movePy < 0))
                {

                    saque =false;
                    hp1.setVelocityY(-velocity);

                    if(movePy < 0){
                        hp1.setVelocityY(-dh*3);
                    }
                    
                    if(dash >=1){
                        if(mobile == true){
                            if(dh > dw){
                                hp1.setVelocityY(-dash);
                            }
                        }
                        else{
                            hp1.setVelocityY(-dash);
                        }
                    }
                    else{
                        if(mobile == true){
                            if(dh > dw){
                                movement = 'up';
                            }
                        }
                        else{
                            movement = 'up';
                        }
                    }

                    
                    
                    kv = 1;

                    if(mobile == false){
                        player.anims.play(`${movement}${me}`, true);
                        pressed = "up";
                        pressedV = "up";
                    }
                    else if(dh > dw){
                        player.anims.play(`${movement}${me}`, true);
                        pressed = "up";
                        pressedV = "up"; 
                    }
                    Client.sendClick(player.x, player.y, `${movement}${me}`);
                    
                    
                }

                else if (!isTyping && (cursors.down.isDown  || movePy > 0))
                {
                    saque =false;
                    hp1.setVelocityY(velocity);

                    if(movePy > 0){
                        hp1.setVelocityY(dh*3);
                        
                    }

                    if(dash >=1){
                        if(mobile == true){
                            if(dh > dw){
                                hp1.setVelocityY(dash);
                            }
                        }
                        else{
                            hp1.setVelocityY(dash);
                        }
                    }
                    else{
                        if(mobile == true){
                            if(dh > dw){
                                movement = 'down';
                            }
                        }
                        else{
                            movement = 'down';
                        }
                    }
                    
                    kv = 1;
                    
                    if(mobile == false){
                        player.anims.play(`${movement}${me}`, true);
                        pressed = "";
                        pressedV = "down";
                    }
                    else if(dh > dw){
                        player.anims.play(`${movement}${me}`, true);
                        pressed = "";
                        pressedV = "down";
                    }
                    Client.sendClick(player.x, player.y, `${movement}${me}`);
                }

                else
                {
                    hp1.setVelocityY(0);
                    kv = 0;
                    pressedV = "";
                }
                
                if(kv == 0 && kh == 0){
                    dash = 0;
                    // if((cursors.hado.isDown || gun == true) && rechargedH == true)
                    // {
                    //     if (pressed == ''){
                    //         movement = 'hadodown';
                    //     }
                    //     else{
                    //         movement = `hado${pressed}`;
                    //     }
                        
                    //     if(saque == false){

                    //         player.anims.play(`${movement}${me}`, true);
                    //         Client.sendClick(player.x, player.y, `${movement}${me}`);
                    //         saque = true;
                    //     }
                    // }
                    // else if((cursors.hado.isUp  || capsulate == true) && saque == true && movement.includes('hado'))
                    // {
                    //     movement = `turn${pressed}hado`;
                    //     rechargedH = false;
                    //     powered = true;
                    //     timedEvent = this.time.delayedCall(500, function () { movement = `turn${pressed}`; powered = false;}, [], this);
                    //     timedEvent = this.time.delayedCall(600, function () { rechargedH = true; capsulate = false}, [], this);

                    //     var xreal = 0, xmove = 0, yreal = 0, ymove = 0;

                    //     if(pressed == 'left' || pressed == 'right'){
                    //         signal = '+';
                    //         xmove = 16;
                    //     }
                    //     else{
                    //         signal = '-';
                    //         ymove = 27;
                    //     }

                    //     if(pressed == 'up' || pressed == 'left'){
                    //         direction = '-';
                    //         xreal = player.x - xmove;
                    //         yreal = player.y - ymove;
                    //     }
                    //     else{
                    //         direction = '+';
                    //         xreal = player.x + xmove;
                    //         yreal = player.y + ymove;
                    //     }

                    //     Client.sendBullet(xreal, yreal, signal, direction, indexMe);

                    //     saque = false;
                    //     player.anims.play(`${movement}${me}`, true);
                    //     Client.sendClick(player.x, player.y, `${movement}${me}`);

                    // }
                    // *ADD ELSE NOVAMENTE CASO DESCOMENTAR*
                    
                    // CORREÇÃO: Sempre envia animação de idle quando parado
                    if(movement != '' && powered == false){
                        // Usa o ID do jogador (me) ao invés de -1
                        const animKey = `turn${pressed}${me}`;
                        if(safePlayAnimation(player, animKey)){
                            Client.sendClick(player.x, player.y, animKey);
                        }
                        movement = '';
                    }
                }
            }
            if(lastScene && lastScene.estado == '1' && vp == false){
                pause = true;
                vp = true;
            }
            else if(lastScene && lastScene.estado != '1' && vp == false){
                pause = false;
                movement = 'turn';
                vp = true;
            }
}

function onEvent ()
{
    recharged = true;
}

function dasher ()
{
    if(recharged == true){
        dash = 400;
        recharged = false;
        movement = `dash${movement}`;
        timedEvent = Cthis.time.delayedCall(300, function () { dash = 0 }, [], this);
        timedEvent = Cthis.time.delayedCall(1000, onEvent, [], this);
    }
}

function aim ()
{
    gun = true;
}

function disparate ()
{
    gun = false;
    capsulate = true;
}

function setCursors(){
    if (!Cthis || !Cthis.input || !Cthis.input.keyboard) {
        console.warn('⚠️ setCursors: Sistema de input não está pronto');
        return;
    }
    
    cursors = Cthis.input.keyboard.addKeys(
    {
        test:Phaser.Input.Keyboard.KeyCodes.ENTER,

        // Setas
        up:Phaser.Input.Keyboard.KeyCodes.UP,
        down:Phaser.Input.Keyboard.KeyCodes.DOWN,
        left:Phaser.Input.Keyboard.KeyCodes.LEFT,
        right:Phaser.Input.Keyboard.KeyCodes.RIGHT,

        // WASD (atalhos duplicados)
        w:Phaser.Input.Keyboard.KeyCodes.W,
        a:Phaser.Input.Keyboard.KeyCodes.A,
        s:Phaser.Input.Keyboard.KeyCodes.S,
        d:Phaser.Input.Keyboard.KeyCodes.D,
    
        run:Phaser.Input.Keyboard.KeyCodes.SHIFT,

        sprint:Phaser.Input.Keyboard.KeyCodes.CTRL,

        dash:Phaser.Input.Keyboard.KeyCodes.K,

        hado:Phaser.Input.Keyboard.KeyCodes.H,
        
        // 🎭 Teclas para modo espectador
        q:Phaser.Input.Keyboard.KeyCodes.Q, // Zoom out
        e:Phaser.Input.Keyboard.KeyCodes.E  // Zoom in
    });
}

function createComponets (player){

    if (mobile == false){
        Cthis.cameras.main.startFollow(player, true, 0.09, 0.09);
    }
    else{
        Cthis.cameras.main.startFollow(player, true, 1, 1);
    }

    Cthis.cameras.main.followOffset.set(0, 0);

    Cthis.cameras.main.setZoom(zoom);

    if(mobile == true){

        // buttonG = Cthis.add.text(Cthis.cameras.main.centerX - 50, Cthis.cameras.main.centerY + 80, '   ')
        // .setOrigin(0.5)
        // .setPadding(12)
        // .setStyle({ backgroundColor: '#00000000' })
        // .setInteractive({ useHandCursor: true })
        // .on('pointerdown', aim)
        // .on('pointerup', disparate)
        // .setDepth(parseInt(ch));

        // buttonD = Cthis.add.text(Cthis.cameras.main.centerX - 50, Cthis.cameras.main.centerY + 160, '   ')
        // .setOrigin(0.5)
        // .setPadding(12)
        // .setStyle({ backgroundColor: '#00000000' })
        // .setInteractive({ useHandCursor: true })
        // .on('pointerdown', dasher)
        // .setDepth(parseInt(ch));

        // guns = Cthis.physics.add.staticImage(Cthis.cameras.main.centerX - 50, Cthis.cameras.main.centerY + 80, "guns").setScale(0.08).setDepth(2000);
        // dashs = Cthis.physics.add.staticImage(Cthis.cameras.main.centerX - 50, Cthis.cameras.main.centerY + 160, "dashs").setScale(0.08).setDepth(2000);

        apx = parseInt(Cthis.cameras.main.midPoint.x - (cw /2) + 170);
        apy = parseInt(Cthis.cameras.main.midPoint.y + (ch /2) - 120);

        round = Cthis.physics.add.staticImage(apx, apy, 'round').setDepth(2000);
        analog = Cthis.physics.add.staticImage(apx, apy, 'analog').setDepth(2000);
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Função utilitária para executar animações com segurança
function safePlayAnimation(sprite, animationKey) {
    if (!sprite) {
        console.warn('Sprite não definido para animação:', animationKey);
        return false;
    }
    
    if (me === -1) {
        // Log apenas uma vez para evitar spam no console
        if (!window.playerNotInitializedLogged) {
            console.info('Aguardando inicialização do jogador pelo servidor...');
            window.playerNotInitializedLogged = true;
        }
        return false;
    }
    
    // Check for invalid animation keys (like just numbers)
    if (/^\d+$/.test(animationKey)) {
        console.warn('Invalid animation key (pure number):', animationKey, 'me value:', me);
        return false;
    }
    
    try {
        if (Cthis && Cthis.anims && Cthis.anims.exists(animationKey)) {
            sprite.anims.play(animationKey, true);
            return true;
        } else {
            console.warn('Animação não existe:', animationKey);
            return false;
        }
    } catch (e) {
        console.error('Erro ao executar animação:', animationKey, e);
        return false;
    }
}

function doorsVerify(idd){
        // Verifica se os objetos necessários existem
        if (!doorset || !doorset[idd] || !Game.doors || !Game.doors[idd] || !doorvars || !doorvars[idd]) {
            return; // Sai da função se algum objeto estiver undefined
        }
        
        if(doorset[idd].mode == 0){
            if(Game.doors[idd].rotation < doorset[idd].mode - 1.55 && Game.doors[idd].rotation < doorset[idd].mode && doorvars[idd].Ddirection == true){
                doorvars[idd].Ddirection = false;
                doorvars[idd].Dmovement = null;
                doorvars[idd].Dmoved = false;
            }
            else if(Game.doors[idd].rotation > doorset[idd].mode + 1.55 && Game.doors[idd].rotation > doorset[idd].mode && doorvars[idd].Ddirection == false){
                doorvars[idd].Ddirection = true;
                doorvars[idd].Dmovement = null;
                doorvars[idd].Dmoved = false;
            }
            else if((Game.doors[idd].rotation < doorset[idd].mode + 0.04 && Game.doors[idd].rotation > doorset[idd].mode - 0.04) && doorvars[idd].Dmoved == true){
                Game.doors[idd].rotation = doorset[idd].mode;
                Game.doors2[idd].rotation = -doorset[idd].mode;
                doorvars[idd].Dmovement = null;
                doorvars[idd].Dmoved = false;
            }
            if(doorvars[idd].Dmovement == null){
                Game.doors[idd].rotation = Game.doors[idd].rotation;
            }
            else{
                if(doorvars[idd].Ddirection == false){
                    Game.doors[idd].rotation += 0.05;
                    Game.doors2[idd].rotation -= 0.05;
                    doorvars[idd].Dmoved = true;
                    if(doorvars[idd].Dopen == true){
                        Client.sendRotation(0, Game.doors[idd].rotation);
                    }
                }
                
                else{
                    Game.doors[idd].rotation -= 0.05;
                    Game.doors2[idd].rotation += 0.05;
                    doorvars[idd].Dmoved = true;
                    if(doorvars[idd].Dopen == true){
                        Client.sendRotation(0, Game.doors[idd].rotation);
                    }
                }
            }
        }
        else{
            if(Game.doors[idd].rotation < doorset[idd].mode - 1.5 && Game.doors[idd].rotation < doorset[idd].mode && doorvars[idd].Ddirection == true){
                doorvars[idd].Ddirection = false;
                doorvars[idd].Dmovement = null;
                doorvars[idd].Dmoved = false;
            }
            else if(Game.doors[idd].rotation > doorset[idd].mode + 1.5 && Game.doors[idd].rotation > doorset[idd].mode && doorvars[idd].Ddirection == false){
                doorvars[idd].Ddirection = true;
                doorvars[idd].Dmovement = null;
                doorvars[idd].Dmoved = false;
            }
            else if((Game.doors[idd].rotation < doorset[idd].mode + 0.04 && Game.doors[idd].rotation > doorset[idd].mode - 0.04) && doorvars[idd].Dmoved == true){
                Game.doors[idd].rotation = doorset[idd].mode;
                Game.doors2[idd].rotation = -doorset[idd].mode;
                doorvars[idd].Dmovement = null;
                doorvars[idd].Dmoved = false;
            }
            if(doorvars[idd].Dmovement == null){
                Game.doors[idd].rotation = Game.doors[idd].rotation;
            }
            else{
                if(doorvars[idd].Ddirection == false){
                    Game.doors[idd].rotation += 0.05;
                    Game.doors2[idd].rotation -= 0.05;
                    doorvars[idd].Dmoved = true;
                    if(doorvars[idd].Dopen == true){
                        Client.sendRotation(0, Game.doors[idd].rotation);
                    }
                }
                
                else{
                    Game.doors[idd].rotation -= 0.05;
                    Game.doors2[idd].rotation += 0.05;
                    doorvars[idd].Dmoved = true;
                    if(doorvars[idd].Dopen == true){
                        Client.sendRotation(0, Game.doors[idd].rotation);
                    }
                }
            }
        }
        if (doorvars[idd].Dmoved == false) {
            if(doorset[idd].mode == 0){
                if(hp1.y > doorset[idd].y && hp1.y < doorset[idd].y + 50 && hp1.x > doorset[idd].x && hp1.x < doorset[idd].auxx && Game.doors[idd].rotation < doorset[idd].mode + 1.55){
                    doorvars[idd].Ddirection = true;
                    doorvars[idd].Dmovement = 1;
                    doorvars[idd].Dmoved = false;
                    doorvars[idd].Dopen = true;
                    Client.sendRotation(0, Game.doors[idd].rotation);
                }
                else if(hp1.y < doorset[idd].y  && hp1.y > doorset[idd].y - 50 && hp1.x > doorset[idd].x && hp1.x < doorset[idd].auxx && Game.doors[idd].rotation > doorset[idd].mode - 1.55){
                    doorvars[idd].Ddirection = false;
                    doorvars[idd].Dmovement = 1;
                    doorvars[idd].Dmoved = false;
                    doorvars[idd].Dopen = true;
                }
                else if(doorvars[idd].Dopen == true && (hp1.y < doorset[idd].y - 50 || hp1.y > doorset[idd].y + 50 || hp1.x < doorset[idd].x || hp1.x > doorset[idd].auxx) && Game.doors[idd].rotation != doorset[idd].mode){
                    if(Game.doors[idd].rotation > doorset[idd].mode){
                        doorvars[idd].Ddirection = true;
                    }
                    else{
                        doorvars[idd].Ddirection = false;
                    }
                    doorvars[idd].Dmovement = 1;
                    doorvars[idd].Dmoved = true;
                    doorvars[idd].Dopen = true;
                }
                else{
                    doorvars[idd].Dmovement = null;
                }
            }
            else{
                if(hp1.x > doorset[idd].x && hp1.x < doorset[idd].x + 50 && hp1.y < doorset[idd].y && hp1.y > doorset[idd].auxy && Game.doors[idd].rotation < doorset[idd].mode + 1.5){
                    doorvars[idd].Ddirection = true;
                    doorvars[idd].Dmovement = 1;
                    doorvars[idd].Dmoved = false;
                    doorvars[idd].Dopen = true;
                    Client.sendRotation(0, Game.doors[idd].rotation);
                }
                else if(hp1.x < doorset[idd].x  && hp1.x > doorset[idd].x - 50 && hp1.y < doorset[idd].y && hp1.y > doorset[idd].auxy && Game.doors[idd].rotation > doorset[idd].mode - 1.5){
                    doorvars[idd].Ddirection = false;
                    doorvars[idd].Dmovement = 1;
                    doorvars[idd].Dmoved = false;
                    doorvars[idd].Dopen = true;
                }
                else if(doorvars[idd].Dopen == true && (hp1.x < doorset[idd].x - 50 || hp1.x > doorset[idd].x + 50 || hp1.y > doorset[idd].y || hp1.y < doorset[idd].auxy) && Game.doors[idd].rotation != doorset[idd].mode){
                    if(Game.doors[idd].rotation > doorset[idd].mode){
                        doorvars[idd].Ddirection = true;
                    }
                    else{
                        doorvars[idd].Ddirection = false;
                    }
                    doorvars[idd].Dmovement = 1;
                    doorvars[idd].Dmoved = true;
                    doorvars[idd].Dopen = true;
                }
                else{
                    doorvars[idd].Dmovement = null;
                }
            }
        }
}

Game.setFirstScene = function(scene){
    lastScene = scene;
    aScene = `${lastScene.nome}`;
    
    console.log(`🗺️ Configurando primeira cena: ${aScene} (${w}x${h})`);
    
    // Garante que doorset seja definido
    if (lastScene.doors) {
        doorset = lastScene.doors;
        console.log('doorset definido da cena:', doorset.length, 'portas');
    } else {
        doorset = [];
        console.log('doorset definido como array vazio');
    }
    
    // Atualiza bounds da câmera e física SE Cthis já existir
    if (Cthis && Cthis.cameras && Cthis.cameras.main) {
        Cthis.cameras.main.setBounds(0, 0, w, h);
        console.log(`📷 Camera bounds definidos: ${w}x${h}`);
    }
    if (Cthis && Cthis.physics && Cthis.physics.world) {
        Cthis.physics.world.setBounds(0, 0, w, h);
        console.log(`🌍 Physics world bounds definidos: ${w}x${h}`);
    }
}


// Função para inicializar valores padrão se necessário
Game.initializeDefaultScene = function(){
    if(!lastScene){
        lastScene = {
            x: midw,
            y: midh,
            nome: aScene || 'hospital',
            horario: 'n', // Corrigido: usar 'n' ao invés de 'Dia'
            estado: '0',
            doors: [] // Adiciona doors vazio para cena padrão
        };
        console.log('Usando cena padrão:', lastScene);
    }
}

// Função para usar cena padrão quando servidor não responde
Game.useDefaultScene = function(){
    const defaultScene = {
        x: midw || 960,
        y: midh || 960,
        nome: aScene || 'hospital',
        horario: 'n', // Corrigido: usar 'n' ao invés de 'Dia'
        estado: '0',
        doors: [] // Array vazio de portas para cena padrão
    };
    
    console.log('Forçando uso de cena padrão:', defaultScene);
    window.sceneReceived = true; // Evita timeout
    Game.setFirstScene(defaultScene);
    
    // Marca que a cena está pronta
    if (typeof updateLoadingStatus === 'function') {
        updateLoadingStatus('scene', true);
    }
};
Game.setDoors = function(doors){
    doorset = doors;
}

Game.emitRotation = function(id,rotation){
    Dopen = false;
    Game.doors[id].rotation = rotation;
    Game.doors2[id].rotation = -rotation;
}

// Função para fazer a transferência inicial do hospital para o mapa real
Game.transferToScene = async function(scene){
    console.log('🎬 Iniciando transferência para:', scene.nome);
    
    if (!Cthis || !fg) {
        console.error('❌ Cthis ou fg não definidos, não é possível fazer transferência');
        return;
    }
    
    lastScene = scene;
    aScene = `${lastScene.nome}`;
    
    // Atualiza dimensões do mundo (que já foram atualizadas pelo updateMapDimensions)
    console.log(`📐 Usando dimensões: ${w}x${h}`);
    if (Cthis.cameras && Cthis.cameras.main) {
        Cthis.cameras.main.setBounds(0, 0, w, h);
    }
    if (Cthis.physics && Cthis.physics.world) {
        Cthis.physics.world.setBounds(0, 0, w, h);
    }
    
    // Verifica quais texturas são necessárias
    const textureKeys = {
        bg: `${aScene}${lastScene.horario.toLowerCase()}`,
        limits: `limits${aScene}`,
        roofs: `roofs${aScene}${lastScene.horario.toLowerCase()}`
    };
    
    console.log('🔍 Verificando texturas necessárias:', textureKeys);
    
    // Verifica se as texturas já existem (foram pré-carregadas)
    const allTexturesReady = Object.values(textureKeys).every(key => Cthis.textures.exists(key));
    
    if (!allTexturesReady) {
        console.warn('⚠️ Algumas texturas ainda não estão prontas, aguardando...');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Aplica as texturas do mapa real
    try {
        console.log('🖼️ Aplicando texturas do mapa:', aScene);
        
        // Usa fallback se não existir
        const bgKey = Cthis.textures.exists(textureKeys.bg) ? textureKeys.bg : 'hospitald';
        const limitsKey = Cthis.textures.exists(textureKeys.limits) ? textureKeys.limits : 'limitshospital';
        const roofsKey = Cthis.textures.exists(textureKeys.roofs) ? textureKeys.roofs : 'roofshospitald';
        
        // Aplica texturas
        bg.setTexture(bgKey);
        limits.setTexture(limitsKey);
        roofs.setTexture(roofsKey);
        
        // 🔧 REPOSICIONA E REDIMENSIONA AS IMAGENS PARA O NOVO MAPA
        const newMidW = parseInt(w / 2);
        const newMidH = parseInt(h / 2);
        
        console.log(`📐 Reposicionando e redimensionando imagens: ${newMidW}x${newMidH} (mundo: ${w}x${h})`);
        
        // Reposiciona e redimensiona todas as camadas
        bg.x = newMidW;
        bg.y = newMidH;
        bg.displayWidth = w;
        bg.displayHeight = h;
        
        bgaux.x = newMidW;
        bgaux.y = newMidH;
        bgaux.displayWidth = w;
        bgaux.displayHeight = h;
        
        fg.x = newMidW;
        fg.y = newMidH;
        fg.displayWidth = w;
        fg.displayHeight = h;
        
        limits.x = newMidW;
        limits.y = newMidH;
        limits.displayWidth = w;
        limits.displayHeight = h;
        // Atualiza o corpo físico estático para refletir novo tamanho/posição
        if (limits.refreshBody) {
            try { limits.refreshBody(); } catch(e) { console.warn('⚠️ Falha ao refreshBody dos limits (transferToScene):', e); }
        }
        
        roofs.x = newMidW;
        roofs.y = newMidH;
        roofs.displayWidth = w;
        roofs.displayHeight = h;
        
        roofsaux.x = newMidW;
        roofsaux.y = newMidH;
        roofsaux.displayWidth = w;
        roofsaux.displayHeight = h;
        
        console.log(`✅ Texturas aplicadas: bg=${bgKey}, limits=${limitsKey}, roofs=${roofsKey}`);
        
        // Move o jogador para a posição correta
        const playerX = parseInt(lastScene.x);
        const playerY = parseInt(lastScene.y);
        
        hp1.x = playerX;
        hp1.y = playerY + 25;
        player.x = playerX;
        player.y = playerY;
        hc1.x = playerX;
        hc1.y = playerY + 5;
        
        console.log(`📍 Jogador movido para: x=${playerX}, y=${playerY}`);
        
        // Atualiza portas se existirem
        if (lastScene.doors && lastScene.doors.length > 0) {
            console.log(`🚪 Atualizando ${lastScene.doors.length} portas`);
            removeDoors(doorset);
            doorset = lastScene.doors;
            addDoors(doorset);
        }
        
        // Atualiza collider de limites
        limitsTopLeft = limits.getTopLeft();
        if (collider) {
            collider.destroy();
        }
        
        // Criar colisões físicas pixel-perfect a partir da imagem
        Game.createPhysicsFromLimits(Cthis, limitsKey, w, h);
        
        // Fade out da tela preta (transição suave)
        console.log('🎬 Iniciando fade out...');
        let cont = 1.0;
        while(cont > 0) {
            cont -= 0.02;
            fg.setAlpha(Math.max(0, cont));
            await sleep(10);
        }
        fg.setAlpha(0);
        
        console.log('✅ Transferência para', aScene, 'concluída!');
        
    } catch (error) {
        console.error('❌ Erro na transferência:', error);
        // Se falhar, pelo menos remove a tela preta
        fg.setAlpha(0);
    }
};

Game.changeScene = async function(scene){

    lastScene = scene;
    console.log(lastScene);
    aScene = `${lastScene.nome}`;
    
    // Atualiza bounds da câmera e física com as dimensões atuais do mapa
    console.log(`🗺️ Atualizando bounds para cena: ${aScene} (${w}x${h})`);
    if (Cthis && Cthis.cameras && Cthis.cameras.main) {
        Cthis.cameras.main.setBounds(0, 0, w, h);
        console.log(`📷 Camera bounds atualizados: ${w}x${h}`);
    }
    if (Cthis && Cthis.physics && Cthis.physics.world) {
        Cthis.physics.world.setBounds(0, 0, w, h);
        console.log(`🌍 Physics world bounds atualizados: ${w}x${h}`);
    }
    
    // Verificar se as texturas necessárias existem
    const textureKeys = {
        bg: `${aScene}${lastScene.horario.toLowerCase()}`,
        limits: `limits${aScene}`,
        roofs: `roofs${aScene}${lastScene.horario.toLowerCase()}`
    };
    
    // Verificar quais texturas não existem
    const missingTextures = [];
    for (const [type, key] of Object.entries(textureKeys)) {
        if (!Cthis.textures.exists(key)) {
            console.warn(`⚠️ Textura ${key} não encontrada localmente`);
            missingTextures.push({type, key});
        }
    }
    
    // Se há texturas faltando, tentar carregar do banco
    if (missingTextures.length > 0) {
        console.log(`📡 Buscando texturas dinâmicas para ${aScene} (ID: ${lastScene.mapa})...`);
        // Usa lastScene.mapa (ID do mapa) ao invés de aScene (nome)
        const mapData = await Game.fetchMapData(lastScene.mapa || aScene);
        
        if (mapData) {
            console.log('✅ Dados do mapa encontrados, carregando texturas...');
            
            // Carregar texturas conforme o horário
            const timeMapping = {
                'd': 'dia',
                'a': 'tarde',
                'n': 'noite'
            };
            const fullTime = timeMapping[lastScene.horario.toLowerCase()] || 'dia';
            
            try {
                // Carregar textura de fundo (dia/tarde/noite)
                const bgKey = `${aScene}${lastScene.horario.toLowerCase()}`;
                if (!Cthis.textures.exists(bgKey) && mapData[fullTime]) {
                    await Game.loadDynamicTexture(Cthis, bgKey, mapData[fullTime]);
                }
                
                // Carregar textura de limites
                if (!Cthis.textures.exists(`limits${aScene}`) && mapData.limits) {
                    await Game.loadDynamicTexture(Cthis, `limits${aScene}`, mapData.limits);
                }
                
                // Carregar textura de telhados (dia/tarde/noite)
                const roofsKey = `roofs${aScene}${lastScene.horario.toLowerCase()}`;
                const roofsField = `roofs_${fullTime}`;
                if (!Cthis.textures.exists(roofsKey) && mapData[roofsField]) {
                    await Game.loadDynamicTexture(Cthis, roofsKey, mapData[roofsField]);
                }
                
                console.log('✅ Texturas dinâmicas carregadas com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao carregar texturas dinâmicas:', error);
                // Continua mesmo com erro - pode usar texturas de fallback
            }
        } else {
            console.warn(`⚠️ Mapa ${aScene} não encontrado no banco de dados`);
        }
    }
    
    let cont = 0.0;
    while(cont <1){
        cont += 0.01;
        fg.setAlpha(cont);
        await sleep(5);
    }
    hp1.x = parseInt(lastScene.x);
    hp1.y = parseInt(lastScene.y) + 25;
    
    // Aplicar texturas (agora devem existir)
    try {
        bg.setTexture(`${aScene}${lastScene.horario.toLowerCase()}`);
    } catch (e) {
        console.error('❌ Erro ao aplicar textura de fundo:', e);
        bg.setTexture('fake'); // Fallback
    }
    
    try {
        limits.setTexture(`limits${aScene}`);
    } catch (e) {
        console.error('❌ Erro ao aplicar textura de limites:', e);
    }
    
    try {
        roofs.setTexture(`roofs${aScene}${lastScene.horario.toLowerCase()}`);
    } catch (e) {
        console.error('❌ Erro ao aplicar textura de telhados:', e);
        roofs.setTexture('fake'); // Fallback
    }
    
    // 🔧 REPOSICIONA E REDIMENSIONA AS IMAGENS PARA O NOVO MAPA
    const newMidW = parseInt(w / 2);
    const newMidH = parseInt(h / 2);
    
    console.log(`📐 Reposicionando e redimensionando imagens: ${newMidW}x${newMidH} (mundo: ${w}x${h})`);
    
    // Reposiciona e redimensiona todas as camadas
    bg.x = newMidW;
    bg.y = newMidH;
    bg.displayWidth = w;
    bg.displayHeight = h;
    
    bgaux.x = newMidW;
    bgaux.y = newMidH;
    bgaux.displayWidth = w;
    bgaux.displayHeight = h;
    
    fg.x = newMidW;
    fg.y = newMidH;
    fg.displayWidth = w;
    fg.displayHeight = h;
    
    limits.x = newMidW;
    limits.y = newMidH;
    limits.displayWidth = w;
    limits.displayHeight = h;
    // Atualiza o corpo físico estático para refletir novo tamanho/posição
    if (limits.refreshBody) {
        try { limits.refreshBody(); } catch(e) { console.warn('⚠️ Falha ao refreshBody dos limits (changeScene):', e); }
    }
    
    roofs.x = newMidW;
    roofs.y = newMidH;
    roofs.displayWidth = w;
    roofs.displayHeight = h;
    
    roofsaux.x = newMidW;
    roofsaux.y = newMidH;
    roofsaux.displayWidth = w;
    roofsaux.displayHeight = h;
    
    removeDoors(doorset);
    doorset = lastScene.doors;
    addDoors(doorset);
    console.log(doors);
    // Recalcula top-left após redimensionar e reposicionar limits
    limitsTopLeft = limits.getTopLeft();
    
    // Segurança: destrói collider anterior antes de recriar
    if (collider) { try { collider.destroy(); } catch(e) {} }
    
    // Criar colisões físicas pixel-perfect a partir da imagem
    Game.createPhysicsFromLimits(Cthis, `limits${aScene}`, w, h);
    
    while(cont > 0){
        cont -= 0.01;
        fg.setAlpha(cont);
        await sleep(5);
    }
}

Game.changeTime = async function(time){
    console.log('🕐 Mudando horário para:', time, 'no mapa:', aScene);
    
    // Define as chaves das texturas necessárias
    const bgKey = `${aScene}${time}`;
    const roofsKey = `roofs${aScene}${time}`;
    const doorsKey = `doors${aScene}${time}`;
    
    // Verifica se as texturas já existem (mapas locais)
    const bgExists = Cthis.textures.exists(bgKey);
    const roofsExists = Cthis.textures.exists(roofsKey);
    const doorsExists = Cthis.textures.exists(doorsKey);
    
    console.log(`🔍 Texturas existentes: bg=${bgExists}, roofs=${roofsExists}, doors=${doorsExists}`);
    
    // Se alguma textura não existe, busca do banco
    if (!bgExists || !roofsExists || !doorsExists) {
        console.log('📡 Buscando texturas dinâmicas do banco...');
        const mapData = await Game.fetchMapData(lastScene.mapa || aScene);
        
        if (mapData) {
            // Mapeia horário para campo do banco
            const timeMapping = {
                'd': 'dia',
                'a': 'tarde', 
                'n': 'noite'
            };
            const fullTime = timeMapping[time] || 'dia';
            
            try {
                // Array de promessas para carregar tudo em paralelo
                const loadPromises = [];
                
                // Carrega fundo se não existir
                if (!bgExists && mapData[fullTime]) {
                    console.log(`⏳ Carregando textura de fundo: ${bgKey}`);
                    loadPromises.push(Game.loadDynamicTexture(Cthis, bgKey, mapData[fullTime]));
                }
                
                // Carrega telhados se não existir
                const roofsField = `roofs_${fullTime}`;
                if (!roofsExists && mapData[roofsField]) {
                    console.log(`⏳ Carregando textura de telhados: ${roofsKey}`);
                    loadPromises.push(Game.loadDynamicTexture(Cthis, roofsKey, mapData[roofsField]));
                }
                
                // Carrega portas se não existir
                const doorsField = `doors_${fullTime}`;
                if (!doorsExists && mapData[doorsField]) {
                    console.log(`⏳ Carregando textura de portas: ${doorsKey}`);
                    loadPromises.push(Game.loadDynamicTexture(Cthis, doorsKey, mapData[doorsField]));
                }
                
                // Aguarda TODAS as texturas carregarem
                if (loadPromises.length > 0) {
                    await Promise.all(loadPromises);
                    console.log('✅ Texturas dinâmicas carregadas com sucesso');
                    // Aguarda mais um pouco para garantir que o Phaser processou
                    await sleep(100);
                }
            } catch (error) {
                console.error('❌ Erro ao carregar texturas dinâmicas:', error);
                // Continua mesmo com erro, usando fallbacks
            }
        }
    }
    
    // Aguarda um frame para garantir que texturas estejam prontas no Phaser
    await sleep(50);
    
    // Verifica novamente se as texturas existem após carregamento
    const finalBgExists = Cthis.textures.exists(bgKey);
    const finalRoofsExists = Cthis.textures.exists(roofsKey);
    const finalDoorsExists = Cthis.textures.exists(doorsKey);
    
    console.log(`✅ Verificação final - bg:${finalBgExists}, roofs:${finalRoofsExists}, doors:${finalDoorsExists}`);
    
    if (!finalBgExists) {
        console.error('❌ Textura de fundo não existe após carregamento:', bgKey);
        console.log('❌ Abortando mudança de horário');
        return;
    }
    
    // ESTRATÉGIA (especificação do usuário):
    // - mapa atual: nível 0 (bg)
    // - roof atual: nível max-1 (1919)
    // - mapa de passagem: nível 2 (bgaux) com opacidade 0
    // - roof de passagem: nível max (1920) com opacidade 0
    // Crossfade: aumentar alpha dos itens de passagem 0→1. Ao final, trocar texturas das camadas principais e resetar aux para 0.
    
    // Captura as texturas atuais
    const oldBgTexture = bg.texture.key;
    const oldRoofsTexture = roofs.texture.key;
    const oldDoorsTexture = doorset.length > 0 ? Game.doors[0].texture.key : null;
    
    console.log(`🎬 Iniciando crossfade:`);
    console.log(`   BG: ${oldBgTexture} → ${bgKey}`);
    console.log(`   Roofs: ${oldRoofsTexture} → ${roofsKey}`);
    console.log(`   Depths: bg=${bg.depth}, bgaux=${bgaux.depth}, roofs=${roofs.depth}, roofsaux=${roofsaux.depth}`);
    
    // Se as texturas são iguais, não precisa fazer crossfade
    if (oldBgTexture === bgKey && oldRoofsTexture === roofsKey) {
        console.log('ℹ️ Texturas são iguais, pulando crossfade');
        return;
    }
    
    // 1) Configura camadas de PASSAGEM com as NOVAS texturas e alpha 0
    const centerX = parseInt(w/2);
    const centerY = parseInt(h/2);

    try {
        // Ordem correta: setTexture -> setPosition -> setDisplaySize
        bgaux.setTexture(bgKey); // nova textura no aux
        bgaux.setAlpha(0);
        bgaux.setVisible(true);
        bgaux.setBlendMode(Phaser.BlendModes.NORMAL);
        bgaux.setPosition(centerX, centerY);
        if (typeof bgaux.setDisplaySize === 'function') {
            bgaux.setDisplaySize(w, h);
        } else {
            bgaux.displayWidth = w; bgaux.displayHeight = h;
        }
        console.log(`✅ bgaux preparado para passagem: ${bgKey} @ depth ${bgaux.depth}`);
    } catch (e) {
        console.error('❌ Erro ao preparar bgaux para passagem:', e);
    }

    try {
        roofsaux.setTexture(roofsKey); // nova textura no aux
        roofsaux.setAlpha(0);
        roofsaux.setVisible(true);
        roofsaux.setBlendMode(Phaser.BlendModes.NORMAL);
        roofsaux.setPosition(centerX, centerY);
        if (typeof roofsaux.setDisplaySize === 'function') {
            roofsaux.setDisplaySize(w, h);
        } else {
            roofsaux.displayWidth = w; roofsaux.displayHeight = h;
        }
        console.log(`✅ roofsaux preparado para passagem: ${roofsKey} @ depth ${roofsaux.depth}`);
    } catch (e) {
        console.error('❌ Erro ao preparar roofsaux para passagem:', e);
    }

    // Portas auxiliares também recebem a nova textura
    for (var i = 0; i < doorset.length; i++){
        try {
            Game.doorsaux[i].setTexture(doorsKey);
            Game.doorsaux2[i].setTexture(doorsKey);
            Game.doorsaux[i].setAlpha(0);
            Game.doorsaux2[i].setAlpha(0);
            Game.doorsaux[i].setVisible(true);
            Game.doorsaux2[i].setVisible(true);
        } catch (e) {
            console.warn(`⚠️ Erro ao preparar porta de passagem ${i}`);
        }
    }

    // Dá um pequeno tempo para a GPU subir as texturas antes do fade
    await sleep(50);

    // 2) Fade IN das camadas de PASSAGEM (0 → 1) revelando as novas texturas
    console.log('🎬 Fazendo fade IN das texturas de passagem...');
    let cont = 0.0;
    while (cont < 1){
        cont += 0.01;
        if (cont > 1) cont = 1;
        bgaux.setAlpha(cont);
        roofsaux.setAlpha(cont);
        for (var i = 0; i < doorset.length; i++){
            Game.doorsaux[i].setAlpha(cont);
            Game.doorsaux2[i].setAlpha(cont);
        }
        await sleep(10);
    }

    // 3) Ao final, aplicar NOVAS texturas nas camadas PRINCIPAIS e resetar auxiliares
    try { bg.setTexture(bgKey); } catch(e) { console.error('❌ Falha ao aplicar bg principal:', e); }
    try { roofs.setTexture(roofsKey); } catch(e) { console.error('❌ Falha ao aplicar roofs principal:', e); }
    for (var i = 0; i < doorset.length; i++){
        try {
            Game.doors[i].setTexture(doorsKey);
            Game.doors2[i].setTexture(doorsKey);
        } catch(e) {
            console.warn(`⚠️ Falha ao aplicar porta principal ${i}`);
        }
    }

    // Reset auxiliares
    bgaux.setAlpha(0);
    roofsaux.setAlpha(0);
    for (var i = 0; i < doorset.length; i++){
        Game.doorsaux[i].setAlpha(0);
        Game.doorsaux2[i].setAlpha(0);
    }
    
    console.log('✅ Mudança de horário concluída!');
}

Game.pause = function(value){
    if(value == 1){
        pause = true;
    }
    else{
        pause = false;
        movement = 'turn';
    }
}

// 🎭 MODO ESPECTADOR: Controles de câmera
Game.updateSpectatorControls = function() {
    const camera = this.cameras.main;
    const spec = Game.spectatorMode;
    
    // Se está seguindo um jogador, atualiza posição da câmera
    if (spec.followingPlayer !== null) {
        const targetPlayer = Game.playerMap[spec.followingPlayer];
        if (targetPlayer && targetPlayer.sprite) {
            camera.centerOn(targetPlayer.sprite.x, targetPlayer.sprite.y);
        }
    }
    
    // Controles de teclado (só funcionam se não está seguindo jogador)
    if (spec.followingPlayer === null && cursors) {
        const isTyping = Game.isPlayerTyping();
        
        if (!isTyping) {
            // Movimento com setas ou WASD
            if ((cursors.left && cursors.left.isDown) || (cursors.a && cursors.a.isDown)) {
                camera.scrollX -= spec.panSpeed / camera.zoom;
            }
            if ((cursors.right && cursors.right.isDown) || (cursors.d && cursors.d.isDown)) {
                camera.scrollX += spec.panSpeed / camera.zoom;
            }
            if ((cursors.up && cursors.up.isDown) || (cursors.w && cursors.w.isDown)) {
                camera.scrollY -= spec.panSpeed / camera.zoom;
            }
            if ((cursors.down && cursors.down.isDown) || (cursors.s && cursors.s.isDown)) {
                camera.scrollY += spec.panSpeed / camera.zoom;
            }
            
            // Zoom com Q e E
            if (cursors.q && cursors.q.isDown) {
                spec.zoomLevel = Math.max(spec.minZoom, spec.zoomLevel - spec.zoomSpeed);
                camera.setZoom(spec.zoomLevel);
            }
            if (cursors.e && cursors.e.isDown) {
                spec.zoomLevel = Math.min(spec.maxZoom, spec.zoomLevel + spec.zoomSpeed);
                camera.setZoom(spec.zoomLevel);
            }
        }
    }
    
    // Zoom com scroll do mouse
    if (this.input && this.input.activePointer) {
        const pointer = this.input.activePointer;
        
        if (pointer.deltaY !== 0) {
            // Ajuste suave com base no deltaY (scroll pode variar por dispositivo)
            const step = spec.zoomSpeed *  (Math.abs(pointer.deltaY) > 1 ? 1 : 0.5);
            const delta = pointer.deltaY > 0 ? -step : step;
            spec.zoomLevel = Phaser.Math.Clamp(
                spec.zoomLevel + delta,
                spec.minZoom,
                spec.maxZoom
            );
            camera.setZoom(spec.zoomLevel);
        }
    }
    
    // Atualiza posições dos nomes (para todos os jogadores)
    for (let id in Game.playerMap) {
        const p = Game.playerMap[id];
        if (p && p.sprite && Game.playerNames[id]) {
            Game.playerNames[id].x = p.sprite.x;
            Game.playerNames[id].y = p.sprite.y - 40;
        }
    }

    // Garante que a câmera não passe fora dos limites do mundo quando em câmera livre
    if (spec.followingPlayer === null) {
        const cam = camera;
        const halfW = cam.width * 0.5 / cam.zoom;
        const halfH = cam.height * 0.5 / cam.zoom;
        const minCenterX = halfW;
        const maxCenterX = w - halfW;
        const minCenterY = halfH;
        const maxCenterY = h - halfH;

        // Calcula o centro atual
        const currentCenterX = cam.scrollX + halfW;
        const currentCenterY = cam.scrollY + halfH;
        const clampedCenterX = Phaser.Math.Clamp(currentCenterX, minCenterX, maxCenterX);
        const clampedCenterY = Phaser.Math.Clamp(currentCenterY, minCenterY, maxCenterY);
        // Ajusta scroll com base no centro desejado
        cam.scrollX = clampedCenterX - halfW;
        cam.scrollY = clampedCenterY - halfH;
    }
}

// 🎭 MODO ESPECTADOR: Seguir jogador específico
Game.followPlayer = function(playerId) {
    if (Game.spectatorMode && Game.spectatorMode.enabled) {
        if (playerId === null || playerId === 'none') {
            Game.spectatorMode.followingPlayer = null;
            console.log('🎭 Câmera livre ativada');
            if (typeof addSystemMessage === 'function') {
                addSystemMessage('📹 Câmera livre ativada');
            }
        } else if (Game.playerMap[playerId]) {
            Game.spectatorMode.followingPlayer = playerId;
            const playerName = Game.playerMap[playerId].client || `Jogador ${playerId}`;
            console.log(`🎭 Seguindo jogador: ${playerName}`);
            if (typeof addSystemMessage === 'function') {
                addSystemMessage(`📹 Seguindo: ${playerName}`);
            }
        }
    }
}

// 🎭 MODO ESPECTADOR: Obter lista de jogadores
Game.getPlayerList = function() {
    const players = [];
    for (let id in Game.playerMap) {
        const p = Game.playerMap[id];
        if (p && p.sprite) {
            players.push({
                id: id,
                name: p.client || `Jogador ${id}`,
                x: Math.round(p.sprite.x),
                y: Math.round(p.sprite.y)
            });
        }
    }
    return players;
}

Game.addNewPlayer = function (id, x, y,client,sprite){
    playerids.push(id);
    
    // Determina o sprite correto para este jogador
    let playerSprite;
    if(me == -1 && id == client){
        me = client;
        indexMe = playerids.indexOf(me);
        playerSprite = spriteMe;
    }
    else{
        indexCli = playerids.indexOf(id);
        playerSprite = sprite;
    }
    
    // IMPORTANTE: Armazena o sprite deste jogador para uso futuro
    Game.playerSprites[id] = playerSprite;

    if(playerSprite == 'master'){
        master.play();
    }
    if(id == client){
        Game.playerMap[id] = Cthis.physics.add.sprite(x, y, 'fake');
    }
    else{
        Game.playerMap[id] = Cthis.physics.add.sprite(x, y, playerSprite);
    }

    Game.playerHb[id] = Cthis.physics.add.sprite(x, y + 25, 'hitbox');

    Game.playerHb[id].setCollideWorldBounds(true);

    Game.playerHp[id] = Cthis.physics.add.sprite(x, y + 5, 'hitboxP');

    Game.playerHp[id].setCollideWorldBounds(true);

    Game.playerMap[id].setDepth(parseInt(Game.playerHb[id].y));

    for(var i = 0; i < Game.playerHb.length; i++){
        if(id != i){
            Cthis.physics.add.collider(Game.playerHb[id], Game.playerHb[i]);
            Cthis.physics.add.collider(Game.playerHp[id], Game.playerHp[i]);
        }
    }
    
    // Cria o texto do nome do jogador acima da cabeça
    // Posição: x do jogador, y do jogador - 40 (acima da cabeça)
    // Depth: altura do mapa + 2 (sempre visível, acima dos telhados)
    const nameDepth = h + 2; // h é a altura do mapa (ex: 1920 pixels)
    Game.playerNames[id] = Cthis.add.text(x, y - 40, playerSprite, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 3,
        align: 'center'
    }).setOrigin(0.5, 0.5).setDepth(nameDepth);
    
    console.log(`📝 Nome criado para jogador ${id}: "${playerSprite}" no depth ${nameDepth}`);

    // Usa o sprite armazenado (não a variável local) para criar animações
    Cthis.anims.create({
        key: `turn${id}`,
        frames: [ { key: playerSprite, frame: 240 } ],
        frameRate: 20
    });

    Cthis.anims.create({
        key: `turnup${id}`,
        frames: [ { key: playerSprite, frame: 192 } ],
        frameRate: 20
    });

    Cthis.anims.create({
        key: `turnleft${id}`,
        frames: [ { key: playerSprite, frame: 216 } ],
        frameRate: 20
    });

    Cthis.anims.create({
        key: `turnright${id}`,
        frames: [ { key: playerSprite, frame: 264 } ],
        frameRate: 20
    });

    Cthis.anims.create({
        key: `left${id}`,
        frames: Cthis.anims.generateFrameNumbers(playerSprite, { start: 217, end: 224 }),
        frameRate: 10,
        repeat: -1
    });

    Cthis.anims.create({
        key: `right${id}`,
        frames: Cthis.anims.generateFrameNumbers(playerSprite, { start: 265, end: 272 }),
        frameRate: 10,
        repeat: -1
    });

    Cthis.anims.create({
        key: `up${id}`,
        frames: Cthis.anims.generateFrameNumbers(playerSprite, { start: 193, end: 200 }),
        frameRate: 10,
        repeat: -1
        
    });

    Cthis.anims.create({
        key: `down${id}`,
        frames: Cthis.anims.generateFrameNumbers(playerSprite, { start: 241, end: 248 }),
        frameRate: 10,
        repeat: -1
    });
    
    Cthis.anims.create({
        key: `dead${id}`,
        frames: Cthis.anims.generateFrameNumbers(playerSprite, { start: 356, end: 361 }),
        frameRate: 10
    });
    Cthis.anims.create({
        key: `body${id}`,
        frames: [{key: playerSprite, frame: 361}],
        frameRate: 20
    });
}

Game.addNewBullet = function (x, y, signal, direction, idP){
    
    gun.play();
    var limitsTopLeft = limits.getTopLeft();
    Game.removeBullet(idP);
    Game.bulletsP[idP] = [ Cthis.physics.add.sprite(x, y, 'bullet'), signal, direction ];
    var colisorB = Cthis.physics.add.overlap(
        limits,
        Game.bulletsP[idP],
        function overlap(_limits, bullet) {
            bullet.setVelocityX(0);
            bullet.setVelocityY(0);
            Game.removeBullet(idP);           
        },
        function process(_limits, bullet) {
          // It would be more efficient to create a CanvasTexture and check that instead.
          // But getPixelAlpha() is convenient for an example.
    
          return (
            this.textures.getPixelAlpha(
              Math.floor(bullet.body.center.x - limitsTopLeft.x),
              Math.floor(bullet.body.center.y - limitsTopLeft.y),
              `limits${lastScene.nome}`
            ) === 255
          );
        },
        Cthis
      );

    if(idP != indexMe){
        Cthis.physics.add.collider(Game.playerHp[me], Game.bulletsP[idP][0], function (plane, obstacle) {
            if(dead == false){
                reached = true;
                dead = true;
                Client.reach(indexMe);
                death.play();
                Game.removeBullet(idP);
            }
        });
    }

    if(Game.bulletsP[idP][1] == '+'){
        if(Game.bulletsP[idP][2] == '+'){
            Game.bulletsP[idP][0].setVelocityX(400);
        }
        else{
            Game.bulletsP[idP][0].setVelocityX(-400);
        }
    }
    else{
        if(Game.bulletsP[idP][2] == '+'){
            Game.bulletsP[idP][0].setVelocityY(400);
        }
        else{
            Game.bulletsP[idP][0].setVelocityY(-400);
        }
    }

}

Game.addNewRoll = function(data){
    $('#messages').append(data);
    $('#messages-box').scrollTop($('#messages-box')[0].scrollHeight);
};

Game.movePlayer = function(id,x,y,moveto){
    try {
        var playerM = Game.playerMap[id];
        var playerH = Game.playerHb[id];
        var playerHp = Game.playerHp[id];
        var playerName = Game.playerNames[id];
        
        playerM.x = x;
        playerM.y = y;
        playerH.x = x;
        playerH.y = y + 25;
        playerHp.x = x;
        playerHp.y = y + 5;
        playerM.setDepth(parseInt(playerH.y));
        
        // Atualiza a posição do nome acima da cabeça
        if(playerName){
            playerName.x = x;
            playerName.y = y - 40;
        }
        
        if(id != me){
            // CORREÇÃO: Remove o ID do movimento recebido e adiciona o ID correto
            // moveto vem como "left5", "turn3", etc. (movimento + ID do remetente)
            // Precisamos extrair apenas o movimento e adicionar o ID do destinatário
            
            // Remove números do final da string de movimento
            const movementType = moveto.replace(/\d+$/, '');
            // Adiciona o ID do jogador que está sendo movido
            const correctAnim = `${movementType}${id}`;
            
            console.log(`🎮 movePlayer: id=${id}, moveto recebido=${moveto}, movimento extraído=${movementType}, animação correta=${correctAnim}`);
            playerM.anims.play(correctAnim, true);
        }
    }
    catch (e) {
        console.error('Erro em movePlayer:', e);
    }
    
};

Game.removePlayer = function(id){
    var index = playerids.indexOf(id);
    if (index !== -1) {
        playerids.splice(index, 1);
    }
    Game.playerMap[id].destroy();
    Game.playerHb[id].destroy();
    Game.playerHp[id].destroy();
    if(Game.playerNames[id]){
        Game.playerNames[id].destroy();
    }
    delete Game.playerMap[id];
    delete Game.playerHb[id];
    delete Game.playerHp[id];
    delete Game.playerSprites[id]; // Remove o sprite armazenado
    delete Game.playerNames[id]; // Remove o texto do nome
    indexMe = playerids.indexOf(me);
};

function removeDoors(doorset){
    if (!doorset || !Array.isArray(doorset)) {
        console.warn('removeDoors: Invalid doorset');
        doorvars = [];
        return;
    }
    
    for(var id = 0; id < doorset.length; id ++){
        if (Game.doors[id] && Game.doors[id].destroy) {
            Game.doors[id].destroy();
        }
        if (Game.doorsaux[id] && Game.doorsaux[id].destroy) {
            Game.doorsaux[id].destroy();
        }
        if (Game.doorsaux2[id] && Game.doorsaux2[id].destroy) {
            Game.doorsaux2[id].destroy();
        }
        if (Game.doors2[id] && Game.doors2[id].destroy) {
            Game.doors2[id].destroy();
        }
    }
    doorvars = [];
}
function addDoors(doorset){
    // Safety checks
    if (!doorset || !Array.isArray(doorset)) {
        console.warn('addDoors: doorset inválido ou não é array, usando array vazio');
        doorset = [];
        return;
    }
    
    if (!Cthis || !Cthis.physics) {
        console.warn('addDoors: Contexto Phaser ou physics não disponível');
        return;
    }
    
    if (doorset.length === 0) {
        console.log('addDoors: Nenhuma porta para adicionar');
        return;
    }
    
    // Use currentScene if lastScene is not available
    const sceneContext = lastScene || currentScene;
    if (!sceneContext || !sceneContext.nome || !sceneContext.horario) {
        console.warn('addDoors: No valid scene context available');
        return;
    }
    
    for(var id = 0; id < doorset.length; id ++){
        if (!doorset[id] || typeof doorset[id].x === 'undefined' || typeof doorset[id].y === 'undefined') {
            console.warn(`addDoors: Invalid door data at index ${id}`);
            continue;
        }
        
        Game.doors[id] = Cthis.physics.add.sprite(doorset[id].x, doorset[id].y, `doors${sceneContext.nome}${sceneContext.horario.toLowerCase()}`).setDepth(1919).setBounce(1);
        Game.doorsaux[id] = Cthis.physics.add.sprite(doorset[id].x, doorset[id].y, "fake").setDepth(1920).setAlpha(0).setBounce(1);
        Game.doors2[id] = Cthis.physics.add.sprite(doorset[id].auxx, doorset[id].auxy, `doors${sceneContext.nome}${sceneContext.horario.toLowerCase()}`).setDepth(1919).setBounce(1);
        Game.doorsaux2[id] = Cthis.physics.add.sprite(doorset[id].auxx, doorset[id].auxy, "fake").setDepth(1920).setAlpha(0).setBounce(1);
        if(doorset[id].mode == 0){
            Game.doors[id].setOrigin(0,0.5);
            Game.doorsaux[id].setOrigin(0,0.5);
            Game.doors2[id].setOrigin(1,0.5);
            Game.doorsaux2[id].setOrigin(1,0.5);
            Game.doors2[id].flipX = !Game.doors2[id].flipX;
            Game.doorsaux2[id].flipX = !Game.doorsaux2[id].flipX;
        }
        else{
            Game.doors[id].setOrigin(0,0.5);
            Game.doorsaux[id].setOrigin(0,0.5);
            Game.doors[id].rotation -= 1.55;
            Game.doorsaux[id].rotation -= 1.55;
            Game.doors2[id].setOrigin(0,0.5);
            Game.doorsaux2[id].setOrigin(0,0.5);
            Game.doors2[id].rotation += 1.55;
            Game.doorsaux2[id].rotation += 1.55;
            Game.doors2[id].flipY = !Game.doors2[id].flipY;
            Game.doorsaux2[id].flipY = !Game.doorsaux2[id].flipY;
        }
        doorvars.push({'Ddirection' : false,
            'Dmovement' : null,
            'Dmoved' : false,
            'Dopen' : false});
    }
}

Game.removeBullet = function(id){
    try {
        Game.bulletsP[id][0].destroy();
        delete Game.bulletsP[id];
    }
    catch (e) {
        movement = movement;
    }
};

Game.resetPlayers = function(id,x,y,client,sprite){
    found = 0;
    for(var i = 0; i < playerids.length; i++){
        if(id == playerids[i]){
            found = 1;
            break;
        }
    }
    if(found == 0){
        Game.addNewPlayer(id,x,y,client,sprite);
    }
};

// Função para lidar com redimensionamento do jogo
Game.resize = function(newWidth, newHeight) {
    if (Cthis && Cthis.cameras && Cthis.cameras.main) {
        // Atualiza as dimensões da câmera
        Cthis.cameras.main.width = newWidth;
        Cthis.cameras.main.height = newHeight;
        
        // Reposiciona a câmera se necessário
        if (player) {
            Cthis.cameras.main.startFollow(player);
            Cthis.cameras.main.setZoom(zoom);
        }
        
        console.log(`Game.resize: Câmera redimensionada para ${newWidth}x${newHeight}`);
    }
};

// Função para criar animações padrão e evitar erros
Game.createDefaultAnimations = function() {
    if (!this.anims) return;
    
    // Cria animações temporárias com ID -1 para casos onde me ainda não foi definido
    const tempSprite = spriteMe;
    const tempId = -1;
    
    // Só cria se não existir
    const animationsToCreate = [
        { key: `turn${tempId}`, frame: 240 },
        { key: `turnup${tempId}`, frame: 192 },
        { key: `turnleft${tempId}`, frame: 216 },
        { key: `turnright${tempId}`, frame: 264 },
        { key: `left${tempId}`, frame: 216 },
        { key: `right${tempId}`, frame: 264 },
        { key: `up${tempId}`, frame: 192 },
        { key: `down${tempId}`, frame: 240 },
        { key: `body${tempId}`, frame: 240 }
    ];
    
    animationsToCreate.forEach(anim => {
        if (!this.anims.exists(anim.key)) {
            try {
                this.anims.create({
                    key: anim.key,
                    frames: [{ key: tempSprite, frame: anim.frame }],
                    frameRate: 20
                });
                console.log(`Animação padrão criada: ${anim.key}`);
            } catch (e) {
                console.warn(`Erro ao criar animação padrão ${anim.key}:`, e);
            }
        }
    });
};

// Sistema robusto de inicialização do jogador
Game.initializePlayerWithRetry = function(sprite) {
    let retryCount = 0;
    const maxRetries = 5;
    const baseDelay = 200;
    
    function attemptInitialization() {
        console.log(`Tentativa ${retryCount + 1}/${maxRetries} de inicialização do jogador`);
        
        // Verifica se a conexão WebSocket está ativa
        if (!Client.socket || !Client.socket.connected) {
            console.warn('WebSocket não conectado, aguardando...');
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(attemptInitialization, baseDelay * retryCount);
                return;
            } else {
                console.error('Falha na conexão WebSocket após múltiplas tentativas');
                Game.showConnectionError();
                return;
            }
        }
        
        // Verifica se o Phaser está pronto
        if (!Cthis || !Cthis.scene || !Cthis.scene.isActive()) {
            console.warn('Cena Phaser não está ativa, aguardando...');
            if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(attemptInitialization, baseDelay);
                return;
            }
        }
        
        // Tenta inicializar o jogador
        console.log('Enviando solicitação de novo jogador:', sprite);
        Client.askNewPlayer(sprite);
        
        // Define timeout para verificar se recebeu resposta
        const responseTimeout = setTimeout(() => {
            if (me === -1 && retryCount < maxRetries) {
                console.warn('Timeout na resposta do servidor, tentando novamente...');
                retryCount++;
                attemptInitialization();
            } else if (me === -1) {
                console.error('Falha na inicialização do jogador após múltiplas tentativas');
                Game.showConnectionError();
            }
        }, 3000);
        
        // Limpa o timeout se o jogador for inicializado
        const checkInitialization = setInterval(() => {
            if (me !== -1) {
                clearTimeout(responseTimeout);
                clearInterval(checkInitialization);
                console.log('Jogador inicializado com sucesso! ID:', me);
                Game.onPlayerInitialized();
            }
        }, 100);
    }
    
    // Inicia com um pequeno delay
    setTimeout(attemptInitialization, 100);
};

// Callback quando o jogador é inicializado com sucesso
Game.onPlayerInitialized = function() {
    // Remove indicador de carregamento se existir
    window.playerNotInitializedLogged = false;
    
    // Atualiza status de carregamento
    if (typeof updateLoadingStatus === 'function') {
        updateLoadingStatus('player', true);
    }
    
    // Reset contador de tentativas quando jogador é inicializado com sucesso
    localStorage.setItem('rpg_loading_attempts', '0');
    
    // Pode adicionar lógica adicional aqui se necessário
    console.log('Sistema do jogador totalmente inicializado');
};

// Mostra erro de conexão para o usuário
Game.showConnectionError = function() {
    console.error('Erro de conexão: Não foi possível conectar ao servidor');
    
    // Adiciona mensagem de erro visual se o chat existir
    if (typeof addSystemMessage === 'function') {
        addSystemMessage('❌ Erro de conexão com o servidor. Recarregue a página.');
    }
    
    // Opcional: tentar reconectar automaticamente
    setTimeout(() => {
        console.log('Tentando reconectar automaticamente...');
        if (Client.socket) {
            Client.socket.connect();
        }
    }, 1000);
};

// Função para criar colisões físicas pixel-perfect a partir da imagem de limites
Game.createPhysicsFromLimits = function(scene, limitsKey, mapWidth, mapHeight) {
    console.log('🔧 Criando colisões pixel-perfect a partir da imagem...');
    
    // Limpar colisões anteriores se existirem
    if (Game.collisionBodies && Game.collisionBodies.length > 0) {
        console.log(`🗑️ Removendo ${Game.collisionBodies.length} corpos de colisão anteriores...`);
        Game.collisionBodies.forEach(body => {
            if (body && body.destroy) {
                body.destroy();
            }
        });
    }
    Game.collisionBodies = [];
    
    // Limpar grupo de colisão
    if (Game.collisionGroup) {
        Game.collisionGroup.clear(true, true);
    } else {
        Game.collisionGroup = scene.physics.add.staticGroup();
    }
    
    // Obter a textura
    const texture = scene.textures.get(limitsKey);
    if (!texture || !texture.source || !texture.source[0]) {
        console.error('❌ Não foi possível obter textura de colisões:', limitsKey);
        return;
    }
    
    const imgWidth = texture.source[0].width;
    const imgHeight = texture.source[0].height;
    
    console.log(`📊 Imagem de colisões: ${imgWidth}x${imgHeight} pixels`);
    console.log(`📊 Mapa real: ${mapWidth}x${mapHeight} pixels`);
    
    // Calcular escala da imagem para o mapa real
    const scaleX = mapWidth / imgWidth;
    const scaleY = mapHeight / imgHeight;
    
    console.log(`📊 Escala: X=${scaleX.toFixed(2)}, Y=${scaleY.toFixed(2)}`);
    
    // Criar canvas temporário para ler pixels
    const canvas = scene.textures.createCanvas('temp_limits_game', imgWidth, imgHeight);
    const ctx = canvas.context;
    
    // Desenhar a textura no canvas
    ctx.drawImage(texture.source[0].image, 0, 0);
    
    // Ler pixels
    const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
    const pixels = imageData.data;
    
    // Processar pixels para criar mapa de colisões
    // Criar matriz 2D para otimizar (detectar retângulos)
    const collisionMatrix = [];
    for (let y = 0; y < imgHeight; y++) {
        collisionMatrix[y] = [];
        for (let x = 0; x < imgWidth; x++) {
            const index = (y * imgWidth + x) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];
            
            // Pixel vermelho com alpha > 128 = colisão
            collisionMatrix[y][x] = (r > 200 && g < 100 && b < 100 && a > 128) ? 1 : 0;
        }
    }
    
    // Detectar retângulos de colisão (algoritmo de varredura horizontal)
    const rectangles = [];
    const visited = [];
    for (let y = 0; y < imgHeight; y++) {
        visited[y] = new Array(imgWidth).fill(false);
    }
    
    for (let y = 0; y < imgHeight; y++) {
        for (let x = 0; x < imgWidth; x++) {
            if (collisionMatrix[y][x] === 1 && !visited[y][x]) {
                // Encontrar largura máxima desta linha
                let width = 0;
                while (x + width < imgWidth && 
                       collisionMatrix[y][x + width] === 1 && 
                       !visited[y][x + width]) {
                    width++;
                }
                
                // Encontrar altura máxima para esta largura
                let height = 1;
                let canExtend = true;
                while (canExtend && y + height < imgHeight) {
                    for (let dx = 0; dx < width; dx++) {
                        if (collisionMatrix[y + height][x + dx] !== 1 || 
                            visited[y + height][x + dx]) {
                            canExtend = false;
                            break;
                        }
                    }
                    if (canExtend) height++;
                }
                
                // Marcar pixels como visitados
                for (let dy = 0; dy < height; dy++) {
                    for (let dx = 0; dx < width; dx++) {
                        visited[y + dy][x + dx] = true;
                    }
                }
                
                // Adicionar retângulo escalado
                rectangles.push({
                    x: Math.round(x * scaleX),
                    y: Math.round(y * scaleY),
                    width: Math.round(width * scaleX),
                    height: Math.round(height * scaleY)
                });
            }
        }
    }
    
    console.log(`✅ ${rectangles.length} retângulos de colisão detectados`);
    
    if (rectangles.length === 0) {
        console.warn('⚠️ Nenhuma colisão detectada! Certifique-se que a imagem tem pixels VERMELHOS (#FF0000)');
    }
    
    // Criar corpos físicos para cada retângulo
    rectangles.forEach((rect, index) => {
        // Criar retângulo invisível apenas para física
        const body = scene.add.zone(
            rect.x + rect.width / 2, 
            rect.y + rect.height / 2, 
            rect.width, 
            rect.height
        );
        
        // Adicionar física estática
        scene.physics.add.existing(body, true); // true = static body
        body.body.immovable = true;
        
        // Adicionar ao grupo
        Game.collisionGroup.add(body);
        Game.collisionBodies.push(body);
        
        // Log das primeiras 5 colisões para debug
        if (index < 5) {
            console.log(`   Retângulo ${index}: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`);
        }
    });
    
    // Criar collider com o personagem (hp1)
    if (hp1) {
        collider = scene.physics.add.collider(hp1, Game.collisionGroup);
        console.log('✅ Collider criado entre personagem e grupo de colisões');
    } else {
        console.warn('⚠️ hp1 ainda não existe, collider não foi criado');
    }
    
    // Limpar canvas temporário
    scene.textures.remove('temp_limits_game');
    
    console.log('✅ Colisões físicas criadas!');
    console.log(`   Total de retângulos: ${Game.collisionBodies.length}`);
};

// Função para verificar se o jogador está digitando (input em foco)
Game.isPlayerTyping = function() {
    // Primeiro verifica a variável global (mais rápida)
    if (window.isTypingInChat === true) {
        return true;
    }
    
    // Fallback: verifica se algum input ou textarea está em foco
    const activeElement = document.activeElement;
    
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    const isInput = tagName === 'input' || tagName === 'textarea';
    const isContentEditable = activeElement.contentEditable === 'true';
    
    // Verifica especificamente os inputs do chat
    const isChatInput = activeElement.id === 'messageInput' ||
                       activeElement.classList.contains('chat-input') ||
                       activeElement.classList.contains('message-input');
    
    const typing = isInput || isContentEditable || isChatInput;
    
    // Se detectou que está digitando mas a variável global não está setada, atualiza
    if (typing && !window.isTypingInChat) {
        window.isTypingInChat = true;
    }
    
    return typing;
};

// Função para verificar integridade visual do jogo
Game.verifyVisualIntegrity = function(scene) {
    console.log('🔍 Verificando integridade visual...');
    
    try {
        // Verifica se as variáveis de fundo existem e são válidas
        if (!window.bg || !window.limits) {
            throw new Error('Objetos de fundo não foram criados');
        }
        
        // Verifica se as texturas estão válidas
        const bgTexture = window.bg.texture;
        const limitsTexture = window.limits.texture;
        
        if (!bgTexture || bgTexture.key === '__MISSING') {
            throw new Error('Textura de fundo missing ou inválida');
        }
        
        if (!limitsTexture || limitsTexture.key === '__MISSING') {
            throw new Error('Textura de limites missing ou inválida');
        }
        
        // Verifica se as texturas têm dimensões válidas
        if (bgTexture.source[0].width === 0 || bgTexture.source[0].height === 0) {
            throw new Error('Dimensões de textura de fundo inválidas');
        }
        
        if (limitsTexture.source[0].width === 0 || limitsTexture.source[0].height === 0) {
            throw new Error('Dimensões de textura de limites inválidas');
        }
        
        // Verifica se os objetos estão visíveis (não alpha 0 para bg)
        if (window.bg.alpha === 0) {
            console.warn('⚠️ Fundo com alpha 0 - corrigindo');
            window.bg.setAlpha(1);
        }
        
        console.log('✅ Integridade visual verificada com sucesso');
        
        // Se chegou até aqui, tudo está OK - pode marcar assets como prontos
        if (typeof updateLoadingStatus === 'function') {
            updateLoadingStatus('assets', true);
        }
        
    } catch (error) {
        console.error('❌ FALHA NA VERIFICAÇÃO VISUAL:', error.message);
        console.error('❌ Detectado problema de tela preta - recarregando');
        
        if (typeof addSystemMessage === 'function') {
            addSystemMessage('❌ Problema visual detectado. Recarregando...');
        }
        
        // Incrementa contador e força reload
        window.loadingAttempts = (window.loadingAttempts || 0) + 1;
        localStorage.setItem('rpg_loading_attempts', window.loadingAttempts.toString());
        
        setTimeout(() => {
            // window.location.reload();
        }, 1000);
    }
};

// ============================================================
// CARREGAMENTO DINÂMICO DE MAPAS DO BANCO DE DADOS
// ============================================================

// Cache de mapas carregados
Game.mapsCache = {};

// Função para buscar dados do mapa no banco
Game.fetchMapData = async function(mapName) {
    try {
        if (Game.mapsCache[mapName]) {
            console.log('✅ Mapa encontrado no cache:', mapName);
            return Game.mapsCache[mapName];
        }
        
        console.log('📡 Buscando dados do mapa no banco:', mapName);
        const response = await fetch(`/api/maps/get/${mapName}`);
        
        if (!response.ok) {
            console.warn('⚠️ Mapa não encontrado no banco:', mapName);
            return null;
        }
        
        const data = await response.json();
        if (data.success && data.map) {
            Game.mapsCache[mapName] = data.map;
            console.log('✅ Dados do mapa carregados:', mapName, data.map);
            return data.map;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Erro ao buscar mapa:', mapName, error);
        return null;
    }
};

// Função para converter URL do MinIO para URL do proxy
Game.convertToProxyUrl = function(minioUrl) {
    if (!minioUrl || minioUrl === '') return null;
    
    // Se já é URL completa do MinIO
    if (minioUrl.startsWith('https://s3.rezum.me/rezumme/')) {
        const path = minioUrl.replace('https://s3.rezum.me/rezumme/', '');
        return `/minio-proxy/${path}`;
    }
    
    return minioUrl;
};

// Função para carregar texturas dinâmicas no Phaser
Game.loadDynamicTexture = function(scene, key, url) {
    return new Promise((resolve, reject) => {
        if (!url || url === '') {
            reject(new Error('URL vazia'));
            return;
        }
        
        // Verifica se a textura já existe
        if (scene.textures.exists(key)) {
            console.log(`✅ Textura ${key} já existe no cache`);
            resolve();
            return;
        }
        
        const proxyUrl = Game.convertToProxyUrl(url);
        console.log(`🖼️ Carregando textura dinâmica: ${key} de ${proxyUrl}`);
        
        // Timeout de 15 segundos
        const timeout = setTimeout(() => {
            console.error(`❌ Timeout ao carregar textura ${key}`);
            reject(new Error(`Timeout ao carregar ${key}`));
        }, 15000);
        
        // Remove todos os listeners de progresso para evitar erro de drawImage
        scene.load.off('progress');
        scene.load.off('fileprogress');
        
        // Adiciona a imagem ao loader
        scene.load.image(key, proxyUrl);
        
        // Handler de sucesso
        scene.load.once(`filecomplete-image-${key}`, () => {
            clearTimeout(timeout);
            console.log(`✅ Textura ${key} carregada com sucesso`);
            resolve();
        });
        
        // Handler de erro
        scene.load.once('loaderror', (file) => {
            if (file.key === key) {
                clearTimeout(timeout);
                console.error(`❌ Erro ao carregar textura ${key}`);
                reject(new Error(`Falha ao carregar ${key}`));
            }
        });
        
        // Inicia o carregamento apenas se o loader não estiver ativo
        if (!scene.load.isLoading()) {
            scene.load.start();
        } else {
            console.warn('⚠️ Loader já está ativo, textura será carregada na fila');
        }
    });
};