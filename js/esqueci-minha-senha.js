// Selecionando os Elementos.
const form = document.querySelector('form');
const emailInput = document.getElementById('email-cadastrado');
const mensagemErro = document.getElementById('mensagemErro');
const botaoSubmit = document.querySelector('.Botão-Enviar-Código');

// Verificar o Formulário.
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagemErro.style.display = 'none';

    // Pega o valor do input e remove espaços desnecessários.
    const email = emailInput.value.trim();

    if (email === '') {
        mensagemErro.textContent = 'Por favor, digite seu E-mail.';
        mensagemErro.style.display = 'block';
        return; 
    }

    // Modificando o conteúdo do botão 'enviar código'.
    botaoSubmit.disabled = true;
    botaoSubmit.textContent = 'Enviando...';

    // Fazer o fetch para o back-end enviando o e-mail em JSON.
    try {
    const response = await fetch('/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });

    // Converte a resposta JSON do servidor para objeto.
    const data = await response.json();

    console.log('Resposta do servidor:', data.mensagem);
    
    // Sucesso: notifica o usuário e redireciona para a página de redefinição,
    alert('Código enviado! Verifique seu e-mail e digite o código.');
    window.location.href = `redefinir-senha.html?email=${encodeURIComponent(email)}`;


    } catch (error) {
        // Em caso de erro de rede ou exceção, mostra mensagem e reativa o botão.
        console.error('Erro de rede:', error);
        mensagemErro.textContent = 'Erro de conexão. Tente mais tarde.';
        mensagemErro.style.display = 'block';
        
        botaoSubmit.disabled = false;
        botaoSubmit.textContent = 'Enviar Código';
    }
});
