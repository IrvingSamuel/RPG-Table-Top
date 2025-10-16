-- Tabela para mesas de jogo
CREATE TABLE IF NOT EXISTS game_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Inserir mesa de teste padrão
INSERT IGNORE INTO game_tables (id, table_name, is_active) 
VALUES (1, 'Mesa de Teste 1', TRUE);

-- Tabela para armazenar mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT DEFAULT 1,
    player_name VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    message_type ENUM('message', 'roll', 'system') DEFAULT 'message',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_date DATE DEFAULT (CURRENT_DATE),
    INDEX idx_created_at (created_at),
    INDEX idx_session_date (session_date),
    INDEX idx_player_name (player_name),
    INDEX idx_table_id (table_id),
    FOREIGN KEY (table_id) REFERENCES game_tables(id) ON DELETE CASCADE
);

-- Tabela para armazenar rolagens de dados
CREATE TABLE IF NOT EXISTS dice_rolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_id INT DEFAULT 1,
    player_name VARCHAR(50) NOT NULL,
    dice_type INT NOT NULL, -- D4, D6, D8, D10, D12, D20
    dice_result INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_date DATE DEFAULT (CURRENT_DATE),
    INDEX idx_created_at (created_at),
    INDEX idx_session_date (session_date),
    INDEX idx_player_name (player_name),
    INDEX idx_table_id (table_id),
    FOREIGN KEY (table_id) REFERENCES game_tables(id) ON DELETE CASCADE
);