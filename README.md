TA.share — Tecnologia Assistiva Compartilhada

O TA.share é uma plataforma voltada para a gestão e intermediação do empréstimo comunitário de itens de Tecnologia Assistiva (TA). O nome une as iniciais de Tecnologia Assistiva ao termo em inglês ".share" (compartilhar), traduzindo a essência do projeto: conectar equipamentos parados ou disponíveis em acervos a pessoas com deficiência, limitações temporárias de mobilidade ou necessidades específicas que precisam desses recursos para promover sua autonomia e inclusão.

Na prática, o sistema atua no controle patrimonial e no ciclo completo de circulação dos itens, desde o catálogo e registro de empréstimos até o acompanhamento de prazos e estado de conservação, garantindo um fluxo organizado, rastreável e acessível para a comunidade.

---

Tecnologias Utilizadas (Backend)

Linguagem: Java 21
Framework: Spring Boot (Spring Web, Spring Data JPA)
Banco de Dados: MySQL
Versionamento de Banco (Migrations): Flyway
* Gerenciador de Dependências: Maven

---

Arquitetura do Projeto

O backend segue a arquitetura em camadas (MVC / REST), separando as responsabilidades para facilitar a manutenção e escalabilidade:
src/main/java/com/grupo5/ta_share
├── controller   # Endpoints REST que recebem e respondem às requisições HTTP
├── service      # Regras de negócio (ex: atualização de status no empréstimo)
├── repository   # Interfaces de comunicação com o banco via Spring Data JPA
└── model        # Entidades mapeadas para as tabelas do MySQL

---

Modelo de Dados
O banco de dados é gerenciado automaticamente via Flyway (src/main/resources/db/migration) e conta com quatro entidades principais:

usuarios: Cadastro de beneficiários, administradores, profissionais e doadores parceiros.

categorias: Classificação dos tipos de Tecnologia Assistiva (ex: Mobilidade, Comunicação Alternativa).

equipamentos: Controle patrimonial dos itens, estado de conservação e status de disponibilidade (DISPONIVEL, EMPRESTADO, MANUTENCAO).

emprestimos: Registro da circulação dos itens, vinculando usuário, equipamento, datas previstas e status (ATIVO, CONCLUIDO, ATRASADO).

---

Como Executar o Projeto
Pré-requisitos
Java 21 instalado

MySQL Server ativo

Maven instalado (ou uso do wrapper ./mvnw)

Passo a passo
1. Clone este repositório:
git clone https://github.com/eduardoRvieira/ta-share.git
2. Crie um banco de dados vazio no seu MySQL chamado ta_share:
CREATE DATABASE ta_share;
3. Configure as credenciais do seu banco no arquivo src/main/resources/application.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/ta_share
spring.datasource.username=seu_usuario
spring.datasource.password=sua senha
4. Execute a aplicação pela sua IDE (IntelliJ/Eclipse) ou via terminal:
./mvnw spring-boot:run
(O Flyway criará automaticamente todas as tabelas na primeira inicialização.)

---

Endpoints da API REST
A API responde na porta padrão 8080 (http://localhost:8080).
1. Categorias
GET	/api/categorias - Lista todas as categorias cadastradas
POST	/api/categorias - Cadastra uma nova categoria
GET	/api/categorias/{id} - Busca uma categoria específica por ID
DELETE	/api/categorias/{id} - Remove uma categoria
2. Equipamentos
GET	/api/equipamentos - Lista todos os equipamentos do acervo
POST	/api/equipamentos	- Cadastra um novo equipamento vinculado a uma categoria
GET	/api/equipamentos/{id} - Busca um equipamento específico por ID
DELETE	/api/equipamentos/{id} - Remove um equipamento
3. Usuários
GET	/api/usuarios - Lista todos os usuários cadastrados
POST	/api/usuarios - Cadastra um novo usuário
GET	/api/usuarios/{id} - Busca um usuário específico por ID
DELETE	/api/usuarios/{id} - Remove um usuário
4. Empréstimos
GET	/api/emprestimos - Lista todos os empréstimos registrados
POST	/api/emprestimos - Registra um novo empréstimo e altera o item para EMPRESTADO
GET	/api/emprestimos/{id} - Busca um empréstimo específico por ID
DELETE	/api/emprestimos/{id} - Remove um registro de empréstimo

Desenvolvimento
Turma Java +Devs2Blu, grupo 5



