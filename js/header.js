// Variável global para ajustar os caminhos relativos quando o site estiver em subpastas.
let basePath = '';

// Função responsável por carregar o componente Header dinamicamente.
async function carregarHeader() {
    const header = document.getElementById('header') || document.getElementById('header-placeholder');
    if (!header) return;

    try {
        // Tentativa de carregar o Header assumindo que estamos na raiz do projeto.
        let response = await fetch('components/header.html');

        // Se não encontrar, tentamos subir uma pasta. 
        // Isso permite que o mesmo header funcione tanto na raiz quanto em páginas dentro de 'pages/'.
        if (!response.ok) {
            response = await fetch('../components/header.html');
            if (response.ok) {
                // Se deu certo, salva o prefixo para ajustar os links dentro do Header.
                basePath = '../';
            }
        }

        if (!response.ok) throw new Error('Header não encontrado em nenhum caminho!');

        // Converte o corpo da resposta em uma string de texto simples. 
        const html = await response.text();

        // Coloca o HTML do componente no DOM.
        header.innerHTML = html;

        // Corrigindo os caminhos relativos.
        ajustarLinksDoHeader(header);

        inicializarLogicaHeader();
        verificarLoginUsuario();

    } catch (error) {
        console.error('Erro ao carregar o header:', error);
    }
}

function ajustarLinksDoHeader(container) {
    // Ajusta o caminho do Logo do Site e a foto do perfil do usuário.
    const imagens = container.querySelectorAll('img');
    imagens.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('../') && !src.startsWith('/')) {
            img.src = basePath + src;
        }
    });
    
    // Ajusta o caminho dos Links.
    const links = container.querySelectorAll('a');
    links.forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('../') && !href.startsWith('#') && !href.startsWith('/')) {
            a.href = basePath + href;
        }
    });
}

// Inicializa toda a interatividade do cabeçalho (Menu Mobile, Modais e Navegação).
function inicializarLogicaHeader() {
    // Seleção dos Elementos.
    const hamburger = document.querySelector(".Hamburger");
    const navMenu = document.querySelector(".Navegacao-Menu");
    const modal = document.getElementById('Pop-up-Entrar');
    const openModalButtons = document.querySelectorAll('.js-open-modal'); 
    const closeModalButton = document.querySelector('.Pop-up-Fechar');
    const btnLoginContainer = document.getElementById('btn-login-container');
    const btnLogin = document.querySelector('.btn-fazer-login'); 
    const btnCadastro = document.querySelector('.btn-criar-conta'); 
    

    // --------------- MODAL ---------------
    // Função para mostrar o Modal de Login.
    const abrirModal = () => {
        // Adiciona classe que muda opacidade no CSS.
        if (modal) modal.classList.add('active'); 
        
        // Esconde o botão "Entrar" do Header.
        if (window.innerWidth > 900 && btnLoginContainer) btnLoginContainer.style.display = 'none';
        
        // Se abrir o modal pelo celular, garante que o menu lateral se feche
        if (hamburger) hamburger.classList.remove("active");
        if (navMenu) navMenu.classList.remove("active");
    };

    // Função para fechar o Modal.
    const fecharModal = () => {
        if (modal) modal.classList.remove('active');
        // Verifica se precisa mostrar o botão "Entrar" de volta se ninguém estiver logado.
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado && btnLoginContainer) btnLoginContainer.style.display = 'block';
    };

    // Navegação interna do Modal.
    if (btnLogin) btnLogin.addEventListener('click', () => window.location.href = basePath + 'pages/entrar.html');
    if (btnCadastro) btnCadastro.addEventListener('click', () => window.location.href = basePath + 'pages/criar-conta-um.html');

    // Chama a função de destaque do link da página atual.
    destacarLinkAtivo();

    // --------------- MENU HAMBURGUER ---------------
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // Configura o botão "entrar" para abrir o Modal.
    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            abrirModal();
        });
    });

    // Fecha o Modal ao clicar no 'X'.
    if (closeModalButton) closeModalButton.addEventListener('click', fecharModal);
    
    // Fecha o Modal se clicar fora do seu retângulo.
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'Pop-up-Entrar') fecharModal();
        });
    }
}

// Verifica se existe um usuário logado.
function verificarLoginUsuario() {
    // Recupera os dados salvos no navegador. 
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    
    // Seleção dos Elementos.
    const containerVisitante = document.getElementById('btn-login-container');
    const containerUsuario = document.getElementById('areaUsuario'); 
    const nomeDisplay = document.getElementById('header-user-name');
    const avatarDisplay = document.getElementById('avatar');
    const btnLogout = document.getElementById('btn-sair');
    const linkLoginMobile = document.getElementById('link-login-mobile');

    // Links do menu da área do usuário.   
    const linkPerfil = document.getElementById('menu-perfil');
    const linkNotificacoes = document.getElementById('notificacoes');
    const linkAdocoes = document.getElementById('menu-adocoes');
    const linkDivulgacoes = document.getElementById('menu-divulgacoes');
    
    // Caminho da imagem de perfil caso o usuário não tenha foto.
    const caminhoPadrao = basePath + 'img/Perfil.png';

    if (usuarioSalvo) {
        // Se o usuário estiver logado.
        try {
            // Converte a string JSON de volta para Objeto.
            const usuario = JSON.parse(usuarioSalvo); 

            // Esconde botão "Entrar", mostra sua foto e nome.
            if(containerVisitante) containerVisitante.style.display = 'none';
            if(containerUsuario) containerUsuario.style.display = 'flex';
            
            // Preenche o nome com "nome_exibicao" ou usuário. 
            if(nomeDisplay) nomeDisplay.textContent = usuario.nome_exibicao || "Usuário";
            
            // Tratamento da Foto de Perfil.
            if (avatarDisplay) {
                let fotoUrl = usuario.foto_perfil || caminhoPadrao;
                avatarDisplay.src = fotoUrl; 
                // Se der erro ao carregar a imagem, carrega a imagem padrão.
                avatarDisplay.onerror = () => { avatarDisplay.src = caminhoPadrao; };
            }

            // Configuração para os links da Áre do usuário levar as abas certas.
            if (linkPerfil) linkPerfil.href = basePath + 'pages/minha-conta.html?secao=adocoes';
            
            // Adiciona '?secao=...' para que o JS da "minha-conta" saiba qual aba clicar.
            if (linkNotificacoes) linkNotificacoes.href = basePath + 'pages/minha-conta.html?secao=notificacoes';
            if (linkAdocoes) linkAdocoes.href = basePath + 'pages/minha-conta.html?secao=adocoes';
            if (linkDivulgacoes) linkDivulgacoes.href = basePath + 'pages/minha-conta.html?secao=divulgacoes';


            // Ajustes para o Mobile.
            if (linkLoginMobile) {
                // No mobile, o link "Entrar" vira o nome da pessoa e leva ao perfil.
                linkLoginMobile.textContent = usuario.nome_exibicao;
                linkLoginMobile.href = basePath + 'pages/minha-conta.html';
                linkLoginMobile.classList.remove('js-open-modal');
                
                // Clonar o elemento para remover event listeners antigos (ex: abrir modal)
                const novoLink = linkLoginMobile.cloneNode(true); 
                linkLoginMobile.parentNode.replaceChild(novoLink, linkLoginMobile);
            }
            
            // Sair.
            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    // Limpa a sessão.
                    localStorage.removeItem('usuarioLogado'); 
                    window.location.href = basePath + 'index.html'; 
                });
            }
        } catch (e) {
            // Se o JSON estiver corrompido, desloga por segurança.
            console.error(e);
            localStorage.removeItem('usuarioLogado');
        }
    } else {
        // Usuário não Logado.
        if(containerVisitante) containerVisitante.style.display = 'block';
        if(containerUsuario) containerUsuario.style.display = 'none';
        
        // Reseta o link mobile para abrir o modal de login.
        if (linkLoginMobile) {
            linkLoginMobile.textContent = "Entrar";
            linkLoginMobile.href = "#";
            linkLoginMobile.classList.add('js-open-modal');
        }
    }
}

// Identifica a página atual e destacar o link correspondente no Header.
function destacarLinkAtivo() {
    // Pega o caminho completo da URL atual.
    const caminhoAtual = window.location.pathname; 
    const linksMenu = document.querySelectorAll('.Navegacao-Menu a');

    linksMenu.forEach(link => {
        const href = link.getAttribute('href');
        
        // Ignora links vazios ou âncoras simples.
        if (!href || href === '#') return;

        // Pegamos o nome da página após a "/".
        const nomeArquivoLink = href.split('/').pop(); 
        
        // Verifica se a URL do navegador termina com o nome do arquivo deste link.
        const ehPaginaAtual = caminhoAtual.endsWith(nomeArquivoLink);

        // Caso especial para a Tela Inicial.
        const ehHomeNaRaiz = (caminhoAtual.endsWith('/') || caminhoAtual.endsWith('/meu-futuro-amigo/')) && nomeArquivoLink === 'index.html';

        // Se for a página exata ou a home na raiz, ativa a classe CSS que deixa o link marrom.
        if (ehPaginaAtual || ehHomeNaRaiz) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', carregarHeader);