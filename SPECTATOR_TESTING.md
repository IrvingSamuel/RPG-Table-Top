# 🧪 Guia de Teste Rápido - Modo Espectador

## Como Testar

### 1. Acesso Básico

Abra o jogo em modo espectador:
```
http://rpg.bigbridge.com.br/jogo.html?master
```

ou localmente:
```
http://localhost:3000/jogo.html?master
```

**Verificações:**
- ✅ Console deve mostrar: `🎭 Modo Mestre/Espectador ativado`
- ✅ Painel flutuante aparece no canto superior esquerdo
- ✅ Zoom inicial está em ~30%
- ✅ Câmera está centralizada no mapa
- ✅ Você NÃO vê seu próprio personagem

### 2. Teste de Controles de Movimentação

**Teclado:**
- Pressione `W` → Câmera move para cima
- Pressione `S` → Câmera move para baixo
- Pressione `A` → Câmera move para esquerda
- Pressione `D` → Câmera move para direita
- Setas funcionam da mesma forma

**Verificações:**
- ✅ Câmera se move suavemente
- ✅ Movimento é proporcional ao zoom
- ✅ Não há lag perceptível

### 3. Teste de Zoom

**Teclado:**
- Pressione `Q` → Zoom diminui (afasta)
- Pressione `E` → Zoom aumenta (aproxima)

**Mouse:**
- Scroll para cima → Zoom aumenta
- Scroll para baixo → Zoom diminui

**Painel:**
- Clique no botão `-` → Zoom diminui
- Clique no botão `+` → Zoom aumenta
- Clique no botão de reset → Volta para 30%

**Verificações:**
- ✅ Display mostra porcentagem correta (ex: 30%)
- ✅ Zoom não passa de 200%
- ✅ Zoom não fica menor que 10%
- ✅ Transição é suave

### 4. Teste com Múltiplos Jogadores

**Cenário:**
1. Abra uma aba em modo normal: `jogo.html?p=warrior`
2. Abra outra aba em modo normal: `jogo.html?p=mage`
3. Abra uma aba em modo espectador: `jogo.html?master`

**Na aba do espectador:**
- Verifique dropdown "Seguir Jogador"
- Deve listar: "🎥 Câmera Livre", "👤 Jogador 1", "👤 Jogador 2"

**Verificações:**
- ✅ Dropdown atualiza automaticamente
- ✅ Posições dos jogadores aparecem no dropdown
- ✅ Nomes dos jogadores são exibidos
- ✅ Lista atualiza a cada 2 segundos

### 5. Teste de Seguimento de Jogador

**Ações:**
1. No modo espectador, selecione um jogador no dropdown
2. Na aba do jogador, mova o personagem
3. Observe a aba do espectador

**Verificações:**
- ✅ Câmera segue o jogador automaticamente
- ✅ Jogador permanece no centro da tela
- ✅ Mensagem no chat: "📹 Seguindo: [Nome do Jogador]"
- ✅ Não é possível mover câmera manualmente durante follow
- ✅ Zoom ainda funciona durante follow

### 6. Teste de Câmera Livre

**Ações:**
1. Selecione "🎥 Câmera Livre" no dropdown
2. Tente mover a câmera com WASD

**Verificações:**
- ✅ Mensagem no chat: "📹 Câmera livre ativada"
- ✅ Câmera volta a se mover livremente
- ✅ Zoom funciona normalmente

### 7. Teste de Chat

**Ações:**
1. Clique no input de chat
2. Digite "Teste de mensagem"
3. Pressione Enter
4. Tente usar WASD enquanto digita

**Verificações:**
- ✅ Mensagem aparece no chat
- ✅ Teclas WASD NÃO movem câmera durante digitação
- ✅ Letras w, a, s, d aparecem normalmente no texto
- ✅ Após enviar mensagem, controles voltam a funcionar

### 8. Teste de Nomes de Jogadores

**Ações:**
1. Com múltiplos jogadores conectados
2. Observe acima de cada personagem

**Verificações:**
- ✅ Nomes aparecem acima de todos jogadores
- ✅ Nomes seguem os personagens durante movimento
- ✅ Nomes permanecem centralizados
- ✅ Z-index está correto (nomes sobre personagens)

### 9. Teste de Troca de Mapa

**Ações:**
1. Como jogador normal, mude de mapa (se disponível)
2. Observe o espectador

**Verificações:**
- ✅ Espectador vê a mudança de mapa
- ✅ Câmera permanece funcional
- ✅ Controles continuam responsivos
- ✅ Jogador permanece visível após troca

### 10. Teste de Desconexão

**Ações:**
1. Feche a aba de um jogador sendo seguido
2. Observe o dropdown no espectador

**Verificações:**
- ✅ Jogador desconectado some da lista
- ✅ Se estava seguindo, câmera não trava
- ✅ Dropdown atualiza automaticamente
- ✅ Sem erros no console

## Testes de Regressão

Verifique que funcionalidades antigas ainda funcionam:

### Modo Normal
- ✅ Jogadores normais ainda podem entrar
- ✅ Movimento funciona normalmente
- ✅ Animações funcionam
- ✅ Colisão funciona
- ✅ Chat funciona
- ✅ Rolagem de dados funciona

### Sincronização
- ✅ Múltiplos jogadores se veem corretamente
- ✅ Sprites corretos para cada jogador
- ✅ Animações sincronizam
- ✅ Posições sincronizam

## Teste de Performance

**Cenário de Stress:**
1. Abra 5+ jogadores normais
2. Abra 1 espectador
3. Faça todos jogadores se moverem simultaneamente

**Verificações:**
- ✅ FPS permanece estável (60fps)
- ✅ Dropdown atualiza sem lag
- ✅ Câmera segue suavemente
- ✅ Nomes atualizam sem delay
- ✅ Memória não aumenta excessivamente

## Teste Cross-Browser

Teste em diferentes navegadores:

### Chrome/Edge
- ✅ Painel renderiza corretamente
- ✅ Controles funcionam
- ✅ Sem erros no console

### Firefox
- ✅ Painel renderiza corretamente
- ✅ Controles funcionam
- ✅ Sem erros no console

### Safari
- ✅ Painel renderiza corretamente
- ✅ Controles funcionam
- ✅ Backdrop-filter funciona

## Teste Mobile (Limitado)

**Dispositivo móvel ou emulador:**

**Verificações:**
- ✅ Painel aparece e é responsivo
- ✅ Dropdown funciona
- ⚠️ Controles de teclado não disponíveis (esperado)
- ✅ Seguir jogador funciona
- ✅ Zoom por pinch pode funcionar

## Checklist Final

Antes de considerar pronto para produção:

- [ ] Todos os testes acima passaram
- [ ] Documentação revisada (SPECTATOR_MODE.md)
- [ ] Console sem erros críticos
- [ ] Performance aceitável (60fps)
- [ ] UI responsiva em diferentes resoluções
- [ ] Funcionalidades antigas não quebradas
- [ ] Servidor reiniciado com novas mudanças
- [ ] Git commit e push feitos
- [ ] README.md atualizado com nova feature

## Solução de Problemas Comuns

### Painel não aparece
```javascript
// Verificar no console:
console.log(isMaster); // deve ser true
console.log(document.getElementById('spectator-panel')); // não deve ser null
```

### Controles não funcionam
```javascript
// Verificar:
console.log(Game.spectatorMode); // deve existir
console.log(cursors); // deve ter w, a, s, d, q, e
```

### Jogadores não aparecem na lista
```javascript
// Verificar:
console.log(Game.playerMap); // deve ter jogadores
console.log(Game.getPlayerList()); // deve retornar array
```

### Câmera não segue jogador
```javascript
// Verificar:
console.log(Game.spectatorMode.followingPlayer); // deve ser ID do jogador
console.log(Game.playerMap[ID].sprite); // sprite deve existir
```

## Relatório de Bugs

Se encontrar bugs, inclua:
1. Passos para reproduzir
2. Comportamento esperado
3. Comportamento observado
4. Console log (F12)
5. Browser e versão
6. Screenshot/video se possível

---

**Última atualização**: 2024  
**Status dos testes**: ⏳ Aguardando execução  
**Responsável**: Equipe de desenvolvimento
