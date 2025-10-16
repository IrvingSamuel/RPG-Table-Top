-- Migração para adicionar suporte a múltiplas mesas
-- Execute este script se as tabelas já existem

-- Criar tabela de mesas se não existir
CREATE TABLE IF NOT EXISTS game_tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Inserir mesa de teste padrão
INSERT IGNORE INTO game_tables (id, table_name, is_active) 
VALUES (1, 'Mesa de Teste 1', TRUE);

-- Adicionar coluna table_id na tabela chat_messages se não existir
-- Verificamos se a coluna já existe antes de tentar adicionar
SET @dbname = DATABASE();
SET @tablename = 'chat_messages';
SET @columnname = 'table_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE chat_messages ADD COLUMN table_id INT DEFAULT 1 AFTER id, ADD INDEX idx_table_id (table_id)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Adicionar coluna table_id na tabela dice_rolls se não existir
SET @tablename = 'dice_rolls';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  'ALTER TABLE dice_rolls ADD COLUMN table_id INT DEFAULT 1 AFTER id, ADD INDEX idx_table_id_dice (table_id)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Atualizar registros existentes para usar table_id = 1 (Mesa de Teste 1)
UPDATE chat_messages SET table_id = 1 WHERE table_id IS NULL OR table_id = 0;
UPDATE dice_rolls SET table_id = 1 WHERE table_id IS NULL OR table_id = 0;

