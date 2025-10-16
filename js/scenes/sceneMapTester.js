// ============================================================
// SCENE MAP TESTER - Phaser Scene para testar mapas
// ============================================================

// Verificar se Phaser está disponível
if (typeof Phaser === 'undefined') {
    console.error('❌ ERRO: Phaser não está carregado! Certifique-se de que phaser.min.js foi carregado antes deste script.');
    throw new Error('Phaser não disponível');
}

class SceneMapTester extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneMapTester' });
        
        this.testCharacter = null;
        this.cursors = null;
        this.wasdKeys = null;
        this.mapLayer = null;
        this.limitsLayer = null;
        this.rooftopsLayer = null;
        this.currentTime = 'dia';
        
        // Controle de visibilidade
        this.showLimits = false;
        this.showRooftops = false;
        
        // Corpos de colisão física
        this.collisionBodies = [];
        
        // Assets carregados
        this.loadedAssets = {
            dia: null,
            tarde: null,
            noite: null,
            limits: null,
            rooftops: null
        };
        
        // Dimensões do mapa
        this.mapWidth = 1920;
        this.mapHeight = 1920;
        this.spawnX = 960;
        this.spawnY = 960;
    }

    preload() {
        // Carregar sprite de teste (boneco genérico)
        // Criamos um sprite simples via Graphics se não houver arquivo
        this.createTestCharacterTexture();
    }

    create() {
        console.log('🎮 SceneMapTester iniciada');

        // Criar fundo temporário para visualização
        const bg = this.add.rectangle(0, 0, this.mapWidth, this.mapHeight, 0x1a1f3a);
        bg.setOrigin(0, 0);
        bg.setDepth(-10);

        // Configurar física com debug
        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        // Criar camadas (inicialmente vazias)
        this.createLayers();

        // Criar personagem de teste
        this.createTestCharacter();

        // Configurar câmera
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        this.cameras.main.startFollow(this.testCharacter, true, 0.1, 0.1);
        this.cameras.main.setZoom(0.8); // Zoom out para ver melhor

        // Controles
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = {
            W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Debug de FPS
        this.time.addEvent({
            delay: 100,
            callback: this.updateDebugInfo,
            callbackScope: this,
            loop: true
        });

        // Adicionar texto de instrução
        const instructionText = this.add.text(
            this.mapWidth / 2, 
            100, 
            '🎮 BONECO DE TESTE ATIVO\n\n' +
            'Use WASD ou Arrow Keys para mover\n' +
            'Faça upload dos mapas e clique em "Carregar no Teste"\n\n' +
            '✅ Sistema funcionando - Você pode mover agora!',
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 6,
                align: 'center',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: { x: 20, y: 15 }
            }
        );
        instructionText.setOrigin(0.5);
        instructionText.setScrollFactor(0);
        instructionText.setDepth(100);
        
        // Piscar o texto para chamar atenção
        this.tweens.add({
            targets: instructionText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                instructionText.setAlpha(1);
            }
        });

        console.log('✅ Scene criada com sucesso');
        console.log('📍 Personagem criado em:', this.spawnX, this.spawnY);
    }

    createTestCharacterTexture() {
        // Criar sprite genérico de boneco de teste
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Corpo (círculo amarelo)
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(32, 32, 20);
        
        // Borda preta
        graphics.lineStyle(2, 0x000000, 1);
        graphics.strokeCircle(32, 32, 20);
        
        // Olhos
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(26, 28, 3);
        graphics.fillCircle(38, 28, 3);
        
        // Sorriso
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginPath();
        graphics.arc(32, 32, 12, 0.2, Math.PI - 0.2, false);
        graphics.strokePath();
        
        // Direção (seta)
        graphics.fillStyle(0xff0000, 1);
        graphics.fillTriangle(32, 10, 28, 18, 36, 18);
        
        graphics.generateTexture('testCharacter', 64, 64);
        graphics.destroy();
    }

    createLayers() {
        // Camada do mapa principal
        this.mapLayer = this.add.container(0, 0);
        this.mapLayer.setDepth(0);

        // Camada de limites (debug)
        this.limitsLayer = this.add.container(0, 0);
        this.limitsLayer.setDepth(1);
        this.limitsLayer.setVisible(false);

        // Camada de telhados (acima do personagem)
        this.rooftopsLayer = this.add.container(0, 0);
        this.rooftopsLayer.setDepth(10);
        this.rooftopsLayer.setVisible(false);
    }

    createTestCharacter() {
        this.testCharacter = this.physics.add.sprite(this.spawnX, this.spawnY, 'testCharacter');
        this.testCharacter.setDepth(5);
        this.testCharacter.setCollideWorldBounds(true);
        this.testCharacter.body.setSize(40, 40);
        this.testCharacter.body.setOffset(12, 12);
        
        // Tornar mais visível
        this.testCharacter.setScale(1.5);

        // Texto com nome (fixo na tela para debug)
        const nameText = this.add.text(0, -50, 'TEST DUMMY', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffff00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        });
        nameText.setOrigin(0.5);
        this.testCharacter.nameText = nameText;
        
        console.log('✅ Personagem criado:', {
            x: this.testCharacter.x,
            y: this.testCharacter.y,
            visible: this.testCharacter.visible,
            texture: this.testCharacter.texture.key
        });
    }

    update() {
        if (!this.testCharacter) return;

        // Movimento do personagem
        const speed = 200;
        let velocityX = 0;
        let velocityY = 0;

        // WASD ou Arrow Keys
        if (this.wasdKeys.A.isDown || this.cursors.left.isDown) {
            velocityX = -speed;
        } else if (this.wasdKeys.D.isDown || this.cursors.right.isDown) {
            velocityX = speed;
        }

        if (this.wasdKeys.W.isDown || this.cursors.up.isDown) {
            velocityY = -speed;
        } else if (this.wasdKeys.S.isDown || this.cursors.down.isDown) {
            velocityY = speed;
        }

        this.testCharacter.setVelocity(velocityX, velocityY);

        // Atualizar posição do nome
        if (this.testCharacter.nameText) {
            this.testCharacter.nameText.setPosition(
                this.testCharacter.x,
                this.testCharacter.y - 60
            );
        }

        // Rotacionar personagem na direção do movimento
        if (velocityX !== 0 || velocityY !== 0) {
            const angle = Math.atan2(velocityY, velocityX);
            this.testCharacter.setRotation(angle + Math.PI / 2);
            
            // Feedback visual: deixar mais brilhante quando em movimento
            this.testCharacter.setTint(0xffff88);
        } else {
            // Voltar cor normal quando parado
            this.testCharacter.clearTint();
        }
    }

    updateDebugInfo() {
        const fps = Math.round(this.game.loop.actualFps);
        const fpsElement = document.getElementById('canvas-fps');
        if (fpsElement) {
            fpsElement.textContent = `FPS: ${fps}`;
        }

        if (this.testCharacter) {
            const x = Math.round(this.testCharacter.x);
            const y = Math.round(this.testCharacter.y);
            const posElement = document.getElementById('canvas-pos');
            if (posElement) {
                posElement.textContent = `Pos: (${x}, ${y})`;
            }
        }
    }

    // ============================================================
    // MÉTODOS PÚBLICOS PARA CONTROLE EXTERNO
    // ============================================================

    loadMapTexture(timeOfDay, imageUrl) {
        console.log(`🖼️ Carregando textura ${timeOfDay}:`, imageUrl);
        
        const textureKey = `map_${timeOfDay}`;
        
        // Verificar se já existe e remover
        if (this.textures.exists(textureKey)) {
            console.log(`⚠️ Textura ${textureKey} já existe, removendo...`);
            this.textures.remove(textureKey);
        }

        // Carregar nova imagem usando load.image que retorna o file
        this.load.image(textureKey, imageUrl);
        
        // Listener para quando um arquivo específico completa
        this.load.on('filecomplete-image-' + textureKey, (key, type, data) => {
            console.log(`✅ Arquivo ${key} completado! Tipo: ${type}`);
            console.log('📦 Dados:', data);
            console.log('🔍 Textura existe?', this.textures.exists(key));
            
            if (this.textures.exists(key)) {
                console.log(`✅ Textura ${key} IMEDIATAMENTE disponível!`);
                this.loadedAssets[timeOfDay] = imageUrl;
                
                // Se for o horário atual, aplicar
                if (this.currentTime === timeOfDay) {
                    this.applyMapTexture(timeOfDay);
                }
            } else {
                console.error(`❌ Textura ${key} não está no texture manager mesmo após filecomplete!`);
                console.log('🔍 Texturas disponíveis:', this.textures.list);
            }
        }, this);
        
        // Listener para progresso
        this.load.on('progress', (progress) => {
            console.log(`📊 Progresso: ${Math.round(progress * 100)}%`);
        });
        
        // Listener para cada arquivo adicionado
        this.load.on('addfile', (file) => {
            console.log(`➕ Arquivo adicionado: ${file.key} (${file.url})`);
        });
        
        // Listener para quando o arquivo começa a carregar
        this.load.on('load', (file) => {
            console.log(`⏳ Iniciando carregamento: ${file.key}`);
        });
        
        // Listener para erros de processamento de arquivo
        this.load.on('fileerror', (file) => {
            console.error(`❌ ERRO ao processar arquivo: ${file.key}`);
            console.error('📋 Detalhes:', file);
        });
        
        // Aguardar o evento de conclusão da fila de carregamento
        this.load.once('complete', () => {
            console.log(`✅ Load complete disparado para ${timeOfDay}`);
            console.log(`📋 Total de texturas: ${Object.keys(this.textures.list).length}`);
            console.log(`📋 Lista de texturas:`, Object.keys(this.textures.list));
            
            // Verificar se a textura foi carregada após o complete
            this.time.delayedCall(200, () => {
                if (this.textures.exists(textureKey)) {
                    console.log(`✅ Textura ${textureKey} encontrada após delay!`);
                    this.loadedAssets[timeOfDay] = imageUrl;
                    if (this.currentTime === timeOfDay) {
                        this.applyMapTexture(timeOfDay);
                    }
                } else {
                    console.error(`❌ Textura ${textureKey} NÃO foi carregada mesmo após complete + delay!`);
                    console.error(`🔍 URL usada: ${imageUrl}`);
                    console.error(`🔍 Verificar se a imagem pode ser aberta diretamente no navegador`);
                }
            });
        });
        
        this.load.once('loaderror', (file) => {
            console.error(`❌ Erro ao carregar textura ${timeOfDay}:`, file);
            console.error('📋 Detalhes do arquivo:', {
                key: file.key,
                url: file.url,
                type: file.type,
                state: file.state
            });
        });
        
        console.log(`🎬 Iniciando load para ${textureKey}...`);
        this.load.start();
    }

    loadLimitsTexture(imageUrl) {
        console.log('🚧 Carregando colisões:', imageUrl);
        
        const textureKey = 'map_limits';
        
        if (this.textures.exists(textureKey)) {
            this.textures.remove(textureKey);
        }
        
        this.load.image(textureKey, imageUrl);
        this.load.once('complete', () => {
            // Aguardar processamento da textura
            this.time.delayedCall(100, () => {
                if (this.textures.exists(textureKey)) {
                    console.log('✅ Colisões carregadas e confirmadas');
                    this.loadedAssets.limits = imageUrl;
                    this.applyLimitsTexture();
                } else {
                    console.error('❌ Textura de colisões não registrada');
                }
            });
        });
        this.load.once('loaderror', (file) => {
            console.error('❌ Erro ao carregar colisões:', file);
        });
        this.load.start();
    }

    loadRooftopsTexture(timeOfDay, imageUrl) {
        console.log(`🏠 Carregando telhados ${timeOfDay}:`, imageUrl);
        
        const textureKey = `map_rooftops_${timeOfDay}`;
        
        if (this.textures.exists(textureKey)) {
            this.textures.remove(textureKey);
        }
        
        this.load.image(textureKey, imageUrl);
        this.load.once('complete', () => {
            // Aguardar processamento da textura
            this.time.delayedCall(100, () => {
                if (this.textures.exists(textureKey)) {
                    console.log(`✅ Telhados ${timeOfDay} carregados e confirmados`);
                    
                    // Armazenar em loadedAssets com chave correta
                    if (!this.loadedAssets.rooftops) {
                        this.loadedAssets.rooftops = {};
                    }
                    this.loadedAssets.rooftops[timeOfDay] = imageUrl;
                    
                    // Se for o horário atual, aplicar
                    if (this.currentTime === timeOfDay) {
                        this.applyRooftopsTexture(timeOfDay);
                    }
                } else {
                    console.error(`❌ Textura de telhados ${timeOfDay} não registrada`);
                }
            });
        });
        this.load.once('loaderror', (file) => {
            console.error(`❌ Erro ao carregar telhados ${timeOfDay}:`, file);
        });
        this.load.start();
    }

    applyMapTexture(timeOfDay) {
        console.log(`🎨 Aplicando textura ${timeOfDay} ao mapa`);
        
        // Verificar se o mapLayer ainda existe
        if (!this.mapLayer || !this.mapLayer.removeAll) {
            console.warn('⚠️ mapLayer não existe, recriando...');
            this.mapLayer = this.add.container(0, 0);
        }
        
        // Limpar camada atual
        this.mapLayer.removeAll(true);

        const textureKey = `map_${timeOfDay}`;
        
        // Verificar se textura existe
        if (!this.textures.exists(textureKey)) {
            console.error(`❌ Textura ${textureKey} não existe!`);
            return;
        }

        // Adicionar nova imagem
        const mapSprite = this.add.image(0, 0, textureKey);
        mapSprite.setOrigin(0, 0);
        mapSprite.setDepth(0);
        
        // Escalar para as dimensões do mapa
        mapSprite.setDisplaySize(this.mapWidth, this.mapHeight);
        
        this.mapLayer.add(mapSprite);

        console.log(`✅ Textura ${timeOfDay} aplicada:`, {
            width: mapSprite.width,
            height: mapSprite.height,
            displayWidth: mapSprite.displayWidth,
            displayHeight: mapSprite.displayHeight,
            visible: mapSprite.visible
        });
    }

    applyLimitsTexture() {
        console.log('🎨 Aplicando textura de colisões');
        
        // Verificar se o limitsLayer ainda existe
        if (!this.limitsLayer || !this.limitsLayer.removeAll) {
            console.warn('⚠️ limitsLayer não existe, recriando...');
            this.limitsLayer = this.add.container(0, 0);
        }
        
        // Limpar camada
        this.limitsLayer.removeAll(true);

        if (!this.textures.exists('map_limits')) {
            console.error('❌ Textura map_limits não existe!');
            return;
        }

        // Adicionar imagem com transparência nas dimensões corretas do mapa
        const limitsSprite = this.add.image(0, 0, 'map_limits');
        limitsSprite.setOrigin(0, 0);
        limitsSprite.setDisplaySize(this.mapWidth, this.mapHeight); // Ajustar ao tamanho do mapa
        limitsSprite.setAlpha(0.5); // Semi-transparente para debug
        limitsSprite.setDepth(1);
        this.limitsLayer.add(limitsSprite);

        console.log('✅ Colisões aplicadas visualmente (visível:', this.showLimits, ')');
        console.log(`   Dimensões: ${this.mapWidth}x${this.mapHeight}`);
        
        // Criar colisões físicas baseadas em pixels
        this.createPhysicsFromLimits();
    }
    
    createPhysicsFromLimits() {
        console.log('🔧 Criando colisões pixel-perfect a partir da imagem...');
        
        // Limpar colisões anteriores se existirem
        if (this.collisionBodies) {
            this.collisionBodies.forEach(body => body.destroy());
        }
        this.collisionBodies = [];
        
        // Criar grupo de colisões se não existir
        if (!this.collisionGroup) {
            this.collisionGroup = this.physics.add.staticGroup();
        } else {
            this.collisionGroup.clear(true, true);
        }
        
        // Obter a textura
        const texture = this.textures.get('map_limits');
        if (!texture) {
            console.error('❌ Não foi possível obter textura de colisões');
            return;
        }
        
        const imgWidth = texture.source[0].width;
        const imgHeight = texture.source[0].height;
        
        // Criar canvas temporário para ler pixels
        const canvas = this.textures.createCanvas('temp_limits', imgWidth, imgHeight);
        const ctx = canvas.context;
        
        // Desenhar a textura no canvas
        ctx.drawImage(texture.source[0].image, 0, 0);
        
        // Ler pixels
        const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
        const pixels = imageData.data;
        
        console.log(`📊 Imagem de colisões: ${imgWidth}x${imgHeight} pixels`);
        console.log(`📊 Mapa real: ${this.mapWidth}x${this.mapHeight} pixels`);
        
        // Calcular escala da imagem para o mapa real
        const scaleX = this.mapWidth / imgWidth;
        const scaleY = this.mapHeight / imgHeight;
        
        console.log(`📊 Escala: X=${scaleX.toFixed(2)}, Y=${scaleY.toFixed(2)}`);
        
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
            const body = this.add.zone(
                rect.x + rect.width / 2, 
                rect.y + rect.height / 2, 
                rect.width, 
                rect.height
            );
            
            // Adicionar física estática
            this.physics.add.existing(body, true); // true = static body
            body.body.immovable = true;
            
            // Adicionar ao grupo
            this.collisionGroup.add(body);
            this.collisionBodies.push(body);
            
            // Log das primeiras 5 colisões para debug
            if (index < 5) {
                console.log(`   Retângulo ${index}: x=${rect.x}, y=${rect.y}, w=${rect.width}, h=${rect.height}`);
            }
        });
        
        // Criar collider com o personagem se ele já existir
        if (this.testCharacter) {
            this.physics.add.collider(this.testCharacter, this.collisionGroup);
            console.log('✅ Collider criado entre personagem e grupo de colisões');
        } else {
            console.warn('⚠️ Personagem ainda não existe, collider será criado depois');
        }
        
        // Limpar canvas temporário
        this.textures.remove('temp_limits');
        
        console.log('✅ Colisões físicas criadas!');
        console.log(`   Total de retângulos: ${this.collisionBodies.length}`);
        console.log(`   Visível: ${this.showLimits}`);
    }

    applyRooftopsTexture(timeOfDay) {
        console.log(`🎨 Aplicando textura de telhados ${timeOfDay}`);
        
        // Verificar se o rooftopsLayer ainda existe
        if (!this.rooftopsLayer || !this.rooftopsLayer.removeAll) {
            console.warn('⚠️ rooftopsLayer não existe, recriando...');
            this.rooftopsLayer = this.add.container(0, 0);
        }
        
        // Limpar camada
        this.rooftopsLayer.removeAll(true);

        const textureKey = `map_rooftops_${timeOfDay}`;
        
        if (!this.textures.exists(textureKey)) {
            console.warn(`⚠️ Textura ${textureKey} não existe!`);
            return;
        }

        // Adicionar imagem nas dimensões corretas do mapa
        const rooftopsSprite = this.add.image(0, 0, textureKey);
        rooftopsSprite.setOrigin(0, 0);
        rooftopsSprite.setDisplaySize(this.mapWidth, this.mapHeight); // Ajustar ao tamanho do mapa
        rooftopsSprite.setDepth(10);
        this.rooftopsLayer.add(rooftopsSprite);

        console.log(`✅ Telhados ${timeOfDay} aplicados (visível:`, this.showRooftops, ')');
        console.log(`   Dimensões: ${this.mapWidth}x${this.mapHeight}`);
    }

    changeTimeOfDay(timeOfDay) {
        this.currentTime = timeOfDay;
        
        // Aplicar textura do mapa
        if (this.loadedAssets[timeOfDay]) {
            this.applyMapTexture(timeOfDay);
        } else {
            console.warn(`⚠️ Textura do mapa para ${timeOfDay} não carregada ainda`);
        }
        
        // Aplicar textura dos telhados se existir
        if (this.loadedAssets.rooftops && this.loadedAssets.rooftops[timeOfDay]) {
            this.applyRooftopsTexture(timeOfDay);
        } else {
            console.warn(`⚠️ Textura de telhados para ${timeOfDay} não carregada ainda`);
        }
        
        console.log(`⏰ Horário alterado para: ${timeOfDay}`);
    }

    toggleLimits() {
        this.showLimits = !this.showLimits;
        this.limitsLayer.setVisible(this.showLimits);
        
        // Os corpos de colisão agora são zones invisíveis (não precisam de toggle)
        // Apenas a camada limitsLayer (imagem semi-transparente) é mostrada/oculta
        
        console.log('🚧 Colisões:', this.showLimits ? 'Visível' : 'Oculto');
    }

    toggleRooftops() {
        this.showRooftops = !this.showRooftops;
        this.rooftopsLayer.setVisible(this.showRooftops);
        console.log('🏠 Telhados:', this.showRooftops ? 'Visível' : 'Oculto');
    }

    updateMapDimensions(width, height, spawnX, spawnY) {
        this.mapWidth = width;
        this.mapHeight = height;
        this.spawnX = spawnX;
        this.spawnY = spawnY;

        // Atualizar física e câmera
        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);

        // Reposicionar personagem se necessário
        if (this.testCharacter) {
            this.testCharacter.setPosition(spawnX, spawnY);
        }

        console.log(`📏 Dimensões atualizadas: ${width}x${height}, Spawn: (${spawnX}, ${spawnY})`);
    }

    // ============================================================
    // LIMPEZA COMPLETA - Limpar todos os assets antes de recarregar
    // ============================================================
    
    cleanupAll() {
        console.log('🧹 Limpando todos os assets...');
        
        try {
            // Remover TODOS os listeners do loader para evitar acúmulo
            this.load.removeAllListeners();
            console.log('✅ Listeners do loader removidos');
            
            // Limpar (mas não destruir) as camadas de sprites
            if (this.mapLayer && this.mapLayer.removeAll) {
                this.mapLayer.removeAll(true);
                console.log('✅ mapLayer limpa');
            }
            if (this.limitsLayer && this.limitsLayer.removeAll) {
                this.limitsLayer.removeAll(true);
                console.log('✅ limitsLayer limpa');
            }
            if (this.rooftopsLayer && this.rooftopsLayer.removeAll) {
                this.rooftopsLayer.removeAll(true);
                console.log('✅ rooftopsLayer limpa');
            }
            
            // Destruir todos os corpos de colisão
            if (this.collisionBodies && this.collisionBodies.length > 0) {
                console.log(`🗑️ Removendo ${this.collisionBodies.length} corpos de colisão...`);
                this.collisionBodies.forEach(body => {
                    if (body && body.destroy) {
                        body.destroy();
                    }
                });
                this.collisionBodies = [];
            }
            
            // Limpar grupo de colisão (mas não destruir)
            if (this.collisionGroup) {
                this.collisionGroup.clear(true, true);
                console.log('✅ collisionGroup limpo');
            }
            
            // Limpar texturas carregadas do cache (EXCETO testCharacter)
            const texturesToRemove = [
                'map-dia', 'map-tarde', 'map-noite',
                'map_dia', 'map_tarde', 'map_noite',
                'map_limits', 'limits-texture',
                'map_rooftops_dia', 'map_rooftops_tarde', 'map_rooftops_noite',
                'rooftops-dia', 'rooftops-tarde', 'rooftops-noite',
                'temp_limits'
            ];
            
            texturesToRemove.forEach(key => {
                if (this.textures.exists(key)) {
                    console.log(`🗑️ Removendo textura: ${key}`);
                    this.textures.remove(key);
                }
            });
            
            // Resetar assets carregados
            this.loadedAssets = {
                dia: null,
                tarde: null,
                noite: null,
                limits: null,
                rooftops: {
                    dia: null,
                    tarde: null,
                    noite: null
                }
            };
            
            // Resetar tempo atual
            this.currentTime = 'dia';
            
            // Reposicionar personagem no spawn
            if (this.testCharacter) {
                this.testCharacter.setPosition(this.spawnX, this.spawnY);
                this.testCharacter.setVelocity(0, 0);
                console.log('✅ Personagem reposicionado');
            }
            
            console.log('✅ Limpeza completa realizada');
        } catch (error) {
            console.error('❌ Erro durante limpeza:', error);
        }
    }
}

// Exportar para uso global
window.SceneMapTester = SceneMapTester;
