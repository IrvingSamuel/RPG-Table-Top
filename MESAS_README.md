# Sistema de Mesas - RPG BigBridge

## ✅ Migração Concluída

### Alterações no Banco de Dados

1. **Nova tabela `game_tables`**
   - Armazena as mesas de jogo
   - Mesa padrão criada: "Mesa de Teste 1" (ID: 1)

2. **Coluna `table_id` adicionada**
   - ✅ `chat_messages` - Mensagens agora são associadas a uma mesa
   - ✅ `dice_rolls` - Rolagens agora são associadas a uma mesa

### Alterações no Código

1. **server.js**
   - Constante `DEFAULT_TABLE_ID = 1` (Mesa de Teste 1)
   - Funções atualizadas:
     - `saveChatMessage()` - Salva com table_id
     - `getChatHistory()` - Busca apenas da mesa específica
     - `saveDiceRoll()` - Salva com table_id
     - `getDiceHistory()` - Busca apenas da mesa específica

### Como Funciona

- **Atualmente**: Todas as mensagens e rolagens são salvas na "Mesa de Teste 1" (ID: 1)
- **Futuro**: Quando implementar sistema de múltiplas mesas, basta:
  1. Criar novas mesas na tabela `game_tables`
  2. Passar o `tableId` correto nas mensagens do client
  3. Filtrar histórico por mesa específica

### Estrutura para Múltiplas Mesas (Futuro)

```javascript
// No client, quando tiver sistema de mesas:
const messageData = {
    player: playerName,
    content: message,
    type: 'message',
    tableId: currentTableId  // ID da mesa atual do jogador
};

Client.socket.emit('chatMessage', messageData);
```

### Comandos Úteis

```bash
# Ver mensagens de uma mesa específica
mysql -u bigbridge-rpg -p bigbridge-rpg -e "SELECT * FROM chat_messages WHERE table_id = 1 ORDER BY created_at DESC LIMIT 10;"

# Criar nova mesa
mysql -u bigbridge-rpg -p bigbridge-rpg -e "INSERT INTO game_tables (table_name, is_active) VALUES ('Nova Mesa', TRUE);"

# Ver todas as mesas
mysql -u bigbridge-rpg -p bigbridge-rpg -e "SELECT * FROM game_tables;"
```

### Logs do Servidor

Agora o servidor exibe:
- `Mensagem salva com ID: X - Mesa: 1`
- `✅ Histórico do banco: X mensagens encontradas - Mesa: 1`
- `✅ Histórico de dados do banco: X rolagens encontradas - Mesa: 1`

## 🎲 Próximos Passos

1. Implementar interface para criar/gerenciar mesas
2. Adicionar seleção de mesa no login
3. Permitir jogadores entrarem em mesas diferentes
4. Sistema de convite para mesas privadas
