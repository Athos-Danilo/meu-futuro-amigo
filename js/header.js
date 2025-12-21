// --- LÓGICA INTELIGENTE DE CAMINHOS ---
// Verifica se estamos dentro da pasta 'pages' para ajustar os links
const isPages = window.location.pathname.includes('/pages/');
// Se estiver em pages, volta uma pasta (../). Se estiver na raiz, não faz nada ('').
const basePath = isPages ? '../' : ''; 

// Carregar o Header em todos as páginas.
async function carregarHeader() {
    const Cabeçalho = document.getElementById('Cabeçalho') || document.getElementById('header-placeholder');
    if (!Cabeçalho) return;
    try {
        // CORREÇÃO 1: Usamos o basePath para achar o arquivo certo
        const response = await fetch(basePath + 'components/header.html');
        
        if (!response.ok) throw new Error('Caminho não encontrado: ' + response.url);

        const html = await response.text();
        Cabeçalho.innerHTML = html;

        // IMPORTANTE: Ajustar os links dentro do HTML do header que acabamos de carregar
        ajustarLinksDoHeader(Cabeçalho);

        inicializarLogicaHeader();
        verificarLoginUsuario();

    } catch (error) {
        console.error('Erro ao carregar o header:', error);
    }
}

// Função extra para corrigir links de imagens/logos dentro do header carregado
function ajustarLinksDoHeader(container) {
    // Exemplo: Se o header tem um logo <img src="img/logo.png">, 
    // nas páginas internas ele precisa virar <img src="../img/logo.png">
    if (isPages) {
        const imagens = container.querySelectorAll('img');
        imagens.forEach(img => {
            const src = img.getAttribute('src');
            if (src && !src.startsWith('http') && !src.startsWith('../')) {
                img.src = basePath + src;
            }
        });
        
        const links = container.querySelectorAll('a');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('../') && !href.startsWith('#')) {
                a.href = basePath + href;
            }
        });
    }
}

// Inicializando o Header.
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
        if (window.innerWidth > 900 && btnLoginContainer) {
            btnLoginContainer.style.display = 'none';
        }
        if (hamburger) hamburger.classList.remove("active");
        if (navMenu) navMenu.classList.remove("active");
    };

    const fecharModal = () => {
        if (modal) modal.classList.remove('active');
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado && btnLoginContainer) {
            btnLoginContainer.style.display = 'block';
        }
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

    if (closeModalButton) {
        closeModalButton.addEventListener('click', fecharModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'Pop-up-Entrar') {
                fecharModal();
            }
        });
    }

    // CORREÇÃO 2: Redirecionamentos usando basePath
    if (btnLogin) btnLogin.addEventListener('click', () => window.location.href = basePath + 'pages/entrar.html');
    if (btnCadastro) btnCadastro.addEventListener('click', () => window.location.href = basePath + 'pages/criar-conta-um.html');

    destacarLinkAtivo();
}

// Verificar se o usuário está conectado.
function verificarLoginUsuario() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    const containerVisitante = document.getElementById('btn-login-container');
    const containerUsuario = document.getElementById('areaUsuario');
    const nomeDisplay = document.getElementById('header-user-name');
    const avatarDisplay = document.getElementById('avatar');
    const btnLogout = document.getElementById('btn-sair');
    const linkLoginMobile = document.getElementById('link-login-mobile');
    
    // CORREÇÃO 3: Caminho da imagem padrão corrigido
    const caminhoPadrao = basePath + 'img/Perfil.png';

    if (usuarioSalvo) {
        try {
            const usuario = JSON.parse(usuarioSalvo);
            
            if(containerVisitante) containerVisitante.style.display = 'none';
            if(containerUsuario) containerUsuario.style.display = 'flex';
            if(nomeDisplay) nomeDisplay.textContent = usuario.nome_exibicao || "Usuário";
            
            if (avatarDisplay) {
                if (usuario.foto_perfil) {
                    // Removemos a barra forçada que quebrava o link
                    let fotoUrl = usuario.foto_perfil; 
                    avatarDisplay.src = fotoUrl;
                    avatarDisplay.onerror = () => {
                        avatarDisplay.src = caminhoPadrao;
                    };
                } else {
                    avatarDisplay.src = caminhoPadrao;
                }
            }

            if (linkLoginMobile) {
                linkLoginMobile.textContent = usuario.nome_exibicao;
                // CORREÇÃO 4: Link corrigido
                linkLoginMobile.href = basePath + 'pages/minha-conta.html';
                linkLoginMobile.classList.remove('js-open-modal');
                const novoLink = linkLoginMobile.cloneNode(true);
                linkLoginMobile.parentNode.replaceChild(novoLink, linkLoginMobile);
            }
            
            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    localStorage.removeItem('usuarioLogado'); 
                    // CORREÇÃO 5: Redirecionamento para index corrigido
                    window.location.href = basePath + 'index.html'; 
                });
            }
        } catch (e) {
            console.error("Erro ao processar usuário logado:", e);
            localStorage.removeItem('usuarioLogado');
            if(containerVisitante) containerVisitante.style.display = 'block';
            if(containerUsuario) containerUsuario.style.display = 'none';
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
        // Ajuste simples para comparar caminhos
        if (linkPath && caminhoAtual.includes(linkPath.replace('../', '').replace('./', '')) && linkPath !== '#') {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', carregarHeader);