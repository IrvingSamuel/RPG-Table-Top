# 🎲 Teste do Painel Admin - Road to Valhalla

## ✅ Correções Aplicadas

### Problema Identificado
Os botões não estavam funcionando porque:
1. O `admin.js` tentava usar `Client.changeScene()` e `Client.pause()` que não existiam no contexto admin
2. Scripts desnecessários do jogo (game.js, sceneA.js, etc.) estavam sendo carregados

### Solução Implementada
1. **Conexão Socket.IO direta no admin.js**
   - Criado `adminSocket = io()` para conectar direto ao servidor
   - Eventos emitidos via `adminSocket.emit('scene', mapId)` e `adminSocket.emit('time', time)`
   - Eventos recebidos via `adminSocket.on('scene', callback)` para atualizar UI

2. **Simplificação do HTML**
   - Removidos scripts do jogo (game.js, scenes, main.js, client.js)
   - Mantido apenas: Bootstrap, admin.js

3. **Funções Atualizadas**
   - `changeScene(mapId, time)` - Emite eventos 'scene' e 'time' via Socket.IO
   - `pauseGame()` - Emite evento 'pause' com valor 1
   - `resumeGame()` - Emite evento 'pause' com valor 0

## 🧪 Como Testar

### 1. Acesse o Painel Admin
```
URL: http://localhost:8083/admin
ou
URL: http://seu-dominio/admin
```

### 2. Abra o Jogo em Outra Aba
```
URL: http://localhost:8083/jogo
ou
URL: http://seu-dominio/jogo
```

### 3. Teste Mudança de Cena
1. No painel admin, clique em um dos botões de horário (Dia/Tarde/Noite)
2. Observe:
   - ✅ O botão clicado fica destacado (active)
   - ✅ O "Status Atual" atualiza
   - ✅ Na aba do jogo, a cena muda instantaneamente

### 4. Teste Pause/Resume
1. No painel admin, clique em "Pausar Jogo"
2. Observe na aba do jogo:
   - ✅ O jogo congela (jogadores não podem se mover)
3. Clique em "Continuar Jogo"
4. Observe:
   - ✅ O jogo volta ao normal

### 5. Teste Atualizar Dados
1. Clique em "Atualizar Dados"
2. Observe:
   - ✅ Mapas e jogadores são recarregados
   - ✅ Status atual é atualizado

## 🔍 Verificar Console do Navegador

Abra o DevTools (F12) e verifique o console:

**Mensagens esperadas ao carregar:**
```
🎲 Painel do Mestre inicializado
✅ Socket.IO conectado no painel admin
✅ Mapas carregados: (3) […]
✅ Jogadores carregados: (7) […]
✅ Cena atual carregada: {id: 1, mapa: 1, horario: 'n', estado: '0'}
```

**Mensagens ao mudar cena:**
```
🎬 Mudando para mapa 2, horário d
📍 Cena mudou para: 2
🕐 Horário mudou para: d
✅ Cena atual carregada: {id: 1, mapa: 2, horario: 'd', estado: '0'}
```

**Mensagens ao pausar:**
```
⏸️ Pausando jogo
⏯️ Pause estado: 1
```

## 🚨 Solução de Problemas

### Socket.IO não conecta
```
Erro: ❌ Socket.IO não está disponível!
Solução: Verifique se /socket.io/socket.io.js está carregando
```

### Botões não respondem
```
Erro: ❌ Socket não está conectado!
Solução: Aguarde a mensagem "✅ Socket.IO conectado" no console
```

### Jogo não muda de cena
```
Verificar:
1. PM2 está rodando: pm2 status
2. Logs do servidor: pm2 logs rpg
3. Eventos sendo emitidos no console do navegador
```

## 📊 Logs do Servidor

Para ver se os eventos estão chegando:
```bash
pm2 logs rpg --lines 20
```

**Mensagens esperadas:**
```
Changing Scene...
Changing Time...
Conectado com sucesso, buscando informação
✅ Cena atual enviada: RowDataPacket { id: 1, mapa: 2, horario: 'd' }
```

## ✨ Funcionalidades Testadas

- [x] Conexão Socket.IO no painel admin
- [x] Emissão de eventos 'scene', 'time', 'pause'
- [x] Recepção de eventos e atualização da UI
- [x] Renderização de mapas dinâmicos
- [x] Renderização de jogadores
- [x] Status atual sincronizado
- [ ] Modais de adicionar mapa/jogador (em desenvolvimento)
- [ ] WebSocket real-time para jogadores online (próxima feature)

## 🎯 Próximos Passos

1. Implementar modais de criação de mapas/jogadores
2. Adicionar contador de jogadores online em tempo real
3. Sistema de permissões (apenas admin pode acessar)
4. Histórico de mudanças de cena
5. Chat do mestre com jogadores
