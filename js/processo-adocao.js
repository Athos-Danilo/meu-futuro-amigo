document.addEventListener('DOMContentLoaded', async () => {
    // Verifica se tem alguém logado.
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    
    if (!usuarioLogado) {
        alert("Você precisa estar logado para adotar um amigo!");

        // Salva a url atual para voltar pra cá depois do login.
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = "login.html"; 
        return; 
    }

    // Converte o texto do localStorage de volta para um Objeto JavaScript.
    const usuario = JSON.parse(usuarioLogado);

    // Recebe o ID do animal através da URL.
    const params = new URLSearchParams(window.location.search);
    const idAnimal = params.get('id');

    if (!idAnimal) {
        alert("Erro: Nenhum animal selecionado. Voltando para a busca.");
        window.location.href = "adotar.html";
        return;
    }

    // Carrega os dados do Animal.
    try {
        const response = await fetch(`http://localhost:3000/animais/${idAnimal}`);
        if (!response.ok) throw new Error('Animal não encontrado no banco de dados.');
        
        const animal = await response.json();

        // Ajuste da URL da foto do Animal: Se já começar com "http", usa direto. Se não, adiciona o domínio do servidor.
        const fotoUrl = animal.foto.startsWith('http') ? animal.foto : `http://localhost:3000/${animal.foto}`;

        // Preenche o Card de Resumo.
        document.getElementById('resumo-foto').src = fotoUrl;
        document.getElementById('resumo-nome').innerText = animal.nome;
        document.getElementById('resumo-detalhes').innerText = `${animal.raca} | ${animal.idade}`;
        document.getElementById('resumo-local').innerText = animal.local;

    } catch (error) {
        console.error("Erro ao carregar animal:", error);
        alert("Não conseguimos carregar os dados do animal. Tente novamente.");
    }

    // Preenchimento Automático com os Dados do Usuário logado.
    if (document.getElementById('nome')) document.getElementById('nome').value = usuario.nome_completo || "";
    if (document.getElementById('email')) document.getElementById('email').value = usuario.email || "";

    if (document.getElementById('whatsapp')) {
        document.getElementById('whatsapp').value = mascaraTelefone(usuario.numero) || "";
    }
    
    if (document.getElementById('cidade')) document.getElementById('cidade').value = usuario.cidade || "";
    if (document.getElementById('cep')) document.getElementById('cep').value = usuario.cep || "";

    const inputCpf = document.getElementById('cpf'); 

    if (inputCpf) {
        // Formata enquanto o Usuário Escreve.
        inputCpf.addEventListener('input', (e) => {
            e.target.value = mascaraCPF(e.target.value);
        });

        if (usuario.cpf) {
            // Usuário já tem o CPF salvo no Banco de Dados. O valor é passado pela máscara.
            inputCpf.value = mascaraCPF(usuario.cpf);      
            inputCpf.readOnly = true;          
            inputCpf.style.cursor = "not-allowed";

        } else {
            // Usuário não tem o CPF salvo no Banco de Dados.
            inputCpf.value = "";               
            inputCpf.readOnly = false;
            inputCpf.style.cursor = "text"; 
            inputCpf.placeholder = "000.000.000-00"; 
        }
    }
    
    // Mostra/esconde campo (Casa Alugada vs Própria).
    configurarCamposDinamicos();

    // Fica ouvindo quando o usuário clicar em "Enviar".
    document.getElementById('form-adocao').addEventListener('submit', enviarSolicitacao);
});


// Controle visual dos campos.
function configurarCamposDinamicos() {
    const selectPosse = document.getElementById('posse-imovel');
    const divPermissao = document.getElementById('div-permissao');

    // Estado inicial: Escondido.
    if(divPermissao) divPermissao.style.display = 'none';

    if(selectPosse && divPermissao) {
        selectPosse.addEventListener('change', (e) => {
            if (e.target.value === 'alugado') {
                divPermissao.style.display = 'flex'; 
                divPermissao.style.animation = 'fadeIn 0.5s';
            } else {
                divPermissao.style.display = 'none';
                const radios = document.getElementsByName('permissao-proprietario');
                radios.forEach(r => r.checked = false);
            }
        });
    }
}


// ------ Envio do Formulário ao Servidor ------>
async function enviarSolicitacao(e) {
    e.preventDefault(); 
    
    // Recupera dados necessários novamente.
    const params = new URLSearchParams(window.location.search);
    const idAnimal = params.get('id');
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    const usuario = JSON.parse(usuarioLogado);

    // Captura todos os dados digitados no formulário.
    const formData = new FormData(e.target);
    const dados = Object.fromEntries(formData.entries());
    
    dados.animal_id = idAnimal;     
    dados.usuario_id = usuario.id;  

    try {
        // Botão muda de estado para o usuário não clicar 2 vezes.
        const btnEnviar = document.querySelector('.botao-enviar-grande');
        
        btnEnviar.innerText = "Processando...";
        btnEnviar.disabled = true;
        btnEnviar.style.cursor = "wait"; 

        // Pausa.
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Só depois de 2 segundos ele faz o envio.
        const response = await fetch('http://localhost:3000/solicitacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (response.ok) {
            // Salva o CPF no localStorage.
            if (!usuario.cpf && dados.cpf) {
                usuario.cpf = dados.cpf;
                localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            }

            window.location.href = `agradecimento-adocao.html?id=${idAnimal}`;
        
        } else {
            throw new Error('O servidor retornou um erro ao tentar salvar.');
        }

    } catch (error) {
        console.error("Erro no envio:", error);
        alert("Ocorreu um Erro Técnico. Verifique sua Conexão e Tente Novamente.");
        
        // Restaura o botão em caso de erro.
        const btnEnviar = document.querySelector('.botao-enviar-grande');
        btnEnviar.innerText = "Enviar Solicitação de Adoção";
        btnEnviar.disabled = false;
    }
}

// Formatação do CPF.
function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, '') // Remove tudo o que não é número.
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 3º dígito.
        .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após o 6º dígito.
        .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca traço após o 9º dígito.
        .replace(/(-\d{2})\d+?$/, '$1'); // Impede digitar mais que 11 números.
}

// Formatação Número de Celular.
function mascaraTelefone(valor) {
    if (!valor) return "";
    
    // Remove tudo que não é número para começar limpo.
    valor = valor.replace(/\D/g, ''); 
    
    // Máscara.
    valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2'); 
    valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');    

    return valor;
}