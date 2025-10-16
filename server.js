// Carregar variáveis de ambiente PRIMEIRO
require('dotenv').config();

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');

// Importar MinIO após carregar as variáveis de ambiente
const minio = require('./config/minio');

// Configurar multer para upload em memória (enviaremos direto para MinIO)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // Limite de 50MB por arquivo
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, webp, svg)'));
        }
    }
});

// Constantes do jogo
const DEFAULT_TABLE_ID = 1; // Mesa de Teste 1 (até implementarmos sistema de múltiplas mesas)

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://bigbridge.com.br/");
  next();
});

// Importação do arquivo de rotas
// require('./js/routes.js');
app.use('/css',express.static(__dirname + '/css'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/assets',express.static(__dirname + '/assets'));
app.use('/spritesheets',express.static(__dirname + '/lcp/spritesheets'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

app.get('/jogo',function(req,res){
    res.sendFile(__dirname+'/jogo.html');
});
app.get('/admin',function(req,res){
    res.sendFile(__dirname+'/admin.html');
});
app.get('/map-tester',function(req,res){
    res.sendFile(__dirname+'/map-tester.html');
});
app.get('/teste',function(req,res){
    res.sendFile(__dirname+'/teste.html');
});

app.get('/lcp',function(req,res){
    res.sendFile(__dirname+'/lcp/index.html');
});
app.get('/jhash-2.1.min.js',function(req,res){
    res.sendFile(__dirname+'/lcp/jhash-2.1.min.js');
});
app.get('/sources/chargen.js',function(req,res){
    res.sendFile(__dirname+'/lcp/sources/chargen.js');
});
app.get('/chargen.css',function(req,res){
    res.sendFile(__dirname+'/lcp/chargen.css');
});
app.get('/spritesheets',function(req,res){
    res.sendFile(__dirname + req.url);
});
app.get('/turn',function(req,res){
    res.sendFile(__dirname + '/contador.html');
});

// API para buscar informações da mesa de jogo
app.get('/api/table-info/:tableId', function(req, res) {
    const tableId = parseInt(req.params.tableId) || DEFAULT_TABLE_ID;
    
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg'
    });
    
    connection.connect((error) => {
        if (error) {
            console.error('❌ Erro ao conectar ao MySQL:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }
        
        const query = 'SELECT id, table_name, load_screen, is_active FROM game_tables WHERE id = ?';
        
        connection.query(query, [tableId], (error, results) => {
            connection.end();
            
            if (error) {
                console.error('❌ Erro ao buscar informações da mesa:', error);
                return res.status(500).json({ error: 'Query error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Table not found' });
            }
            
            console.log('✅ Informações da mesa enviadas:', results[0]);
            res.json(results[0]);
        });
    });
});

// API para buscar todos os mapas disponíveis
app.get('/api/maps', function(req, res) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg'
    });
    
    connection.connect((error) => {
        if (error) {
            console.error('❌ Erro ao conectar ao MySQL:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }
        
        const query = 'SELECT * FROM mapas ORDER BY id';
        
        connection.query(query, (error, results) => {
            connection.end();
            
            if (error) {
                console.error('❌ Erro ao buscar mapas:', error);
                return res.status(500).json({ error: 'Query error' });
            }
            
            console.log('✅ Mapas enviados:', results.length);
            res.json(results);
        });
    });
});

// API para buscar todos os jogadores
app.get('/api/players', function(req, res) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg'
    });
    
    connection.connect((error) => {
        if (error) {
            console.error('❌ Erro ao conectar ao MySQL:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }
        
        const query = 'SELECT * FROM players ORDER BY id';
        
        connection.query(query, (error, results) => {
            connection.end();
            
            if (error) {
                console.error('❌ Erro ao buscar jogadores:', error);
                return res.status(500).json({ error: 'Query error' });
            }
            
            console.log('✅ Jogadores enviados:', results.length);
            res.json(results);
        });
    });
});

// API para buscar informações de um mapa específico
app.get('/api/map/:mapId', function(req, res) {
    const mapId = parseInt(req.params.mapId);
    
    if (!mapId || mapId < 1) {
        return res.status(400).json({ error: 'Invalid map ID' });
    }
    
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg'
    });
    
    connection.connect((error) => {
        if (error) {
            console.error('❌ Erro ao conectar ao MySQL:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }
        
        const query = 'SELECT * FROM mapas WHERE id = ? LIMIT 1';
        
        connection.query(query, [mapId], (error, results) => {
            connection.end();
            
            if (error) {
                console.error('❌ Erro ao buscar mapa:', error);
                return res.status(500).json({ error: 'Query error' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Map not found' });
            }
            
            console.log('✅ Mapa enviado:', results[0].nome);
            res.json(results[0]);
        });
    });
});

// ============================================================
// ENDPOINTS DE UPLOAD PARA MINIO
// ============================================================

// Verificar se pasta do mapa existe no MinIO
app.post('/api/maps/check-exists', express.json(), async (req, res) => {
    try {
        const { tableId, mapName } = req.body;
        
        if (!tableId || !mapName) {
            return res.status(400).json({ error: 'tableId e mapName são obrigatórios' });
        }
        
        const sanitizedMapName = mapName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const folderPath = `rpg/maps/${tableId}_${sanitizedMapName}/`;
        
        // Listar arquivos na pasta
        const files = await minio.listFiles(folderPath);
        
        res.json({
            exists: files.length > 0,
            fileCount: files.length,
            folderPath: folderPath
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar pasta:', error);
        res.status(500).json({ error: error.message });
    }
});

// Deletar pasta completa do mapa no MinIO
app.post('/api/maps/delete-folder', express.json(), async (req, res) => {
    try {
        const { tableId, mapName } = req.body;
        
        if (!tableId || !mapName) {
            return res.status(400).json({ error: 'tableId e mapName são obrigatórios' });
        }
        
        const sanitizedMapName = mapName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const folderPath = `rpg/maps/${tableId}_${sanitizedMapName}/`;
        
        // Deletar todos os arquivos da pasta
        const deletedCount = await minio.deleteFolder(folderPath);
        
        console.log(`✅ Pasta deletada: ${folderPath} (${deletedCount} arquivos)`);
        
        res.json({
            success: true,
            deletedFiles: deletedCount,
            folderPath: folderPath
        });
        
    } catch (error) {
        console.error('❌ Erro ao deletar pasta:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload de textura de mapa (dia/tarde/noite)
app.post('/api/upload/map', upload.single('mapFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { timeOfDay, mapName, tableId } = req.body;
        if (!timeOfDay || !mapName || !tableId) {
            return res.status(400).json({ error: 'timeOfDay, mapName e tableId são obrigatórios' });
        }

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const sanitizedMapName = mapName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const ext = path.extname(req.file.originalname);
        const fileName = `rpg/maps/${tableId}_${sanitizedMapName}/${timeOfDay}/${timestamp}${ext}`;

        // Upload para MinIO
        const result = await minio.uploadFile(req.file.buffer, fileName, req.file.mimetype);

        console.log('✅ Mapa uploaded:', fileName);
        res.json({
            success: true,
            fileName: fileName,
            url: result.url,
            size: req.file.size,
            timeOfDay: timeOfDay
        });

    } catch (error) {
        console.error('❌ Erro no upload do mapa:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload de camada de colisões (limits)
app.post('/api/upload/limits', upload.single('limitsFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { mapName, tableId } = req.body;
        if (!mapName || !tableId) {
            return res.status(400).json({ error: 'mapName e tableId são obrigatórios' });
        }

        const timestamp = Date.now();
        const sanitizedMapName = mapName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const ext = path.extname(req.file.originalname);
        const fileName = `rpg/maps/${tableId}_${sanitizedMapName}/limits/${timestamp}${ext}`;

        const result = await minio.uploadFile(req.file.buffer, fileName, req.file.mimetype);

        console.log('✅ Limits uploaded:', fileName);
        res.json({
            success: true,
            fileName: fileName,
            url: result.url,
            size: req.file.size
        });

    } catch (error) {
        console.error('❌ Erro no upload dos limits:', error);
        res.status(500).json({ error: error.message });
    }
});

// Upload de camada de telhados (rooftops)
app.post('/api/upload/rooftops', upload.single('rooftopsFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const { mapName, tableId, timeOfDay } = req.body;
        if (!mapName || !tableId) {
            return res.status(400).json({ error: 'mapName e tableId são obrigatórios' });
        }

        const timestamp = Date.now();
        const sanitizedMapName = mapName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const ext = path.extname(req.file.originalname);
        
        // Se timeOfDay for fornecido, salvar em subpasta específica
        const subfolder = timeOfDay ? `/${timeOfDay}` : '';
        const fileName = `rpg/maps/${tableId}_${sanitizedMapName}/rooftops${subfolder}/${timestamp}${ext}`;

        const result = await minio.uploadFile(req.file.buffer, fileName, req.file.mimetype);

        console.log('✅ Rooftops uploaded:', fileName);
        res.json({
            success: true,
            fileName: fileName,
            url: result.url,
            size: req.file.size,
            timeOfDay: timeOfDay || null
        });

    } catch (error) {
        console.error('❌ Erro no upload dos rooftops:', error);
        res.status(500).json({ error: error.message });
    }
});

// Criar novo mapa completo no banco de dados
app.post('/api/maps/create', express.json(), async (req, res) => {
    try {
        const { nome, width, height, spawnX, spawnY, dia, tarde, noite, limits, roofsDia, roofsTarde, roofsNoite } = req.body;

        if (!nome || !width || !height || !spawnX || !spawnY || !dia) {
            return res.status(400).json({ 
                error: 'Campos obrigatórios: nome, width, height, spawnX, spawnY, dia' 
            });
        }

        // Criar conexão com MySQL
        const connection = mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'bigbridge-rpg',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE || 'bigbridge-rpg'
        });

        connection.connect((error) => {
            if (error) {
                console.error('❌ Erro ao conectar ao MySQL:', error);
                return res.status(500).json({ error: 'Database connection error' });
            }
        });

        const query = `
            INSERT INTO mapas (nome, width, height, x, y, dia, tarde, noite, limits, roofs_dia, roofs_tarde, roofs_noite) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            nome,
            parseInt(width),
            parseInt(height),
            parseInt(spawnX),
            parseInt(spawnY),
            dia,
            tarde || dia, // Se não tiver tarde, usa dia
            noite || dia, // Se não tiver noite, usa dia
            limits || '',
            roofsDia || '',
            roofsTarde || roofsDia || '', // Se não tiver tarde, usa dia
            roofsNoite || roofsDia || ''  // Se não tiver noite, usa dia
        ];

        connection.query(query, values, (error, results) => {
            connection.end();

            if (error) {
                console.error('❌ Erro ao criar mapa:', error);
                return res.status(500).json({ error: 'Query error' });
            }

            console.log('✅ Novo mapa criado:', nome, '- ID:', results.insertId);
            res.json({
                success: true,
                mapId: results.insertId,
                message: `Mapa "${nome}" criado com sucesso!`
            });
        });

    } catch (error) {
        console.error('❌ Erro ao criar mapa:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// BUSCAR MAPA POR ID OU NOME
// ============================================================

app.get('/api/maps/get/:identifier', async (req, res) => {
    try {
        const { identifier } = req.params;
        
        // Verifica se é um número (ID) ou string (nome)
        const isNumeric = /^\d+$/.test(identifier);
        const queryField = isNumeric ? 'id' : 'nome';
        const queryValue = isNumeric ? parseInt(identifier) : identifier;

        const connection = mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'bigbridge-rpg',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE || 'bigbridge-rpg'
        });

        connection.connect((error) => {
            if (error) {
                console.error('❌ Erro ao conectar ao MySQL:', error);
                return res.status(500).json({ error: 'Database connection error' });
            }
        });

        const query = `SELECT * FROM mapas WHERE ${queryField} = ? LIMIT 1`;

        connection.query(query, [queryValue], (error, results) => {
            connection.end();

            if (error) {
                console.error('❌ Erro ao buscar mapa:', error);
                return res.status(500).json({ error: 'Query error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Mapa não encontrado' });
            }

            console.log(`✅ Mapa encontrado por ${queryField}:`, queryValue, '→', results[0].nome);
            res.json({
                success: true,
                map: results[0]
            });
        });

    } catch (error) {
        console.error('❌ Erro ao buscar mapa:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PROXY PARA IMAGENS DO MINIO (Resolver CORS)
// ============================================================

// Rota proxy para servir imagens do MinIO com CORS correto
app.get('/minio-proxy/*', async (req, res) => {
    try {
        const filePath = req.params[0]; // Pega tudo depois de /minio-proxy/
        const minioUrl = `https://s3.rezum.me/rezumme/${filePath}`;
        
        console.log('🖼️ Proxy MinIO:', filePath);
        console.log('🔗 URL completa:', minioUrl);
        
        // Fazer requisição para o MinIO
        const https = require('https');
        const url = require('url');
        const path = require('path');
        
        const options = url.parse(minioUrl);
        
        https.get(options, (minioRes) => {
            // Determinar Content-Type baseado na extensão
            const ext = path.extname(filePath).toLowerCase();
            let contentType = 'application/octet-stream';
            
            switch(ext) {
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
                case '.gif':
                    contentType = 'image/gif';
                    break;
                case '.webp':
                    contentType = 'image/webp';
                    break;
                case '.svg':
                    contentType = 'image/svg+xml';
                    break;
                default:
                    // Tentar usar o Content-Type do MinIO
                    contentType = minioRes.headers['content-type'] || 'application/octet-stream';
            }
            
            // Configurar headers CORS corretos
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 ano
            
            console.log(`✅ Servindo ${filePath} como ${contentType}`);
            
            // Pipe da resposta do MinIO para o cliente
            minioRes.pipe(res);
            
        }).on('error', (error) => {
            console.error('❌ Erro ao buscar do MinIO:', error);
            res.status(500).json({ error: 'Failed to fetch from MinIO' });
        });
        
    } catch (error) {
        console.error('❌ Erro no proxy MinIO:', error);
        res.status(500).json({ error: error.message });
    }
});

// API para buscar cena atual
app.get('/api/current-scene', function(req, res) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg'
    });
    
    connection.connect((error) => {
        if (error) {
            console.error('❌ Erro ao conectar ao MySQL:', error);
            return res.status(500).json({ error: 'Database connection error' });
        }
        
        const query = 'SELECT * FROM atual LIMIT 1';
        
        connection.query(query, (error, results) => {
            connection.end();
            
            if (error) {
                console.error('❌ Erro ao buscar cena atual:', error);
                return res.status(500).json({ error: 'Query error' });
            }
            
            console.log('✅ Cena atual enviada:', results[0]);
            res.json(results[0] || {});
        });
    });
});

server.lastPlayderID = 0;
server.lastPlayers = [];
server.bulletInfo = [];
server.isaac = -1;

server.listen(process.env.PORT || 8083,function(){
    console.log('Listening on '+server.address().port);
});

io.on('connection',function(socket){

    socket.on('newplayer',function(sprite){
        console.log('generating player...')
        socket.player = {
            id: server.lastPlayderID++,
            x: 100,//randomInt(200,400),
            y: 450,//randomInt(200,400)
            sprite: sprite
        };
        server.lastPlayers = getAllPlayers();
        socket.emit('allplayers',server.lastPlayers,socket.player.id);
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('click',function(data){
            // console.log('click to '+data.x+', '+data.y+', '+socket.player.id);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('move',socket.player,data.movement);
        });
    
        socket.on('disconnect',function(){
            if(socket.player.id == socket.isaac){
                socket.isaac = -1;
            }
            io.emit('remove',socket.player.id);
        });
    
        socket.on('shot',function(data){
            console.log('generating bullet...');
            console.log(data);
            socket.emit('generateShot',data); 
            socket.broadcast.emit('generateShot',data);            
        });
    
        socket.on('reach',function(id){
            console.log('removing bullet...');
            socket.emit('removeBullet',id); 
            socket.broadcast.emit('removeBullet',id);            
        });
    
        socket.on('roll',function(data){
            console.log('generating roll...');
            socket.emit('generateRoll',data); 
            socket.broadcast.emit('generateRoll',data);            
        });
        
        socket.on('verify',function(){
            server.verify = getAllPlayers();
            if(server.verify != server.lastPlayers){
                server.lastPlayers = server.verify;
                socket.emit('refreshplayers',server.lastPlayers,socket.player.id);
            }
            
        });
    });

    socket.on('test',function(){
        console.log('test received');
    });

    socket.on('scene',function(scene){
        console.log('Changing Scene...'); 
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'bigbridge-rpg',
            password: 'eV10PiSKpfpyUBi8HfRn',
            database: 'bigbridge-rpg',
          });
        connection.connect((error) => {
            if(error){
              console.log('Error connecting to the MySQL Database');
              return;
            }
            console.log('Conectado com sucesso, buscando informação');
          });
        connection.query(`UPDATE atual SET mapa='${scene}' WHERE id = 1`, function (err, result, fields) {
            if (err) throw err;
            var newScene;
            getBD(function(result){
                newScene = result;
                socket.broadcast.emit('generateScene',newScene);  
            }); 
        });
        connection.end((error) => {
        });       
    });

    socket.on('time',function(time){
        console.log('Changing Time...');
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'bigbridge-rpg',
            password: 'eV10PiSKpfpyUBi8HfRn',
            database: 'bigbridge-rpg',
          });
        connection.connect((error) => {
            if(error){
              console.log('Error connecting to the MySQL Database');
              return;
            }
            console.log('Conectado com sucesso, buscando informação');
          });
        connection.query(`UPDATE atual SET horario='${time}' WHERE id = 1`, function (err, result, fields) {
            if (err) throw err;
        });
        connection.end((error) => {
        });
        socket.broadcast.emit('generateTime',time);            
    });

    socket.on('pause',function(value){
        console.log('Pausing...');
        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'bigbridge-rpg',
            password: 'eV10PiSKpfpyUBi8HfRn',
            database: 'bigbridge-rpg',
          });
        connection.connect((error) => {
            if(error){
              console.log('Error connecting to the MySQL Database');
              return;
            }
            console.log('Conectado com sucesso, buscando informação');
          });
        connection.query(`UPDATE atual SET estado='${value}' WHERE id = 1`, function (err, result, fields) {
            if (err) throw err;
        });
        connection.end((error) => {
        });
        socket.broadcast.emit('pause',value);            
    });

    socket.on('getLastScene',function(){
        console.log('Emitting...');
        var lastScene;
        var doors;
        getBD(function(result){
            lastScene = result;
            socket.emit('lastScene',lastScene);   
        }); 
        getDoors(function(result){
            doors = result;
            socket.emit('doors',doors);   
        });     
    });

    socket.on('getTurn',function(){
        console.log('Buscando...');
        var playersturn;
        getTurns(function(result){
            playersturn = result;
            socket.emit('turns',playersturn);   
        });     
    });

    socket.on('sendRotation',function(id,rotation){ 
        socket.broadcast.emit('emitRotation',id, rotation); 
    });

    // === HANDLERS DE CHAT E DADOS ===

    // Recebe mensagem de chat
    socket.on('chatMessage', function(messageData) {
        console.log('Mensagem recebida:', messageData);
        
        // Salva no banco de dados
        saveChatMessage(messageData, function(success) {
            if (success) {
                // Retransmite para todos os clientes
                io.emit('chatMessage', messageData);
                console.log('Mensagem salva e retransmitida');
            } else {
                console.error('Erro ao salvar mensagem');
            }
        });
    });

    // Recebe rolagem de dados
    socket.on('diceRoll', function(diceData) {
        console.log('Dado rolado:', diceData);
        
        // Salva no banco de dados
        saveDiceRoll(diceData, function(success) {
            if (success) {
                // Retransmite para todos os clientes
                io.emit('diceRoll', diceData);
                console.log('Rolagem salva e retransmitida');
            } else {
                console.error('Erro ao salvar rolagem');
            }
        });
    });

    // Solicita histórico de mensagens
    socket.on('getChatHistory', function(limit = 50) {
        console.log('📚 Solicitação de histórico de chat, limit:', limit);
        getChatHistory(limit, function(messages) {
            console.log('📤 Enviando histórico:', messages.length, 'mensagens');
            socket.emit('chatHistory', messages);
        });
    });

    // Solicita histórico de rolagens
    socket.on('getDiceHistory', function(limit = 20) {
        getDiceHistory(limit, function(rolls) {
            socket.emit('diceHistory', rolls);
        });
    });
    
    // Solicita histórico completo (mensagens + rolagens ordenadas)
    socket.on('getFullHistory', function(limit = 50) {
        console.log('📚 Solicitação de histórico completo, limit:', limit);
        getFullHistory(limit, function(history) {
            console.log('📤 Enviando histórico completo:', history.length, 'itens');
            socket.emit('fullHistory', history);
        });
    });

    // Envia contagem de jogadores quando alguém conecta
    socket.emit('playerCount', getAllPlayers().length);
    socket.broadcast.emit('playerCount', getAllPlayers().length);
});

function getBD(callback){
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg',
      });
    connection.connect((error) => {
        if(error){
          console.log('Error connecting to the MySQL Database');
          return;
        }
        console.log('Conectado com sucesso, buscando informação');
      });
    connection.query("SELECT a.*, b.* FROM atual a INNER JOIN mapas b ON a.mapa = b.id", function (err, result, fields) {
        if (err) throw err;
        var query = {};
        Object.keys(result).forEach(function(ID){
            var rows = result[ID];
            Object.keys(rows).forEach(function(key){
                var row = rows[key];
                query[`${key}`] = `${row}`;
            });
        });

        // Fetch doors related to the current map
        connection.query("SELECT * FROM doors WHERE mapa = ?", [query.id], function (err, doorsResult) {
            if (err) throw err;
            query['doors'] = doorsResult.length > 0 ? doorsResult : [];
            callback(query);
            connection.end((error) => {
                if (error) console.log('Error closing the connection:', error);
            });
        });
    });
}

function getTurns(callback){
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg',
      });
    connection.connect((error) => {
        if(error){
          console.log('Error connecting to the MySQL Database');
          return;
        }
        console.log('Conectado com sucesso, buscando informação');
      });
    connection.query("SELECT * FROM players ORDER BY nome ASC", function (err, result, fields) {
        if (err) throw err;
        var query = {};
        Object.keys(result).forEach(function(ID){
            var rows = result[ID];
            Object.keys(rows).forEach(function(key){
                var row = rows[key];
                query[`${key}`] = `${row}`;
            });
        });
        return callback(query);
    });
    connection.end((error) => {
    });
}

function getDoors(callback){
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg',
      });
    connection.connect((error) => {
        if(error){
          console.log('Error connecting to the MySQL Database');
          return;
        }
        console.log('Conectado com sucesso, buscando informação');
      });
    connection.query("SELECT a.mapa, b.* FROM atual a INNER JOIN doors b ON a.mapa = b.mapa", function (err, result, fields) {
        if (err) throw err;
        var query = [];
        Object.keys(result).forEach(function(ID){
            // var rows = result[ID];
            query.push(result[ID]);
            // Object.keys(rows).forEach(function(key){
            //     var row = rows[key];
            //     query[`${key}`] = parseInt(row);
            // });
        });
        console.log(query);
        return callback(query);
    });
    connection.end((error) => {
    });
}

function getAllPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });
    return players;
}
function getNewPlayers(){
    var players = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if((player) && lastPlayers.includes(player) == false){
            players.push(player);
            lastPlayers.push(player);
        }
    });
    return players;
}
function getAllData(data){
    var bullet = [];
    for(var i = 0; i < data.length; i++){
        bullet.push(data[i]);
    }
    return bullet;
}

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

// === FUNÇÕES DE BANCO DE DADOS PARA CHAT ===

// Configuração de conexão reutilizável
function createConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'bigbridge-rpg',
        password: 'eV10PiSKpfpyUBi8HfRn',
        database: 'bigbridge-rpg',
        charset: 'utf8mb4' // Para suportar emojis
    });
}

// Salvar mensagem de chat
function saveChatMessage(messageData, callback) {
    const connection = createConnection();
    
    connection.connect((error) => {
        if (error) {
            console.error('Erro ao conectar ao banco:', error);
            callback(false);
            return;
        }
    });

    const query = `
        INSERT INTO chat_messages (table_id, player_name, message_content, message_type, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    `;
    
    const values = [
        messageData.tableId || DEFAULT_TABLE_ID,
        messageData.player || 'Anônimo',
        messageData.content || '',
        messageData.type || 'message'
    ];

    connection.query(query, values, function(err, result) {
        if (err) {
            console.error('Erro ao salvar mensagem:', err);
            callback(false);
        } else {
            console.log('Mensagem salva com ID:', result.insertId, '- Mesa:', values[0]);
            callback(true);
        }
        
        connection.end();
    });
}

// Salvar rolagem de dados
function saveDiceRoll(diceData, callback) {
    const connection = createConnection();
    
    connection.connect((error) => {
        if (error) {
            console.error('Erro ao conectar ao banco:', error);
            callback(false);
            return;
        }
    });

    // Suporte para rolagens múltiplas
    const isMultiple = diceData.results && diceData.results.length > 1;
    const result = isMultiple ? diceData.results[0] : (diceData.result || 1);
    const rollCount = isMultiple ? diceData.count : 1;
    const allResults = isMultiple ? JSON.stringify(diceData.results) : null;
    const rollSum = isMultiple ? diceData.analysis.sum : null;
    const rollAvg = isMultiple ? parseFloat(diceData.analysis.avg) : null;

    const query = `
        INSERT INTO dice_rolls (
            table_id, player_name, dice_type, dice_result, 
            roll_count, all_results, roll_sum, roll_avg, 
            created_at
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const values = [
        diceData.tableId || DEFAULT_TABLE_ID,
        diceData.player || 'Anônimo',
        diceData.sides || 20,
        result,
        rollCount,
        allResults,
        rollSum,
        rollAvg
    ];

    connection.query(query, values, function(err, result) {
        if (err) {
            console.error('Erro ao salvar rolagem:', err);
            callback(false);
        } else {
            console.log('Rolagem salva com ID:', result.insertId, `(${rollCount}x D${diceData.sides})`);
            callback(true);
        }
        
        connection.end();
    });
}

// Buscar histórico de mensagens
function getChatHistory(limit, callback) {
    console.log('🔍 getChatHistory chamada, limit:', limit);
    const connection = createConnection();
    
    connection.connect((error) => {
        if (error) {
            console.error('Erro ao conectar ao banco:', error);
            callback([]);
            return;
        }
    });

    const query = `
        SELECT player_name, message_content, message_type, created_at 
        FROM chat_messages 
        WHERE table_id = ?
        ORDER BY created_at DESC 
        LIMIT ?
    `;

    connection.query(query, [DEFAULT_TABLE_ID, parseInt(limit)], function(err, results) {
        if (err) {
            console.error('Erro ao buscar histórico de chat:', err);
            callback([]);
        } else {
            console.log('✅ Histórico do banco:', results.length, 'mensagens encontradas - Mesa:', DEFAULT_TABLE_ID);
            // Reverse para mostrar em ordem cronológica
            const messages = results.reverse().map(row => ({
                player: row.player_name,
                content: row.message_content,
                type: row.message_type,
                timestamp: row.created_at.toISOString()
            }));
            callback(messages);
        }
        
        connection.end();
    });
}

// Buscar histórico de rolagens
function getDiceHistory(limit, callback) {
    const connection = createConnection();
    
    connection.connect((error) => {
        if (error) {
            console.error('Erro ao conectar ao banco:', error);
            callback([]);
            return;
        }
    });

    const query = `
        SELECT player_name, dice_type, dice_result, created_at 
        FROM dice_rolls 
        WHERE table_id = ?
        ORDER BY created_at DESC 
        LIMIT ?
    `;

    connection.query(query, [DEFAULT_TABLE_ID, parseInt(limit)], function(err, results) {
        if (err) {
            console.error('Erro ao buscar histórico de dados:', err);
            callback([]);
        } else {
            console.log('✅ Histórico de dados do banco:', results.length, 'rolagens encontradas - Mesa:', DEFAULT_TABLE_ID);
            // Reverse para mostrar em ordem cronológica
            const rolls = results.reverse().map(row => ({
                player: row.player_name,
                sides: row.dice_type,
                result: row.dice_result,
                timestamp: row.created_at.toISOString(),
                type: 'roll',
                content: `Rolou D${row.dice_type}`
            }));
            callback(rolls);
        }
        
        connection.end();
    });
}

// Buscar histórico completo (mensagens + rolagens ordenadas por data)
function getFullHistory(limit, callback) {
    console.log('🔍 getFullHistory chamada, limit:', limit);
    const connection = createConnection();
    
    connection.connect((error) => {
        if (error) {
            console.error('Erro ao conectar ao banco:', error);
            callback([]);
            return;
        }
    });

    // UNION de mensagens e rolagens, ordenado por data
    const query = `
        (SELECT 
            player_name as player, 
            message_content as content, 
            message_type as type,
            created_at,
            NULL as sides,
            NULL as result,
            NULL as roll_count,
            NULL as all_results,
            NULL as roll_sum,
            NULL as roll_avg
        FROM chat_messages 
        WHERE table_id = ?)
        UNION ALL
        (SELECT 
            player_name as player,
            CONCAT('Rolou D', dice_type) as content,
            'roll' as type,
            created_at,
            dice_type as sides,
            dice_result as result,
            roll_count,
            all_results,
            roll_sum,
            roll_avg
        FROM dice_rolls 
        WHERE table_id = ?)
        ORDER BY created_at ASC
        LIMIT ?
    `;

    connection.query(query, [DEFAULT_TABLE_ID, DEFAULT_TABLE_ID, parseInt(limit)], function(err, results) {
        if (err) {
            console.error('Erro ao buscar histórico completo:', err);
            callback([]);
        } else {
            console.log('✅ Histórico completo do banco:', results.length, 'itens encontrados - Mesa:', DEFAULT_TABLE_ID);
            
            const history = results.map(row => {
                const item = {
                    player: row.player,
                    content: row.content,
                    type: row.type,
                    timestamp: row.created_at.toISOString()
                };
                
                // Adiciona propriedades específicas de rolagem se for roll
                if (row.type === 'roll') {
                    item.sides = row.sides;
                    item.result = row.result;
                    
                    // Se for rolagem múltipla
                    if (row.roll_count > 1 && row.all_results) {
                        item.count = row.roll_count;
                        item.results = JSON.parse(row.all_results);
                        item.analysis = {
                            sum: row.roll_sum,
                            avg: parseFloat(row.roll_avg),
                            max: Math.max(...item.results),
                            min: Math.min(...item.results),
                            hasCriticalSuccess: item.results.some(r => r === row.sides),
                            hasCriticalFailure: item.results.some(r => r === 1)
                        };
                    }
                }
                
                return item;
            });
            
            callback(history);
        }
        
        connection.end();
    });
}

// Função para limpar mensagens antigas (executar diariamente)
// Função para limpar mensagens antigas (executar diariamente)
function cleanOldMessages() {
    const connection = createConnection();
    
    connection.connect((error) => {
        if (error) {
            console.error('Erro ao conectar ao banco:', error);
            return;
        }
    });

    // Remove mensagens mais antigas que 30 dias
    const cleanupQuery = `
        DELETE FROM chat_messages 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    connection.query(cleanupQuery, function(err, result) {
        if (err) {
            console.error('Erro ao limpar mensagens antigas:', err);
        } else {
            console.log(`${result.affectedRows} mensagens antigas removidas`);
        }
    });

    // Remove rolagens mais antigas que 30 dias
    const cleanupRollsQuery = `
        DELETE FROM dice_rolls 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;

    connection.query(cleanupRollsQuery, function(err, result) {
        if (err) {
            console.error('Erro ao limpar rolagens antigas:', err);
        } else {
            console.log(`${result.affectedRows} rolagens antigas removidas`);
        }
        
        connection.end();
    });
}

// Executar limpeza diariamente (24 horas)
setInterval(cleanOldMessages, 24 * 60 * 60 * 1000);

// ============================================================
// MINIO STORAGE INTEGRATION
// ============================================================

// Testar conexão MinIO no startup do servidor
async function testMinIOConnection() {
    console.log('🔍 Testando conexão MinIO...');
    try {
        const isConnected = await minio.testConnection();
        if (isConnected) {
            console.log('✅ MinIO conectado com sucesso!');
            console.log(`   Endpoint: ${process.env.AWS_ENDPOINT}`);
            console.log(`   Bucket: ${process.env.AWS_BUCKET}`);
            console.log(`   URL Público: ${minio.PUBLIC_URL}`);
        } else {
            console.error('❌ Falha na conexão MinIO - Verifique as credenciais');
        }
    } catch (error) {
        console.error('❌ Erro ao testar MinIO:', error.message);
    }
}

// Executar teste de conexão no startup
testMinIOConnection();

