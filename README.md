## Meu Futuro Amigo 🐾

**Conectando Lares e Corações: Uma Plataforma de Adoção Responsáve**

**🚧 Projeto em Evolução Contínua: De um site estático para uma aplicação Web Full Stack.**

## 🌟 Sobre o Projeto

Bem-vindo ao repositório do **Meu Futuro Amigo**! Este projeto  nasceu como um trabalho para a disciplina de **Programação para Internet 1**, focado em Front-end, com o objetivo de criar um site funcional e visualmente atraente utilizando **HTML5 Semântico** e **CSS3**, baseado em um protótipo de alta fidelidade.

Atualmente, o projeto está em uma fase avançada de desenvolvimento, **evoluindo para uma aplicação Full Stack completa**. Além de uma interface bonita e responsiva, agora ele conta com um **servidor próprio, banco de dados real e funcionalidades dinâmicas de autenticação e gerenciamento de perfil**.

A plataforma busca solucionar um problema real: a dificuldade em conectar animais que precisam de um lar (sejam de abrigos ou de doações particulares) com pessoas dispostas a adotar de forma responsável em Pernambuco.


## ✨ Funcionalidades Implementadas

**🎨 Front-End (Interface)**

* **Design Responsivo (Mobile First):** Layout cuidadosamente planejado para funcionar perfeitamente em celulares e se adaptar elegantemente a telas maiores (desktops).

* UX/UI Aconchegante: Uso de cores, tipografia e espaçamentos que transmitem confiança e carinho.

* **Consumo de APIs**:

    * ViaCEP: Preenchimento automático de endereço (Cidade/Estado) ao digitar o CEP.

    * API Própria: Comunicação com o nosso back-end para login e cadastro.

**⚙️ Back-End (Servidor & Banco de Dados)**

* Sistema de Cadastro em Duas Etapas:

    * Parte 1: Criação de conta com validação de e-mail único e senhas criptografadas.

    * Parte 2: Completar perfil com dados de contato e localização.

* **Upload de Imagens:** Usuários podem enviar sua foto de perfil, que é processada pelo servidor e salva localmente.

* Autenticação Segura:

    * Login com verificação de e-mail e senha.

    * Senhas nunca são salvas em texto puro (uso de bcrypt para hash).

* **Banco de Dados Relacional:** Uso do PostgreSQL para armazenar dados dos usuários de forma estruturada e segura.

## 🚀 Acesso ao Projeto

* **Site no Ar (GitHub Pages):** [https://athos-danilo.github.io/meu-futuro-amigo/](https://athos-danilo.github.io/meu-futuro-amigo/)
* **Protótipo no Figma:** [https://www.figma.com/design/GDqz34u7yU78RZSstfax6A/Projeto-Web?node-id=0-1&t=Cj0maHrw5e0URM2f-1](https://www.figma.com/design/GDqz34u7yU78RZSstfax6A/Projeto-Web?node-id=0-1&t=Cj0maHrw5e0URM2f-1)

## 💻 Tecnologias Utilizadas

O projeto utiliza um conjunto moderno e robusto de tecnologias Full Stack:

### Design & Front-End
* **Design:** Figma (Protótipo de alta fidelidade)
* **Estrutura:** HTML5 Semântico
* **Estilização:** CSS3 (Flexbox, Grid, Media Queries, Variáveis, Mobile First)
* **Linguagem de Script:** JavaScript (ES6+, Fetch API, DOM Manipulation)

### Back-End (Servidor)
* **Ambiente de Execução:** Node.js
* **Framework:** Express.js (Criação de rotas e API)
* **Middlewares & Utilitários:**
    * `multer` (Upload e armazenamento de imagens)
    * `bcryptjs` (Criptografia/Hash de senhas para segurança)
    * `dotenv` (Gerenciamento de variáveis de ambiente sensíveis)
    * `cors` (Permissão de requisições entre domínios)

### Banco de Dados
* **SGBD:** PostgreSQL (Banco de dados relacional)
* **Integração:** Pacote `pg` (node-postgres) para conexão entre o Node.js e o banco.

### Ferramentas & Infraestrutura
* **Versionamento:** Git & GitHub
* **Gerenciamento de Banco:** pgAdmin 4
* **Hospedagem Front-end:** GitHub Pages

-------
Desenvolvido  por **Athos Danilo**.