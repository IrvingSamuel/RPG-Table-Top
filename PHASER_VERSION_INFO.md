# 🎮 Informações sobre Versões do Phaser

## ⚠️ ATENÇÃO: Duas Versões em Uso

Este projeto usa **duas versões diferentes** do Phaser:

### 📦 Phaser 2.6.2 (Jogo Principal)
- **Local:** `/js/phaser.min.js` (773KB)
- **Usado em:** Jogo principal (`/jogo`)
- **Características:**
  - Framework mais antigo (2016)
  - API diferente do Phaser 3
  - Sem suporte a `Phaser.Scene`
  - Sistema de Estados (States) ao invés de Scenes

### 📦 Phaser 3.55.2 (Map Tester)
- **CDN:** `https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js`
- **Usado em:** Map Tester (`/map-tester`)
- **Características:**
  - Framework moderno (2021)
  - API completamente reescrita
  - Sistema de Scenes
  - Melhor performance
  - Mais recursos

---

## 🔧 Por que duas versões?

1. **Jogo Principal (Phaser 2):**
   - Já estava implementado com Phaser 2
   - Reescrever todo o jogo seria muito trabalho
   - Funciona perfeitamente para as necessidades atuais

2. **Map Tester (Phaser 3):**
   - Tool novo, escrito do zero
   - Phaser 3 tem melhores ferramentas de desenvolvimento
   - Scene system mais moderno e flexível
   - Melhor para debug e testes

---

## 📝 Diferenças Principais

### Phaser 2 (Jogo Principal)
```javascript
// States
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add('Play', PlayState);
game.state.start('Play');

// Sprites
this.sprite = this.game.add.sprite(x, y, 'key');

// Grupos
this.group = this.game.add.group();
```

### Phaser 3 (Map Tester)
```javascript
// Scenes
const config = {
    scene: [SceneMapTester]
};
const game = new Phaser.Game(config);

// Sprites
this.sprite = this.add.sprite(x, y, 'key');

// Containers
this.container = this.add.container(x, y);
```

---

## 🚫 Incompatibilidades

❌ **NÃO faça:**
- Usar código Phaser 2 no Map Tester
- Usar código Phaser 3 no jogo principal
- Tentar carregar ambas versões na mesma página
- Copiar cenas entre os dois projetos sem adaptar

✅ **FAÇA:**
- Mantenha Map Tester com Phaser 3 do CDN
- Mantenha jogo principal com Phaser 2 local
- Adapte código ao copiar entre projetos
- Consulte a documentação correta para cada versão

---

## 📚 Documentação

### Phaser 2
- Docs: https://phaser.io/docs/2.6.2/index
- Exemplos: https://phaser.io/examples/v2

### Phaser 3
- Docs: https://photonstorm.github.io/phaser3-docs/
- Exemplos: https://phaser.io/examples/v3

---

## 🔮 Futuro

### Migração para Phaser 3?

**Prós:**
- Framework mais moderno
- Melhor performance
- Mais recursos
- Suporte ativo

**Contras:**
- Reescrever todo o jogo (~5000 linhas)
- Risco de bugs
- Tempo de desenvolvimento
- Sistema atual funciona

**Decisão:** Manter Phaser 2 no jogo principal por enquanto. Map Tester permanece com Phaser 3.

---

## 🐛 Troubleshooting

### Erro: "Class extends value undefined is not a constructor"
**Causa:** Tentando usar `Phaser.Scene` (Phaser 3) com Phaser 2 carregado  
**Solução:** Usar Phaser 3 do CDN no Map Tester

### Erro: "game.state is undefined"
**Causa:** Tentando usar States (Phaser 2) no Map Tester  
**Solução:** Usar Scene system do Phaser 3

### Warning: "willReadFrequently"
**Causa:** Phaser 2 não otimiza operações de canvas  
**Solução:** Ignorar - é apenas um warning de performance

---

**Última atualização:** Outubro 2025
