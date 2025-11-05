// Selecionando os dados que iremos precisar, o ícone do olho e a senha do usuário.
const senhaIcone = document.getElementById('olho-fechado');
const inputSenha = document.getElementById('senha');


// Função para verificar se o ícone do olho está ativo.
senhaIcone.addEventListener('click', () => {
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        senhaIcone.src = 'img/olho-aberto.png';
        senhaIcone.alt = 'Esconder Senha';
    } else {
        inputSenha.type = 'password';
        senhaIcone.src = 'img/olho-fechado.png';
        senhaIcone.alt = 'Mostrar Senha';
    }
});


// Validação do e-mail e senha do usuário. Selecionando os dados que iremos trabalhar, toda a tag 'form', o e-mail e por fim a mensagem de erro. 
// Vamos usar a senha, mas não precisamos pegar ela novamente.
const form = document.querySelector('form');
const inputEmail = document.getElementById('email');
const mensagemErro = document.getElementById('mensagemErro');

form.addEventListener('submit', async (Event) => {
    Event.preventDefault();
    mensagemErro.style.display = 'none';

    const email = inputEmail.value.trim();
    const senha = inputSenha.value.trim();
    
    if (email === '' || senha === '') {
        mensagemErro.textContent = "Por favor, preencha todos os campos!";
        mensagemErro.style.display = 'block';
        return;
    } 

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Sucesso!', data.mensagem);
            alert('Login (simulado) com sucesso!');
        } else {
            console.log('Erro do servidor', data.mensagem);
            mensagemErro.textContent = data.mensagem;
            mensagemErro.style.display = 'block';
        }

    }catch (error) {
        console.error('Erro de rede:', error);
        mensagemErro.textContent = 'Não foi possível conectar ao servidor. Tente mais tarde.';
        mensagemErro.style.display = 'block';
    }
});