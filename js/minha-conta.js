// Inicializa tudo quando o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', () => {   
    carregarDadosUsuario();
    inicializarAbas();
    inicializarBotoesAcao();
    inicializarModalExclusao();
    verificarAbaUrl();
});

// Faz as alterações das Abas do histórico do usuário.
function inicializarAbas() {
    // Conteúdos estáticos para as abas (Agora inclui Minhas Adoções como padrão)
    const conteudos = {
        "Notificações": {
            titulo: "Você não tem novas<br>notificações",
            imagem: "../img/ilustração cachorro correndo.png",
            textoBotao: null, linkBotao: null
        },
        "Minhas Divulgações": {
            titulo: "Você ainda não divulgou<br>nenhum animal",
            imagem: "../img/ilustração gato triste.png",
            textoBotao: "Divulgar um Animal", linkBotao: "../pages/divulgar.html"
        }
    };

    const botoesAba = document.querySelectorAll('.Abas-Navegação button');
    const cardBranco = document.querySelector('.Card-Branco');

    // Ao clicar em uma aba, atualiza o visual e conteúdo do card.
    botoesAba.forEach(botao => {
        botao.addEventListener('click', () => {
            const nomeAba = botao.textContent.trim();

            // 1. Marca a aba ativa visualmente
            botoesAba.forEach(b => b.className = 'Aba-Item');
            botao.className = 'Aba-Item-Ativa';
            
            // 2. Efeito visual de Fade Out (Sumir conteúdo antigo)
            cardBranco.style.opacity = '0';

            setTimeout(() => {
                // SE FOR A ABA DE ADOÇÕES, CARREGA A LISTA DINÂMICA
                if (nomeAba === "Minhas Adoções") {
                    carregarMinhasAdocoes(cardBranco);
                } 
                // SE FOR OUTRA, CARREGA O CONTEÚDO PADRÃO
                else {
                    const dados = conteudos[nomeAba];
                    if (dados) renderizarConteudoPadrao(cardBranco, dados);
                }
                
                cardBranco.style.opacity = '1';
            }, 200);
        });
    });
}

// Função Auxiliar: Monta o HTML do estado vazio (Cachorro Triste/Correndo)
function renderizarConteudoPadrao(container, dados) {
    let htmlBotao = dados.textoBotao 
        ? `<a href="${dados.linkBotao}" class="Btn-Encontrar-Amigo" style="display:inline-block">${dados.textoBotao}</a>` 
        : '';

    container.innerHTML = `
        <div class="Chamada">
            <h3 class="Título">${dados.titulo}</h3>
            <img src="${dados.imagem}" alt="Ilustração" class="Imagem">
            ${htmlBotao}
        </div>
    `;
}

// Verifica se a URL tem um parâmetro ?secao=... e clica na aba correspondente.
function verificarAbaUrl() {
    const params = new URLSearchParams(window.location.search);
    const secao = params.get('secao'); // Ex: 'adocoes', 'divulgacoes'

    if (secao) {
        let nomeAbaParaClicar = "";

        if (secao === 'adocoes') {
            nomeAbaParaClicar = "Minhas Adoções";
        } else if (secao === 'divulgacoes') {
            nomeAbaParaClicar = "Minhas Divulgações";
        } else if (secao === 'notificacoes') {
            nomeAbaParaClicar = "Notificações";
        }
        
        if (nomeAbaParaClicar) {
            const botoes = document.querySelectorAll('.Abas-Navegação button');
            botoes.forEach(botao => {
                if (botao.textContent.trim() === nomeAbaParaClicar) {
                    botao.click();
                }
            });
        }
    }
}

// Carrega os dados do usuário no LocalStorage e preenche a sidebar.
function carregarDadosUsuario() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) {
        window.location.href = '/index.html'; // Chuta para home se não estiver logado
        return;
    }
    const usuario = JSON.parse(usuarioSalvo);
    
    // Elementos da Sidebar
    const nomeEl = document.getElementById('nomeUsuario');
    const localEl = document.getElementById('cidadeEstado');
    const telefoneEl = document.getElementById('telefone');
    const fotoEl = document.querySelector('.Foto-Perfil img');

    // Preenchimento Seguro
    if (nomeEl) nomeEl.textContent = usuario.nome_exibicao || usuario.nome_completo || "Usuário";
    
    if (localEl) {
        if (usuario.cidade && usuario.estado) localEl.textContent = `${usuario.cidade} - ${usuario.estado}`;
        else localEl.textContent = "Localização não informada";
    }
    
    if (telefoneEl) telefoneEl.textContent = usuario.numero || "(XX) XXXXX-XXXX";

    // Lógica da Foto de Perfil
    const caminhoAvatarPadrao = '/img/Perfil.png'; 
    if (fotoEl) {
        fotoEl.src = usuario.foto_perfil || caminhoAvatarPadrao;
        fotoEl.onerror = () => { fotoEl.src = caminhoAvatarPadrao; };
    }

    // Botão Sair
    const btnSair = document.getElementById('btn-sair');
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = '/index.html';
        });
    }
}

// Gerencia a troca entre Sidebar e Formulário de Edição
function inicializarBotoesAcao() {
    const btnMeusDados = document.querySelector('.Btn-Meus-Dados');
    const btnFechar = document.getElementById('btn-cancelar-edicao');
    const btnAcaoPrincipal = document.getElementById('btn-acao-principal');
    const sidebar = document.querySelector('.Perfil'); 
    const secaoNavegacao = document.querySelector('.Retângulo-Navegação'); 
    const secaoFormulario = document.querySelector('.Seção-Meus-Dados'); 

    // Botão "Meus Dados" (Abre o form)
    if (btnMeusDados) {
        btnMeusDados.addEventListener('click', () => {
            if (sidebar) sidebar.classList.add('Escondido');
            if (secaoNavegacao) secaoNavegacao.classList.add('Escondido');
            
            secaoFormulario.style.display = 'flex';
            
            desativarModoEdicao(); // Começa bloqueado
            preencherFormularioComDadosAtuais();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Botão "Fechar" (Volta pra sidebar)
    if (btnFechar) {
        btnFechar.addEventListener('click', (e) => {
            e.preventDefault();
            secaoFormulario.style.display = 'none';
            if (sidebar) sidebar.classList.remove('Escondido');
            if (secaoNavegacao) secaoNavegacao.classList.remove('Escondido');
        });
    }

    // Botão Principal (Editar ou Salvar)
    if (btnAcaoPrincipal) {
        btnAcaoPrincipal.addEventListener('click', (e) => {
            e.preventDefault();
            if (btnAcaoPrincipal.textContent === 'Editar Informações') {
                ativarModoEdicao();
            } else {
                salvarDados();
            }
        });
    }

    // Preview de Imagem no Upload
    const inputFoto = document.getElementById('input-upload-foto');
    const imgPreview = document.getElementById('preview-foto');
    if (inputFoto) {
        inputFoto.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imgPreview.src = e.target.result;
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

// Desbloqueia inputs
function ativarModoEdicao() {
    const form = document.getElementById('editar-perfil');
    const btnAcao = document.getElementById('btn-acao-principal');
    const inputs = form.querySelectorAll('input, select');

    form.classList.add('Modo-Edicao');
    
    inputs.forEach(input => {
        if (!input.classList.contains('Bloqueado-Permanente')) {
            input.disabled = false;
        }
    });
    btnAcao.textContent = 'Salvar Alterações';
}

// Bloqueia inputs
function desativarModoEdicao() {
    const form = document.getElementById('editar-perfil');
    const btnAcao = document.getElementById('btn-acao-principal');
    const inputs = form.querySelectorAll('input, select');

    form.classList.remove('Modo-Edicao');
    inputs.forEach(input => input.disabled = true);
    btnAcao.textContent = 'Editar Informações';
}

// Pega dados do localStorage e joga nos inputs
function preencherFormularioComDadosAtuais() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) return;
    const usuario = JSON.parse(usuarioSalvo);

    document.getElementById('input-nome').value = usuario.nome_completo || usuario.nome_exibicao || "";
    document.getElementById('input-email').value = usuario.email || "";
    document.getElementById('input-telefone').value = usuario.numero || "";
    document.getElementById('input-cep').value = usuario.cep || "";
    document.getElementById('input-cidade').value = usuario.cidade || "";
    document.getElementById('input-estado').value = usuario.estado || "";

    const imgPreview = document.getElementById('preview-foto');
    if (usuario.foto_perfil) imgPreview.src = usuario.foto_perfil;
    else imgPreview.src = '../img/Perfil.png';
}

// Envia atualização para o servidor
async function salvarDados() {
    const btnSalvar = document.getElementById('btn-acao-principal');
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;

    const formData = new FormData();
    // Coleta dados dos inputs
    formData.append('email', document.getElementById('input-email').value);
    formData.append('numero', document.getElementById('input-telefone').value);
    formData.append('cep', document.getElementById('input-cep').value);
    formData.append('cidade', document.getElementById('input-cidade').value);
    formData.append('estado', document.getElementById('input-estado').value);

    // Coleta foto se houver
    const inputFoto = document.getElementById('input-upload-foto');
    if (inputFoto.files[0]) {
        formData.append('foto_perfil', inputFoto.files[0]);
    }

    try {
        const response = await fetch('/completar-perfil', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("Dados atualizados com sucesso!");
            
            // Atualiza LocalStorage
            const usuarioAntigo = JSON.parse(localStorage.getItem('usuarioLogado'));
            const usuarioNovo = { ...usuarioAntigo, ...resultado.user };
            
            // Normaliza barras da foto
            if (resultado.user.foto_perfil) {
                 let foto = resultado.user.foto_perfil.replace(/\\/g, '/');
                 if(!foto.startsWith('/')) foto = '/' + foto;
                 usuarioNovo.foto_perfil = foto;
            }

            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioNovo));
            carregarDadosUsuario(); // Atualiza sidebar
            desativarModoEdicao();
            
        } else {
            alert("Erro ao atualizar: " + resultado.mensagem);
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro de conexão com o servidor.");
    } finally {
        if (btnSalvar.textContent === "Salvando...") {
             btnSalvar.textContent = "Salvar Alterações";
             btnSalvar.disabled = false;
        }
    }
}

// Modal de Exclusão de Conta
function inicializarModalExclusao() {
    const btnAbrir = document.getElementById('btn-abrir-modal-exclusao');
    const btnCancelar = document.getElementById('btn-cancelar-exclusao');
    const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
    const modal = document.getElementById('modal-exclusao');

    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => modal.style.display = 'flex');
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => modal.style.display = 'none');
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async () => {
            const usuarioSalvo = localStorage.getItem('usuarioLogado');
            if (!usuarioSalvo) return;
            const { email } = JSON.parse(usuarioSalvo);

            const textoOriginal = btnConfirmar.textContent;
            btnConfirmar.textContent = "Apagando...";
            btnConfirmar.disabled = true;

            try {
                const response = await fetch('/deletar-conta', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const resultado = await response.json();

                if (response.ok) {
                    alert("Sua conta foi excluída com sucesso.");
                    localStorage.removeItem('usuarioLogado');
                    window.location.href = '/index.html';
                } else {
                    alert("Erro: " + resultado.mensagem);
                    btnConfirmar.textContent = textoOriginal;
                    btnConfirmar.disabled = false;
                }

            } catch (error) {
                console.error("Erro:", error);
                alert("Erro de conexão com o servidor.");
                btnConfirmar.textContent = textoOriginal;
                btnConfirmar.disabled = false;
            }
        });
    }
}


async function carregarMinhasAdocoes(container) {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) return;
    const usuario = JSON.parse(usuarioSalvo);

    container.innerHTML = '<div class="Chamada"><h3 class="Título">Buscando seus pedidos...</h3></div>';

    try {
        // Busca usando o E-mail
        const response = await fetch(`/minhas-solicitacoes?email=${usuario.email}`);
        
        if (!response.ok) throw new Error('Falha ao buscar dados');

        const adocoes = await response.json();

        // Se a lista estiver vazia
        if (adocoes.length === 0) {
            renderizarConteudoPadrao(container, {
                titulo: "Você ainda não adotou<br>nenhum bichinho",
                imagem: "../img/ilustração cachorro triste.png",
                textoBotao: "Encontrar um Amigo", linkBotao: "/pages/quero-adotar.html"
            });
            return;
        }

        // Se tiver dados, monta a lista
        let htmlLista = '<div class="Lista-Adocoes">';
        
        adocoes.forEach(adocao => {
            // 1. Status Colorido
            let classeBadge = "Analise"; 
            let textoBadge = "Em Análise";

            if (adocao.status === 'aprovado') {
                classeBadge = "Aprovado";
                textoBadge = "Aprovado";
            } else if (adocao.status === 'reprovado') {
                classeBadge = "Reprovado";
                textoBadge = "Não Aprovado";
            }

            // 2. Correção da Data (Agora pega o nome certo do banco)
            const dataObj = new Date(adocao.data_solicitacao);
            const dataFormatada = !isNaN(dataObj) 
                ? dataObj.toLocaleDateString('pt-BR') 
                : 'Data desconhecida';

            // 3. Tratamento da Imagem (Para não quebrar)
            let caminhoFoto = adocao.foto_animal;
            
            // Se o caminho não começar com http ou /, adiciona a barra para garantir
            if (caminhoFoto && !caminhoFoto.startsWith('http') && !caminhoFoto.startsWith('/')) {
                caminhoFoto = '/' + caminhoFoto;
            }
            
            // Se vier nulo, coloca um placeholder direto
            if (!caminhoFoto) caminhoFoto = '../img/ilustração cachorro triste.png';

            // Renderiza o Card
            htmlLista += `
                <div class="Item-Adocao">
                    <img src="${caminhoFoto}" 
                         alt="${adocao.nome_animal}" 
                         class="Foto-Animal-Pequena" 
                         onerror="this.onerror=null; this.src='../img/ilustração cachorro triste.png'">
                    
                    <div class="Info-Principal">
                        <h4>${adocao.nome_animal}</h4>
                        <span>Solicitado em: ${dataFormatada}</span>
                    </div>

                    <div class="Badge ${classeBadge}">${textoBadge}</div>

                    <a href="/pages/agradecimento-adocao.html?id=${adocao.animal_id}" class="Btn-Acompanhar">
                        Acompanhar
                    </a>
                </div>
            `;
        });

        htmlLista += '</div>';
        container.innerHTML = htmlLista;

    } catch (erro) {
        console.error(erro);
        container.innerHTML = '<h3 class="Título" style="color:red">Erro ao carregar adoções.</h3>';
    }
}