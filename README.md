# 🎲 RPG Table Top - Sistema de Mesa Virtual

<div align="center">

![RPG Banner](https://img.shields.io/badge/RPG-Table%20Top-blue?style=for-the-badge&logo=d-and-d&logoColor=white)
![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

**Um sistema completo de mesa virtual para RPG com mapas interativos, personagens customizáveis e chat em tempo real.**

[🎮 Demo](#demo) • [✨ Features](#features) • [🚀 Instalação](#instalação) • [📖 Documentação](#documentação)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Features](#features)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Sistema de Mapas](#sistema-de-mapas)
- [Sistema de Chat](#sistema-de-chat)
- [Sistema de Dados](#sistema-de-dados)
- [API](#api)
- [Contribuindo](#contribuindo)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O **RPG Table Top** é uma plataforma web completa para jogar RPG de mesa online. Desenvolvido com Node.js, Phaser 3 e Socket.IO, o sistema oferece uma experiência imersiva com mapas 2D isométricos, personagens customizáveis, sistema de chat em tempo real, rolagem de dados e muito mais.

### Por que usar este sistema?

- ✅ **Gratuito e Open Source**: Sem custos de licença
- ✅ **Multiplayer em Tempo Real**: Sincronização instantânea via WebSocket
- ✅ **Mapas Personalizados**: Suporte para múltiplos mapas com diferentes horários
- ✅ **Chat Integrado**: Sistema de chat com histórico persistente
- ✅ **Rolagem de Dados**: Sistema completo de rolagem com análise estatística
- ✅ **Visual Customizável**: Múltiplas skins de personagens (Warrior, Ranger, Mage, etc.)
- ✅ **Responsivo**: Funciona em desktop e mobile

---

## ✨ Features

### 🎮 Sistema de Jogo

- **Movimento em Tempo Real**: Sistema de física com colisão pixel-perfect
- **Múltiplos Personagens**: Escolha entre Warrior, Ranger, Mage e outros sprites
- **Sincronização Multiplayer**: Veja outros jogadores se movendo em tempo real
- **Nomes Acima dos Personagens**: Identificação visual de cada jogador
- **Sistema de Animações**: Animações de movimento (walk, idle) sincronizadas
- **Câmera Dinâmica**: Follow camera suave que acompanha o jogador

### 🗺️ Sistema de Mapas

- **Mapas Dinâmicos**: Sistema de carregamento de mapas do banco de dados
- **Múltiplos Cenários**: Hospital, Escola, Floresta, Selva, Porto, etc.
- **Sistema de Horários**: Mapas com variações (Dia/Tarde/Noite)
- **Camadas Visuais**: Background, limites de colisão, telhados e efeitos
- **Portas Interativas**: Sistema de portas que abrem automaticamente
- **Texturas Dinâmicas**: Carregamento de texturas via MinIO/S3
- **Dimensões Personalizadas**: Cada mapa pode ter tamanho diferente

### 💬 Sistema de Chat

- **Chat em Tempo Real**: Comunicação instantânea entre jogadores
- **Histórico Persistente**: Mensagens salvas no banco de dados MySQL
- **Sistema de Dados Integrado**: Rolagem de dados direto no chat
- **Múltiplas Mesas**: Suporte para várias mesas simultâneas
- **Timestamps**: Horário de cada mensagem
- **UI Moderna**: Interface limpa e responsiva

### 🎲 Sistema de Dados

- **Rolagem Simples**: D4, D6, D8, D10, D12, D20, D100
- **Rolagem Múltipla**: Role múltiplos dados de uma vez (ex: 3d6)
- **Análise Estatística**: Soma, média, mínimo, máximo
- **Resultados Críticos**: Destaque visual para 1 (crítico) e valor máximo
- **Histórico de Rolagens**: Todas as rolagens são salvas
- **Visual Feedback**: Cores diferentes para resultados especiais

### 🎨 Sistema Visual

- **Sprites Animados**: Personagens com 8 direções de movimento
- **Depth Sorting**: Objetos renderizados na ordem correta
- **Tela de Carregamento**: Loading screen customizável por mesa
- **Transições Suaves**: Fade in/out entre cenas
- **Controles Mobile**: Joystick virtual para dispositivos touch
- **Zoom Dinâmico**: Ajuste de câmera responsivo

### 🔧 Sistema Técnico

- **WebSocket Real-time**: Socket.IO para comunicação bidirecional
- **Banco de Dados**: MySQL para persistência
- **Armazenamento de Arquivos**: MinIO para assets (S3-compatible)
- **Sistema de Mesas**: Múltiplas mesas/campanhas simultâneas
- **Auto-recovery**: Sistema de reconexão automática
- **Logs Detalhados**: Sistema de diagnóstico completo

---

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Socket.IO** - WebSocket em tempo real
- **MySQL** - Banco de dados relacional
- **MinIO** - Object storage (S3-compatible)
- **PM2** - Process manager

### Frontend
- **Phaser 3** - Game engine HTML5
- **HTML5/CSS3** - Interface web
- **JavaScript (ES6+)** - Lógica cliente
- **Bootstrap** - Framework CSS (componentes)

### DevOps
- **Git** - Controle de versão
- **PM2** - Gerenciamento de processos
- **Linux** - Servidor de produção

---

## 🚀 Instalação

### Pré-requisitos

- Node.js (v18 ou superior)
- MySQL (v8.0 ou superior)
- MinIO ou AWS S3 (para armazenamento de assets)
- Git

### Passo a Passo

1. **Clone o repositório**
\`\`\`bash
git clone https://github.com/IrvingSamuel/RPG-Table-Top.git
cd RPG-Table-Top
\`\`\`

2. **Instale as dependências**
\`\`\`bash
npm install
\`\`\`

3. **Configure o banco de dados**
\`\`\`bash
# Execute os scripts SQL na ordem:
mysql -u seu_usuario -p nome_do_banco < database_setup.sql
mysql -u seu_usuario -p nome_do_banco < database_add_map_dimensions.sql
mysql -u seu_usuario -p nome_do_banco < database_update_loadscreen.sql
mysql -u seu_usuario -p nome_do_banco < database_update_rooftops.sql
\`\`\`

4. **Configure as credenciais**
   
Edite o arquivo \`server.js\` com suas credenciais do MySQL:
\`\`\`javascript
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'seu_usuario',
    password: 'sua_senha',
    database: 'seu_banco'
});
\`\`\`

Edite o arquivo \`config/minio.js\` com suas credenciais do MinIO:
\`\`\`javascript
const minioClient = new Minio.Client({
    endPoint: 'seu-endpoint.com',
    port: 9000,
    useSSL: true,
    accessKey: 'sua_access_key',
    secretKey: 'sua_secret_key'
});
\`\`\`

5. **Inicie o servidor**
\`\`\`bash
# Desenvolvimento
node server.js

# Produção (com PM2)
pm2 start server.js --name rpg
pm2 save
\`\`\`

6. **Acesse o sistema**
\`\`\`
http://localhost:3000
\`\`\`

---

## ⚙️ Configuração

### Configuração de Mesas

As mesas são configuradas no banco de dados na tabela \`mesas\`:

\`\`\`sql
INSERT INTO mesas (table_name, load_screen, is_active) 
VALUES ('Nome da Mesa', 'assets/loading/custom-loading.svg', 1);
\`\`\`

### Configuração de Mapas

Mapas são adicionados na tabela \`mapas\`:

\`\`\`sql
INSERT INTO mapas (nome, largura, altura, dia, tarde, noite, limits, roofs_dia, roofs_tarde, roofs_noite, doors_dia, doors_tarde, doors_noite)
VALUES ('hospital', 1920, 1920, 
    'https://minio.com/maps/hospital-dia.png',
    'https://minio.com/maps/hospital-tarde.png',
    'https://minio.com/maps/hospital-noite.png',
    'https://minio.com/maps/hospital-limits.png',
    'https://minio.com/maps/hospital-roofs-dia.png',
    'https://minio.com/maps/hospital-roofs-tarde.png',
    'https://minio.com/maps/hospital-roofs-noite.png',
    'https://minio.com/maps/hospital-doors-dia.png',
    'https://minio.com/maps/hospital-doors-tarde.png',
    'https://minio.com/maps/hospital-doors-noite.png'
);
\`\`\`

---

## 📖 Uso

### Interface Básica

1. **Login**: Escolha seu personagem (sprite) na tela inicial
2. **Movimento**: Use WASD ou setas para mover
3. **Chat**: Clique no ícone de chat (💬) para abrir
4. **Dados**: Use os botões de dados na barra lateral

### Controles

**Desktop:**
- \`W/↑\` - Mover para cima
- \`S/↓\` - Mover para baixo
- \`A/←\` - Mover para esquerda
- \`D/→\` - Mover para direita
- \`Enter\` - Abrir chat

**Mobile:**
- Joystick virtual no canto inferior esquerdo

---

## 🗺️ Roadmap

### ✅ Implementado

- [x] Sistema básico de multiplayer
- [x] Chat em tempo real
- [x] Sistema de dados
- [x] Mapas dinâmicos
- [x] Múltiplos personagens
- [x] Nomes acima dos personagens
- [x] Sistema de colisão
- [x] Portas interativas
- [x] Suporte mobile

### 🚧 Em Desenvolvimento

- [ ] Sistema de combate
- [ ] Inventário de itens
- [ ] Fichas de personagem completas
- [ ] Sistema de habilidades/magias
- [ ] Fog of War (névoa de guerra)
- [ ] Sistema de iluminação dinâmica

### 📋 Planejado

- [ ] Sistema de som ambiente
- [ ] Música de fundo por mapa
- [ ] Sistema de quests
- [ ] Sistema de níveis/XP
- [ ] Voice chat integrado
- [ ] Modo espectador para mestres

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/NovaFeature\`)
3. Commit suas mudanças (\`git commit -m 'Adiciona nova feature'\`)
4. Push para a branch (\`git push origin feature/NovaFeature\`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Irving Samuel** - *Desenvolvedor Principal* - [@IrvingSamuel](https://github.com/IrvingSamuel)

---

<div align="center">

**⭐ Se você gostou deste projeto, considere dar uma estrela no GitHub! ⭐**

Feito com ❤️ para a comunidade RPG

[⬆ Voltar ao topo](#-rpg-table-top---sistema-de-mesa-virtual)

</div>
