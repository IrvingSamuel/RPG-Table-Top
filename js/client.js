var Client = {};

console.log('📦 client.js carregado');
console.log('🔍 window.socket existe no carregamento?', !!window.socket);

// WebSocket inicializado no main.js - conecta automaticamente com window.socket
Client.socket = null; // Será definido pelo main.js

// Função para configurar eventos do socket quando disponível
Client.setupSocketEvents = function() {
    console.log('🔧 setupSocketEvents chamado');
    console.log('🔍 window.socket existe?', !!window.socket);
    console.log('🔍 window.socket.connected?', window.socket?.connected);
    
    if (!window.socket) {
        console.warn('⚠️ Socket não disponível para configurar eventos');
        return;
    }
    
    Client.socket = window.socket; // Referência local
    console.log('✅ Client.socket definido:', !!Client.socket);
    
    Client.socket.on('connect', function() {
        console.log('Socket.IO conectado com sucesso');
        window.initDiagnostic.log('WebSocket Connected', 'OK');
        
        // Atualiza status de carregamento
        if (typeof updateLoadingStatus === 'function') {
            updateLoadingStatus('websocket', true);
        }
        
        // Marca que a conexão está estabelecida
        Client.connectionEstablished = true;
        
        // O histórico será solicitado pelo initializeGameSystem() quando tudo estiver pronto
    });
    
    Client.socket.on('disconnect', function() {
        console.warn('Socket.IO desconectado');
        Client.connectionEstablished = false;
        
        if (typeof addSystemMessage === 'function') {
            addSystemMessage('⚠️ Conexão perdida. Tentando reconectar...');
        }
    });
    
    Client.socket.on('reconnect', function() {
        console.log('Socket.IO reconectado com sucesso');
        Client.connectionEstablished = true;
        
        if (typeof addSystemMessage === 'function') {
            addSystemMessage('✅ Reconectado ao servidor');
        }
    });
    
    Client.socket.on('connect_error', function(error) {
        console.error('Erro de conexão Socket.IO:', error);
        Client.connectionEstablished = false;
        
        if (typeof addSystemMessage === 'function') {
            addSystemMessage('❌ Erro de conexão com o servidor');
        }
    });
    
    // === EVENT LISTENERS PARA CHAT ===
    
    // Recebe mensagens de chat de outros jogadores
    Client.socket.on('chatMessage', function(messageData) {
        console.log('📨 Mensagem recebida do servidor:', messageData);
        if (typeof addMessage === 'function') {
            addMessage(messageData);
        } else {
            console.warn('⚠️ Função addMessage não disponível');
        }
    });
    
    // Recebe resultados de dados de outros jogadores
    Client.socket.on('diceRoll', function(diceData) {
        console.log('🎲 Rolagem recebida do servidor:', diceData);
        
        // Verifica se é rolagem múltipla ou única
        if (diceData.results && diceData.results.length > 1) {
            if (typeof addMultipleDiceMessage === 'function') {
                addMultipleDiceMessage(diceData);
            } else if (typeof addDiceMessage === 'function') {
                addDiceMessage(diceData);
            }
        } else {
            if (typeof addDiceMessage === 'function') {
                addDiceMessage(diceData);
            } else {
                console.warn('⚠️ Função addDiceMessage não disponível');
            }
        }
    });

    // Atualiza contador de jogadores online
    Client.socket.on('playerCount', function(count) {
        if (typeof updatePlayerCount === 'function') {
            updatePlayerCount(count);
        }
    });

    // Recebe histórico de mensagens do servidor
    Client.socket.on('chatHistory', function(messages) {
        console.log('📚 Histórico recebido:', messages.length, 'mensagens', messages);
        if (typeof loadChatHistory === 'function') {
            loadChatHistory(messages);
        } else {
            console.error('❌ Função loadChatHistory não disponível');
        }
    });

    // Recebe histórico de rolagens do servidor
    Client.socket.on('diceHistory', function(rolls) {
        if (typeof loadDiceHistory === 'function') {
            loadDiceHistory(rolls);
        }
    });
    
    // Recebe histórico completo (mensagens + rolagens ordenadas)
    Client.socket.on('fullHistory', function(history) {
        console.log('📚 Histórico COMPLETO recebido:', history.length, 'itens', history);
        if (typeof loadChatHistory === 'function') {
            loadChatHistory(history);
        } else {
            console.error('❌ Função loadChatHistory não disponível');
        }
    });
    
    // === EVENT LISTENERS PARA GAME ===
    
    Client.socket.on('allplayers',function(data,client){
        console.log('📥 Recebendo todos os jogadores:', data);
        for(var i = 0; i < data.length; i++){
            console.log(`  Jogador ${i}: ID=${data[i].id}, sprite=${data[i].sprite}`);
            Game.addNewPlayer(data[i].id,data[i].x,data[i].y,client,data[i].sprite);
        }
    });
    
    // Listener para quando um novo jogador entra no jogo (broadcast do servidor)
    Client.socket.on('newplayer',function(playerData){
        console.log('🆕 Novo jogador entrou no jogo:', playerData);
        Game.addNewPlayer(playerData.id, playerData.x, playerData.y, -1, playerData.sprite);
    });

    Client.socket.on('move',function(data,movement){
        Game.movePlayer(data.id,data.x,data.y,movement);
    });

    Client.socket.on('remove',function(id){
        Game.removePlayer(id);
    });

    Client.socket.on('generateShot',function(data){
        Game.addNewBullet(data.x,data.y,data.signal,data.direction,data.id);
    });

    Client.socket.on('moveBullet',function(data,movement){
        Game.movePlayer(data.id,data.x,data.y,movement);
    });
    
    Client.socket.on('removeBullet',function(id){
        Game.removeBullet(id);
    });

    Client.socket.on('generateRoll',function(data){
        Game.addNewRoll(data);
    });

    Client.socket.on('emitRotation',function(id, rotation){
        Game.emitRotation(id,rotation);
    });

    Client.socket.on('generateScene',function(scene){
        console.log('🎬 Mudando para cena:', scene);
        
        // Atualiza dimensões do mapa antes de mudar a cena
        if (typeof updateMapDimensions === 'function' && scene.mapa) {
            updateMapDimensions(scene.mapa).then(() => {
                Game.changeScene(scene);
            });
        } else {
            Game.changeScene(scene);
        }
    });

    Client.socket.on('lastScene', async function(scene){
        console.log('Cena recebida do servidor:', scene);
        window.initDiagnostic.log('Scene Received', 'OK', `${scene.nome} - ${scene.horario} - ${scene.doors?.length || 0} doors`);
        window.sceneReceived = true;
        
        // Atualiza dimensões do mapa antes de definir a primeira cena
        if (typeof updateMapDimensions === 'function' && scene.mapa) {
            await updateMapDimensions(scene.mapa);
        }
        
        // PRÉ-CARREGA texturas dinâmicas SE o jogo já estiver criado
        if (window.game && window.game.scene && window.game.scene.scenes[0]) {
            const phaserScene = window.game.scene.scenes[0];
            if (phaserScene.textures) {
                console.log('🔍 Verificando necessidade de texturas dinâmicas para', scene.nome);
                
                const textureKeys = {
                    bg: `${scene.nome}${scene.horario.toLowerCase()}`,
                    limits: `limits${scene.nome}`,
                    roofs: `roofs${scene.nome}${scene.horario.toLowerCase()}`
                };
                
                // Verificar quais texturas não existem
                const missingTextures = [];
                for (const [type, key] of Object.entries(textureKeys)) {
                    if (!phaserScene.textures.exists(key)) {
                        console.warn(`⚠️ Textura ${key} não encontrada localmente`);
                        missingTextures.push({type, key});
                    }
                }
                
                // Se há texturas faltando, carregar do banco
                if (missingTextures.length > 0 && typeof Game.fetchMapData === 'function') {
                    console.log(`📡 Pré-carregando texturas dinâmicas para ${scene.nome} (ID: ${scene.mapa})...`);
                    // Usa scene.mapa (ID do mapa) ao invés de scene.nome
                    const mapData = await Game.fetchMapData(scene.mapa || scene.nome);
                    
                    if (mapData) {
                        console.log('✅ Dados do mapa encontrados, pré-carregando texturas...');
                        
                        const timeMapping = {
                            'd': 'dia',
                            'a': 'tarde',
                            'n': 'noite'
                        };
                        const fullTime = timeMapping[scene.horario.toLowerCase()] || 'dia';
                        
                        try {
                            // Carregar textura de fundo
                            const bgKey = `${scene.nome}${scene.horario.toLowerCase()}`;
                            if (!phaserScene.textures.exists(bgKey) && mapData[fullTime]) {
                                await Game.loadDynamicTexture(phaserScene, bgKey, mapData[fullTime]);
                            }
                            
                            // Carregar textura de limites
                            if (!phaserScene.textures.exists(`limits${scene.nome}`) && mapData.limits) {
                                await Game.loadDynamicTexture(phaserScene, `limits${scene.nome}`, mapData.limits);
                            }
                            
                            // Carregar textura de telhados
                            const roofsKey = `roofs${scene.nome}${scene.horario.toLowerCase()}`;
                            const roofsField = `roofs_${fullTime}`;
                            if (!phaserScene.textures.exists(roofsKey) && mapData[roofsField]) {
                                await Game.loadDynamicTexture(phaserScene, roofsKey, mapData[roofsField]);
                            }
                            
                            console.log('✅ Texturas dinâmicas pré-carregadas com sucesso!');
                        } catch (error) {
                            console.error('❌ Erro ao pré-carregar texturas dinâmicas:', error);
                        }
                    }
                }
            }
        }
        
        // Define a primeira cena
        Game.setFirstScene(scene);
        
        // Aguarda um momento e então faz a transferência visual
        setTimeout(() => {
            console.log('🎬 Iniciando transferência para cena:', scene.nome);
            if (typeof Game.transferToScene === 'function') {
                Game.transferToScene(scene);
            }
        }, 500); // 500ms de delay para garantir que tudo está pronto
        
        // Marca que a cena está pronta
        if (typeof updateLoadingStatus === 'function') {
            updateLoadingStatus('scene', true);
        }
    });

    Client.socket.on('turns',function(turns){
        Game.setTurns(turns);
    });

    Client.socket.on('doors',function(doors){
        Game.setDoors(doors);
    });

    Client.socket.on('generateTime',function(time){
        Game.changeTime(time);
    });

    Client.socket.on('pause',function(value){
        Game.pause(value);
    });

    Client.socket.on('refreshplayers',function(data, client){
        for(var i = 0; i < data.length; i++){
            Game.resetPlayers(data[i].id,data[i].x,data[i].y, client, data[i].sprite);
        }
    });
    
    console.log('✅ Todos os eventos do Socket configurados (chat + game)');
};

// Função para inicializar Client.socket quando window.socket estiver disponível
Client.initializeSocket = function() {
    console.log('🔧 Client.initializeSocket chamado');
    if (typeof window !== 'undefined' && window.socket) {
        Client.socket = window.socket;
        Client.setupSocketEvents();
        console.log('✅ Client.socket configurado com window.socket');
        return true;
    } else {
        console.warn('⚠️ window.socket não disponível para Client');
        return false;
    }
};

// NÃO chamar automaticamente - será chamado pelo main.js quando socket estiver pronto
// Client.initializeSocket();

Client.sendTest = function(){
    console.log("test sent");
    Client.socket.emit('test');
};

Client.verifyPlayers = function(){
    Client.socket.emit('verify');
};

Client.askNewPlayer = function(sprite){
    console.log('asking...');
    Client.socket.emit('newplayer',sprite);
};

Client.sendClick = function(x,y,movement){
    Client.socket.emit('click',{x:x,y:y,movement:movement});
};

Client.sendBullet = function(x,y,signal,direction,id){
    Client.socket.emit('shot',{x:x,y:y,signal:signal,direction:direction,id:id});
};

Client.sendRoll = function(data){
    Client.socket.emit('roll',data);
};

Client.changeScene = function(scene){
    Client.socket.emit('scene',scene);
};

Client.changeTime = function(time){
    Client.socket.emit('time',time);
};

Client.pause = function(value){
    Client.socket.emit('pause',value);
};

Client.reach = function(id){
    Client.socket.emit('reach',id);
};

Client.getLastScene = function(){
    console.log('Getting...');
    window.initDiagnostic.log('GetLastScene Request', 'START');
    
    // Só tenta se a conexão estiver estabelecida
    if (!Client.socket || !Client.socket.connected) {
        console.warn('WebSocket não conectado ao tentar obter cena');
        window.initDiagnostic.log('GetLastScene WebSocket', 'FAIL', 'Not connected');
        setTimeout(() => {
            if (Client.socket && Client.socket.connected) {
                window.initDiagnostic.log('GetLastScene Retry', 'START');
                Client.getLastScene();
            } else {
                console.warn('Usando cena padrão devido à falha de conexão');
                window.initDiagnostic.log('GetLastScene Fallback', 'WARN', 'Using default scene');
                Game.useDefaultScene();
            }
        }, 1000);
        return;
    }
    
    window.initDiagnostic.log('GetLastScene Emit', 'OK', 'Requesting scene from server');
    Client.socket.emit('getLastScene');
    
    // Timeout para usar cena padrão se não receber resposta
    setTimeout(() => {
        if (!window.sceneReceived) {
            console.warn('Timeout ao obter cena do servidor, usando cena padrão');
            window.initDiagnostic.log('GetLastScene Timeout', 'WARN', 'Server timeout, using default');
            Game.useDefaultScene();
        }
    }, 3000);
};

Client.sendRotation = function(id, rotation){
    Client.socket.emit('sendRotation', id, rotation);
};

Client.getTurns = function(){
    Client.socket.emit('getTurns');
};

// Todos os event listeners movidos para dentro de setupSocketEvents()


