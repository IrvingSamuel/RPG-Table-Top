-- Atualizar tabela mapas para suportar telhados por horário
-- BigBridge RPG - Map Tester System

USE `bigbridge-rpg`;

-- Adicionar colunas para telhados por horário
-- Nota: Se as colunas já existirem, você verá um erro "Duplicate column" (pode ignorar)

ALTER TABLE `mapas` ADD COLUMN `roofs_dia` TEXT NULL COMMENT 'URL do telhado durante o dia' AFTER `limits`;
ALTER TABLE `mapas` ADD COLUMN `roofs_tarde` TEXT NULL COMMENT 'URL do telhado durante a tarde' AFTER `roofs_dia`;
ALTER TABLE `mapas` ADD COLUMN `roofs_noite` TEXT NULL COMMENT 'URL do telhado durante a noite' AFTER `roofs_tarde`;

-- Mostrar estrutura atualizada
DESCRIBE `mapas`;

SELECT 'Tabela mapas atualizada com sucesso!' AS resultado;
