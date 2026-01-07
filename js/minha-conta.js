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
    const conteudos = {
        "Notificações": {
            titulo: "Você não tem novas<br>notificações",
            imagem: "../img/ilustração cachorro correndo.png",
            textoBotao: null, linkBotao: null
        },
        "Minhas Adoções": {
            titulo: "Você ainda não adotou<br>nenhum bichinho",
            imagem: "../img/ilustração cachorro triste.png",
            textoBotao: "Encontrar um Amigo", linkBotao: "/pages/adotar.html"
        },
        "Minhas Divulgações": {
            titulo: "Você ainda não divulgou<br>nenhum animal",
            imagem: "../img/ilustração gato triste.png",
            textoBotao: "Divulgar um Animal", linkBotao: "/pages/como-ajudar.html"
        }
    };

    const botoesAba = document.querySelectorAll('.Abas-Navegação button');
    const tituloEl = document.querySelector('.Chamada .Título');
    const imagemEl = document.querySelector('.Chamada .Imagem');
    const botaoEl = document.querySelector('.Chamada a');

    // Ao clicar em uma aba, atualiza o visual e conteúdo do card.
    botoesAba.forEach(botao => {
        botao.addEventListener('click', () => {
            const nomeAba = botao.textContent.trim();
            const dados = conteudos[nomeAba];

            if (dados) {
                // Marca a aba ativa.
                botoesAba.forEach(b => b.className = 'Aba-Item');
                botao.className = 'Aba-Item-Ativa';
                
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

// Verifica se a URL tem um parâmetro ?secao=... e clica na aba correspondente.
function verificarAbaUrl() {
    const params = new URLSearchParams(window.location.search);
    const secao = params.get('secao'); // Pega o valor de 'secao' (ex: 'adocoes')

    if (secao) {
        let nomeAbaParaClicar = "";

        // Mapeia o código da URL para o Nome da Aba (exatamente como está no HTML/Array)
        if (secao === 'adocoes') {
            nomeAbaParaClicar = "Minhas Adoções";
        } else if (secao === 'divulgacoes') {
            nomeAbaParaClicar = "Minhas Divulgações";
        } 
        else if (secao === 'notificacoes') {
            nomeAbaParaClicar = "Notificações";
        }

        // Se encontrou um mapeamento, busca o botão e clica
        if (nomeAbaParaClicar) {
            const botoes = document.querySelectorAll('.Abas-Navegação button');
            
            botoes.forEach(botao => {
                if (botao.textContent.trim() === nomeAbaParaClicar) {
                    botao.click(); // Simula o clique do usuário
                }
            });
        }
    }
}

// Carrega os dados do usuário no LocalStorage e faz o preenchimento com as informações dele.
function carregarDadosUsuario() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) {
        window.location.href = '/index.html';
        return;
    }
    const usuario = JSON.parse(usuarioSalvo);
    const nomeEl = document.getElementById('nomeUsuario');
    const localEl = document.getElementById('cidadeEstado');
    const telefoneEl = document.getElementById('telefone');
    const fotoEl = document.querySelector('.Foto-Perfil img');

    if (nomeEl) nomeEl.textContent = usuario.nome_exibicao || usuario.nome_completo || "Usuário";
    
    if (localEl) {
        if (usuario.cidade && usuario.estado) localEl.textContent = `${usuario.cidade} - ${usuario.estado}`;
        else localEl.textContent = "Localização não informada";
    }
    
    if (telefoneEl) telefoneEl.textContent = usuario.numero || "(XX) XXXXX-XXXX";

    if (fotoEl && usuario.foto_perfil) fotoEl.src = usuario.foto_perfil;

    const btnSair = document.getElementById('btn-sair');

    // Remove usuário do localStorage e redireciona para a tela inicial.
    if (btnSair) {
        btnSair.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('usuarioLogado');
            window.location.href = '/index.html';
        });
    }
}

// Modo de edição dos dados do usuário.
function inicializarBotoesAcao() {
    const btnMeusDados = document.querySelector('.Btn-Meus-Dados');
    const btnFechar = document.getElementById('btn-cancelar-edicao');
    const btnAcaoPrincipal = document.getElementById('btn-acao-principal');
    const sidebar = document.querySelector('.Perfil'); 
    const secaoNavegacao = document.querySelector('.Retângulo-Navegação'); 
    const secaoFormulario = document.querySelector('.Seção-Meus-Dados'); 

    // Esconde a sidbar e o card do perfil.
    if (btnMeusDados) {
        btnMeusDados.addEventListener('click', () => {
            if (sidebar) sidebar.classList.add('Escondido');
            if (secaoNavegacao) secaoNavegacao.classList.add('Escondido');
            
            secaoFormulario.style.display = 'flex';
            
            desativarModoEdicao();
            preencherFormularioComDadosAtuais();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Volta para o início da página meus dados. 
    if (btnFechar) {
        btnFechar.addEventListener('click', (e) => {
            e.preventDefault();
            secaoFormulario.style.display = 'none';
            if (sidebar) sidebar.classList.remove('Escondido');
            if (secaoNavegacao) secaoNavegacao.classList.remove('Escondido');
        });
    }

    // Ativa a edição das informações do usuário, e salva as alterações.
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

    // Mostrar imagem selecionada antes do upload.
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

// Libera o usuário a preencher ou alterar suas infomações.
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

// Sai do modo de edição.
function desativarModoEdicao() {
    const form = document.getElementById('editar-perfil');
    const btnAcao = document.getElementById('btn-acao-principal');
    const inputs = form.querySelectorAll('input, select');

    form.classList.remove('Modo-Edicao');
    inputs.forEach(input => input.disabled = true);
    btnAcao.textContent = 'Editar Informações';
}

//Preenche o formulário com os dados do usuário armazenados em localStorage.
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

// Envia os dados do formulário para o servidor.
async function salvarDados() {
    const btnSalvar = document.getElementById('btn-acao-principal');
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;

    const formData = new FormData();
    const email = document.getElementById('input-email').value;
    const numero = document.getElementById('input-telefone').value;
    const cep = document.getElementById('input-cep').value;
    const cidade = document.getElementById('input-cidade').value;
    const estado = document.getElementById('input-estado').value;

    formData.append('email', email);
    formData.append('numero', numero);
    formData.append('cep', cep);
    formData.append('cidade', cidade);
    formData.append('estado', estado);

    const inputFoto = document.getElementById('input-upload-foto');
    if (inputFoto.files[0]) {
        formData.append('foto_perfil', inputFoto.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/completar-perfil', {
            method: 'POST',
            body: formData
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("Dados atualizados com sucesso!");
            
            const usuarioAntigo = JSON.parse(localStorage.getItem('usuarioLogado'));
            const usuarioNovo = { ...usuarioAntigo, ...resultado.user };
            
            // Ajusta caminho da foto para funcionar no cliente (normaliza barras)
            if (resultado.user.foto_perfil) {
                 let foto = resultado.user.foto_perfil.replace(/\\/g, '/');
                 if(!foto.startsWith('/')) foto = '/' + foto;
                 usuarioNovo.foto_perfil = foto;
            }

            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioNovo));
            carregarDadosUsuario(); 
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

// Inicializa o modal e todo o processo de exclusão da conta.
function inicializarModalExclusao() {
    const btnAbrir = document.getElementById('btn-abrir-modal-exclusao');
    const btnCancelar = document.getElementById('btn-cancelar-exclusao');
    const btnConfirmar = document.getElementById('btn-confirmar-exclusao'); // O botão vermelho
    const modal = document.getElementById('modal-exclusao');

    // Abrir Modal.
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Fechar Modal.
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Fechar Clicando Fora da área.
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Excluir conta.
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', async () => {
            const usuarioSalvo = localStorage.getItem('usuarioLogado');
            if (!usuarioSalvo) return;
            const { email } = JSON.parse(usuarioSalvo);

            const textoOriginal = btnConfirmar.textContent;
            btnConfirmar.textContent = "Apagando...";
            btnConfirmar.disabled = true;

            try {
                const response = await fetch('http://localhost:3000/deletar-conta', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const resultado = await response.json();

                if (response.ok) {
                    alert("Sua conta foi excluída com sucesso. Esperamos te ver de volta um dia!");
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