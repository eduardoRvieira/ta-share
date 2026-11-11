CREATE TABLE `usuarios` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `senha` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(14) UNIQUE NOT NULL,
  `telefone` VARCHAR(20),
  `perfil` VARCHAR(50) NOT NULL COMMENT 'BENEFICIARIO, ADMIN, PROFISSIONAL',
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `categorias` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(100) NOT NULL COMMENT 'Ex: Mobilidade, Comunicação Alternativa',
  `descricao` TEXT
);

CREATE TABLE `equipamentos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `patrimonio` VARCHAR(50) UNIQUE NOT NULL COMMENT 'Número de tombamento/identificação',
  `categoria_id` INT NOT NULL,
  `estado_conservacao` VARCHAR(50) NOT NULL COMMENT 'NOVO, BOM, NECESSITA_MANUTENCAO',
  `status_item` VARCHAR(50) NOT NULL COMMENT 'DISPONIVEL, EMPRESTADO, MANUTENCAO',
  `descricao` TEXT,
  `criado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_equipamento_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
);

CREATE TABLE `emprestimos` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `equipamento_id` INT NOT NULL,
  `data_emprestimo` DATE NOT NULL,
  `data_devolucao_prevista` DATE NOT NULL,
  `data_devolucao_real` DATE,
  `status` VARCHAR(50) NOT NULL COMMENT 'ATIVO, CONCLUIDO, ATRASADO',
  `observacoes` TEXT,
  CONSTRAINT `fk_emprestimo_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_emprestimo_equipamento` FOREIGN KEY (`equipamento_id`) REFERENCES `equipamentos` (`id`)
);