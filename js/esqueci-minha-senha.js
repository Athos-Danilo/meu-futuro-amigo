// Selecionando os Elementos.
const form = document.querySelector('form');
const emailInput = document.getElementById('email-cadastrado');
const mensagemErro = document.getElementById('mensagemErro');
const botaoSubmit = document.querySelector('.Botão-Enviar-Código');

// Verificar o Formulário.
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagemErro.style.display = 'none';

    const email = emailInput.value.trim();

    if (email === '') {
        mensagemErro.textContent = 'Por favor, digite seu E-mail.';
        mensagemErro.style.display = 'block';
        return; 
    }

    botaoSubmit.disabled = true;
    botaoSubmit.textContent = 'Enviando...';

    // Fazer o fetch para o back-end.
    try {
    const response = await fetch('http://localhost:3000/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });

    const data = await response.json();

    console.log('Resposta do servidor:', data.mensagem);
    
    alert('Código enviado! Verifique seu e-mail e digite o código.');
    window.location.href = `redefinir-senha.html?email=${encodeURIComponent(email)}`;


    } catch (error) {
        console.error('Erro de rede:', error);
        mensagemErro.textContent = 'Erro de conexão. Tente mais tarde.';
        mensagemErro.style.display = 'block';
        
        botaoSubmit.disabled = false;
        botaoSubmit.textContent = 'Enviar Código';
    }
});
