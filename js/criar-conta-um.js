// Selecionando os inputs do formulário.
const nomeInput = document.getElementById('Nome-Completo');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmar-senha');

// Selecionando os ícones de olho.
const iconeSenha = document.getElementById('olho-fechado');
const iconeConfirmar = document.getElementById('olho-fechado-confirmar');

// Selecionando o formulário e a caixa de erro. 
const form = document.querySelector('form');
const mensagemErro = document.getElementById('mensagemErro');

//Função para alterar a visibilidade da senha.
function alterarVisibilidade(input, icone) {
    if (input.type === 'password') {
        input.type = 'text';
        icone.src = '../img/olho-aberto.png';
        icone.alt = 'Esconder Senha';
    } else {
        input.type = 'password';
        icone.src = '../img/olho-fechado.png';
        icone.alt = 'Mostrar Senha';
    }
}

// Evento caso os ícones sejam clicados.
iconeSenha.addEventListener('click', () => {
    alterarVisibilidade(senhaInput, iconeSenha);
});

iconeConfirmar.addEventListener('click', () => {
    alterarVisibilidade(confirmarSenhaInput, iconeConfirmar);
});


// Validação para envio do formulário.
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagemErro.style.display = 'none';

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    const confirmarSenha = confirmarSenhaInput.value.trim();

    if (nome === '' || email === '' || senha === '' || confirmarSenha === '') {
        mensagemErro.textContent = 'Por favor Preencha todos os Campos!';
        mensagemErro.style.display = 'block';
        return;
    }

    if (senha !== confirmarSenha) {
        mensagemErro.textContent = 'As Senhas Não são Iguais. Tente Novamente!';
        mensagemErro.style.display = 'block';

        // Apaga o que foi preenchido e coloca o foco no input da senha.
        senhaInput.value = '';
        confirmarSenhaInput.value = '';
        senhaInput.focus();

        return; 
    }

    console.log('Formulário validado! Pronto para Enviar.')

    // Eviando o formulário através do 'fetch'.
    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                nome_completo: nome,
                email: email,
                senha: senha
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Usuário Criado:', data.user);

            // Redirecionando o usuário para a parte dois do cadastro O Email dele é passado pela Url.
            window.location.href = `criar-conta-dois.html?email=${encodeURIComponent(email)}`;

        } else {
            // Email já está cadastrado.
            mensagemErro.textContent = data.mensagem; 
            mensagemErro.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro na Requisição', error);
        mensagemErro.textContent = 'Erro ao Tentar Criar Conta. Verifique sua Conexão';
        mensagemErro.style.display = 'block';
    }

});