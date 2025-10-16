# 🗺️ Sistema de Dimensões Dinâmicas de Mapas

## 📋 Resumo da Implementação

Implementado sistema que ajusta automaticamente os limites da câmera e física do jogo baseado nas dimensões reais (em pixels) de cada mapa carregado.

## ❌ Problema Anterior

- Dimensões fixadas em **1920x1920** pixels
- Todos os mapas usavam os mesmos bounds independente do tamanho real
- Câmera podia ir além dos limites visuais do mapa
- Jogadores podiam sair da área visível

## ✅ Solução Implementada

### 1. **Nova API de Mapas** (`server.js`)

```javascript
// GET /api/map/:mapId
// Retorna informações completas de um mapa específico
```

**Exemplo de resposta:**
```json
{
  "id": 1,
  "nome": "hospital",
  "x": 587,
  "y": 1670,
  "dia": "assets/maps/hospital/terreo/mapad.png",
  "tarde": "assets/maps/hospital/terreo/mapaa.png",
  "noite": "assets/maps/hospital/terreo/mapan.png",
  "limits": "assets/maps/hospital/terreo/limits.png"
}
```

### 2. **Sistema de Dimensões** (`main.js`)

#### Variáveis Globais
```javascript
let w = 1920; // Largura do mundo (dinâmica)
let h = 1920; // Altura do mundo (dinâmica)

window.mapDimensions = {
    current: { width: 1920, height: 1920 },
    cache: {} // Cache de dimensões por ID
};
```

#### Função `updateMapDimensions(mapId)`
- Busca dimensões do mapa via API
- Armazena em cache para evitar requisições repetidas
- Atualiza variáveis globais `w`, `h`, `midw`, `midh`
- Aplica novos bounds à câmera e física

#### Função `applyMapDimensions(width, height)`
- Atualiza `w`, `h`, `midw`, `midh`
- Reconfigura `cameras.main.setBounds(0, 0, width, height)`
- Reconfigura `physics.world.setBounds(0, 0, width, height)`

### 3. **Integração com Client** (`client.js`)

```javascript
// Ao receber nova cena
Client.socket.on('generateScene', function(scene) {
    updateMapDimensions(scene).then(() => {
        Game.changeScene(scene);
    });
});

// Ao carregar primeira cena
Client.socket.on('lastScene', function(scene) {
    updateMapDimensions(scene.mapa).then(() => {
        Game.setFirstScene(scene);
    });
});
```

### 4. **Atualização no Game** (`game.js`)

#### `Game.setFirstScene(scene)`
```javascript
// Atualiza bounds ao definir primeira cena
if (Cthis.cameras.main) {
    Cthis.cameras.main.setBounds(0, 0, w, h);
}
if (Cthis.physics.world) {
    Cthis.physics.world.setBounds(0, 0, w, h);
}
```

#### `Game.changeScene(scene)`
```javascript
// Atualiza bounds ao trocar de cena
console.log(`🗺️ Atualizando bounds: ${w}x${h}`);
Cthis.cameras.main.setBounds(0, 0, w, h);
Cthis.physics.world.setBounds(0, 0, w, h);
```

## 📊 Dimensões dos Mapas

| Mapa     | Largura | Altura | Proporção |
|----------|---------|--------|-----------|
| Hospital | 587px   | 1670px | 0.35:1 (vertical) |
| Escola   | 960px   | 50px   | 19.2:1 (horizontal) |
| Forest   | 960px   | 900px  | 1.07:1 (quase quadrado) |

## 🔄 Fluxo de Execução

### Carregamento Inicial
```
1. Jogo inicia com dimensões padrão (1920x1920)
2. WebSocket conecta
3. Servidor envia 'lastScene' com ID do mapa
4. Cliente chama updateMapDimensions(mapId)
5. API retorna dimensões reais do mapa
6. applyMapDimensions() atualiza bounds
7. Game.setFirstScene() aplica configurações
8. Jogador aparece com câmera nos limites corretos
```

### Mudança de Cena
```
1. Admin/Servidor emite 'scene' com novo ID
2. Cliente chama updateMapDimensions(novoMapId)
3. API retorna dimensões do novo mapa
4. applyMapDimensions() atualiza bounds
5. Game.changeScene() faz fade preto
6. Aplica novos bounds durante transição
7. Nova cena carrega com limites corretos
```

## 🎯 Benefícios

✅ **Câmera Precisa**: Limites exatos do mapa visual  
✅ **Performance**: Cache evita requisições repetidas  
✅ **Flexibilidade**: Suporta mapas de qualquer tamanho  
✅ **Consistência**: Mesma lógica para primeira cena e mudanças  
✅ **Debug**: Logs detalhados de cada atualização  

## 🧪 Como Testar

### Teste 1: API de Mapas
```bash
# Hospital (587x1670)
curl http://localhost:8083/api/map/1

# Escola (960x50)
curl http://localhost:8083/api/map/2

# Forest (960x900)
curl http://localhost:8083/api/map/3
```

### Teste 2: Mudança de Cena
1. Abra o jogo: `/jogo`
2. Abra o painel admin: `/admin`
3. Mude para diferentes cenas
4. Verifique console do navegador:
```
🗺️ Atualizando dimensões do mapa 2...
✅ Dados do mapa 2 recebidos: {nome: 'escola', x: 960, y: 50}
🔧 Aplicando dimensões: 960x50
📷 Camera bounds atualizados: 960x50
🌍 Physics world bounds atualizados: 960x50
```

### Teste 3: Cache de Dimensões
```javascript
// No console do navegador
console.log(window.mapDimensions.cache);
// Deve mostrar:
// {
//   1: {width: 587, height: 1670, nome: 'hospital'},
//   2: {width: 960, height: 50, nome: 'escola'},
//   ...
// }
```

### Teste 4: Limites da Câmera
1. Entre no jogo
2. Tente mover para fora do mapa
3. A câmera deve parar nos limites exatos
4. Não deve mostrar área preta além do mapa

## 🐛 Debug

### Logs Importantes
```javascript
// Ao atualizar dimensões
🗺️ Atualizando dimensões do mapa X...
✅ Dados do mapa X recebidos

// Ao aplicar
🔧 Aplicando dimensões: WxH
📷 Camera bounds atualizados
🌍 Physics world bounds atualizados

// Nas funções de cena
🗺️ Configurando primeira cena: nome (WxH)
🗺️ Atualizando bounds para cena: nome (WxH)
```

### Verificar Dimensões Atuais
```javascript
// No console do navegador
console.log('Dimensões atuais:', w, 'x', h);
console.log('Cache de mapas:', window.mapDimensions.cache);
```

### Forçar Atualização
```javascript
// No console do navegador
updateMapDimensions(1).then(dims => {
    console.log('Dimensões atualizadas:', dims);
});
```

## 📝 Estrutura de Dados

### Objeto de Dimensões
```javascript
{
    width: 960,      // Largura em pixels
    height: 900,     // Altura em pixels
    nome: 'forest'   // Nome do mapa
}
```

### Cache Global
```javascript
window.mapDimensions = {
    current: {
        width: 960,
        height: 900
    },
    cache: {
        1: {width: 587, height: 1670, nome: 'hospital'},
        2: {width: 960, height: 50, nome: 'escola'},
        3: {width: 960, height: 900, nome: 'forest'}
    }
}
```

## 🔧 Manutenção

### Adicionar Novo Mapa
1. Insira na tabela `mapas`:
```sql
INSERT INTO mapas (nome, x, y, dia, tarde, noite, limits) 
VALUES ('novo_mapa', 1200, 800, 'path/dia.png', 'path/tarde.png', 'path/noite.png', 'path/limits.png');
```

2. As dimensões serão carregadas automaticamente
3. O sistema criará entrada no cache na primeira vez

### Atualizar Dimensões
```sql
UPDATE mapas SET x = 1500, y = 1000 WHERE nome = 'hospital';
```

Limpe o cache do navegador ou force reload para aplicar.

## 🚀 Melhorias Futuras

- [ ] Pré-carregar dimensões de todos os mapas no início
- [ ] Sistema de transição suave de bounds (animação)
- [ ] Validação de dimensões mínimas/máximas
- [ ] Mini-mapa com proporções corretas
- [ ] Zoom adaptativo baseado no tamanho do mapa
- [ ] Área segura para spawn de jogadores (% do mapa)

## 📌 Notas Técnicas

- Dimensões são lidas dos campos `x` e `y` da tabela `mapas`
- Valores padrão são 1920x1920 se não encontrar
- Cache persiste apenas durante a sessão (não no localStorage)
- Mudanças de dimensão acontecem ANTES da troca de cena
- Bounds são aplicados tanto na câmera quanto na física
