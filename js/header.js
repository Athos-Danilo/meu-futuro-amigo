async function carregarHeader() {
    // 1. Seleciona o local onde o header vai entrar
    // (Certifique-se que no seu HTML a div tem id="Cabeçalho" ou mude aqui para "header-placeholder")
    const Cabeçalho = document.getElementById('Cabeçalho') || document.getElementById('header-placeholder');
    
    if (!Cabeçalho) return;

    try {
        const response = await fetch('/components/header.html');
        const html = await response.text();

        Cabeçalho.innerHTML = html;

        // 4. AGORA que o HTML existe, ativamos tudo!
        inicializarLogicaHeader();
        verificarLoginUsuario();

    } catch (error) {
        console.error('Erro ao carregar o header:', error);
    }
}

function inicializarLogicaHeader() {
    // --- 1. Elementos do DOM ---
    const hamburger = document.querySelector(".Hamburger");
    const navMenu = document.querySelector(".Navegação-Menu");
    
    const modal = document.getElementById('Pop-up-Entrar');
    const openModalButtons = document.querySelectorAll('.js-open-modal');
    const closeModalButton = document.querySelector('.Pop-up-Fechar');
    
    // Pegamos o container do botão "Entrar" para poder escondê-lo
    const btnLoginContainer = document.getElementById('btn-login-container');
    
    const btnLogin = document.querySelector('.btn-fazer-login');
    const btnCadastro = document.querySelector('.btn-criar-conta');

    // --- 2. Funções Auxiliares ---
    
    // Função para ABRIR o modal e ESCONDER o botão
    const abrirModal = () => {
        if (modal) modal.classList.add('active');
        
        // Se estamos no Desktop (tela grande), escondemos o botão "Entrar"
        if (window.innerWidth > 900 && btnLoginContainer) {
            btnLoginContainer.style.display = 'none';
        }

        // Fecha menu mobile se estiver aberto
        if (hamburger) hamburger.classList.remove("active");
        if (navMenu) navMenu.classList.remove("active");
    };

    // Função para FECHAR o modal e MOSTRAR o botão de volta
    const fecharModal = () => {
        if (modal) modal.classList.remove('active');
        
        // Trazemos o botão "Entrar" de volta
        // Verificamos se o usuário NÃO está logado antes de mostrar (para não conflitar com a lógica de login)
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado && btnLoginContainer) {
            btnLoginContainer.style.display = 'block';
        }
    };

    // --- 3. Event Listeners (Ações) ---

    // Menu Hambúrguer
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // Botões que abrem o modal (Links "Entrar")
    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal();
        });
    });

    // Botão X para fechar
    if (closeModalButton) {
        closeModalButton.addEventListener('click', fecharModal);
    }
    
    // Clicar fora para fechar (na parte escura)
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'Pop-up-Entrar') {
                fecharModal();
            }
        });
    }

    // Redirecionamentos internos do Modal
    if (btnLogin) btnLogin.addEventListener('click', () => window.location.href = '/pages/entrar.html');
    if (btnCadastro) btnCadastro.addEventListener('click', () => window.location.href = '/pages/criar-conta-um.html');

    // Destacar link ativo
    destacarLinkAtivo();
}

function verificarLoginUsuario() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    const containerVisitante = document.getElementById('btn-login-container');
    const containerUsuario = document.getElementById('user-profile-container');
    const nomeDisplay = document.getElementById('header-user-name');
    const avatarDisplay = document.getElementById('header-user-avatar');
    const btnLogout = document.getElementById('btn-logout');

    const caminhoPadrao = '/img/Perfil.png';

    if (usuarioSalvo) {
        // ESTÁ LOGADO!
        const usuario = JSON.parse(usuarioSalvo);
        
        if(containerVisitante) containerVisitante.style.display = 'none';
        if(containerUsuario) containerUsuario.style.display = 'flex';
        if(nomeDisplay) nomeDisplay.textContent = usuario.nome_exibicao;
        
        if (avatarDisplay) {
                if (usuario.foto_perfil) {
                    // Tenta usar o caminho da foto, garantindo que ele comece com '/' se não tiver
                    let fotoUrl = usuario.foto_perfil.startsWith('/') ? usuario.foto_perfil : '/' + usuario.foto_perfil;
                    
                    // 1. Tenta carregar a foto do usuário
                    avatarDisplay.src = fotoUrl;

                    // 2. Adiciona um fallback: Se a imagem dinâmica falhar (404), carrega a padrão.
                    avatarDisplay.onerror = () => {
                        avatarDisplay.src = caminhoPadrao;
                        avatarDisplay.onerror = null; // Previne loop infinito de erro
                    };
                    
                } else {
                    // Se o usuário.foto_perfil for nulo/vazio, usa o caminho padrão
                    avatarDisplay.src = caminhoPadrao;
                }
            }
        
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                localStorage.removeItem('usuarioLogado'); 
                window.location.href = '../index.html'; 
            });
        }
    } else {
        // NÃO ESTÁ LOGADO
        if(containerVisitante) containerVisitante.style.display = 'block';
        if(containerUsuario) containerUsuario.style.display = 'none';
    }
}

function destacarLinkAtivo() {
    const caminhoAtual = window.location.pathname;
    const linksMenu = document.querySelectorAll('.Navegação-Menu a');

    linksMenu.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (caminhoAtual.includes(linkPath) && linkPath !== '#') {
            link.classList.add('active');
        }
    });
}

// Chama a função assim que o arquivo carrega
document.addEventListener('DOMContentLoaded', carregarHeader);