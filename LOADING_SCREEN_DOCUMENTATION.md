# Sistema de Tela de Loading Personalizada - Documentação

## 📋 Resumo

Implementação completa de um sistema de tela de loading personalizada por mesa de jogo, com imagem customizável, barra de progresso animada, dicas rotativas e transição suave.

## 🎯 Funcionalidades

### 1. **Tela de Loading Full Screen**
- ✅ Cobre toda a tela durante o carregamento
- ✅ Imagem de fundo personalizada por mesa
- ✅ Overlay com gradiente para melhor legibilidade
- ✅ Design responsivo (desktop e mobile)
- ✅ Transição suave de fade out quando completo

### 2. **Barra de Progresso Inteligente**
- ✅ Progresso simulado até 90%
- ✅ Integração com componentes reais (Phaser, WebSocket, Assets, Scene)
- ✅ Animação shimmer na barra
- ✅ Percentual exibido em tempo real
- ✅ Transição final até 100% quando tudo carrega

### 3. **Sistema de Dicas Rotativas**
- ✅ 10 dicas sobre gameplay, mecânicas e estratégias
- ✅ Rotação automática a cada 3 segundos
- ✅ Transição suave entre dicas
- ✅ Conteúdo educativo e motivacional

### 4. **Banco de Dados**
- ✅ Nova coluna `load_screen` na tabela `game_tables`
- ✅ API REST endpoint: `GET /api/table-info/:tableId`
- ✅ Caminho da imagem armazenado no banco
- ✅ Fallback para gradiente se imagem não disponível

## 📁 Arquivos Criados/Modificados

### Novos Arquivos:
1. **`database_update_loadscreen.sql`** - Script SQL para adicionar coluna
2. **`assets/loading/default-loading.svg`** - Imagem de loading padrão (SVG)
3. **`assets/loading/README.md`** - Documentação para adicionar novas imagens

### Arquivos Modificados:
1. **`server.js`**
   - Nova rota API: `/api/table-info/:tableId`
   - Retorna informações da mesa incluindo `load_screen`

2. **`jogo.html`**
   - Adicionado HTML da tela de loading
   - Estrutura com imagem, overlay, barra de progresso, dicas

3. **`css/style.css`**
   - ~160 linhas de CSS para tela de loading
   - Animações (pulse, shimmer)
   - Responsividade mobile
   - Transições suaves

4. **`js/main.js`**
   - Objeto `LoadingScreen` com lógica completa
   - Integração com `updateLoadingStatus()`
   - Sistema de dicas rotativas
   - Fetching da imagem via API
   - Progresso simulado e real

## 🗄️ Estrutura do Banco

```sql
ALTER TABLE game_tables 
ADD COLUMN load_screen VARCHAR(255) DEFAULT NULL;

-- Exemplo de uso:
UPDATE game_tables 
SET load_screen = 'assets/loading/minha-imagem.jpg' 
WHERE id = 1;
```

## 🎨 Personalização

### Para adicionar nova imagem de loading:

1. **Coloque a imagem em** `assets/loading/`
   ```bash
   cp minha-imagem.jpg /caminho/do/projeto/assets/loading/
   ```

2. **Atualize o banco de dados:**
   ```sql
   UPDATE game_tables 
   SET load_screen = 'assets/loading/minha-imagem.jpg' 
   WHERE id = 1;
   ```

3. **Recarregue a página** - A nova imagem será carregada automaticamente!

### Especificações recomendadas para imagens:
- **Resolução:** 1920x1080 (Full HD) ou superior
- **Proporção:** 16:9
- **Tamanho:** Máximo 2MB
- **Formato:** JPG, PNG, SVG, WebP
- **Tema:** Relacionado à campanha/mesa de RPG

## 🔧 API Endpoint

### GET `/api/table-info/:tableId`

**Resposta:**
```json
{
  "id": 1,
  "table_name": "Mesa de Teste 1",
  "load_screen": "assets/loading/default-loading.svg",
  "is_active": 1
}
```

## 🎯 Fluxo de Carregamento

```
1. Página carrega → LoadingScreen.init()
2. Busca informações da mesa (API)
3. Carrega imagem de background
4. Inicia simulação de progresso (0-90%)
5. Rotação de dicas a cada 3s
6. Componentes carregam (Phaser, WebSocket, etc)
7. updateLoadingStatus() atualiza progresso
8. Todos componentes OK → LoadingScreen.complete()
9. Progresso vai para 100%
10. Fade out (800ms)
11. Tela removida do DOM
12. Jogo inicia!
```

## 📊 Componentes Monitorados

- ✅ `phaser` - Engine Phaser.js
- ✅ `websocket` - Conexão Socket.IO
- ✅ `assets` - Sprites, mapas, imagens
- ✅ `scene` - Cenas do jogo carregadas

## 🎨 Dicas de Loading (Exemplos)

- "🎲 Dica: Use WASD ou as setas para se mover"
- "⚔️ Explore cada canto do mapa para encontrar itens"
- "🎯 Role os dados usando a barra de ação inferior"
- "⭐ Críticos acontecem quando você tira o valor máximo do dado!"
- "🌟 A sorte favorece os audaciosos!"

## 🚀 Como Testar

1. Acesse: `http://localhost:8083/jogo`
2. Observe a tela de loading com imagem de fundo
3. Veja a barra de progresso subindo
4. Leia as dicas rotativas
5. Aguarde o carregamento completo
6. Tela desaparece suavemente
7. Jogo inicia!

## 🐛 Troubleshooting

### Imagem não aparece?
- Verifique se o caminho no banco está correto
- Confirme que o arquivo existe em `assets/loading/`
- Veja console do navegador para erros 404

### Loading não completa?
- Abra DevTools → Console
- Procure por erros de carregamento
- Verifique status dos componentes no console

### Dicas não rotacionam?
- Verifique se `startTipsRotation()` foi chamado
- Confirme que não há erros no console

## 📝 Notas Técnicas

- **Z-index:** 999999 (garante que fica sobre tudo)
- **Transição:** 0.8s ease-out (fade out suave)
- **Progresso:** Máximo 90% simulado, 100% quando completo
- **Dicas:** 10 dicas rotativas a cada 3 segundos
- **Fallback:** Gradiente CSS se imagem não disponível

## 🎉 Melhorias Futuras (Opcional)

- [ ] Adicionar sons/música durante loading
- [ ] Animações 3D no background
- [ ] Diferentes temas por tipo de campanha
- [ ] Loading screens sazonais (eventos especiais)
- [ ] Conquistas/easter eggs no loading
- [ ] Integração com sistema de progresso de campanha

---

**Status:** ✅ Implementado e Testado
**Versão:** 1.0.0
**Data:** 2025-10-15
