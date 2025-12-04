// Carregar o Header em todos as páginas.
async function carregarHeader() {
    const Cabeçalho = document.getElementById('Cabeçalho') || document.getElementById('header-placeholder');
    if (!Cabeçalho) return;
    try {
        const response = await fetch('/components/header.html');
        const html = await response.text();
        Cabeçalho.innerHTML = html;

        inicializarLogicaHeader();
        verificarLoginUsuario();

    } catch (error) {
        console.error('Erro ao carregar o header:', error);
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
    
    // Função para abrir o modal e esconder o botão 'Entrar'.
    const abrirModal = () => {
        if (modal) modal.classList.add('active');
        
        // Se estamos no Desktop (tela grande), escondemos o botão "Entrar"
        if (window.innerWidth > 900 && btnLoginContainer) {
            btnLoginContainer.style.display = 'none';
        }

        // Fecha o menu mobile se estiver aberto.
        if (hamburger) hamburger.classList.remove("active");
        if (navMenu) navMenu.classList.remove("active");
    };

    // Função para fechar o modal e mostrar o botão de voltar.
    const fecharModal = () => {
        if (modal) modal.classList.remove('active');
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado && btnLoginContainer) {
            btnLoginContainer.style.display = 'block';
        }
    };

    // Menu Hambúrguer.
    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }

    // Botões que abrem o modal.
    openModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModal();
        });
    });

    // Botão X para fechar.
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

    // Redirecionamentos internos do Modal
    if (btnLogin) btnLogin.addEventListener('click', () => window.location.href = '/pages/entrar.html');
    if (btnCadastro) btnCadastro.addEventListener('click', () => window.location.href = '/pages/criar-conta-um.html');

    // Destacar link ativo
    destacarLinkAtivo();
}

function verificarLoginUsuario() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    const containerVisitante = document.getElementById('btn-login-container');
    const containerUsuario = document.getElementById('areaUsuario'); // Novo ID
    const nomeDisplay = document.getElementById('header-user-name');
    const avatarDisplay = document.getElementById('avatar'); // Novo ID
    const btnLogout = document.getElementById('btn-sair'); // Novo ID

    const caminhoPadrao = '/img/Perfil.png';

    if (usuarioSalvo) {
        // Está logado.
        try {
            const usuario = JSON.parse(usuarioSalvo);
            
            if(containerVisitante) containerVisitante.style.display = 'none';
            if(containerUsuario) containerUsuario.style.display = 'flex';
            if(nomeDisplay) nomeDisplay.textContent = usuario.nome_exibicao || "Usuário";
            
            // Carregar a foto do perfil do usuário.
            if (avatarDisplay) {
                if (usuario.foto_perfil) {
                    // Tenta usar o caminho da foto, garantindo que ele comece com '/' se não tiver
                    let fotoUrl = usuario.foto_perfil.startsWith('/') ? usuario.foto_perfil : '/' + usuario.foto_perfil;
                    
                    avatarDisplay.src = fotoUrl;

                    // Se o usuário não definiu uma imagem carrega a padrão.
                    avatarDisplay.onerror = () => {
                        avatarDisplay.src = caminhoPadrao;
                        avatarDisplay.onerror = null; 
                    };
                    
                } else {
                    avatarDisplay.src = caminhoPadrao;
                }
            }
            
            if (btnLogout) {
                btnLogout.addEventListener('click', () => {
                    localStorage.removeItem('usuarioLogado'); 
                    window.location.href = '/index.html'; 
                });
            }
        } catch (e) {
            console.error("Erro ao processar usuário logado:", e);
            // Em caso de erro no JSON, reseta o estado.
            localStorage.removeItem('usuarioLogado');
            if(containerVisitante) containerVisitante.style.display = 'block';
            if(containerUsuario) containerUsuario.style.display = 'none';
        }
    } else {
        // Não está logado.
        if(containerVisitante) containerVisitante.style.display = 'block';
        if(containerUsuario) containerUsuario.style.display = 'none';
    }
}

function destacarLinkAtivo() {
    const caminhoAtual = window.location.pathname;
    
    const linksMenu = document.querySelectorAll('.Navegacao-Menu a');

    linksMenu.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath && caminhoAtual.includes(linkPath) && linkPath !== '#') {
            link.classList.add('active');
        }
    });
}

// Chama a função assim que o arquivo carrega
document.addEventListener('DOMContentLoaded', carregarHeader);