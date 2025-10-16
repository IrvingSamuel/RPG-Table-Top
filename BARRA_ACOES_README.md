# 🎮 Sistema de Barra de Ações

## ✅ Implementado

### Barra de Ações Flutuante
- **Posição**: Centralizada na parte inferior da tela
- **Design**: Glass effect com backdrop-filter blur
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

### Botão "Rolar Dado"
- **Dropdown (up)**: Menu abre para cima mostrando tipos de dados
- **Tipos disponíveis**: D4, D6, D8, D10, D12, D20, D100
- **Submenu (right)**: Cada tipo abre menu lateral com quantidade de rolagens (1x até 5x)

### Sistema de Rolagem Múltipla
- **Quantidade**: 1 a 5 rolagens do mesmo dado
- **Visualização**: Todos os resultados mostrados na mesma mensagem
- **Análise automática**: Total, média, maior e menor valor

### Sistema de Cores para Resultados

#### Verde - Sucesso Crítico
- Quando: Resultado = valor máximo do dado (top)
- Exemplo: 20 em D20, 6 em D6
- **Prioridade**: Máxima

#### Vermelho - Falha Crítica  
- Quando: Resultado = 1 (base do dado)
- **Prioridade**: Máxima

#### Amarelo - Maior Rolagem
- Quando: Maior valor da sequência (exceto se for crítico)
- Exemplo: Em [5, 18, 12, 8] o 18 fica amarelo
- **Nota**: Verde sobrescreve amarelo

#### Laranja - Menor Rolagem
- Quando: Menor valor da sequência (exceto se for crítico)
- Exemplo: Em [5, 18, 12, 8] o 5 fica laranja
- **Nota**: Vermelho sobrescreve laranja

#### Cinza - Normal
- Quando: Valores intermediários

## 🎯 Exemplos de Uso

### Exemplo 1: 3x D20
```
Rolou 3x D20:
[20] [15] [8]
 🟢   🟡  🟠

Total: 43 | Média: 14.3 | Maior: 20 | Menor: 8
```

### Exemplo 2: 5x D6 com Críticos
```
Rolou 5x D6:
[6] [1] [4] [3] [2]
🟢  🔴  ⚪  ⚪  ⚪

Total: 16 | Média: 3.2 | Maior: 6 | Menor: 1
```

### Exemplo 3: 2x D10
```
Rolou 2x D10:
[7] [4]
🟡  🟠

Total: 11 | Média: 5.5 | Maior: 7 | Menor: 4
```

## 💾 Banco de Dados

### Tabela `dice_rolls` - Novos Campos
- `roll_count` (INT): Quantidade de dados rolados
- `all_results` (VARCHAR): JSON com todos os resultados
- `roll_sum` (INT): Soma total dos resultados
- `roll_avg` (DECIMAL): Média dos resultados

### Compatibilidade
- ✅ Rolagens únicas (antigas) continuam funcionando
- ✅ Histórico carrega rolagens múltiplas corretamente
- ✅ Sincronização via WebSocket para todos os jogadores

## 🎨 Customização

### Cores (CSS)
```css
.dice-critical-success { color: #27ae60; } /* Verde */
.dice-critical-failure { color: #e74c3c; } /* Vermelho */
.dice-highest { color: #f1c40f; }          /* Amarelo */
.dice-lowest { color: #e67e22; }           /* Laranja */
.dice-normal { color: #ecf0f1; }           /* Cinza */
```

### Tipos de Dado
Adicionar novo tipo em `main.js` função `createActionBar()`:
```javascript
${createDiceMenuItem(100)} // D100 já incluído
```

### Quantidade de Rolagens
Modificar array em `createDiceMenuItem()`:
```javascript
${[1, 2, 3, 4, 5].map(count => ... // Até 5x
```

## 🚀 Funcionalidades Futuras

- [ ] Rolagem com modificadores (+1, +2, etc)
- [ ] Rolagem com vantagem/desvantagem
- [ ] Histórico de rolagens por jogador
- [ ] Estatísticas de rolagens (gráficos)
- [ ] Macro de rolagens personalizadas
- [ ] Rolagem de múltiplos tipos (2d6 + 1d8)

## 📱 Responsividade

- **Desktop**: Barra centralizada na parte inferior
- **Mobile**: Barra adaptada com botões menores
- **Tablet**: Layout intermediário

## 🔧 Troubleshooting

### Barra não aparece
- Verifique se `createActionBar()` está sendo chamado
- Verifique o console para erros

### Rolagens não sincronizam
- Verifique conexão WebSocket
- Confirme que `Client.socket` está conectado

### Cores não aparecem
- Limpe o cache do navegador (Ctrl + Shift + R)
- Verifique se o CSS foi carregado

## 📝 Logs Importantes

```javascript
🎮 Criando barra de ações...
✅ Barra de ações criada
🎲 Rolando 3x D20
📊 Análise: {max: 18, min: 5, sum: 38, avg: 12.7}
📤 Enviando rolagem múltipla via WebSocket
```
