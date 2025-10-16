-- Adiciona colunas de dimensões dos mapas
-- width: largura do mapa em pixels
-- height: altura do mapa em pixels

ALTER TABLE mapas 
ADD COLUMN width INT NOT NULL DEFAULT 1920 COMMENT 'Largura do mapa em pixels',
ADD COLUMN height INT NOT NULL DEFAULT 1920 COMMENT 'Altura do mapa em pixels';

-- Atualizar com os valores corretos:
UPDATE mapas SET width = 1920, height = 1920 WHERE id = 1; -- Hospital
UPDATE mapas SET width = 1920, height = 1920 WHERE id = 2; -- Escola  
UPDATE mapas SET width = 1920, height = 1206 WHERE id = 3; -- Jungle/Forest

-- Verificar dados atualizados
SELECT id, nome, width, height, x AS spawn_x, y AS spawn_y FROM mapas;
