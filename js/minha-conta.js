// Carrega os dados do usuário assim que a tela abre
// Inicia a lógica de troca de abas
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosUsuario();
    inicializarAbas();
    inicializarBotoesAcao();
});

// Lógica das Abas.
function inicializarAbas() {
    const conteudos = {
        "Notificações": {
            titulo: "Não há Notificações",
            imagem: "../img/ilustração cachorro correndo.png", 
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

/* =================================================================
   PARTE 3: ALTERNAR ENTRE DASHBOARD, LEITURA E EDIÇÃO
   ================================================================= */
function inicializarBotoesAcao() {
    const btnMeusDados = document.querySelector('.Btn-Meus-Dados');
    const btnFechar = document.getElementById('btn-cancelar-edicao');
    const btnAcaoPrincipal = document.getElementById('btn-acao-principal'); // O botão Editar/Salvar
    
    const secaoNavegacao = document.querySelector('.Retângulo-Navegação');
    const secaoFormulario = document.querySelector('.Seção-Meus-Dados');
    const form = document.getElementById('form-editar-perfil');

    // 1. ABRIR EM MODO LEITURA
    if (btnMeusDados) {
        btnMeusDados.addEventListener('click', () => {
            secaoNavegacao.style.display = 'none';
            secaoFormulario.style.display = 'block';
            
            // Reseta para modo leitura sempre que abrir
            desativarModoEdicao(); 
            preencherFormularioComDadosAtuais();
        });
    }

    // 2. FECHAR
    if (btnFechar) {
        btnFechar.addEventListener('click', (e) => {
            e.preventDefault();
            secaoFormulario.style.display = 'none';
            secaoNavegacao.style.display = 'flex';
        });
    }

    // 3. LÓGICA DO BOTÃO PRINCIPAL (EDITAR vs SALVAR)
    if (btnAcaoPrincipal) {
        btnAcaoPrincipal.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Se o botão diz "Editar Informações"...
            if (btnAcaoPrincipal.textContent === 'Editar Informações') {
                ativarModoEdicao();
            } 
            // Se o botão diz "Salvar Alterações"...
            else {
                // Dispara o evento de submit do form manualmente
                salvarDados(); 
            }
        });
    }

    // 4. LÓGICA DO PREVIEW DA FOTO
    const inputFoto = document.getElementById('input-upload-foto');
    const imgPreview = document.getElementById('preview-foto');

    if (inputFoto) {
        inputFoto.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imgPreview.src = e.target.result; // Atualiza a imagem na hora
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

// --- FUNÇÕES AUXILIARES DE ESTADO ---

function ativarModoEdicao() {
    const form = document.getElementById('form-editar-perfil');
    const btnAcao = document.getElementById('btn-acao-principal');
    const inputs = form.querySelectorAll('input, select');

    form.classList.add('Modo-Edicao'); // Ativa o CSS especial

    // Libera os inputs (menos os permanentemente bloqueados)
    inputs.forEach(input => {
        if (!input.classList.contains('Bloqueado-Permanente')) {
            input.disabled = false;
        }
    });

    btnAcao.textContent = 'Salvar Alterações';
    btnAcao.classList.add('Modo-Salvar'); // Se quiser estilizar diferente
}

function desativarModoEdicao() {
    const form = document.getElementById('form-editar-perfil');
    const btnAcao = document.getElementById('btn-acao-principal');
    const inputs = form.querySelectorAll('input, select');

    form.classList.remove('Modo-Edicao');

    // Bloqueia tudo
    inputs.forEach(input => input.disabled = true);

    btnAcao.textContent = 'Editar Informações';
}

// --- PREENCHIMENTO ---

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

    // Preenche o Preview com a foto atual
    const imgPreview = document.getElementById('preview-foto');
    if (usuario.foto_perfil) {
        imgPreview.src = usuario.foto_perfil;
    } else {
        imgPreview.src = '../img/Perfil.png';
    }
}

/* =================================================================
   PARTE 4: SALVAR DADOS (AGORA COM FOTO!)
   ================================================================= */
async function salvarDados() {
    const btnSalvar = document.getElementById('btn-acao-principal');
    const textoOriginal = btnSalvar.textContent;
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;

    // Usamos FormData porque agora tem envio de arquivo (foto)
    const formData = new FormData();
    formData.append('email', document.getElementById('input-email').value); // Identificador
    formData.append('numero', document.getElementById('input-telefone').value);
    formData.append('cep', document.getElementById('input-cep').value);
    formData.append('cidade', document.getElementById('input-cidade').value);
    formData.append('estado', document.getElementById('input-estado').value);

    // Se o usuário selecionou uma nova foto, anexa ela
    const inputFoto = document.getElementById('input-upload-foto');
    if (inputFoto.files[0]) {
        formData.append('foto_perfil', inputFoto.files[0]);
    }

    try {
        // Envia para o servidor (Multer vai processar o FormData)
        const response = await fetch('http://localhost:3000/completar-perfil', {
            method: 'POST',
            body: formData // Não precisa de Content-Type header com FormData
        });

        const resultado = await response.json();

        if (response.ok) {
            alert("Dados atualizados com sucesso!");
            
            // Atualiza localStorage
            const usuarioAntigo = JSON.parse(localStorage.getItem('usuarioLogado'));
            // Atualiza com os dados novos que vieram do servidor
            const usuarioNovo = { ...usuarioAntigo, ...resultado.user };
            
            // Garante que o caminho da foto esteja correto (barras) se veio novo
            if (resultado.user.foto_perfil) {
                 usuarioNovo.foto_perfil = resultado.user.foto_perfil.replace(/\\/g, '/');
                 if(!usuarioNovo.foto_perfil.startsWith('/')) usuarioNovo.foto_perfil = '/' + usuarioNovo.foto_perfil;
            }

            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioNovo));

            // Atualiza a tela
            carregarDadosUsuario(); 
            desativarModoEdicao(); // Volta para modo leitura
            
        } else {
            alert("Erro ao atualizar: " + resultado.mensagem);
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor.");
    } finally {
        // Se deu erro ou sucesso, restaura o botão se ainda estivermos no modo edição
        if (btnSalvar.textContent === "Salvando...") {
             btnSalvar.textContent = "Salvar Alterações";
             btnSalvar.disabled = false;
        }
    }
}