// Carrega os dados do usuário assim que a tela abre
// Inicia a lógica de troca de abas
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosUsuario();
    inicializarAbas();
});

// Lógica das Abas.
function inicializarAbas() {
    const conteudos = {
        "Notificações": {
            titulo: "Não há Notificações",
            imagem: "../img/ilustração cachorro e gato.png", 
            textoBotao: null,
            linkBotao: null
        },
        "Minhas Adoções": {
            titulo: "Você ainda não Adotou<br>nenhum Bichinho",
            imagem: "../img/ilustração cachorro triste.png", 
            textoBotao: "Encontrar um Amigo",
            linkBotao: "#"
        },
        "Minhas Divulgações": {
            titulo: "Você ainda não Divulgou<br>nenhum Animal",
            imagem: "../img/ilustração gato triste.png", 
            textoBotao: "Divulgar um Animal",
            linkBotao: "#"
        }
    };

    // Selecionando os elementos do HTML.
    const botoesAba = document.querySelectorAll('.Abas-Navegação button');
    
    // Elementos que vão mudar de conteúdo.
    const tituloEl = document.querySelector('.Chamada .Título');
    const imagemEl = document.querySelector('.Chamada .Imagem');
    const botaoEl = document.querySelector('.Chamada a'); // Seleciona o link/botão

    // Adiciona o evento de clique em cada botão.
    botoesAba.forEach(botao => {
        botao.addEventListener('click', () => {
            const nomeAba = botao.textContent.trim();
            const dados = conteudos[nomeAba];

            if (dados) {
                // Atualiza o visual das abas.
                botoesAba.forEach(b => {
                    b.className = 'Aba-Item'; // Reseta todos para o estilo cinza
                });
                botao.className = 'Aba-Item-Ativa'; // Coloca o estilo ativo no clicado

                // Atualiza o conteúdo do Card Branco com efeito suave
                const cardBranco = document.querySelector('.Card-Branco');
                cardBranco.style.opacity = '0'; 

                setTimeout(() => {
                    tituloEl.innerHTML = dados.titulo;
                    imagemEl.src = dados.imagem;

                    if (dados.textoBotao) {
                        botaoEl.style.display = 'inline-block'; 
                        botaoEl.textContent = dados.textoBotao;
                        botaoEl.href = dados.linkBotao;
                    } else {
                        botaoEl.style.display = 'none';
                    }
                    cardBranco.style.opacity = '1';
                }, 200);
            }
        });
    });
}

// Carregar os dados do Usuário.
function carregarDadosUsuario() {
    // Recupera o JSON salvo no Login
    const usuarioSalvo = localStorage.getItem('usuarioLogado');

    if (!usuarioSalvo) {
        window.location.href = '/index.html'; 
        return;
    }

    const usuario = JSON.parse(usuarioSalvo);

    // Seleciona os elementos da Sidebar Laranja
    const nomeEl = document.getElementById('nomeUsuario');
    const localEl = document.getElementById('cidadeEstado');
    const telefoneEl = document.getElementById('telefone');
    const fotoEl = document.querySelector('.Foto-Perfil img');

    // Preenchendo os dados
    if (nomeEl) nomeEl.textContent = usuario.nome_exibicao || "Usuário";
    
    // Como no login básico as vezes só vem email e nome, podemos deixar um padrão ou pegar do objeto se existir.
    if (localEl && usuario.cidade && usuario.estado) {
        localEl.textContent = `${usuario.cidade} - ${usuario.estado}`;
    }
    
    if (telefoneEl && usuario.numero) {
        telefoneEl.textContent = usuario.numero; 
    }

    if (fotoEl && usuario.foto_perfil) {
        fotoEl.src = usuario.foto_perfil;
    }
    
    // Botão de Sair da Sidebar
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = '/index.html';
        });
    }
}