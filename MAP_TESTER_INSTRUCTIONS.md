# 🗺️ Map Tester - Instruções de Uso

## 📋 O que foi implementado

O Map Tester é uma ferramenta completa para criar, testar e validar mapas antes de adicioná-los ao jogo.

### ✅ Funcionalidades Ativas:

1. **Upload para MinIO (S3)** - Todos os arquivos são enviados para armazenamento em nuvem
2. **Preview em Tempo Real** - Canvas Phaser com teste interativo
3. **Boneco de Teste** - Sprite genérico amarelo controlável
4. **Debug Mode** - Física do Phaser com visualização de colisões
5. **Múltiplas Camadas** - Mapas (dia/tarde/noite), colisões e telhados
6. **Salvamento no Banco** - Integração direta com MySQL

---

## 🚀 Como Usar

### 1. Acessar o Map Tester

- Abra o **Admin Panel**: `http://localhost:8083/admin`
- Clique no botão: **"🗺️ Testar/Criar Mapa"**
- Uma nova janela será aberta com o Map Tester

### 2. Você deverá ver:

✅ **Canvas Phaser ativo** - Fundo azul escuro  
✅ **Boneco amarelo** - Círculo amarelo com seta vermelha no spawn (960, 960)  
✅ **Texto na tela**: "BONECO DE TESTE - Use WASD para mover"  
✅ **Debug boxes** - Retângulos verdes ao redor do boneco (física)  

**Se não vir o boneco:**
1. Abra o Console do navegador (F12)
2. Verifique se há erros em vermelho
3. Procure por logs: `✅ Scene criada com sucesso` e `✅ Personagem criado`

### 3. Preencher Informações do Mapa

No painel lateral esquerdo:

```
Nome do Mapa: Hospital
Largura (px): 1920
Altura (px): 1920
Spawn X: 960
Spawn Y: 960
```

### 4. Upload de Texturas

**IMPORTANTE:** Você DEVE fazer upload pelo menos da textura **Dia**.

#### Upload Dia (Obrigatório):
- Clique ou arraste a imagem do mapa (versão dia)
- Formatos aceitos: PNG, JPG, WEBP, SVG
- Tamanho máximo: 50MB
- Preview será exibido automaticamente

#### Upload Tarde/Noite (Opcional):
- Se não enviar, o sistema usará a textura Dia

#### Upload Limits (Opcional):
- Imagem das áreas de colisão
- Será exibida semi-transparente no debug

#### Upload Rooftops (Opcional):
- Imagem dos telhados
- Renderizada acima do personagem

### 5. Carregar no Teste

Clique no botão: **"🔄 Carregar no Teste"**

**O que acontece:**
1. ⏳ Botão muda para "Carregando..."
2. 📤 Upload de todos os arquivos para MinIO
3. 🖼️ Texturas são carregadas no Phaser
4. 📏 Dimensões do mapa são aplicadas
5. ✅ Alert: "Mapa carregado no teste!"

**Aguarde 2-3 segundos** após o alert para as texturas serem aplicadas.

### 6. Testar o Mapa

#### Controles:
- **W** - Mover para cima
- **A** - Mover para esquerda
- **S** - Mover para baixo
- **D** - Mover para direita
- **Arrow Keys** - Também funcionam

#### Botões:
- **👁️ Mostrar Colisões** - Toggle da camada de limits
- **🏠 Mostrar Telhados** - Toggle da camada de rooftops
- **Selector de Horário** - Trocar entre dia/tarde/noite

#### Informações Exibidas:
- **FPS** - Taxa de quadros
- **Pos: (x, y)** - Posição do personagem

### 7. Salvar no Banco

Quando estiver satisfeito com o teste:

1. Clique em: **"💾 Salvar Mapa no Banco"**
2. Confirme a ação
3. O mapa será salvo na tabela `mapas` com:
   - URLs do MinIO para todas as texturas
   - Dimensões configuradas
   - Spawn coordinates
4. O novo mapa estará disponível no Admin

---

## 🐛 Troubleshooting

### Problema: Não vejo o boneco de teste

**Soluções:**
1. Abra o Console (F12) e procure por erros
2. Verifique se aparece: `✅ Personagem criado`
3. Recarregue a página (F5)
4. Clique em "🔄 Reiniciar Tudo"

### Problema: Imagem não aparece após clicar "Carregar"

**Verificar:**
1. Console deve mostrar: `✅ DIA uploaded`
2. Console deve mostrar: `✅ Textura dia carregada com sucesso`
3. Console deve mostrar: `✅ Textura dia aplicada`
4. Aguarde 2-3 segundos após o alert

**Se não aparecer:**
1. Abra o Console
2. Procure por erros com `❌`
3. Verifique se MinIO está conectado (deve ter `✅ MinIO conectado`)

### Problema: CORS Error ao carregar imagem

**Causa:** MinIO bloqueando requisições cross-origin

**Solução:**
1. Configurar CORS no bucket MinIO
2. Ou: Servir imagens através do servidor Node.js

### Problema: Upload falha

**Verificar:**
1. Arquivo é uma imagem válida?
2. Arquivo tem menos de 50MB?
3. MinIO está acessível? (Console deve ter: `✅ MinIO conectado`)

---

## 🔍 Debug no Console

### Logs Importantes:

#### Inicialização:
```
🚀 Map Tester carregado
✅ Phaser inicializado e scene obtida
🎮 SceneMapTester iniciada
✅ Scene criada com sucesso
📍 Personagem criado em: 960 960
```

#### Upload:
```
📤 Iniciando uploads para MinIO...
📤 Uploading DIA...
✅ DIA uploaded
📋 URLs carregadas: {dia: "https://s3.rezum.me/rpg/maps/..."}
```

#### Carregamento de Texturas:
```
🖼️ Carregando textura dia: https://s3.rezum.me/rpg/maps/...
✅ Textura dia carregada com sucesso
🎨 Aplicando textura dia ao mapa
✅ Textura dia aplicada: {width: 1920, height: 1920, visible: true}
```

---

## 📊 Estrutura de Arquivos no MinIO

```
rpg/
  └── maps/
      └── hospital/          (nome sanitizado)
          ├── dia/
          │   └── 1729012345678.png
          ├── tarde/
          │   └── 1729012345789.png
          ├── noite/
          │   └── 1729012345890.png
          ├── limits/
          │   └── 1729012345901.png
          └── rooftops/
              └── 1729012346012.png
```

---

## ⚙️ Configurações Técnicas

### Phaser Config:
- **Dimensões:** 1200x800 (canvas)
- **Física:** Arcade com gravity Y=0
- **Debug:** ATIVO (mostra hitboxes)
- **Zoom:** 0.8 (para ver mais área)

### Personagem de Teste:
- **Sprite:** Círculo amarelo 64x64
- **Escala:** 1.5x (maior visibilidade)
- **Velocidade:** 200 pixels/segundo
- **Hitbox:** 40x40 (centralizada)

### Câmera:
- **Seguimento:** Suave (lerp 0.1)
- **Bounds:** Dinâmicos baseados nas dimensões do mapa

---

## 🎯 Próximas Melhorias Possíveis

1. **Colisões Reais** - Parser de pixels para criar polígonos de colisão
2. **Grid de Referência** - Linhas de grade para posicionamento
3. **Múltiplos Spawns** - Click para adicionar pontos de spawn
4. **NPCs de Teste** - Adicionar NPCs estáticos para testar interações
5. **Exportar Configuração** - Salvar JSON com todas as configurações
6. **Importar Mapa Existente** - Editar mapas já criados

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar Console do navegador** (F12)
2. **Verificar logs do servidor PM2**: `pm2 logs rpg`
3. **Testar conexão MinIO**: Deve aparecer `✅ MinIO conectado` nos logs

---

**Última atualização:** Outubro 2025  
**Versão:** 1.0.0
