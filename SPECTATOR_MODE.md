# 🎭 Modo Espectador/Mestre

## Visão Geral

O Modo Espectador permite que mestres de RPG observem toda a partida com controle total da câmera, sem interferir no jogo dos jogadores.

## Como Ativar

Para entrar no modo espectador, adicione o parâmetro `?master` na URL:

```
http://rpg.bigbridge.com.br/jogo.html?master
```

ou se já houver outros parâmetros:

```
http://rpg.bigbridge.com.br/jogo.html?p=warrior&master
```

## Características

### 🎥 Visualização Completa
- **Visão inicial**: Zoom afastado mostrando todo o mapa
- **Todos os jogadores visíveis**: Veja todos os personagens em tempo real
- **Sem sprite próprio**: Você não aparece no jogo, apenas observa

### 🕹️ Controles de Câmera

#### Movimentação Livre
- **W, A, S, D** ou **Setas**: Mover câmera em qualquer direção
- **Mouse Scroll**: Zoom in/out
- **Q**: Zoom out (afastar)
- **E**: Zoom in (aproximar)

#### Interface de Controle
Um painel flutuante no canto superior esquerdo oferece:

1. **Controle de Zoom**
   - Botões `-` e `+` para ajustar zoom
   - Display do nível atual (ex: 30%)
   - Botão de reset para voltar ao zoom padrão

2. **Seleção de Jogador**
   - Dropdown com lista de todos jogadores ativos
   - Opção "Câmera Livre" para movimento manual
   - Informações de posição de cada jogador

3. **Ajuda Rápida**
   - Lembrete dos controles principais
   - Ícones intuitivos para cada ação

## Funcionalidades

### Seguir Jogadores
1. Abra o dropdown "Seguir Jogador"
2. Selecione o jogador desejado
3. A câmera acompanhará automaticamente o personagem
4. Selecione "Câmera Livre" para voltar ao controle manual

### Limites de Zoom
- **Zoom mínimo**: 10% (visão muito afastada)
- **Zoom máximo**: 200% (visão próxima)
- **Zoom padrão**: 30% (ideal para visão geral)

### Chat Disponível
- Mestres podem ver e enviar mensagens no chat
- Dados podem ser rolados normalmente
- Mensagens do sistema aparecem para todos

## Comportamento Técnico

### O que NÃO acontece no modo espectador:
- ❌ Seu personagem não é criado no mapa
- ❌ Outros jogadores não veem você
- ❌ Você não colide com objetos ou portas
- ❌ Você não aparece na lista de jogadores online (para jogadores)

### O que FUNCIONA normalmente:
- ✅ Visualização de todos os jogadores em tempo real
- ✅ Sincronização de movimentos e animações
- ✅ Sistema de chat e rolagem de dados
- ✅ Mudanças de cena/mapa
- ✅ Efeitos visuais e animações

## Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| W / ↑ | Mover câmera para cima |
| S / ↓ | Mover câmera para baixo |
| A / ← | Mover câmera para esquerda |
| D / → | Mover câmera para direita |
| Q | Diminuir zoom (afastar) |
| E | Aumentar zoom (aproximar) |
| Scroll ↑ | Aumentar zoom |
| Scroll ↓ | Diminuir zoom |

## Dicas de Uso

### Para Mestres de RPG
1. **Visão Geral**: Mantenha zoom baixo (30-50%) para ver todo o mapa
2. **Acompanhar Ação**: Selecione jogadores específicos em momentos importantes
3. **Exploração**: Use câmera livre para verificar áreas do mapa
4. **Zoom Tático**: Aproxime (100%+) para ver detalhes de combate

### Casos de Uso
- **Narrações**: Siga jogadores durante descrições de cenas
- **Combate**: Veja posicionamento de todos os personagens
- **Exploração**: Antecipe onde jogadores estão indo
- **Streaming**: Grave ou transmita a partida com controle total

## Solução de Problemas

### Painel não aparece
- Verifique se `?master` está na URL
- Aguarde alguns segundos após carregar
- Recarregue a página (F5)

### Controles não funcionam
- Certifique-se de que não está digitando no chat
- Clique no canvas do jogo primeiro
- Verifique console do navegador (F12) para erros

### Lista de jogadores vazia
- Aguarde jogadores conectarem
- Lista atualiza automaticamente a cada 2 segundos
- Verifique se há jogadores online no chat

## Compatibilidade

- ✅ Desktop (Chrome, Firefox, Edge, Safari)
- ✅ Tablets com teclado
- ⚠️ Mobile (limitado - sem controles de teclado)

## Segurança

- ⚠️ **IMPORTANTE**: Qualquer pessoa com a URL `?master` pode entrar em modo espectador
- 🔒 **Recomendação**: Use apenas em servidores privados ou com autenticação
- 💡 **Futuro**: Sistema de senha para acesso ao modo mestre

## Suporte

Para problemas ou sugestões sobre o modo espectador:
1. Verifique o console do navegador (F12)
2. Reporte bugs com detalhes da situação
3. Sugira melhorias baseadas na sua experiência como mestre

---

**Versão**: 1.0  
**Última Atualização**: 2024  
**Status**: Funcional e pronto para uso
