// ============================================================
// MAP TESTER - JavaScript Principal
// Gerencia uploads, preview e integração com Phaser
// ============================================================

// Verificar dependências
if (typeof Phaser === 'undefined') {
    console.error('❌ Phaser não está carregado!');
    Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar Phaser',
        text: 'Não foi possível carregar o Phaser. Verifique sua conexão e recarregue a página.',
        confirmButtonColor: '#6366f1'
    });
}

if (typeof SceneMapTester === 'undefined') {
    console.error('❌ SceneMapTester não está carregado!');
    Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar Scene',
        text: 'SceneMapTester não carregou. Recarregue a página.',
        confirmButtonColor: '#6366f1'
    });
}

let phaserGame = null;
let phaserScene = null;

// Estado dos uploads
const uploadedFiles = {
    dia: null,
    tarde: null,
    noite: null,
    limits: null,
    rooftopsDia: null,
    rooftopsTarde: null,
    rooftopsNoite: null
};

// URLs dos arquivos no MinIO
const uploadedUrls = {
    dia: null,
    tarde: null,
    noite: null,
    limits: null,
    rooftopsDia: null,
    rooftopsTarde: null,
    rooftopsNoite: null
};

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Map Tester carregado');
    
    initPhaser();
    setupUploadHandlers();
    setupButtonHandlers();
    
    // Mostrar instruções na primeira vez
    setTimeout(() => {
        if (phaserScene) {
            console.log('✅ Sistema inicializado com sucesso!');
            console.log('📋 VOCÊ DEVE VER:');
            console.log('   - Canvas azul escuro (Phaser ativo)');
            console.log('   - Boneco amarelo no centro (Test Dummy)');
            console.log('   - Caixas verdes ao redor do boneco (Debug)');
            console.log('   - FPS e posição no topo direito');
            console.log('');
            console.log('🎮 TESTE AGORA:');
            console.log('   - Pressione W, A, S, D para mover o boneco');
            console.log('   - Se o boneco se mover, está tudo funcionando!');
            console.log('');
            console.log('📤 PRÓXIMO PASSO:');
            console.log('   1. Preencha o nome do mapa');
            console.log('   2. Faça upload da imagem (Dia)');
            console.log('   3. Clique em "Carregar no Teste"');
        } else {
            console.warn('⚠️ Scene não inicializou ainda, aguarde...');
        }
    }, 1500);
});

// ============================================================
// PHASER SETUP
// ============================================================

function initPhaser() {
    const config = {
        type: Phaser.AUTO,
        width: 1200,
        height: 800,
        parent: 'phaser-game',
        backgroundColor: '#0a0e1a',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false // Debug desativado para visualização limpa
            }
        },
        scene: SceneMapTester
    };

    phaserGame = new Phaser.Game(config);
    
    // Aguardar scene estar pronta (usar setTimeout como fallback)
    setTimeout(() => {
        phaserScene = phaserGame.scene.getScene('SceneMapTester');
        if (phaserScene) {
            console.log('✅ Phaser inicializado e scene obtida');
        } else {
            console.error('❌ Não foi possível obter a scene');
        }
    }, 1000);
}

// ============================================================
// UPLOAD HANDLERS
// ============================================================

function setupUploadHandlers() {
    const uploadTypes = ['dia', 'tarde', 'noite', 'limits', 'rooftops-dia', 'rooftops-tarde', 'rooftops-noite'];
    
    uploadTypes.forEach(type => {
        const fileInput = document.getElementById(`file-${type}`);
        const uploadArea = document.getElementById(`upload-${type}`);
        
        if (!fileInput || !uploadArea) {
            console.warn(`⚠️ Elemento não encontrado: ${type}`);
            return;
        }
        
        // Click handler
        fileInput.addEventListener('change', (e) => handleFileSelect(e, type));
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#6366f1';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect({ target: { files } }, type);
            }
        });
    });
}

function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
        Swal.fire({
            icon: 'error',
            title: 'Arquivo Inválido',
            text: 'Apenas imagens são permitidas!',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    // Validar tamanho (50MB)
    if (file.size > 50 * 1024 * 1024) {
        Swal.fire({
            icon: 'error',
            title: 'Arquivo Muito Grande',
            text: 'O arquivo excede o limite de 50MB!',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    console.log(`📁 Arquivo selecionado [${type}]:`, file.name);
    
    // Mapear nome do tipo para chave do objeto
    const fileKey = type.replace('rooftops-', 'rooftops').replace(/-/g, '');
    // rooftops-dia -> rooftopsDia
    const camelCaseKey = type === 'rooftops-dia' ? 'rooftopsDia' :
                         type === 'rooftops-tarde' ? 'rooftopsTarde' :
                         type === 'rooftops-noite' ? 'rooftopsNoite' : type;
    
    uploadedFiles[camelCaseKey] = file;
    showPreview(file, type);
    
    // Marcar área como preenchida
    const uploadArea = document.getElementById(`upload-${type}`);
    uploadArea.classList.add('has-file');
}

function showPreview(file, type) {
    const preview = document.getElementById(`preview-${type}`);
    const reader = new FileReader();
    
    reader.onload = (e) => {
        preview.innerHTML = `
            <img src="${e.target.result}" alt="${type}">
            <div class="preview-info">
                ${file.name} - ${formatFileSize(file.size)}
            </div>
            <button class="btn-remove" onclick="removeFile('${type}')">×</button>
        `;
        preview.classList.add('active');
    };
    
    reader.readAsDataURL(file);
}

function removeFile(type) {
    // Mapear nome do tipo para chave do objeto
    const camelCaseKey = type === 'rooftops-dia' ? 'rooftopsDia' :
                         type === 'rooftops-tarde' ? 'rooftopsTarde' :
                         type === 'rooftops-noite' ? 'rooftopsNoite' : type;
    
    uploadedFiles[camelCaseKey] = null;
    uploadedUrls[camelCaseKey] = null;
    
    const preview = document.getElementById(`preview-${type}`);
    preview.innerHTML = '';
    preview.classList.remove('active');
    
    const uploadArea = document.getElementById(`upload-${type}`);
    uploadArea.classList.remove('has-file');
    
    const fileInput = document.getElementById(`file-${type}`);
    fileInput.value = '';
    
    console.log(`🗑️ Arquivo removido: ${type}`);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ============================================================
// BUTTON HANDLERS
// ============================================================

function setupButtonHandlers() {
    // Botão de carregar no teste
    document.getElementById('btn-load-test').addEventListener('click', loadIntoTest);
    
    // Toggle de limites
    document.getElementById('btn-toggle-limits').addEventListener('click', () => {
        if (phaserScene) {
            phaserScene.toggleLimits();
        }
    });
    
    // Toggle de telhados
    document.getElementById('btn-toggle-rooftops').addEventListener('click', () => {
        if (phaserScene) {
            phaserScene.toggleRooftops();
        }
    });
    
    // Selector de horário
    document.getElementById('test-time').addEventListener('change', (e) => {
        if (phaserScene) {
            phaserScene.changeTimeOfDay(e.target.value);
        }
    });
    
    // Botão de salvar mapa
    document.getElementById('btn-save-map').addEventListener('click', saveMapToDatabase);
}

// ============================================================
// LOAD INTO TEST - Carregar assets no Phaser
// ============================================================

async function loadIntoTest() {
    console.log('🔄 Iniciando carregamento no teste...');
    
    if (!phaserScene) {
        console.error('❌ phaserScene não está disponível');
        Swal.fire({
            icon: 'warning',
            title: 'Aguarde...',
            text: 'O Phaser ainda está inicializando. Aguarde alguns segundos e tente novamente.',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    console.log('✅ phaserScene disponível:', phaserScene);
    
    // Validar ID da Mesa
    const tableId = document.getElementById('tableId').value.trim();
    if (!tableId) {
        Swal.fire({
            icon: 'warning',
            title: 'ID da Mesa Necessário',
            text: 'Digite o ID da mesa antes de continuar!',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    // Validar Nome do Mapa
    const mapName = document.getElementById('mapName').value.trim();
    if (!mapName) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome Necessário',
            text: 'Digite um nome para o mapa antes de continuar!',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    // Verificar se pelo menos o mapa dia foi carregado
    if (!uploadedFiles.dia) {
        Swal.fire({
            icon: 'warning',
            title: 'Upload Necessário',
            text: 'Faça upload da textura do mapa (Dia) antes de testar!',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    // Verificar se pasta já existe no MinIO
    try {
        console.log('🔍 Verificando se pasta já existe no MinIO...');
        const checkResponse = await fetch('/api/maps/check-exists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableId, mapName })
        });
        
        if (!checkResponse.ok) {
            throw new Error('Erro ao verificar existência da pasta');
        }
        
        const checkData = await checkResponse.json();
        console.log('📋 Resultado da verificação:', checkData);
        
        if (checkData.exists) {
            // Pasta já existe - perguntar se quer sobrescrever
            const confirm = await Swal.fire({
                title: 'Pasta já existe',
                html: `A pasta <b>${checkData.folderPath}</b> já contém ${checkData.fileCount} arquivo(s).<br><br>Deseja sobrescrever os arquivos existentes?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sim, Sobrescrever',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6366f1',
                reverseButtons: true
            });
            
            if (!confirm.isConfirmed) {
                console.log('❌ Usuário cancelou a sobrescrita');
                return;
            }
            
            // Deletar pasta antiga
            console.log('🗑️ Deletando pasta antiga...');
            const deleteResponse = await fetch('/api/maps/delete-folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId, mapName })
            });
            
            if (!deleteResponse.ok) {
                throw new Error('Erro ao deletar pasta antiga');
            }
            
            const deleteData = await deleteResponse.json();
            console.log(`✅ ${deleteData.deletedFiles} arquivo(s) deletado(s)`);
            
            Swal.fire({
                icon: 'success',
                title: 'Pasta Deletada',
                text: `${deleteData.deletedFiles} arquivo(s) removido(s) do MinIO`,
                timer: 2000,
                showConfirmButton: false
            });
        }
    } catch (error) {
        console.error('❌ Erro na verificação/deleção:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao verificar/deletar pasta existente: ' + error.message,
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    // Limpar assets antigos antes de carregar novos
    console.log('🔄 Limpando assets antigos...');
    try {
        // Limpar todos os assets antigos (texturas, colisões, etc)
        if (phaserScene && phaserScene.cleanupAll) {
            phaserScene.cleanupAll();
        }
        
        // Limpar estado de uploads de URLs
        uploadedUrls.dia = null;
        uploadedUrls.tarde = null;
        uploadedUrls.noite = null;
        uploadedUrls.limits = null;
        uploadedUrls.rooftopsDia = null;
        uploadedUrls.rooftopsTarde = null;
        uploadedUrls.rooftopsNoite = null;
        
        console.log('✅ Assets antigos limpos');
        
        // Aguardar um pouco para garantir que a limpeza foi concluída
        await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
        console.error('❌ Erro ao limpar assets:', error);
    }
    
    const btn = document.getElementById('btn-load-test');
    btn.disabled = true;
    btn.textContent = '⏳ Carregando...';
    
    try {
        console.log('📤 Iniciando uploads para MinIO...');
        
        // 1. Fazer upload de todos os arquivos para MinIO
        console.log('📤 Fazendo upload dos arquivos...');
        
        // Upload mapas (dia, tarde, noite)
        if (uploadedFiles.dia) {
            console.log('📤 Uploading DIA...');
            await uploadToMinIO('dia', uploadedFiles.dia, mapName, null, tableId);
            console.log('✅ DIA uploaded');
        }
        if (uploadedFiles.tarde) {
            console.log('📤 Uploading TARDE...');
            await uploadToMinIO('tarde', uploadedFiles.tarde, mapName, null, tableId);
            console.log('✅ TARDE uploaded');
        }
        if (uploadedFiles.noite) {
            console.log('📤 Uploading NOITE...');
            await uploadToMinIO('noite', uploadedFiles.noite, mapName, null, tableId);
            console.log('✅ NOITE uploaded');
        }
        
        // Upload limits
        if (uploadedFiles.limits) {
            console.log('📤 Uploading LIMITS...');
            await uploadToMinIO('limits', uploadedFiles.limits, mapName, null, tableId);
            console.log('✅ LIMITS uploaded');
        }
        
        // Upload rooftops (3 horários)
        if (uploadedFiles.rooftopsDia) {
            console.log('📤 Uploading ROOFTOPS DIA...');
            await uploadToMinIO('rooftops', uploadedFiles.rooftopsDia, mapName, 'dia', tableId);
            console.log('✅ ROOFTOPS DIA uploaded');
        }
        if (uploadedFiles.rooftopsTarde) {
            console.log('📤 Uploading ROOFTOPS TARDE...');
            await uploadToMinIO('rooftops', uploadedFiles.rooftopsTarde, mapName, 'tarde', tableId);
            console.log('✅ ROOFTOPS TARDE uploaded');
        }
        if (uploadedFiles.rooftopsNoite) {
            console.log('📤 Uploading ROOFTOPS NOITE...');
            await uploadToMinIO('rooftops', uploadedFiles.rooftopsNoite, mapName, 'noite', tableId);
            console.log('✅ ROOFTOPS NOITE uploaded');
        }
        
        console.log('✅ Todos os arquivos enviados!');
        console.log('📋 URLs carregadas:', uploadedUrls);
        
        // 2. Atualizar dimensões do mapa no Phaser
        const width = parseInt(document.getElementById('mapWidth').value);
        const height = parseInt(document.getElementById('mapHeight').value);
        const spawnX = parseInt(document.getElementById('spawnX').value);
        const spawnY = parseInt(document.getElementById('spawnY').value);
        
        console.log('📏 Atualizando dimensões:', { width, height, spawnX, spawnY });
        phaserScene.updateMapDimensions(width, height, spawnX, spawnY);
        
        // 3. Carregar texturas no Phaser
        console.log('🖼️ Carregando texturas no Phaser...');
        
        if (uploadedUrls.dia) {
            // Converter URL do MinIO para URL do proxy
            const proxyUrl = convertToProxyUrl(uploadedUrls.dia);
            console.log('🖼️ Carregando DIA no Phaser:', proxyUrl);
            phaserScene.loadMapTexture('dia', proxyUrl);
        }
        if (uploadedUrls.tarde) {
            const proxyUrl = convertToProxyUrl(uploadedUrls.tarde);
            console.log('🖼️ Carregando TARDE no Phaser:', proxyUrl);
            phaserScene.loadMapTexture('tarde', proxyUrl);
        }
        if (uploadedUrls.noite) {
            const proxyUrl = convertToProxyUrl(uploadedUrls.noite);
            console.log('🖼️ Carregando NOITE no Phaser:', proxyUrl);
            phaserScene.loadMapTexture('noite', proxyUrl);
        }
        if (uploadedUrls.limits) {
            const proxyUrl = convertToProxyUrl(uploadedUrls.limits);
            console.log('🖼️ Carregando LIMITS no Phaser:', proxyUrl);
            phaserScene.loadLimitsTexture(proxyUrl);
        }
        if (uploadedUrls.rooftopsDia) {
            const proxyUrl = convertToProxyUrl(uploadedUrls.rooftopsDia);
            console.log('🖼️ Carregando ROOFTOPS DIA no Phaser:', proxyUrl);
            phaserScene.loadRooftopsTexture('dia', proxyUrl);
        }
        if (uploadedUrls.rooftopsTarde) {
            const proxyUrl = convertToProxyUrl(uploadedUrls.rooftopsTarde);
            console.log('🖼️ Carregando ROOFTOPS TARDE no Phaser:', proxyUrl);
            phaserScene.loadRooftopsTexture('tarde', proxyUrl);
        }
        if (uploadedUrls.rooftopsNoite) {
            const proxyUrl = convertToProxyUrl(uploadedUrls.rooftopsNoite);
            console.log('🖼️ Carregando ROOFTOPS NOITE no Phaser:', proxyUrl);
            phaserScene.loadRooftopsTexture('noite', proxyUrl);
        }
        
        // Aplicar horário selecionado após delay
        const selectedTime = document.getElementById('test-time').value;
        console.log('⏰ Aguardando 2s e aplicando horário:', selectedTime);
        setTimeout(() => {
            phaserScene.changeTimeOfDay(selectedTime);
            console.log('✅ Horário aplicado');
        }, 2000);
        
        Swal.fire({
            icon: 'success',
            title: 'Mapa Carregado!',
            html: '✅ Mapa carregado no teste com sucesso!<br><br>Use <strong>WASD</strong> para mover o personagem.',
            confirmButtonColor: '#10b981',
            timer: 3000
        });
        
    } catch (error) {
        console.error('❌ Erro ao carregar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao Carregar',
            text: error.message || 'Ocorreu um erro ao carregar o mapa.',
            confirmButtonColor: '#ef4444'
        });
    } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Carregar no Teste';
    }
}

// ============================================================
// UPLOAD TO MINIO
// ============================================================

// Helper para converter URL do MinIO para URL do proxy
function convertToProxyUrl(minioUrl) {
    // Exemplo: https://s3.rezum.me/rezumme/rpg/maps/porto/dia/123.png
    // Converter para: /minio-proxy/maps/porto/dia/123.png
    
    if (!minioUrl) return null;
    
    // Remover o prefixo do MinIO (bucket rezumme)
    const path = minioUrl.replace('https://s3.rezum.me/rezumme/', '');
    return `/minio-proxy/${path}`;
}

async function uploadToMinIO(type, file, mapName, timeOfDay = null, tableId = null) {
    const formData = new FormData();
    
    // Determinar endpoint
    let endpoint = '';
    let urlKey = type; // Chave para armazenar a URL
    
    if (type === 'dia' || type === 'tarde' || type === 'noite') {
        endpoint = '/api/upload/map';
        formData.append('mapFile', file);
        formData.append('timeOfDay', type);
        formData.append('mapName', mapName);
        formData.append('tableId', tableId);
    } else if (type === 'limits') {
        endpoint = '/api/upload/limits';
        formData.append('limitsFile', file);
        formData.append('mapName', mapName);
        formData.append('tableId', tableId);
    } else if (type === 'rooftops') {
        endpoint = '/api/upload/rooftops';
        formData.append('rooftopsFile', file);
        formData.append('mapName', mapName);
        formData.append('tableId', tableId);
        
        // Para telhados, adicionar horário ao upload
        if (timeOfDay) {
            formData.append('timeOfDay', timeOfDay);
            // Mapear chave correta: rooftopsDia, rooftopsTarde, rooftopsNoite
            urlKey = timeOfDay === 'dia' ? 'rooftopsDia' :
                     timeOfDay === 'tarde' ? 'rooftopsTarde' :
                     timeOfDay === 'noite' ? 'rooftopsNoite' : 'rooftops';
        }
    }
    
    console.log(`📤 Uploading ${type}${timeOfDay ? ' ' + timeOfDay : ''} to ${endpoint}...`);
    
    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no upload');
    }
    
    const result = await response.json();
    uploadedUrls[urlKey] = result.url;
    
    console.log(`✅ ${type}${timeOfDay ? ' ' + timeOfDay : ''} uploaded:`, result.url);
    return result;
}

// ============================================================
// SAVE MAP TO DATABASE
// ============================================================

async function saveMapToDatabase() {
    const mapName = document.getElementById('mapName').value.trim();
    
    if (!mapName) {
        Swal.fire({
            icon: 'warning',
            title: 'Nome Necessário',
            text: 'Digite um nome para o mapa!',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    if (!uploadedUrls.dia) {
        Swal.fire({
            icon: 'warning',
            title: 'Teste Necessário',
            text: 'Faça upload e teste o mapa antes de salvar!',
            confirmButtonColor: '#6366f1'
        });
        return;
    }
    
    const result = await Swal.fire({
        icon: 'question',
        title: 'Salvar Mapa?',
        html: `Deseja salvar o mapa <strong>"${mapName}"</strong> no banco de dados?<br><br>` +
              `Isso criará um novo mapa disponível no jogo.`,
        showCancelButton: true,
        confirmButtonText: '💾 Sim, Salvar!',
        cancelButtonText: '❌ Cancelar',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280'
    });
    
    if (!result.isConfirmed) return;
    
    const btn = document.getElementById('btn-save-map');
    btn.disabled = true;
    btn.textContent = '⏳ Salvando...';
    
    try {
        const mapData = {
            nome: mapName,
            width: parseInt(document.getElementById('mapWidth').value),
            height: parseInt(document.getElementById('mapHeight').value),
            spawnX: parseInt(document.getElementById('spawnX').value),
            spawnY: parseInt(document.getElementById('spawnY').value),
            dia: uploadedUrls.dia,
            tarde: uploadedUrls.tarde || uploadedUrls.dia,
            noite: uploadedUrls.noite || uploadedUrls.dia,
            limits: uploadedUrls.limits || '',
            roofsDia: uploadedUrls.rooftopsDia || '',
            roofsTarde: uploadedUrls.rooftopsTarde || uploadedUrls.rooftopsDia || '',
            roofsNoite: uploadedUrls.rooftopsNoite || uploadedUrls.rooftopsDia || ''
        };
        
        console.log('💾 Salvando mapa:', mapData);
        
        const response = await fetch('/api/maps/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(mapData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao salvar');
        }
        
        const result = await response.json();
        
        await Swal.fire({
            icon: 'success',
            title: 'Mapa Salvo!',
            html: `<strong>${result.message}</strong><br><br>` +
                  `<strong>ID do Mapa:</strong> ${result.mapId}<br><br>` +
                  `O mapa já está disponível no jogo!`,
            confirmButtonColor: '#10b981'
        });
        
        // Perguntar se quer criar outro
        const createAnother = await Swal.fire({
            icon: 'question',
            title: 'Criar Outro Mapa?',
            text: 'Deseja criar outro mapa agora?',
            showCancelButton: true,
            confirmButtonText: '✅ Sim',
            cancelButtonText: '❌ Não, Fechar',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#6b7280'
        });
        
        if (createAnother.isConfirmed) {
            location.reload();
        } else {
            window.close();
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro ao Salvar',
            text: error.message || 'Ocorreu um erro ao salvar o mapa no banco de dados.',
            confirmButtonColor: '#ef4444'
        });
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Salvar Mapa no Banco';
    }
}
