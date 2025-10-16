# 🎲 Painel do Mestre - Documentação

## 📋 Resumo da Implementação

Transformação completa da página de administração em um **Painel do Mestre** épico e funcional, com design moderno e integração dinâmica com o banco de dados.

## ✨ Funcionalidades Implementadas

### 1. **Design Épico e Moderno**
- ✅ Gradiente dark theme (azul escuro + vermelho)
- ✅ Efeitos glassmorphism nos cards
- ✅ Animações suaves e hover effects
- ✅ Ícones Font Awesome 6
- ✅ Layout responsivo (desktop e mobile)
- ✅ Padrão de fundo com gradientes radiais

### 2. **Gerenciamento de Cenas/Mapas**
- ✅ **Carregamento dinâmico** de mapas do banco
- ✅ Exibição de ID, nome e disponibilidade de horários
- ✅ Cards interativos com hover effect
- ✅ **Indicador visual** da cena ativa (borda verde + ícone check)
- ✅ Botões de horário (Dia/Tarde/Noite) com ícones
- ✅ **Desabilita automaticamente** horários não disponíveis
- ✅ Marca horário atual como ativo (dourado)
- ✅ Botão "Adicionar Novo Mapa" (placeholder)

### 3. **Gerenciamento de Jogadores**
- ✅ **Carregamento dinâmico** de jogadores do banco
- ✅ Cards com foto, nome e atributos (Destreza, Stamina, Battle)
- ✅ Layout em grid responsivo
- ✅ Fotos circulares com borda dourada
- ✅ Botão "Adicionar Novo Jogador" (placeholder)

### 4. **Status Atual em Tempo Real**
- ✅ Exibe cena ativa atual
- ✅ Mostra horário atual (☀️ Dia / 🌤️ Tarde / 🌙 Noite)
- ✅ Contador de jogadores online (integração futura)
- ✅ Indicador de status do sistema (pulsante verde)

### 5. **Controles do Jogo**
- ✅ Botão Pausar (vermelho)
- ✅ Botão Continuar (verde)
- ✅ Integração com `Client.pause()`

### 6. **Ações Rápidas**
- ✅ Abrir Jogo (nova aba)
- ✅ Atualizar Dados (recarrega do banco)

## 🌐 APIs REST Criadas

### 1. `GET /api/maps`
Retorna todos os mapas disponíveis.

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "hospital",
    "dia": "assets/maps/hospital/terreo/mapad.png",
    "tarde": "assets/maps/hospital/terreo/mapaa.png",
    "noite": "assets/maps/hospital/terreo/mapan.png",
    "x": 587,
    "y": 1670,
    "limits": "assets/maps/hospital/terreo/limits.png",
    "roofsd": "...",
    "roofst": "...",
    "roofsn": "..."
  }
]
```

### 2. `GET /api/players`
Retorna todos os jogadores cadastrados.

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Grekza",
    "foto": "https://...",
    "destreza": 2,
    "stamina": 33,
    "battle": 1
  }
]
```

### 3. `GET /api/current-scene`
Retorna informações da cena atual ativa.

**Resposta:**
```json
{
  "id": 1,
  "mapa": 1,
  "horario": "n",
  "estado": "0"
}
```

### 4. `GET /api/table-info/:tableId`
(Já existente) Retorna informações da mesa de jogo.

## 📁 Estrutura de Arquivos

### Modificados:
1. **`server.js`**
   - Adicionadas 3 novas rotas API
   - Total de 4 APIs REST funcionais

2. **`admin.html`**
   - Backup criado em `admin.html.old`
   - Novo design completo (~600 linhas)
   - JavaScript integrado para fetch e renderização

### Backup:
- ✅ `admin.html.old` - Versão anterior preservada

## 🎨 Paleta de Cores

```css
--primary-color: #e74c3c (Vermelho épico)
--secondary-color: #c0392b (Vermelho escuro)
--dark-bg: #1a1a2e (Fundo escuro)
--darker-bg: #16213e (Fundo mais escuro)
--darkest-bg: #0f3460 (Fundo mais escuro ainda)
--light-text: #ecf0f1 (Texto claro)
--gold: #f39c12 (Dourado para destaques)
--success: #27ae60 (Verde sucesso)
--info: #3498db (Azul info)
```

## 🔧 Funcionalidades JavaScript

### Funções Principais:

```javascript
loadAllData()          // Carrega todos os dados em paralelo
loadMaps()             // Busca mapas via API
loadPlayers()          // Busca jogadores via API
loadCurrentScene()     // Busca cena atual via API
renderMaps()           // Renderiza cards de mapas
renderPlayers()        // Renderiza cards de jogadores
updateCurrentStatus()  // Atualiza status em tempo real
changeScene(id, time)  // Muda cena e horário
pauseGame()            // Pausa o jogo
resumeGame()           // Resume o jogo
refreshData()          // Recarrega dados do banco
```

## 📊 Banco de Dados

### Tabelas Utilizadas:

1. **`mapas`**
   - `id`, `nome`, `dia`, `tarde`, `noite`
   - `x`, `y`, `limits`
   - `roofsd`, `roofst`, `roofsn`

2. **`players`**
   - `id`, `nome`, `foto`
   - `destreza`, `stamina`, `battle`

3. **`atual`**
   - `id`, `mapa`, `horario`, `estado`

4. **`game_tables`** (já existente)
   - `id`, `table_name`, `load_screen`, `is_active`

## 🎯 Fluxo de Uso

1. **Acessa** `http://localhost:8083/admin`
2. **Vê Header** "Painel do Mestre" com status online
3. **Mapas carregam** automaticamente do banco
4. **Jogadores aparecem** com fotos e atributos
5. **Status atual** mostra cena e horário ativo
6. **Clica em botão de horário** → Muda cena no jogo
7. **Botões de controle** pausam/resumem jogo
8. **Atualizar Dados** recarrega tudo do banco

## 🚀 Próximas Etapas (Sugestões)

### Para o Mestre:
- [ ] Modal para adicionar novo mapa (formulário)
- [ ] Modal para adicionar novo jogador (formulário)
- [ ] Upload de imagens de mapas
- [ ] Edição de mapas existentes
- [ ] Remoção de mapas/jogadores
- [ ] Sistema de inventário de itens
- [ ] Gerenciamento de NPCs/vilões
- [ ] Logs de ações dos jogadores
- [ ] Chat do mestre (enviar mensagens globais)
- [ ] Sistema de quests/missões
- [ ] Gerenciamento de portas (doors table)
- [ ] Configuração de spawn points

### Melhorias Técnicas:
- [ ] WebSocket para atualizações em tempo real
- [ ] Autenticação de admin
- [ ] Validação de formulários
- [ ] Tratamento avançado de erros
- [ ] Sistema de notificações
- [ ] Histórico de mudanças
- [ ] Exportar/importar configurações
- [ ] Preview de mapas antes de trocar

## 🎨 Screenshots Conceituais

### Header
```
┌─────────────────────────────────────────┐
│ 🎲 Painel do Mestre         [• Online] │
│ Controle total sobre a aventura épica   │
└─────────────────────────────────────────┘
```

### Card de Mapa
```
┌─────────────────────────────────────────┐
│ 🗺️ HOSPITAL              #1  [✓ Ativo] │
│                                          │
│ [☀️ Dia] [🌤️ Tarde] [🌙 Noite(Ativo)]  │
└─────────────────────────────────────────┘
```

### Card de Jogador
```
┌──────────────────────────────────┐
│ 👤 [Foto]  Grekza               │
│           Destreza: 2           │
│           Stamina: 33           │
│           Battle: 1             │
└──────────────────────────────────┘
```

## 🐛 Troubleshooting

### APIs não carregam?
- Verifique se o servidor está rodando: `pm2 list`
- Veja logs: `pm2 logs rpg`
- Teste API manualmente: `curl http://localhost:8083/api/maps`

### Mapas não aparecem?
- Confirme se tabela `mapas` tem dados
- Verifique console do navegador (F12)
- Teste query: `SELECT * FROM mapas;`

### Mudança de cena não funciona?
- Verifique se `Client` está definido (JS carregado)
- Veja console do navegador para erros
- Confirme que WebSocket está conectado

## 📝 Notas Técnicas

- **Framework:** Vanilla JavaScript (sem dependências)
- **CSS:** Custom com variáveis CSS
- **Fetch API:** Async/await para requisições
- **Renderização:** Template strings ES6
- **Responsivo:** Flexbox + Grid CSS
- **Animações:** CSS transitions + keyframes

---

**Status:** ✅ Implementado e Testado
**Versão:** 1.0.0
**Data:** 2025-10-15
**Servidor:** PM2 restart #33
