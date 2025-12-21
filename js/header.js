// Variável global para guardar o caminho correto
let basePath = ''; 

async function carregarHeader() {
    const Cabeçalho = document.getElementById('Cabeçalho') || document.getElementById('header-placeholder');
    if (!Cabeçalho) return;

    try {
        // TENTATIVA 1: Tenta buscar considerando que estamos na raiz (index)
        let response = await fetch('components/header.html');
        
        // Se der erro 404, significa que provavelmente estamos numa subpasta
        if (!response.ok) {
            // TENTATIVA 2: Tenta buscar voltando uma pasta
            response = await fetch('../components/header.html');
            if (response.ok) {
                // Se funcionou aqui, definimos o basePath para voltar uma pasta
                basePath = '../';
            }
        }

        if (!response.ok) throw new Error('Header não encontrado em nenhum caminho!');

        const html = await response.text();
        Cabeçalho.innerHTML = html;

        // Agora ajustamos os links usando o basePath que descobrimos
        ajustarLinksDoHeader(Cabeçalho);
        inicializarLogicaHeader();
        verificarLoginUsuario();

    } catch (error) {
        console.error('Erro ao carregar o header:', error);
    }
}

function ajustarLinksDoHeader(container) {
    // Ajusta IMAGENS
    const imagens = container.querySelectorAll('img');
    imagens.forEach(img => {
        const src = img.getAttribute('src');
        // Se for um caminho local simples, adiciona o prefixo (../ ou vazio)
        if (src && !src.startsWith('http') && !src.startsWith('../') && !src.startsWith('/')) {
            img.src = basePath + src;
        }
    });
    
    // Ajusta LINKS
    const links = container.querySelectorAll('a');
    links.forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('../') && !href.startsWith('#') && !href.startsWith('/')) {
            a.href = basePath + href;
        }
    });
}

// Inicializando a Lógica (Menu, Modais, Login)
function inicializarLogicaHeader() {
    const hamburger = document.querySelector(".Hamburger");
    const navMenu = document.querySelector(".Navegacao-Menu");
    const modal = document.getElementById('Pop-up-Entrar');
    const openModalButtons = document.querySelectorAll('.js-open-modal');
    const closeModalButton = document.querySelector('.Pop-up-Fechar');
    const btnLoginContainer = document.getElementById('btn-login-container');
    const btnLogin = document.querySelector('.btn-fazer-login');
    const btnCadastro = document.querySelector('.btn-criar-conta');
    
    const abrirModal = () => {
        if (modal) modal.classList.add('active');
        if (window.innerWidth > 900 && btnLoginContainer) btnLoginContainer.style.display = 'none';
        if (hamburger) hamburger.classList.remove("active");
        if (navMenu) navMenu.classList.remove("active");
    };

    const fecharModal = () => {
        if (modal) modal.classList.remove('active');
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado && btnLoginContainer) btnLoginContainer.style.display = 'block';
    };

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal();
        });
    });

    if (closeModalButton) closeModalButton.addEventListener('click', fecharModal);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'Pop-up-Entrar') fecharModal();
        });
    }

    // USANDO O BASEPATH NOS REDIRECIONAMENTOS
    if (btnLogin) btnLogin.addEventListener('click', () => window.location.href = basePath + 'pages/entrar.html');
    if (btnCadastro) btnCadastro.addEventListener('click', () => window.location.href = basePath + 'pages/criar-conta-um.html');

    destacarLinkAtivo();
}

function verificarLoginUsuario() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    const containerVisitante = document.getElementById('btn-login-container');
    const containerUsuario = document.getElementById('areaUsuario');
    const nomeDisplay = document.getElementById('header-user-name');
    const avatarDisplay = document.getElementById('avatar');
    const btnLogout = document.getElementById('btn-sair');
    const linkLoginMobile = document.getElementById('link-login-mobile');
    
    // Caminho da imagem padrão usando basePath
    const caminhoPadrao = basePath + 'img/Perfil.png';

    if (usuarioSalvo) {
        try {
            const usuario = JSON.parse(usuarioSalvo);
            
            if(containerVisitante) containerVisitante.style.display = 'none';
            if(containerUsuario) containerUsuario.style.display = 'flex';
            if(nomeDisplay) nomeDisplay.textContent = usuario.nome_exibicao || "Usuário";
            
            if (avatarDisplay) {
                let fotoUrl = usuario.foto_perfil || caminhoPadrao;
                // Se a foto salva não for base64/http, assumimos que é local e precisa de basePath? 
                // Geralmente user upload é complexo, mas para o padrão funciona:
                avatarDisplay.src = fotoUrl; 
                avatarDisplay.onerror = () => { avatarDisplay.src = caminhoPadrao; };
            }

            if (linkLoginMobile) {
                linkLoginMobile.textContent = usuario.nome_exibicao;
                linkLoginMobile.href = basePath + 'pages/minha-conta.html';
                linkLoginMobile.classList.remove('js-open-modal');
                const novoLink = linkLoginMobile.cloneNode(true); // Remove listeners antigos
                linkLoginMobile.parentNode.replaceChild(novoLink, linkLoginMobile);
            }
            
            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    localStorage.removeItem('usuarioLogado'); 
                    window.location.href = basePath + 'index.html'; 
                });
            }
        } catch (e) {
            localStorage.removeItem('usuarioLogado');
        }
    } else {
        if(containerVisitante) containerVisitante.style.display = 'block';
        if(containerUsuario) containerUsuario.style.display = 'none';
        if (linkLoginMobile) {
            linkLoginMobile.textContent = "Entrar";
            linkLoginMobile.href = "#";
            linkLoginMobile.classList.add('js-open-modal');
        }
    }
}

function destacarLinkAtivo() {
    const caminhoAtual = window.location.pathname;
    const linksMenu = document.querySelectorAll('.Navegacao-Menu a');
    linksMenu.forEach(link => {
        const linkPath = link.getAttribute('href');
        // Lógica simples de verificação
        if (linkPath && linkPath !== '#' && caminhoAtual.includes(linkPath.replace('../', '').replace('./', ''))) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', carregarHeader);