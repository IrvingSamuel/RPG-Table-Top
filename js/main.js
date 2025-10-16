/**
 * Created by Jerome on 03-03-16.
 */
//noinspection JSCheckFunctionSignatures,JSCheckFunctionSignatures,JSCheckFunctionSignatures

// ============================================
// SISTEMA DE LOADING SCREEN PERSONALIZADO
// ============================================
const LoadingScreen = {
    element: null,
    bar: null,
    percentage: null,
    tips: null,
    background: null,
    currentProgress: 0,
    targetProgress: 0,
    isComplete: false,
    
    // Dicas de loading que aparecem aleatoriamente
    loadingTips: [
        "🎲 Dica: Use WASD ou as setas para se mover",
        "⚔️ Explore cada canto do mapa para encontrar itens",
        "🛡️ Fique atento aos inimigos no seu caminho",
        "💎 Colete recursos para evoluir seu personagem",
        "🗺️ Use o chat para se comunicar com outros jogadores",
        "🎯 Role os dados usando a barra de ação inferior",
        "⭐ Críticos acontecem quando você tira o valor máximo do dado!",
        "🔥 Trabalhe em equipe para vencer desafios maiores",
        "📜 Cada sessão é única - aproveite a aventura!",
        "🌟 A sorte favorece os audaciosos!"
    ],
    
    async init() {
        console.log('🎮 Inicializando Loading Screen...');
        this.element = document.getElementById('game-loading-screen');
        this.bar = document.getElementById('loadingBar');
        this.percentage = document.getElementById('loadingPercentage');
        this.tips = document.getElementById('loadingTips');
        this.background = document.getElementById('loadingBackground');
        
        // Busca informações da mesa (incluindo imagem de loading)
        await this.loadTableInfo();
        
        // Inicia animação das dicas
        this.startTipsRotation();
        
        // Simula progresso gradual
        this.startProgressSimulation();
    },
    
    async loadTableInfo() {
        try {
            const tableId = 1; // Por enquanto usa mesa padrão
            const response = await fetch(`/api/table-info/${tableId}`);
            
            if (response.ok) {
                const tableInfo = await response.json();
                console.log('✅ Informações da mesa carregadas:', tableInfo);
                
                // Define imagem de background se disponível
                if (tableInfo.load_screen) {
                    this.background.src = tableInfo.load_screen;
                    this.background.style.display = 'block';
                } else {
                    // Usa cor de fundo padrão se não tiver imagem
                    this.element.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
            } else {
                console.warn('⚠️ Não foi possível carregar informações da mesa');
            }
        } catch (error) {
            console.error('❌ Erro ao buscar informações da mesa:', error);
        }
    },
    
    startTipsRotation() {
        let currentTipIndex = 0;
        
        // Mostra primeira dica
        this.tips.textContent = this.loadingTips[0];
        
        // Rotaciona dicas a cada 3 segundos
        setInterval(() => {
            currentTipIndex = (currentTipIndex + 1) % this.loadingTips.length;
            this.tips.style.opacity = '0';
            
            setTimeout(() => {
                this.tips.textContent = this.loadingTips[currentTipIndex];
                this.tips.style.opacity = '1';
            }, 300);
        }, 3000);
    },
    
    startProgressSimulation() {
        // Simula progresso gradual até 90%, depois aguarda conclusão real
        const simulationInterval = setInterval(() => {
            if (this.currentProgress < 90) {
                this.targetProgress = Math.min(90, this.currentProgress + Math.random() * 5);
            }
            
            // Animação suave do progresso
            const progressInterval = setInterval(() => {
                if (this.currentProgress < this.targetProgress) {
                    this.currentProgress += 0.5;
                    this.updateProgress(this.currentProgress);
                } else {
                    clearInterval(progressInterval);
                }
            }, 20);
            
            if (this.currentProgress >= 90) {
                clearInterval(simulationInterval);
            }
        }, 500);
    },
    
    updateProgress(progress) {
        const clampedProgress = Math.min(100, Math.max(0, progress));
        this.bar.style.width = `${clampedProgress}%`;
        this.percentage.textContent = `${Math.floor(clampedProgress)}%`;
    },
    
    setProgress(progress) {
        this.targetProgress = progress;
        this.currentProgress = progress;
        this.updateProgress(progress);
    },
    
    complete() {
        if (this.isComplete) return;
        this.isComplete = true;
        
        console.log('✅ Loading completo!');
        
        // Completa a barra até 100%
        this.targetProgress = 100;
        const finalInterval = setInterval(() => {
            if (this.currentProgress < 100) {
                this.currentProgress += 2;
                this.updateProgress(this.currentProgress);
            } else {
                clearInterval(finalInterval);
                this.hide();
            }
        }, 30);
    },
    
    hide() {
        console.log('🎭 Escondendo Loading Screen...');
        this.tips.textContent = '✨ Preparando entrada no jogo...';
        
        setTimeout(() => {
            this.element.classList.add('hidden');
            
            // Remove elemento do DOM após animação
            setTimeout(() => {
                this.element.classList.add('remove');
                console.log('✅ Loading Screen removida');
            }, 800);
        }, 500);
    }
};

// Inicializa loading screen assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    LoadingScreen.init();
});

let w = 1920; // Largura padrão do mundo (será atualizada dinamicamente)
let h = 1920; // Altura padrão do mundo (será atualizada dinamicamente)

// Objeto para armazenar dimensões dos mapas
window.mapDimensions = {
    current: { width: 1920, height: 1920 },
    cache: {} // Cache de dimensões por ID de mapa
};

// Função para buscar e atualizar dimensões do mapa
async function updateMapDimensions(mapId) {
    console.log(`🗺️ Atualizando dimensões do mapa ${mapId}...`);
    
    // Verifica cache primeiro
    if (window.mapDimensions.cache[mapId]) {
        const cached = window.mapDimensions.cache[mapId];
        console.log(`✅ Dimensões do mapa ${mapId} do cache:`, cached);
        applyMapDimensions(cached.width, cached.height);
        return cached;
    }
    
    try {
        const response = await fetch(`/api/maps/get/${mapId}`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar mapa: ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log(`✅ Dados do mapa ${mapId} recebidos:`, responseData);
        
        // Extrai o objeto map da resposta
        const mapData = responseData.map || responseData;
        
        // Usa width e height do banco de dados
        // x e y são coordenadas de spawn do jogador
        const mapWidth = mapData.width || 1920;
        const mapHeight = mapData.height || 1920;
        
        console.log(`📐 Dimensões do mapa "${mapData.nome}": ${mapWidth}x${mapHeight}px`);
        console.log(`📍 Spawn do jogador: x=${mapData.x}, y=${mapData.y}`);
        
        // Atualiza cache
        window.mapDimensions.cache[mapId] = {
            width: mapWidth,
            height: mapHeight,
            spawnX: mapData.x,
            spawnY: mapData.y,
            nome: mapData.nome
        };
        
        // Aplica dimensões
        applyMapDimensions(mapWidth, mapHeight);
        
        return { 
            width: mapWidth, 
            height: mapHeight, 
            spawnX: mapData.x,
            spawnY: mapData.y,
            nome: mapData.nome 
        };
    } catch (error) {
        console.error('❌ Erro ao buscar dimensões do mapa:', error);
        // Mantém dimensões atuais em caso de erro
        return window.mapDimensions.current;
    }
}

// Função para aplicar novas dimensões ao mundo do jogo
function applyMapDimensions(width, height) {
    console.log(`🔧 Aplicando dimensões: ${width}x${height}`);
    
    // Atualiza variáveis globais
    w = width;
    h = height;
    midw = parseInt(width / 2);
    midh = parseInt(height / 2);
    
    // Armazena dimensões atuais
    window.mapDimensions.current = { width, height };
    
    // Se o jogo já foi inicializado, atualiza os bounds
    if (window.game && window.game.scene && window.game.scene.scenes[0]) {
        const scene = window.game.scene.scenes[0];
        
        // Atualiza bounds da câmera
        if (scene.cameras && scene.cameras.main) {
            scene.cameras.main.setBounds(0, 0, width, height);
            console.log(`📷 Camera bounds atualizados: ${width}x${height}`);
        }
        
        // Atualiza bounds do mundo físico
        if (scene.physics && scene.physics.world) {
            scene.physics.world.setBounds(0, 0, width, height);
            console.log(`🌍 Physics world bounds atualizados: ${width}x${height}`);
        }
    }
    
    console.log(`✅ Dimensões aplicadas com sucesso`);
}

// Função para detectar dispositivos móveis
function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];
    
    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}

// Função para calcular dimensões responsivas
function getResponsiveDimensions() {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const isMobile = detectMob();
    
    // Considera elementos da UI que podem ocupar espaço
    const uiMargin = isMobile ? 10 : 5; // Margem menor para desktop
    
    // Calcula dimensões considerando a proporção ideal para jogos
    let gameWidth = Math.max(320, availableWidth - uiMargin);
    let gameHeight = Math.max(240, availableHeight - uiMargin);
    
    // Para dispositivos móveis, otimiza baseado na orientação
    if (isMobile) {
        if (availableHeight > availableWidth) {
            // Modo retrato - pode usar toda a largura
            gameWidth = availableWidth;
            gameHeight = availableHeight - 50; // Espaço para UI inferior
        } else {
            // Modo paisagem - pode usar toda a altura
            gameWidth = availableWidth - 50; // Espaço para UI lateral
            gameHeight = availableHeight;
        }
    }
    
    return {
        width: Math.floor(gameWidth),
        height: Math.floor(gameHeight)
    };
}

// Inicializa dimensões com valores padrão primeiro
var cw = window.innerWidth || 1024;
var ch = window.innerHeight || 768;

let dw;
let dh;
var zoom = 2;
var spriteMe = '';
var isMaster = false; // Flag para modo mestre/espectador
// var sprites = ['joaquim', 'isaac', 'peko', 'hyoma', 'master', 'sapo', 'fake', 'warrior', 'mage', 'ranger'];
var sprites = ['fake', 'warrior', 'mage', 'ranger'];
var aScene = 'hospital';
var person = window.location.href;

// Verifica se é modo mestre
if(person.includes('?master') || person.includes('&master')){
    isMaster = true;
    spriteMe = 'spectator';
    console.log('🎭 Modo Mestre/Espectador ativado');
} else {
    person = person.split("?p=");
    if(person[1]){
      spriteMe = person[1];
    }
    else{
      spriteMe = 'warrior'
    }
}


if((sprites.includes(spriteMe) == false) || spriteMe == null){
    spriteMe = 'warrior';
}

const mobile = detectMob();

// Função para ajustar configurações baseadas no dispositivo
function adjustForDevice() {
    // Agora mobile já está definido, pode calcular dimensões corretamente
    const dims = getResponsiveDimensions();
    cw = dims.width;
    ch = dims.height;
    
    // Garante dimensões mínimas válidas
    if (cw <= 0 || cw > 4000) {
        console.warn('Largura inválida detectada:', cw, 'usando fallback');
        cw = 1024;
    }
    if (ch <= 0 || ch > 4000) {
        console.warn('Altura inválida detectada:', ch, 'usando fallback');
        ch = 768;
    }
    
    console.log('Dimensões calculadas:', cw, 'x', ch, mobile ? '(mobile)' : '(desktop)');
    
    if(mobile) {
        zoom = 1.25;
        
        // Para mobile, ajusta baseado na orientação
        if(window.innerHeight > window.innerWidth) {
            // Modo retrato - mantém as dimensões normais
            // mas pode ajustar o zoom se necessário
            zoom = Math.min(1.5, zoom);
        } else {
            // Modo paisagem - pode usar um zoom menor
            zoom = Math.min(1.25, zoom);
        }
        
        $('#container-left').css("max-width", "28vw");
    }
    
    if(spriteMe == "fake"){
        zoom = 0.5;
    }
}

// Chama o ajuste inicial
adjustForDevice();

let midw = parseInt(w / 2);
let midh = parseInt(h / 2);

var config = {
  type: Phaser.AUTO, // AUTO faz fallback de WEBGL para CANVAS se necessário
  width: cw,
  height: ch,
  parent: 'game', // Especifica o container do jogo
  backgroundColor: '#C5DDEB', // Cor de fundo para debug
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: cw,
    height: ch
  },
  physics: {
      default: 'arcade',
      arcade: {
          debug: false
      }
  },
  fps: {
      target: 90,
      forceSetTimeOut: true
  },
  scene:{
    preload: Game.preload,
    create: Game.create,
    update: Game.update
  }
};

var collider;
var limitsTopLeft
var player;
var hp1;
var hc1;
var cursors;
var ts;
var iter = 0;
var bg;
var bgaux;
var fg;
var limits;
var roofs;
var roofsaux;
var guns;
var dashs;
var repulse = 2.5;
var indexCli;
var spriteCli;
var pause = false;
var vp = false;
var lastScene;
var newScene;

// window.history.replaceState('nextState', '', person[0]);

var collided = false;

let pressed = "";
let pressedH = "";
let pressedV = "";
let kv = 0;
let kh = 0;
let dash = 0;
let dashing = false;
let sprinted = false;
var velocity;
var fr = 0;
var recharged = true; 
var rechargedH = true;    
var p = false;
var send_test = 0;
var verifyed = 0;
var found = 0;
var playerids = [];
var movement = 'turn';
var powered = false;
var sended = false;
var saque = false;
var me = -1;
var indexMe;
var signal;
var direction;
var dead = false;
var danim = false;
var reached = false;
var masterIn = false;
var gun = false;
var capsulate = false;
var touchX = 0;
var touchY = 0;
var touched = 0;
var movePx = 0;
var movePy = 0;
var round;
var analog;
var pointer;
var rpx, rpy;
var apx, apy;
var doors;
var doorset = 0;
var doorvars;

console.log('Configuração do Phaser:', config);
console.log('Dimensões calculadas:', cw, 'x', ch);
console.log('Container do jogo:', document.getElementById('game'));

// INICIALIZAÇÃO DO WEBSOCKET ANTES DO PHASER
console.log('🔌 Iniciando WebSocket ANTES do Phaser...');

// Função para criar o jogo Phaser após WebSocket conectar
function createPhaserGame() {
    console.log('🎮 Criando jogo Phaser...');
    window.game = new Phaser.Game(config);
    console.log('Jogo Phaser criado:', window.game);
    
    // Monitora eventos do Phaser
    window.game.events.on('ready', () => {
        console.log('Phaser está pronto');
        updateLoadingStatus('phaser', true);
    });
    
    // Referência global para compatibilidade
    game = window.game;
}

// Aguarda WebSocket conectar antes de criar o Phaser
let websocketWaitAttempts = 0;
const maxWebsocketWaitAttempts = 50; // 5 segundos máximo

function waitForWebSocketThenCreateGame() {
    websocketWaitAttempts++;
    
    if (window.socket && window.socket.connected) {
        console.log('✅ WebSocket conectado - criando jogo Phaser');
        createPhaserGame();
    } else if (websocketWaitAttempts >= maxWebsocketWaitAttempts) {
        console.warn('⚠️ Timeout na conexão WebSocket - criando jogo sem WebSocket');
        createPhaserGame();
    } else {
        console.log(`⏳ Aguardando WebSocket conectar... (${websocketWaitAttempts}/${maxWebsocketWaitAttempts})`);
        setTimeout(waitForWebSocketThenCreateGame, 100);
    }
}

// Inicia WebSocket e aguarda conexão
if (typeof io !== 'undefined') {
    console.log('Socket.IO carregado, conectando...');
    window.socket = io();
    
    window.socket.on('connect', function() {
        console.log('Socket.IO conectado com sucesso');
        window.initDiagnostic.log('WebSocket Connected', 'OK');
        
        // TESTE DIRETO: adiciona um listener simples AQUI MESMO
        console.log('🧪 Adicionando listener de teste direto no window.socket');
        window.socket.on('chatMessage', function(data) {
            console.log('🎉 SUCESSO! Mensagem recebida direto no window.socket:', data);
        });
        window.socket.on('diceRoll', function(data) {
            console.log('🎉 SUCESSO! Dado recebido direto no window.socket:', data);
        });
        
        // Configura eventos do Client agora que o socket está disponível
        console.log('🔧 Configurando Client.socket após conexão...');
        console.log('🔍 Client existe?', typeof Client !== 'undefined');
        console.log('🔍 Client.initializeSocket existe?', typeof Client?.initializeSocket === 'function');
        
        if (typeof Client !== 'undefined') {
            if (typeof Client.initializeSocket === 'function') {
                const success = Client.initializeSocket();
                console.log('🔧 Client.initializeSocket resultado:', success);
            } else if (typeof Client.setupSocketEvents === 'function') {
                console.log('⚠️ Usando fallback: setupSocketEvents direto');
                Client.socket = window.socket;
                Client.setupSocketEvents();
            } else {
                console.error('❌ Client não tem métodos de inicialização disponíveis!');
            }
        } else {
            console.error('❌ Client não está definido!');
        }
        
        // Atualiza status de carregamento
        if (typeof updateLoadingStatus === 'function') {
            updateLoadingStatus('websocket', true);
        }
    });
    
    window.socket.on('disconnect', function() {
        console.log('Socket.IO desconectado');
        if (typeof updateLoadingStatus === 'function') {
            updateLoadingStatus('websocket', false);
        }
    });
    
    // Inicia verificação de conexão
    waitForWebSocketThenCreateGame();
} else {
    console.error('❌ Socket.IO não carregado, criando jogo sem WebSocket');
    createPhaserGame();
}

// Referência global para compatibilidade (será definida quando o jogo for criado)
var game;

// Sistema de diagnóstico detalhado
window.initDiagnostic = {
    steps: [],
    startTime: Date.now(),
    log: function(step, status, details = '') {
        const timestamp = Date.now() - this.startTime;
        const entry = {
            step,
            status, // 'START', 'OK', 'FAIL', 'WARN'
            details,
            timestamp
        };
        this.steps.push(entry);
        
        const emoji = {
            'START': '🔵',
            'OK': '✅',
            'FAIL': '❌', 
            'WARN': '⚠️'
        };
        
        console.log(`${emoji[status]} [${timestamp}ms] ${step}${details ? ': ' + details : ''}`);
    },
    
    getReport: function() {
        console.log('\n=== RELATÓRIO DE INICIALIZAÇÃO ===');
        this.steps.forEach(entry => {
            console.log(`${entry.timestamp}ms - ${entry.status} - ${entry.step}${entry.details ? ': ' + entry.details : ''}`);
        });
        console.log('===================================\n');
        return this.steps;
    }
};

// Inicia diagnóstico
window.initDiagnostic.log('Sistema iniciado', 'START', `Tentativa #${window.loadingAttempts}`);

// Função para mostrar relatório no console (para debug)
window.showInitReport = function() {
    return window.initDiagnostic.getReport();
};

// Comandos de diagnóstico disponíveis no console
window.debugCommands = {
    report: () => window.initDiagnostic.getReport(),
    status: () => console.log('Status:', window.loadingStatus),
    cache: () => showCacheStatus(),
    reload: () => window.location.reload(),
    hardReload: () => window.location.reload(true),
    clearCache: () => {
        localStorage.setItem('rpg_loading_attempts', '0');
        console.log('Cache counter cleared');
    }
};

// Comandos de teste para reproduzir problemas
window.testCommands = {
    normalReload: () => {
        console.log('� Executando reload normal...');
        location.reload();
    },
    hardReload: () => {
        console.log('⚡ Executando hard reload...');
        location.reload(true);
    },
    testSequence: () => {
        console.log('🧪 Iniciando sequência de teste...');
        setTimeout(() => {
            console.log('🔄 Reload #1...');
            location.reload();
        }, 2000);
    },
    simulateFailure: () => {
        console.log('💥 Simulando falha (contador = 1)...');
        localStorage.setItem('rpg_loading_attempts', '1');
        location.reload();
    }
};

console.log('�🔧 Comandos de diagnóstico disponíveis:');
console.log('- debugCommands.report() - Relatório detalhado');
console.log('- debugCommands.status() - Status atual');  
console.log('- debugCommands.cache() - Info do cache');
console.log('- debugCommands.reload() - Reload normal');
console.log('- debugCommands.hardReload() - Hard reload');
console.log('- debugCommands.clearCache() - Limpar contador cache');
console.log('🧪 Comandos de teste disponíveis:');
console.log('- testCommands.normalReload() - Teste reload normal');
console.log('- testCommands.hardReload() - Teste hard reload');
console.log('- testCommands.testSequence() - Sequência de teste');
console.log('- testCommands.simulateFailure() - Simular falha');

// Timeout para mostrar relatório se não inicializar
setTimeout(() => {
    if (!window.systemReady) {
        console.error('⏰ Sistema não inicializou em 10 segundos - mostrando relatório:');
        window.initDiagnostic.getReport();
    }
}, 10000);

// Função de debug para mostrar status do cache
function showCacheStatus() {
    const attempts = parseInt(localStorage.getItem('rpg_loading_attempts') || '0');
    console.log('=== STATUS DO CACHE ===');
    console.log('Tentativas de carregamento:', attempts);
    console.log('Cache busting:', attempts > 1 ? 'ATIVO' : 'INATIVO');
    console.log('Hard refresh será forçado após:', window.maxLoadingAttempts, 'tentativas');
    console.log('Para forçar hard refresh agora: localStorage.setItem("rpg_loading_attempts", "3"); location.reload();');
    console.log('Para limpar cache: localStorage.setItem("rpg_loading_attempts", "0");');
    console.log('=====================');
}

// Mostra status do cache no console
showCacheStatus();

// Sistema de monitoramento de carregamento com sincronização
window.loadingStatus = {
    phaser: false,
    websocket: false,
    player: false,
    assets: false,
    scene: false
};

window.initializationQueue = [];
window.systemReady = false;
window.loadingAttempts = parseInt(localStorage.getItem('rpg_loading_attempts') || '0');
window.maxLoadingAttempts = 3;

// Função para atualizar status de carregamento
function updateLoadingStatus(component, status) {
    window.loadingStatus[component] = status;
    console.log('Status de carregamento:', window.loadingStatus);
    
    // Atualiza barra de progresso do LoadingScreen
    const components = Object.keys(window.loadingStatus);
    const loadedComponents = components.filter(c => window.loadingStatus[c] === true).length;
    const progress = (loadedComponents / components.length) * 90; // Até 90% para componentes
    
    if (LoadingScreen && !LoadingScreen.isComplete) {
        LoadingScreen.setProgress(Math.max(LoadingScreen.currentProgress, progress));
    }
    
    // Verifica se todos os componentes essenciais estão carregados
    const essentialComponents = ['phaser', 'websocket', 'assets', 'scene'];
    const essentialsLoaded = essentialComponents.every(comp => window.loadingStatus[comp] === true);
    
    if (essentialsLoaded && !window.systemReady) {
        console.log('🔄 Componentes essenciais carregados, iniciando sistema...');
        window.systemReady = true;
        // Reset contador de tentativas quando carrega com sucesso
        localStorage.setItem('rpg_loading_attempts', '0');
        
        // Completa o loading screen antes de inicializar
        if (LoadingScreen && !LoadingScreen.isComplete) {
            LoadingScreen.complete();
        }
        
        // Aguarda um pouco para a animação do loading antes de inicializar
        setTimeout(() => {
            initializeGameSystem();
        }, 1000);
    }
}

// Função para detectar falha de carregamento e forçar hard refresh
function detectLoadingFailure() {
    // Timeout rápido para detectar tela preta
    setTimeout(() => {
        if (!window.bg || !window.limits) {
            console.error('❌ Tela preta detectada - objetos de fundo não criados');
            handleLoadingFailure('Tela preta detectada');
        }
    }, 3000); // 3 segundos para tela preta
    
    // Timeout geral para sistema não pronto
    setTimeout(() => {
        if (!window.systemReady) {
            console.error('❌ Falha na inicialização detectada após timeout');
            handleLoadingFailure('Sistema não inicializou');
        }
    }, 8000); // 8 segundos timeout geral
}

// Função centralizada para lidar com falhas de carregamento
function handleLoadingFailure(reason) {
    console.error(`❌ Motivo da falha: ${reason}`);
    window.initDiagnostic.log('Loading Failure', 'FAIL', reason);
    window.initDiagnostic.getReport(); // Mostra relatório completo
    
    // Sistema de auto-reload RE-HABILITADO após diagnóstico bem-sucedido
    console.log('🱦 Auto-reload HABILITADO - sistema funcionará normalmente');
    console.log(`� Tentativa ${window.loadingAttempts}/${window.maxLoadingAttempts}`);
    
    // Continua com a lógica normal de auto-reload
    
    if (window.loadingAttempts >= window.maxLoadingAttempts) {
        console.error('❌ Múltiplas falhas detectadas, forçando hard refresh');
        localStorage.setItem('rpg_loading_attempts', '0');
        
        // Força hard refresh (equivalente a Shift+F5)
        if (typeof addSystemMessage === 'function') {
            addSystemMessage('⚠️ Detectado problema de cache. Recarregando...');
        }
        
        setTimeout(() => {
            // window.location.reload(true); // Force reload from server
        }, 1000);
    } else {
        console.warn('⚠️ Tentando reload com cache busting');
        if (typeof addSystemMessage === 'function') {
            addSystemMessage(`⚠️ ${reason}. Tentando novamente...`);
        }
        
        setTimeout(() => {
            // window.location.reload();
        }, 1000);
    }
}

// Função para inicializar o sistema quando tudo estiver pronto
function initializeGameSystem() {
    console.log('🚀 Inicializando sistema do jogo...');
    
    // Verifica se já passou o tempo mínimo de 5 segundos
    const startTime = window.gameLoadStartTime || Date.now();
    const elapsed = Date.now() - startTime;
    const minimumWait = 100; // 5 segundos mínimos
    const remainingWait = Math.max(0, minimumWait - elapsed);
    
    if (remainingWait > 0) {
        console.log(`⏳ Aguardando ${remainingWait}ms para completar os 5 segundos mínimos de loading`);
        // Removido: mensagem de loading desnecessária
        
        setTimeout(() => {
            initializeGameSystem(); // Chama novamente quando o tempo mínimo for atingido
        }, remainingWait);
        return;
    }
    
    // Removido: mensagem de sincronização desnecessária
    
    // Adiciona um delay mínimo para garantir estabilidade
    setTimeout(() => {
        // Executa todas as funções na fila de inicialização
        window.initializationQueue.forEach(fn => {
            try {
                fn();
            } catch (e) {
                console.error('Erro na fila de inicialização:', e);
            }
        });
        
        window.initializationQueue = [];
        
        // Inicia o jogador
        if (window.game && window.game.scene && window.game.scene.scenes[0]) {
            const scene = window.game.scene.scenes[0];
            if (scene.initializePlayerWithRetry) {
                scene.initializePlayerWithRetry(spriteMe);
            } else if (Game.initializePlayerWithRetry) {
                Game.initializePlayerWithRetry(spriteMe);
            }
        }
        
        console.log('✅ Sistema totalmente inicializado!');
        // Removido: mensagem de sistema carregado
        
        // Solicita histórico agora que tudo está pronto
        if (Client.socket && Client.socket.connected) {
            console.log('📚 Sistema pronto - solicitando histórico completo...');
            Client.socket.emit('getFullHistory', 100);  // 100 últimos itens
        }
    }, 800); // Aumentado para 800ms para maior estabilidade
}

// Função para mostrar progresso de loading durante os 5 segundos mínimos
function showLoadingProgress(remainingTime) {
    console.log(`⏳ Iniciando loading de estabilização: ${remainingTime}ms restantes`);
    
    // Removido: mensagem de estabilização desnecessária
    
    // Mostra progresso a cada segundo
    const interval = setInterval(() => {
        const currentTime = Date.now();
        const startTime = window.gameLoadStartTime || currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(100, (elapsed / 100) * 100);

        console.log(`📊 Progresso de loading: ${progress.toFixed(1)}% (${elapsed}ms de 100ms)`);

        if (progress >= 100) {
            clearInterval(interval);
            console.log('✅ Loading de estabilização concluído');
            // Removido: mensagem de carregamento completo
        }
    }, 100);
    
    // Limpa o interval se necessário
    setTimeout(() => {
        clearInterval(interval);
    }, remainingTime + 100);
}

// Função para adicionar ações à fila de inicialização
function queueInitialization(fn) {
    if (window.systemReady) {
        fn(); // Se já está pronto, executa imediatamente
    } else {
        window.initializationQueue.push(fn);
    }
}

// Inicia detecção de falha de carregamento
console.log(`Iniciando sistema - Tentativa #${window.loadingAttempts}/${window.maxLoadingAttempts}`);
detectLoadingFailure();

// Função para redimensionar o jogo
function resizeGame() {
    const oldWidth = cw;
    const oldHeight = ch;
    
    adjustForDevice();
    
    // Define um threshold mínimo para evitar redimensionamentos desnecessários
    const widthDiff = Math.abs(oldWidth - cw);
    const heightDiff = Math.abs(oldHeight - ch);
    const threshold = 10; // pixels
    
    // Só redimensiona se a diferença for significativa
    if (game && game.scale && (widthDiff > threshold || heightDiff > threshold)) {
        console.log(`Redimensionando jogo: ${oldWidth}x${oldHeight} -> ${cw}x${ch}`);
        
        try {
            // Atualiza a configuração do Phaser
            game.scale.resize(cw, ch);
            
            // Atualiza variáveis globais que podem ser usadas no jogo
            midw = parseInt(w / 2);
            midh = parseInt(h / 2);
            
            // Se o jogo já foi criado, pode chamar uma função de reposicionamento
            if (typeof Game !== 'undefined' && Game.resize) {
                Game.resize(cw, ch);
            }
        } catch (error) {
            console.error('Erro ao redimensionar:', error);
        }
    }
}

// Listener para redimensionamento da janela
window.addEventListener('resize', function() {
    // Usa debounce para evitar muitas chamadas durante o redimensionamento
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(resizeGame, 300); // Aumenta o delay para evitar instabilidade
});

// Listener para mudança de orientação em dispositivos móveis
window.addEventListener('orientationchange', function() {
    setTimeout(resizeGame, 500); // Aguarda um pouco para a orientação ser aplicada
});

// click to full screen
function toggleFullscreen(elem) {
    elem = elem || document.documentElement;
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
  $('#clickFullscreen').on('click', function () {
    toggleFullscreen();
  });

  function roll(dado){
    // Usa a nova função rollDice se estiver disponível
    if (typeof rollDice === 'function') {
        rollDice(dado);
        return;
    }
    
    // Fallback para sistema antigo
    var valor = Math.floor(Math.random() * dado) + 1;
    
    if(valor == 1){
      var color = `class="text-danger" `;
    }
    else if(valor == dado){
      var color = `class="text-success" `;
    }
    else{
      var color = `class="text-dark" `;
    }

    var data = `<li>
                    <div class="message-data">
                      <h5><span class="message-data-name" style="text-transform:capitalize;">${spriteMe}</span></h5>
                    </div>
                    <div class="message my-message">
                    <div style="margin-bottom: 3px;"><h4 style="color: black;">Rolando D${dado}</h4></div>
                    <span style="margin-bottom: 3px; border: solid 1px #183153; padding: 3px;"><strong ${color}style="font-size: 20px;">${valor}</strong></span>
                    </div>
                </li>`

    // Adiciona ao chat moderno se disponível
    if (typeof addDiceMessage === 'function') {
        addDiceMessage({
            player: spriteMe,
            content: `Rolou D${dado}`,
            result: valor,
            sides: dado,
            timestamp: new Date().toISOString(),
            type: 'roll'
        });
    }
    
    Client.sendRoll(data);
  }

// === SISTEMA DE CHAT INTERATIVO ===

// Estado do chat
let chatMinimized = false; // Chat começa expandido
let messageHistory = [];

// Inicializa o chat quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
});

// Inicialização do chat
function initializeChat() {
    console.log('Inicializando chat interativo...');
    
    // Configura eventos
    setupChatEvents();
    
    // Cria barra de ações
    createActionBar();
    
    // Adiciona mensagem de boas-vindas
    // Teste de conectividade do chat
    setTimeout(() => {
        console.log('🧪 Testando conectividade do chat...');
        if (Client.socket && Client.socket.connected) {
            console.log('✅ WebSocket ativo - chat deve funcionar');
            console.log('🔍 Client.socket:', Client.socket);
            console.log('🔍 Client.socket.emit existe?', typeof Client.socket.emit === 'function');
            
            // Teste de envio
            window.testChatSend = function() {
                console.log('🧪 Teste manual de envio de mensagem');
                const testMsg = {
                    player: 'test',
                    content: 'Mensagem de teste',
                    timestamp: new Date().toISOString(),
                    type: 'message'
                };
                console.log('📤 Enviando:', testMsg);
                Client.socket.emit('chatMessage', testMsg);
                console.log('✅ Emit executado');
            };
            
            // Teste usando window.socket direto
            window.testDirectSend = function() {
                console.log('🧪 Teste DIRETO usando window.socket');
                const testMsg = {
                    player: 'test-direct',
                    content: 'Teste direto window.socket',
                    timestamp: new Date().toISOString(),
                    type: 'message',
                    tableId: 1  // Adiciona table_id
                };
                console.log('📤 Enviando via window.socket:', testMsg);
                window.socket.emit('chatMessage', testMsg);
                console.log('✅ Emit direto executado');
            };
            
            console.log('💡 Para testar: testChatSend() ou testDirectSend()');
            console.log('💡 Para recarregar histórico: refreshChatHistory()');
        } else {
            console.warn('❌ WebSocket inativo - chat não funcionará');
            console.log('🔍 Client.socket:', Client.socket);
            console.log('🔍 window.socket:', window.socket);
        }
    }, 2000);
    
    // Atualiza contador de jogadores
    updatePlayerCount(1);
}

// Configura eventos do chat
function setupChatEvents() {
    const messageInput = document.getElementById('messageInput');
    
    if (messageInput) {
        // Enter para enviar mensagem
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Auto-focus quando expandir
        messageInput.addEventListener('focus', function() {
            if (chatMinimized) {
                toggleChat();
            }
        });
    }
}

// Toggle do chat (expandir/minimizar)
function toggleChat() {
    const container = document.getElementById('chat-container');
    const icon = document.getElementById('toggleIcon');
    
    if (container && icon) {
        chatMinimized = !chatMinimized;
        
        if (chatMinimized) {
            container.classList.add('minimized');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        } else {
            container.classList.remove('minimized');
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
            
            // Focus no input quando expandir
            setTimeout(() => {
                const input = document.getElementById('messageInput');
                if (input) input.focus();
            }, 300);
        }
    }
}

// Enviar mensagem
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input?.value.trim();
    
    if (!message) return;
    
    // Limita tamanho da mensagem
    if (message.length > 200) {
        addSystemMessage('Mensagem muito longa (máximo 200 caracteres)');
        return;
    }
    
    // Cria objeto da mensagem
    const messageData = {
        player: spriteMe,
        content: message,
        timestamp: new Date().toISOString(),
        type: 'message',
        tableId: 1  // Mesa de Teste 1
    };
    
    // Debug: verifica estado do socket
    console.log('🔍 Debug sendMessage:', {
        hasClientSocket: !!Client.socket,
        socketConnected: Client.socket?.connected,
        hasEmitFunction: typeof Client.socket?.emit === 'function',
        messageData: messageData
    });
    
    // Envia via WebSocket (o servidor retornará para todos, incluindo remetente)
    if (Client.socket && typeof Client.socket.emit === 'function') {
        console.log('📤 Enviando mensagem via WebSocket');
        Client.socket.emit('chatMessage', messageData);
    } else {
        console.warn('❌ WebSocket não disponível - adicionando localmente');
        // Adiciona localmente apenas se desconectado
        addMessage(messageData);
        addSystemMessage('Desconectado do servidor - mensagem não foi enviada');
    }
    
    // Limpa input
    input.value = '';
}

// Rolar dados (função melhorada)
function rollDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    
    // Determina cor baseada no resultado
    let resultClass = 'text-dark';
    if (result === 1) {
        resultClass = 'text-danger';
    } else if (result === sides) {
        resultClass = 'text-success';
    }
    
    // Cria mensagem de dado
    const diceMessage = {
        player: spriteMe,
        content: `Rolou D${sides}`,
        result: result,
        sides: sides,
        timestamp: new Date().toISOString(),
        type: 'roll',
        tableId: 1  // Mesa de Teste 1
    };
    
    // Debug: verifica estado do socket
    console.log('🎲 Debug rollDice:', {
        hasClientSocket: !!Client.socket,
        socketConnected: Client.socket?.connected,
        hasEmitFunction: typeof Client.socket?.emit === 'function',
        diceMessage: diceMessage
    });
    
    // Envia via WebSocket (o servidor retornará para todos, incluindo remetente)
    if (Client.socket && typeof Client.socket.emit === 'function') {
        console.log('📤 Enviando rolagem via WebSocket');
        Client.socket.emit('diceRoll', diceMessage);
    } else {
        console.warn('❌ WebSocket não disponível - adicionando localmente');
        // Adiciona localmente apenas se desconectado
        addDiceMessage(diceMessage);
        addSystemMessage('Desconectado do servidor - rolagem não foi enviada');
    }
    
    // Expande chat se minimizado
    if (chatMinimized) {
        toggleChat();
    }
}

// Adicionar mensagem à interface
function addMessage(messageData) {
    console.log('📝 addMessage chamada:', messageData);
    
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) {
        console.error('❌ messagesList não encontrado em addMessage');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item';
    
    const playerName = messageData.player || 'Jogador';
    const content = escapeHtml(messageData.content);
    const time = new Date(messageData.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageElement.innerHTML = `
        <div class="message-player">${playerName} - ${time}</div>
        <div class="message-content">${content}</div>
    `;
    
    messagesList.appendChild(messageElement);
    console.log('✅ Mensagem adicionada ao DOM');
    scrollToBottom();
    
    // Limita histórico a 100 mensagens
    if (messagesList.children.length > 100) {
        messagesList.removeChild(messagesList.firstChild);
    }
}

// Adicionar mensagem de dado
function addDiceMessage(diceData) {
    console.log('🎲 addDiceMessage chamada:', diceData);
    
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) {
        console.error('❌ messagesList não encontrado em addDiceMessage');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item roll';
    
    const playerName = diceData.player || 'Jogador';
    const time = new Date(diceData.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // CORREÇÃO: Verifica se é rolagem única ou múltipla
    let result = diceData.result;
    if (!result && diceData.results && diceData.results.length > 0) {
        result = diceData.results[0];
    }
    
    const sides = diceData.sides || 20;
    
    let resultClass = '';
    if (result === 1) {
        resultClass = 'color: #e74c3c;';
    } else if (result === sides) {
        resultClass = 'color: #27ae60;';
    }
    
    messageElement.innerHTML = `
        <div class="message-player">${playerName} - ${time}</div>
        <div class="message-content">
            🎲 Rolou D${sides}: <strong style="${resultClass}">${result}</strong>
        </div>
    `;
    
    messagesList.appendChild(messageElement);
    console.log('✅ Rolagem adicionada ao DOM');
    scrollToBottom();
    
    // Usa a função original também para compatibilidade
    if (typeof roll === 'function') {
        // Não chama roll() aqui para evitar duplicação
    }
}

// Adicionar mensagem do sistema
function addSystemMessage(content) {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item system';
    
    const time = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageElement.innerHTML = `
        <div class="message-player">Sistema - ${time}</div>
        <div class="message-content">ℹ️ ${escapeHtml(content)}</div>
    `;
    
    messagesList.appendChild(messageElement);
    scrollToBottom();
}

// Rolar para o final das mensagens
function scrollToBottom() {
    const messagesArea = document.getElementById('messagesArea');
    if (messagesArea) {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
}

// Atualizar contador de jogadores
function updatePlayerCount(count) {
    const playerCountElement = document.getElementById('playerCount');
    if (playerCountElement) {
        playerCountElement.textContent = count;
    }
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// BARRA DE AÇÕES
// ========================================

function createActionBar() {
    console.log('🎮 Criando barra de ações...');
    
    // Remove barra anterior se existir
    const existingBar = document.querySelector('.action-bar');
    if (existingBar) {
        existingBar.remove();
    }
    
    // Cria barra de ações
    const actionBar = document.createElement('div');
    actionBar.className = 'action-bar';
    
    // Monta o HTML base com os dados
    let actionBarHTML = `
        <div class="action-dropdown" id="diceDropdown">
            <button class="action-btn" id="diceDropdownBtn">
                <span class="icon">🎲</span>
                <span>Rolar Dado</span>
                <span class="arrow">▼</span>
            </button>
            <div class="action-menu">
                ${createDiceMenuItem(4)}
                ${createDiceMenuItem(6)}
                ${createDiceMenuItem(8)}
                ${createDiceMenuItem(10)}
                ${createDiceMenuItem(12)}
                ${createDiceMenuItem(20)}
                ${createDiceMenuItem(100)}
            </div>
        </div>
    `;
    
    // 🎭 Adiciona botão do espectador se for modo mestre
    if (isMaster) {
        console.log('🎭 Adicionando botão do espectador à action-bar');
        actionBarHTML += `
            <button class="action-btn" id="toggleSpectatorBtn" onclick="toggleSpectatorPanel()" title="Mostrar/ocultar painel do espectador">
                <i class="fas fa-eye"></i>
                <span class="action-label">Espectador</span>
            </button>
        `;
    }
    
    actionBar.innerHTML = actionBarHTML;
    document.body.appendChild(actionBar);
    console.log('✅ Barra de ações criada');
    
    // Adiciona event listener para o botão principal
    setTimeout(() => {
        const dropdownBtn = document.getElementById('diceDropdownBtn');
        if (dropdownBtn) {
            dropdownBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleDropdown('diceDropdown');
                console.log('🎲 Dropdown toggle clicked');
            });
            console.log('✅ Event listener do botão adicionado');
        } else {
            console.error('❌ Botão do dropdown não encontrado');
        }
        
        // Adiciona event listeners para os submenus usando delegação
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('submenu-item')) {
                e.stopPropagation();
                const sides = parseInt(e.target.getAttribute('data-sides'));
                const count = parseInt(e.target.getAttribute('data-count'));
                console.log(`🎲 Submenu clicked: ${count}x D${sides}`);
                rollMultipleDice(sides, count);
            }
        });
        console.log('✅ Event listeners dos submenus configurados');
    }, 100);
    
    // Fecha dropdown ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.action-dropdown')) {
            document.querySelectorAll('.action-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

function createDiceMenuItem(sides) {
    return `
        <div class="dropdown-item">
            <span class="dice-icon">🎲</span>
            <span>D${sides}</span>
            <span class="arrow-right">►</span>
            <div class="dropdown-submenu">
                ${[1, 2, 3, 4, 5].map(count => `
                    <div class="submenu-item" data-sides="${sides}" data-count="${count}">
                        ${count}x D${sides}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function toggleDropdown(id) {
    console.log('🔽 toggleDropdown chamado para:', id);
    const dropdown = document.getElementById(id);
    if (!dropdown) {
        console.error('❌ Dropdown não encontrado:', id);
        return;
    }
    
    const isActive = dropdown.classList.contains('active');
    console.log('📊 Estado atual:', isActive ? 'ativo' : 'inativo');
    
    // Fecha todos os dropdowns
    document.querySelectorAll('.action-dropdown').forEach(d => {
        d.classList.remove('active');
    });
    
    // Abre o dropdown clicado se não estava ativo
    if (!isActive) {
        dropdown.classList.add('active');
        console.log('✅ Dropdown aberto');
    } else {
        console.log('✅ Dropdown fechado');
    }
}

// ========================================
// SISTEMA DE ROLAGEM MÚLTIPLA DE DADOS
// ========================================

function rollMultipleDice(sides, count) {
    console.log(`🎲 Rolando ${count}x D${sides}`);
    
    // Fecha dropdown
    document.querySelectorAll('.action-dropdown').forEach(d => {
        d.classList.remove('active');
    });
    
    // Rola todos os dados
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * sides) + 1);
    }
    
    // Analisa resultados
    const analysis = analyzeDiceRolls(results, sides);
    
    // Cria mensagem de dado múltiplo
    const diceMessage = {
        player: spriteMe,
        sides: sides,
        count: count,
        results: results,
        analysis: analysis,
        timestamp: new Date().toISOString(),
        type: 'roll',
        tableId: 1
    };
    
    console.log('🎲 Resultados:', results);
    console.log('📊 Análise:', analysis);
    
    // Envia via WebSocket
    if (Client.socket && typeof Client.socket.emit === 'function') {
        console.log('📤 Enviando rolagem múltipla via WebSocket');
        Client.socket.emit('diceRoll', diceMessage);
    } else {
        console.warn('❌ WebSocket não disponível - adicionando localmente');
        addMultipleDiceMessage(diceMessage);
        addSystemMessage('Desconectado do servidor - rolagem não foi enviada');
    }
}

function analyzeDiceRolls(results, sides) {
    const max = Math.max(...results);
    const min = Math.min(...results);
    const sum = results.reduce((a, b) => a + b, 0);
    const avg = (sum / results.length).toFixed(1);
    
    return {
        max: max,
        min: min,
        sum: sum,
        avg: avg,
        hasCriticalSuccess: results.some(r => r === sides),
        hasCriticalFailure: results.some(r => r === 1)
    };
}

function getClassForResult(result, sides, analysis) {
    // Prioridade: Críticos > Highest/Lowest > Normal
    
    // Verde: Sucesso crítico (top do dado)
    if (result === sides) {
        return 'dice-critical-success';
    }
    
    // Vermelho: Falha crítica (base do dado, geralmente 1)
    if (result === 1) {
        return 'dice-critical-failure';
    }
    
    // Amarelo: Rolagem mais alta (se não for crítico)
    if (result === analysis.max && !analysis.hasCriticalSuccess) {
        return 'dice-highest';
    }
    
    // Laranja: Rolagem mais baixa (se não for crítico)
    if (result === analysis.min && !analysis.hasCriticalFailure) {
        return 'dice-lowest';
    }
    
    // Normal
    return 'dice-normal';
}

function addMultipleDiceMessage(diceData) {
    console.log('🎲 addMultipleDiceMessage chamada:', diceData);
    
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) {
        console.error('❌ messagesList não encontrado em addMultipleDiceMessage');
        return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message-item roll';
    
    const playerName = diceData.player || 'Jogador';
    const time = new Date(diceData.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Se for rolagem única (compatibilidade)
    if (!diceData.results || diceData.results.length === 1) {
        const result = diceData.result || diceData.results[0];
        let resultClass = '';
        if (result === 1) {
            resultClass = 'color: #e74c3c;';
        } else if (result === diceData.sides) {
            resultClass = 'color: #27ae60;';
        }
        
        messageElement.innerHTML = `
            <div class="message-player">${playerName} - ${time}</div>
            <div class="message-content">
                🎲 Rolou D${diceData.sides}: <strong style="${resultClass}">${result}</strong>
            </div>
        `;
    } else {
        // Rolagem múltipla
        const resultsHTML = diceData.results.map(result => {
            const cssClass = getClassForResult(result, diceData.sides, diceData.analysis);
            return `<span class="dice-result ${cssClass}">${result}</span>`;
        }).join('');
        
        messageElement.innerHTML = `
            <div class="message-player">${playerName} - ${time}</div>
            <div class="message-content">
                🎲 Rolou ${diceData.count}x D${diceData.sides}:<br>
                ${resultsHTML}
                <div class="dice-summary">
                    <strong>Total:</strong> ${diceData.analysis.sum} | 
                    <strong>Média:</strong> ${diceData.analysis.avg} | 
                    <strong>Maior:</strong> ${diceData.analysis.max} | 
                    <strong>Menor:</strong> ${diceData.analysis.min}
                </div>
            </div>
        `;
    }
    
    messagesList.appendChild(messageElement);
    console.log('✅ Rolagem adicionada ao DOM');
    scrollToBottom();
}


// === FUNÇÕES DE TESTE E DEBUG ===

// Função para testar o chat (pode ser chamada no console)
window.testChat = function() {
    console.log('Testando chat...');
    
    // Testa mensagens
    addMessage({
        player: 'TestPlayer',
        content: 'Esta é uma mensagem de teste!',
        timestamp: new Date().toISOString(),
        type: 'message'
    });
    
    // Testa dados
    setTimeout(() => {
        addDiceMessage({
            player: 'TestPlayer',
            content: 'Rolou D20',
            result: Math.floor(Math.random() * 20) + 1,
            sides: 20,
            timestamp: new Date().toISOString(),
            type: 'roll'
        });
    }, 1000);
    
    // Testa sistema
    setTimeout(() => {
        addSystemMessage('Mensagem de teste do sistema');
    }, 2000);
    
    // Expande chat
    if (chatMinimized) {
        toggleChat();
    }
};

// Função para limpar chat (útil para testes)
window.clearChat = function() {
    const messagesList = document.getElementById('messagesList');
    if (messagesList) {
        messagesList.innerHTML = '';
    }
};

// === FUNÇÕES DE CARREGAMENTO DE HISTÓRICO ===

// Carrega histórico de mensagens do banco de dados
function loadChatHistory(messages) {
    console.log('📚 loadChatHistory chamada com', messages.length, 'mensagens');
    console.log('📝 Mensagens:', messages);
    
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) {
        console.error('❌ messagesList não encontrado!');
        return;
    }
    
    console.log('✅ messagesList encontrado');
    
    // Remove indicador de carregamento se existir
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
        console.log('🗑️ Indicador de carregamento removido');
    }
    
    // Limpa mensagens de demonstração mas mantém mensagem de boas-vindas
    const welcomeMessages = messagesList.querySelectorAll('.message-item.system');
    const welcomeMessage = welcomeMessages[0]; // Primeira mensagem do sistema (boas-vindas)
    
    messagesList.innerHTML = '';
    
    // Restaura mensagem de boas-vindas
    if (welcomeMessage) {
        messagesList.appendChild(welcomeMessage);
        console.log('✅ Mensagem de boas-vindas restaurada');
    }
    
    // Adiciona mensagens do histórico
    console.log('➕ Adicionando mensagens ao chat...');
    messages.forEach((messageData, index) => {
        console.log(`  ${index + 1}. ${messageData.type}: ${messageData.player}`);
        if (messageData.type === 'roll') {
            // Verifica se é rolagem múltipla
            if (messageData.results && messageData.results.length > 1) {
                addMultipleDiceMessage(messageData);
            } else {
                addDiceMessage(messageData);
            }
        } else {
            addMessage(messageData);
        }
    });
    console.log('✅ Todas as mensagens adicionadas');
    
    // Adiciona mensagem informativa
    if (messages.length > 0) {
        const stats = calculateDiceStats(messages.filter(m => m.type === 'roll'));
        const rollCount = messages.filter(m => m.type === 'roll').length;
        const messageCount = messages.filter(m => m.type === 'message').length;
        
        addSystemMessage(`📊 Sessão atual: ${messageCount} mensagens, ${rollCount} rolagens`);
    } else {
        addSystemMessage('🎲 Nenhuma atividade anterior. Comece a aventura!');
    }
    
    // Rola automaticamente até a última mensagem
    setTimeout(() => {
        scrollToBottom();
        console.log('⬇️ Scroll automático para última mensagem');
    }, 100);
}

// Carrega histórico de rolagens do banco de dados
function loadDiceHistory(rolls) {
    console.log('Carregando histórico de rolagens:', rolls.length);
    
    // As rolagens já são adicionadas pela função loadChatHistory
    // Esta função pode ser usada para estatísticas ou outros propósitos
    if (rolls.length > 0) {
        console.log(`Rolagens da sessão: ${rolls.length}`);
        
        // Calcula estatísticas das rolagens
        const stats = calculateDiceStats(rolls);
        console.log('Estatísticas das rolagens:', stats);
    }
}

// Calcula estatísticas das rolagens
function calculateDiceStats(rolls) {
    const stats = {
        total: rolls.length,
        byType: {},
        criticalSuccesses: 0,
        criticalFailures: 0,
        averages: {}
    };
    
    rolls.forEach(roll => {
        const diceType = `D${roll.sides}`;
        
        // Conta por tipo
        if (!stats.byType[diceType]) {
            stats.byType[diceType] = 0;
        }
        stats.byType[diceType]++;
        
        // Conta críticos
        if (roll.result === 1) {
            stats.criticalFailures++;
        } else if (roll.result === roll.sides) {
            stats.criticalSuccesses++;
        }
        
        // Calcula médias
        if (!stats.averages[diceType]) {
            stats.averages[diceType] = { total: 0, count: 0 };
        }
        stats.averages[diceType].total += roll.result;
        stats.averages[diceType].count++;
    });
    
    // Finaliza cálculo das médias
    Object.keys(stats.averages).forEach(diceType => {
        const avg = stats.averages[diceType];
        stats.averages[diceType] = (avg.total / avg.count).toFixed(2);
    });
    
    return stats;
}

// Função para solicitar histórico manualmente
window.refreshChatHistory = function() {
    console.log('🔄 Recarregando histórico completo...');
    if (Client.socket && typeof Client.socket.emit === 'function') {
        addLoadingIndicator();
        Client.socket.emit('getFullHistory', 100);  // 100 últimos itens
    } else {
        console.error('❌ Socket não disponível');
    }
};

// Adiciona indicador de carregamento
function addLoadingIndicator() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    // Remove indicador anterior se existir
    const existingIndicator = document.querySelector('.loading-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const loadingElement = document.createElement('div');
    loadingElement.className = 'message-item system loading-indicator';
    loadingElement.innerHTML = `
        <div class="message-player">Sistema</div>
        <div class="message-content">
            <i class="fas fa-spinner fa-spin"></i> Carregando histórico da sessão...
        </div>
    `;
    
    messagesList.appendChild(loadingElement);
    scrollToBottom();
}

// Configuração de controle de foco para desabilitar movimento durante digitação
function setupChatFocusControl() {
    const messageInput = document.getElementById('messageInput');
    
    if (messageInput) {
        // Quando ganha foco (começa a digitar)
        messageInput.addEventListener('focus', function() {
            console.log('🎮 Input do chat ganhou foco - controles de movimento desabilitados');
            window.isTypingInChat = true;
        });
        
        // Quando perde foco (para de digitar)
        messageInput.addEventListener('blur', function() {
            console.log('🎮 Input do chat perdeu foco - controles de movimento reabilitados');
            window.isTypingInChat = false;
        });
        
        // Previne que eventos de teclado do input afetem o jogo
        messageInput.addEventListener('keydown', function(event) {
            // Lista de teclas que devem ser bloqueadas do jogo quando digitando
            const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space'];
            
            if (gameKeys.includes(event.code)) {
                // Para a propagação apenas para teclas do jogo
                event.stopPropagation();
            }
            
            // Se pressionar Enter, envia a mensagem
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
        
        messageInput.addEventListener('keyup', function(event) {
            // Lista de teclas que devem ser bloqueadas do jogo quando digitando
            const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Space'];
            
            if (gameKeys.includes(event.code)) {
                // Para a propagação apenas para teclas do jogo
                event.stopPropagation();
            }
        });
        
        console.log('✅ Controle de foco do chat configurado');
    } else {
        console.warn('⚠️ Input do chat não encontrado para configurar controle de foco');
    }
}

// Configura controle de foco quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupChatFocusControl);
} else {
    setupChatFocusControl();
}
// 🎭 MODO ESPECTADOR: Funções de controle
function initSpectatorMode() {
    if (!isMaster) return;
    
    console.log('🎭 Inicializando painel de controle do espectador');
    
    // Verifica estado salvo do painel
    const savedState = localStorage.getItem('spectator_panel_visible');
    const shouldShow = savedState === null ? true : savedState === 'true';
    
    // Aplica estado inicial do painel
    const panel = document.getElementById('spectator-panel');
    if (panel) {
        panel.style.display = shouldShow ? 'block' : 'none';
    }
    
    // Atualiza lista de jogadores a cada 2 segundos
    setInterval(updatePlayerList, 2000);
    updatePlayerList();
    
    // Atualiza display de zoom a cada frame
    setInterval(updateZoomDisplay, 100);
}

// 🔧 Toggle do painel do espectador
function toggleSpectatorPanel() {
    if (!isMaster) return;
    
    const panel = document.getElementById('spectator-panel');
    if (!panel) return;
    
    const isVisible = panel.style.display !== 'none';
    const newState = !isVisible;
    
    panel.style.display = newState ? 'block' : 'none';
    localStorage.setItem('spectator_panel_visible', newState ? 'true' : 'false');
    
    console.log(`🎭 Painel do espectador ${newState ? 'exibido' : 'ocultado'}`);
}

function updatePlayerList() {
    if (!isMaster || typeof Game === 'undefined' || !Game.getPlayerList) return;
    
    const select = document.getElementById('playerSelect');
    if (!select) return;
    
    const players = Game.getPlayerList();
    const currentValue = select.value;
    
    // Limpa e reconstrói a lista
    select.innerHTML = '<option value="none">🎥 Câmera Livre</option>';
    
    players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `👤 ${player.name} (${player.x}, ${player.y})`;
        select.appendChild(option);
    });
    
    // Restaura seleção anterior se ainda existe
    if (currentValue !== 'none' && players.some(p => p.id == currentValue)) {
        select.value = currentValue;
    }
}

function updateZoomDisplay() {
    if (!isMaster || typeof Game === 'undefined' || !Game.spectatorMode) return;
    
    const zoomSpan = document.getElementById('zoomLevel');
    if (zoomSpan) {
        const zoomPercent = Math.round(Game.spectatorMode.zoomLevel * 100);
        zoomSpan.textContent = `${zoomPercent}%`;
    }
}

function selectPlayerToFollow() {
    const select = document.getElementById('playerSelect');
    if (!select) return;
    
    const playerId = select.value;
    
    if (typeof Game !== 'undefined' && Game.followPlayer) {
        Game.followPlayer(playerId === 'none' ? null : playerId);
    }
}

function adjustSpectatorZoom(delta) {
    if (!isMaster || typeof Game === 'undefined' || !Game.spectatorMode) return;
    
    Game.spectatorMode.zoomLevel = Math.max(
        Game.spectatorMode.minZoom,
        Math.min(Game.spectatorMode.maxZoom, Game.spectatorMode.zoomLevel + delta)
    );
    
    if (window.gameInstance && window.gameInstance.scene.scenes[0]) {
        window.gameInstance.scene.scenes[0].cameras.main.setZoom(Game.spectatorMode.zoomLevel);
    }
}

function resetSpectatorZoom() {
    if (!isMaster || typeof Game === 'undefined' || !Game.spectatorMode) return;
    
    Game.spectatorMode.zoomLevel = 0.3;
    
    if (window.gameInstance && window.gameInstance.scene.scenes[0]) {
        const scene = window.gameInstance.scene.scenes[0];
        scene.cameras.main.setZoom(0.3);
        
        // Se não está seguindo ninguém, centraliza no mapa
        if (Game.spectatorMode.followingPlayer === null) {
            scene.cameras.main.centerOn(w / 2, h / 2);
        }
    }
}

// Inicializa modo espectador quando o jogo estiver pronto
window.addEventListener('load', function() {
    setTimeout(initSpectatorMode, 1000);
});
