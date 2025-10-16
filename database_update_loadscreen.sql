-- Adiciona coluna load_screen na tabela game_tables
ALTER TABLE game_tables 
ADD COLUMN load_screen VARCHAR(255) DEFAULT NULL COMMENT 'Caminho da imagem de loading personalizada';

-- Atualiza a mesa de teste com uma imagem de loading padrão
UPDATE game_tables 
SET load_screen = 'assets/loading/default-loading.jpg' 
WHERE id = 1;
