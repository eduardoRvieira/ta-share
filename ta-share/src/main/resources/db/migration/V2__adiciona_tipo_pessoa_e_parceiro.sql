-- Adiciona os novos campos na tabela de usuários já existente
ALTER TABLE `usuarios` 
ADD COLUMN `tipo_pessoa` VARCHAR(20) NOT NULL DEFAULT 'FISICA' COMMENT 'FISICA, JURIDICA',
ADD COLUMN `cnpj` VARCHAR(18) UNIQUE NULL;