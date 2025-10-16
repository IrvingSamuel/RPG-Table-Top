# 🗺️ Sistema de Dimensões Dinâmicas de Mapas - CORRIGIDO

## ✅ Correção Implementada

### ❌ Problema Anterior (ERRO)
- Estava usando `x` e `y` como dimensões do mapa
- **ERRADO**: `x` e `y` são coordenadas de **spawn do jogador**

### ✅ Solução Correta
- Criadas novas colunas: `width` e `height`
- `width` = largura do mapa em pixels
- `height` = altura do mapa em pixels
- `x` e `y` = coordenadas de spawn do jogador (mantidos intactos)

## 📊 Dimensões Reais dos Mapas

| ID | Nome     | Width | Height | Spawn X | Spawn Y |
|----|----------|-------|--------|---------|---------|
| 1  | Hospital | 1920  | 1920   | 587     | 1670    |
| 2  | Escola   | 1920  | 1920   | 960     | 50      |
| 3  | Jungle   | 1920  | 1206   | 960     | 900     |

## 🔧 Mudanças no Banco de Dados

### Colunas Adicionadas
```sql
ALTER TABLE mapas 
ADD COLUMN width INT NOT NULL DEFAULT 1920 COMMENT 'Largura do mapa em pixels',
ADD COLUMN height INT NOT NULL DEFAULT 1920 COMMENT 'Altura do mapa em pixels';
```

### Dados Atualizados
```sql
UPDATE mapas SET width = 1920, height = 1920 WHERE id = 1; -- Hospital
UPDATE mapas SET width = 1920, height = 1920 WHERE id = 2; -- Escola  
UPDATE mapas SET width = 1920, height = 1206 WHERE id = 3; -- Jungle/Forest
```

## 💻 Mudanças no Código

### main.js - updateMapDimensions()
```javascript
// ANTES (ERRADO)
const mapWidth = mapData.x || 1920;   // ❌ x é spawn, não largura!
const mapHeight = mapData.y || 1920;  // ❌ y é spawn, não altura!

// DEPOIS (CORRETO)
const mapWidth = mapData.width || 1920;   // ✅ width = largura do mapa
const mapHeight = mapData.height || 1920; // ✅ height = altura do mapa

// Cache agora inclui spawn separado
window.mapDimensions.cache[mapId] = {
    width: mapWidth,
    height: mapHeight,
    spawnX: mapData.x,    // ✅ Spawn X do jogador
    spawnY: mapData.y,    // ✅ Spawn Y do jogador
    nome: mapData.nome
};
```

## 🎯 Exemplo de Resposta da API

### GET /api/map/3 (Jungle)
```json
{
    "id": 3,
    "nome": "forest",
    "width": 1920,      // ← LARGURA DO MAPA
    "height": 1206,     // ← ALTURA DO MAPA
    "x": 960,           // ← SPAWN X DO JOGADOR
    "y": 900,           // ← SPAWN Y DO JOGADOR
    "dia": "assets/maps/jungle/jungled.png",
    "limits": "assets/maps/jungle/limits.png",
    ...
}
```

## 🔄 Fluxo Correto

### 1. Carregamento do Mapa
```
1. API retorna: { width: 1920, height: 1206, x: 960, y: 900 }
2. Sistema aplica:
   - Camera bounds: 0,0 → 1920x1206
   - Physics bounds: 0,0 → 1920x1206
3. Jogador spawna em: x=960, y=900
```

### 2. Jungle (1920x1206) - Altura Reduzida
```
📐 Mapa: 1920px largura x 1206px altura
📍 Jogador spawna em: (960, 900)
📷 Câmera limitada a: 0-1920 horizontal, 0-1206 vertical
✅ Não mostra área preta abaixo do mapa
```

## 🧪 Como Testar

### Teste 1: Verificar Banco de Dados
```bash
mysql -u bigbridge-rpg -p'eV10PiSKpfpyUBi8HfRn' bigbridge-rpg \
  -e "SELECT id, nome, width, height, x AS spawn_x, y AS spawn_y FROM mapas;"
```

**Resultado esperado:**
```
id  nome      width  height  spawn_x  spawn_y
1   hospital  1920   1920    587      1670
2   escola    1920   1920    960      50
3   forest    1920   1206    960      900
```

### Teste 2: API com Novos Campos
```bash
curl http://localhost:8083/api/map/3 | python3 -m json.tool
```

**Deve retornar:**
- ✅ `width: 1920`
- ✅ `height: 1206`
- ✅ `x: 960` (spawn)
- ✅ `y: 900` (spawn)

### Teste 3: Jungle com Altura Reduzida
1. Entre no jogo
2. Vá para o mapa Jungle (Forest)
3. Console deve mostrar:
```
📐 Dimensões do mapa "forest": 1920x1206px
📍 Spawn do jogador: x=960, y=900
📷 Camera bounds atualizados: 1920x1206
```

4. Tente ir até o limite inferior do mapa
5. Câmera deve parar em 1206px (não 1920px)
6. Não deve mostrar área preta

## 📝 Logs Esperados

### Ao Carregar Jungle
```javascript
🗺️ Atualizando dimensões do mapa 3...
✅ Dados do mapa 3 recebidos: {nome: "forest", width: 1920, height: 1206, x: 960, y: 900}
📐 Dimensões do mapa "forest": 1920x1206px
📍 Spawn do jogador: x=960, y=900
🔧 Aplicando dimensões: 1920x1206
📷 Camera bounds atualizados: 1920x1206
🌍 Physics world bounds atualizados: 1920x1206
```

## 🎮 Diferenças Visuais

### Hospital/Escola (1920x1920 - Quadrados)
- Mapa completo quadrado
- Câmera se move igualmente em todas direções
- Spawn: Hospital (587, 1670), Escola (960, 50)

### Jungle (1920x1206 - Retangular)
- Mapa mais largo que alto (proporção ~1.6:1)
- Câmera vertical limitada a 1206px
- Jogador não pode ir abaixo de y=1206
- Spawn central: (960, 900)

## 🐛 Debug

### Verificar Dimensões em Uso
```javascript
// Console do navegador
console.log('Dimensões globais:', w, 'x', h);
console.log('Cache:', window.mapDimensions.cache);
```

### Forçar Atualização
```javascript
updateMapDimensions(3).then(data => {
    console.log('Jungle:', data);
    // Deve mostrar: {width: 1920, height: 1206, spawnX: 960, spawnY: 900}
});
```

## 📌 Importante

⚠️ **NUNCA MAIS** usar `x` e `y` para dimensões do mapa!
- ✅ `width` e `height` = dimensões do mapa
- ✅ `x` e `y` = spawn do jogador

## 🚀 Próximos Passos

Se precisar adicionar novo mapa:
```sql
INSERT INTO mapas (nome, width, height, x, y, dia, limits) 
VALUES (
    'novo_mapa',
    2048,        -- largura do mapa
    1536,        -- altura do mapa
    1024,        -- spawn X do jogador
    768,         -- spawn Y do jogador
    'path/dia.png',
    'path/limits.png'
);
```

Sistema agora funciona corretamente! ✅
