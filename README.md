## Meu Futuro Amigo 🐾

**Conectando Lares e Corações: Uma Plataforma de Adoção Responsável**

**🚧 Projeto em Evolução Contínua: De um site estático para uma aplicação Web Full Stack.**

## 🌟 Sobre o Projeto

Bem-vindo ao repositório do **Meu Futuro Amigo**! Este projeto nasceu como um trabalho para a disciplina de **Programação para Internet 1**, focado em Front-end, com o objetivo de criar um site funcional e visualmente atraente utilizando **HTML5 Semântico** e **CSS3**, baseado em um protótipo de alta fidelidade.

Atualmente, o projeto está em uma fase avançada de desenvolvimento, **evoluindo para uma aplicação Full Stack completa**. Além de uma interface bonita e responsiva, agora ele conta com um **servidor próprio, banco de dados real e funcionalidades dinâmicas de autenticação, gerenciamento de perfil e segurança**.

A plataforma busca solucionar um problema real: a dificuldade em conectar animais que precisam de um lar (sejam de abrigos ou de doações particulares) com pessoas dispostas a adotar de forma responsável em Pernambuco.

## ✨ Funcionalidades Implementadas

### 🎨 Front-End (Interface & UX)

* **Novo Cabeçalho (Header) Dinâmico:**
    * Design moderno com cortes diagonais via CSS (sem uso de imagens de fundo pesadas).
    * Menu "Hamburguer" animado para Mobile e navegação horizontal para Desktop.
    * Exibição condicional: Mostra foto e nome quando logado, ou botão de entrar quando visitante.

* **Sistema de Modais (Pop-ups):**
    * Login e Cadastro acessíveis via janelas sobrepostas, sem sair da página principal.
    * Modal de segurança ("Cachorrinho Triste") para confirmação de exclusão de conta.

* **Dashboard do Usuário ("Minha Conta"):**
    * **Layout Responsivo:** Sidebar lateral (Desktop) que se transforma em cards empilhados (Mobile).
    * **Modo Leitura vs. Edição:** Interface limpa para visualizar dados, que se transforma em formulário interativo ao clicar em "Editar".
    * **Preview de Imagem:** Visualização instantânea da nova foto de perfil antes de enviar para o servidor.

* **UX/UI Aconchegante:** Uso de cores da identidade visual (Laranja, Verde, Marrom), tipografia hierárquica e espaçamentos que transmitem confiança.

### ⚙️ Back-End & Integração

* **CRUD Completo de Usuários:**
    * **Create (Criar):** Cadastro em duas etapas com validação de e-mail único.
    * **Read (Ler):** Carregamento automático dos dados (Nome, Telefone, Endereço, Foto) ao fazer login.
    * **Update (Atualizar):** Lógica inteligente que permite atualizar apenas textos ou alterar a foto de perfil (mantendo a antiga caso nenhuma nova seja enviada).
    * **Delete (Excluir):** Rota segura para remoção total da conta e dados do usuário.

* **Upload e Processamento de Imagens:** Uso do `Multer` para receber arquivos, tratar caminhos (Windows/Unix) e salvar no servidor.

* **Autenticação e Segurança:**
    * Senhas criptografadas com `bcrypt` (nunca salvas em texto puro).
    * Verificação de credenciais no login.

* **Banco de Dados Relacional:** Uso do PostgreSQL para persistência segura dos dados.

## 🚀 Acesso ao Projeto

* **Site no Ar (GitHub Pages - Versão Estática):** [https://athos-danilo.github.io/meu-futuro-amigo/](https://athos-danilo.github.io/meu-futuro-amigo/)
* **Protótipo no Figma:** [Link para o Figma](https://www.figma.com/design/GDqz34u7yU78RZSstfax6A/Projeto-Web?node-id=0-1&t=Cj0maHrw5e0URM2f-1)

## 💻 Tecnologias Utilizadas

O projeto utiliza um conjunto moderno e robusto de tecnologias Full Stack:

### Design & Front-End
* **Design:** Figma (Protótipo de alta fidelidade)
* **Estrutura:** HTML5 Semântico
* **Estilização:** CSS3 (Flexbox, Grid, Media Queries, Variáveis CSS, Animações, Mobile First)
* **Linguagem de Script:** JavaScript ES6+ (Manipulação do DOM, Fetch API, FormData, localStorage)

### Back-End (Servidor)
* **Ambiente de Execução:** Node.js
* **Framework:** Express.js (Criação de rotas e API REST)
* **Middlewares & Utilitários:**
    * `multer` (Upload e armazenamento de imagens)
    * `bcryptjs` (Criptografia/Hash de senhas)
    * `dotenv` (Gerenciamento de variáveis de ambiente)
    * `cors` (Permissão de requisições entre domínios)
    * `nodemailer` (Envio de e-mails para recuperação de senha)

### Banco de Dados
* **SGBD:** PostgreSQL
* **Integração:** Pacote `pg` (node-postgres) para conexão e queries SQL.

### Ferramentas & Infraestrutura
* **Versionamento:** Git & GitHub
* **Gerenciamento de Banco:** pgAdmin 4

-------
Desenvolvido por **Athos Danilo**.