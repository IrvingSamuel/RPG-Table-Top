// Sistema de Administração do Mestre
let maps = [];
let players = [];
let currentSceneData = null;
let adminSocket = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎲 Painel do Mestre inicializado');
    
    // Conectar ao Socket.IO
    if (typeof io !== 'undefined') {
        adminSocket = io();
        
        adminSocket.on('connect', () => {
            console.log('✅ Socket.IO conectado no painel admin');
        });
        
        adminSocket.on('disconnect', () => {
            console.log('❌ Socket.IO desconectado');
        });
        
        // Escutar mudanças de cena
        adminSocket.on('scene', (scene) => {
            console.log('📍 Cena mudou para:', scene);
            loadCurrentScene();
        });
        
        // Escutar mudanças de horário
        adminSocket.on('time', (time) => {
            console.log('🕐 Horário mudou para:', time);
            loadCurrentScene();
        });
        
        // Escutar pause/resume
        adminSocket.on('pause', (value) => {
            console.log('⏯️ Pause estado:', value);
        });
    } else {
        console.error('❌ Socket.IO não está disponível!');
    }
    
    loadAllData();
});

async function loadAllData() {
    await Promise.all([
        loadMaps(),
        loadPlayers(),
        loadCurrentScene()
    ]);
}

async function loadMaps() {
    try {
        const response = await fetch('/api/maps');
        if (!response.ok) throw new Error('Erro ao carregar mapas');
        
        maps = await response.json();
        console.log('✅ Mapas carregados:', maps);
        renderMaps();
    } catch (error) {
        console.error('❌ Erro ao carregar mapas:', error);
        document.getElementById('mapsContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar mapas</p>
            </div>
        `;
    }
}

function renderMaps() {
    const container = document.getElementById('mapsContainer');
    
    if (maps.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-map"></i>
                <p>Nenhum mapa cadastrado ainda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = maps.map(map => {
        const isActive = currentSceneData?.mapa === map.id;
        
        return `
            <div class="map-card ${isActive ? 'active' : ''}" data-map-id="${map.id}">
                <div class="map-id">#${map.id}</div>
                <div class="map-name">
                    <i class="fas fa-map"></i> ${map.nome}
                    ${isActive ? '<i class="fas fa-check-circle text-success ms-2" title="Cena Ativa"></i>' : ''}
                </div>
                
                <div class="mt-3">
                    <button class="control-btn ${isActive ? 'btn-pause' : 'btn-add'}" 
                            onclick="changeToScene(${map.id})"
                            ${isActive ? 'disabled' : ''}>
                        <i class="fas ${isActive ? 'fa-check' : 'fa-arrow-right'}"></i>
                        ${isActive ? 'Cena Ativa' : 'Ir para esta Cena'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderTimeControls() {
    const container = document.getElementById('timeControlsContainer');
    
    if (!currentSceneData) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>Aguardando seleção de cena...</p>
            </div>
        `;
        return;
    }
    
    const currentMap = maps.find(m => m.id === currentSceneData.mapa);
    
    if (!currentMap) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Mapa não encontrado</p>
            </div>
        `;
        return;
    }
    
    const hasDay = currentMap.dia && currentMap.dia.trim() !== '';
    const hasAfternoon = currentMap.tarde && currentMap.tarde.trim() !== '';
    const hasNight = currentMap.noite && currentMap.noite.trim() !== '';
    
    container.innerHTML = `
        <div class="current-scene-info mb-3">
            <h5><i class="fas fa-map-marker-alt"></i> ${currentMap.nome}</h5>
            <small class="text-muted">Ajuste o horário da cena atual</small>
        </div>
        
        <div class="time-buttons-large">
            ${hasDay ? `
                <button class="time-btn-large ${currentSceneData.horario === 'd' ? 'active' : ''}" 
                        onclick="changeTime('d')">
                    <i class="fas fa-sun"></i>
                    <span>Dia</span>
                    ${currentSceneData.horario === 'd' ? '<i class="fas fa-check-circle"></i>' : ''}
                </button>
            ` : `
                <button class="time-btn-large" disabled>
                    <i class="fas fa-sun"></i>
                    <span>Dia</span>
                    <small>(Indisponível)</small>
                </button>
            `}
            
            ${hasAfternoon ? `
                <button class="time-btn-large ${currentSceneData.horario === 'a' ? 'active' : ''}" 
                        onclick="changeTime('a')">
                    <i class="fas fa-cloud-sun"></i>
                    <span>Tarde</span>
                    ${currentSceneData.horario === 'a' ? '<i class="fas fa-check-circle"></i>' : ''}
                </button>
            ` : `
                <button class="time-btn-large" disabled>
                    <i class="fas fa-cloud-sun"></i>
                    <span>Tarde</span>
                    <small>(Indisponível)</small>
                </button>
            `}
            
            ${hasNight ? `
                <button class="time-btn-large ${currentSceneData.horario === 'n' ? 'active' : ''}" 
                        onclick="changeTime('n')">
                    <i class="fas fa-moon"></i>
                    <span>Noite</span>
                    ${currentSceneData.horario === 'n' ? '<i class="fas fa-check-circle"></i>' : ''}
                </button>
            ` : `
                <button class="time-btn-large" disabled>
                    <i class="fas fa-moon"></i>
                    <span>Noite</span>
                    <small>(Indisponível)</small>
                </button>
            `}
        </div>
    `;
}

async function loadPlayers() {
    try {
        const response = await fetch('/api/players');
        if (!response.ok) throw new Error('Erro ao carregar jogadores');
        
        players = await response.json();
        console.log('✅ Jogadores carregados:', players);
        renderPlayers();
    } catch (error) {
        console.error('❌ Erro ao carregar jogadores:', error);
        document.getElementById('playersContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar jogadores</p>
            </div>
        `;
    }
}

function renderPlayers() {
    const container = document.getElementById('playersContainer');
    
    if (players.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>Nenhum jogador cadastrado ainda</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="row">
            ${players.map(player => `
                <div class="col-md-6 mb-3">
                    <div class="map-card" style="padding: 15px;">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${player.foto}" alt="${player.nome}" 
                                 style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold);">
                            <div>
                                <div class="map-name" style="font-size: 1.1rem; margin: 0;">${player.nome}</div>
                                <small style="color: rgba(255,255,255,0.6);">
                                    Destreza: ${player.destreza} | Stamina: ${player.stamina} | Battle: ${player.battle}
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function loadCurrentScene() {
    try {
        const response = await fetch('/api/current-scene');
        if (!response.ok) throw new Error('Erro ao carregar cena atual');
        
        currentSceneData = await response.json();
        console.log('✅ Cena atual carregada:', currentSceneData);
        updateCurrentStatus();
        renderMaps(); // Atualiza cards de mapas
        renderTimeControls(); // Atualiza controles de horário
    } catch (error) {
        console.error('❌ Erro ao carregar cena atual:', error);
    }
}

function updateCurrentStatus() {
    if (!currentSceneData) return;
    
    const map = maps.find(m => m.id === currentSceneData.mapa);
    const sceneName = map ? map.nome : 'Desconhecido';
    
    const timeMap = {
        'd': '☀️ Dia',
        'a': '🌤️ Tarde',
        'n': '🌙 Noite'
    };
    
    document.getElementById('currentScene').textContent = sceneName;
    document.getElementById('currentTime').textContent = timeMap[currentSceneData.horario] || 'Desconhecido';
}

// NOVA FUNÇÃO: Mudar apenas a CENA (com fade preto)
function changeToScene(mapId) {
    console.log(`🎬 Mudando CENA para mapa ${mapId} (fade preto)`);
    
    if (!adminSocket) {
        console.error('❌ Socket não está conectado!');
        alert('Erro: Conexão WebSocket não disponível');
        return;
    }
    
    // Emitir apenas evento de mudança de cena
    adminSocket.emit('scene', mapId.toString());
    
    // Atualizar após breve delay
    setTimeout(() => {
        loadCurrentScene();
    }, 800);
}

// NOVA FUNÇÃO: Mudar apenas o HORÁRIO (transição natural)
function changeTime(time) {
    console.log(`🕐 Mudando HORÁRIO para ${time} (transição natural)`);
    
    if (!adminSocket) {
        console.error('❌ Socket não está conectado!');
        alert('Erro: Conexão WebSocket não disponível');
        return;
    }
    
    // Emitir apenas evento de mudança de horário
    adminSocket.emit('time', time);
    
    // Atualizar após breve delay
    setTimeout(() => {
        loadCurrentScene();
    }, 500);
}

function pauseGame() {
    console.log('⏸️ Pausando jogo');
    
    if (!adminSocket) {
        console.error('❌ Socket não está conectado!');
        alert('Erro: Conexão WebSocket não disponível');
        return;
    }
    
    adminSocket.emit('pause', 1);
}

function resumeGame() {
    console.log('▶️ Continuando jogo');
    
    if (!adminSocket) {
        console.error('❌ Socket não está conectado!');
        alert('Erro: Conexão WebSocket não disponível');
        return;
    }
    
    adminSocket.emit('pause', 0);
}

function refreshData() {
    console.log('🔄 Atualizando dados...');
    loadAllData();
}

function openMapTester() {
    console.log('🗺️ Abrindo Map Tester...');
    window.open('/map-tester', '_blank', 'width=1600,height=900');
}

function openAddMapModal() {
    alert('🚧 Funcionalidade em desenvolvimento: Adicionar Novo Mapa');
}

function openAddPlayerModal() {
    alert('🚧 Funcionalidade em desenvolvimento: Adicionar Novo Jogador');
}
