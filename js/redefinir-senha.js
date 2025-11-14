// Pegando o E-mail da Url.
const params = new URLSearchParams(window.location.search);
const emailUsuario = params.get('email');

if (!emailUsuario) {
    alert('Erro: E-mail não encontrado. Voltando ao início.');
    window.location.href = 'entrar.html';
}

// Selecionando os Elementos que vou usar. 
const formCodigo = document.getElementById('form-codigo');
const codigoInput = document.getElementById('codigo-verificacao');
const btnVerificar = document.querySelector('.Botão-Verificar');
const etapaNovaSenha = document.getElementById('etapa-nova-senha');
const formNovaSenha = document.getElementById('form-nova-senha');
const novaSenhaInput = document.getElementById('nova-senha');
const confirmarNovaSenhaInput = document.getElementById('confirmar-nova-senha');
const mensagemFeedback = document.getElementById('mensagemFeedback');
const linkReenviarContainer = document.getElementById('link-reenviar-container');
const iconeNovaSenha = document.getElementById('olho-fechado');
const iconeConfirmarSenha = document.getElementById('olho-fechado-confirmar');

// Verificar código enviado pelo email.
formCodigo.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagemFeedback.style.display = 'none';
    mensagemFeedback.className = 'mensagem-erro'; 

    const tokenDigitado = codigoInput.value.trim();

    if (tokenDigitado.length !== 6) {
        mensagemFeedback.textContent = 'O código deve ter 6 dígitos.';
        mensagemFeedback.style.display = 'block';
        return;
    }

    btnVerificar.disabled = true;
    btnVerificar.textContent = 'Verificando...';

    try {
        const response = await fetch('/verificar-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: emailUsuario, 
                token: tokenDigitado 
            })
        });

        const data = await response.json();

        if (response.ok) {
            mensagemFeedback.textContent = 'Código verificado com sucesso!';
            mensagemFeedback.className = 'mensagem-erro mensagem-sucesso'; // Verde
            mensagemFeedback.style.display = 'block';


            codigoInput.disabled = true;
            btnVerificar.textContent = 'Código Verificado';
            btnVerificar.style.backgroundColor = '#97ce27ff';
            
            if(linkReenviarContainer) linkReenviarContainer.style.display = 'none';

            setTimeout(() => {
                mensagemFeedback.style.display = 'none';
                etapaNovaSenha.style.display = 'block';
                novaSenhaInput.focus();
            }, 1000);

        } else {
            mensagemFeedback.textContent = data.mensagem;
            mensagemFeedback.style.display = 'block';
            btnVerificar.disabled = false;
            btnVerificar.textContent = 'Verificar Código';
        }

    } catch (error) {
        console.error('Erro de rede:', error);
        mensagemFeedback.textContent = 'Erro ao conectar com o servidor.';
        mensagemFeedback.style.display = 'block';
        btnVerificar.disabled = false;
        btnVerificar.textContent = 'Verificar Código';
    }
});


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

// Salvar nova Senha.
formNovaSenha.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagemFeedback.style.display = 'none';
    mensagemFeedback.className = 'mensagem-erro';

    const novaSenha = novaSenhaInput.value.trim();
    const confirmarSenha = confirmarNovaSenhaInput.value.trim();
    const tokenFinal = codigoInput.value.trim(); 


    if (novaSenha.length < 6) {
        mensagemFeedback.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        mensagemFeedback.style.display = 'block';
        return;
    }

    if (novaSenha !== confirmarSenha) {
        mensagemFeedback.textContent = 'As senhas não coincidem.';
        mensagemFeedback.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('/redefinir-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: emailUsuario, 
                token: tokenFinal, 
                novaSenha: novaSenha 
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Sua senha foi redefinida com sucesso! Agora você pode fazer login.');
            window.location.href = 'entrar.html';

        } else {
            mensagemFeedback.textContent = data.mensagem;
            mensagemFeedback.style.display = 'block';

        }

    } catch (error) {
        console.error('Erro de rede:', error);
        mensagemFeedback.textContent = 'Erro ao tentar salvar a senha.';
        mensagemFeedback.style.display = 'block';
    }
});


// Ícones do olho.
iconeNovaSenha.addEventListener('click', () => {
    alterarVisibilidade(novaSenhaInput, iconeNovaSenha);
});

iconeConfirmarSenha.addEventListener('click', () => {
    alterarVisibilidade(confirmarNovaSenhaInput, iconeConfirmarSenha);
});


// Reenviar o Código.
const btnReenviar = document.getElementById('btn-reenviar');

if (btnReenviar) {
    btnReenviar.addEventListener('click', async (e) => {
        e.preventDefault();
        

        const textoOriginal = btnReenviar.textContent;
        btnReenviar.textContent = 'Enviando...';
        btnReenviar.style.pointerEvents = 'none'; 

        try {
            await fetch('/esqueci-senha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailUsuario })
            });
            
            alert('Um novo código foi enviado para seu e-mail!');

        } catch (error) {
            console.error('Erro ao reenviar:', error);
            alert('Erro ao tentar reenviar. Tente mais tarde.');
        } finally {
            btnReenviar.textContent = textoOriginal;
            btnReenviar.style.pointerEvents = 'auto';
        }
    });
}