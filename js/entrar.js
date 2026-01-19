// Selecionando os dados que iremos precisar, o ícone do olho e a senha do usuário, através do id deles no html. 
const senhaIcone = document.getElementById('olho-fechado');
const inputSenha = document.getElementById('senha');

// Função para verificar se o ícone do olho está ativo.
// Se acontecer um evento de click no ícone, será feito a troca do ícone e irá mostrar a senha que o usuário digitou.  
senhaIcone.addEventListener('click', () => {
    if (inputSenha.type === 'password') {
        inputSenha.type = 'text';
        senhaIcone.src = '../img/olho-aberto.png';
        senhaIcone.alt = 'Esconder Senha';
    } else {
        inputSenha.type = 'password';
        senhaIcone.src = '../img/olho-fechado.png';
        senhaIcone.alt = 'Mostrar Senha';
    }
});


// Validação do e-mail e senha do usuário. Selecionando os dados que iremos trabalhar, toda a tag 'form', o e-mail e por fim a mensagem de erro. 
// Vamos usar a senha, mas não precisamos pegar ela novamente, pois a variável 'inputSenha' já foi criada.
const form = document.querySelector('form');
const inputEmail = document.getElementById('email');
const mensagemErro = document.getElementById('mensagemErro');

// Função que será executada quando o usuário enviar o formulário.
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

    // Envia os dados de login (email/senha) em formato JSON para o servidor e aguarda a resposta.
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        // Converte a resposta, que é um texto JSON do servidor, em um objeto JavaScript.
        const data = await response.json();

        // Verifica se a resposta do servidor foi um sucesso ou um erro.
        if (response.ok) {
            console.log('Sucesso!', data.mensagem);

            // Salvando os dados do usuário no navegador para ser usado posteriormente se necessário.
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));

            window.location.href = '../index.html'
            
        } else {
            console.log('Erro do servidor', data.mensagem);
            mensagemErro.textContent = data.mensagem;
            mensagemErro.style.display = 'block';
        }

    // Se o 'fetch' falhar, captura o erro e exibe no console.
    }catch (error) {
        console.error('Erro de rede:', error);
        mensagemErro.innerHTML = 'Não foi possível conectar ao servidor. <br> Tente mais tarde.';
        mensagemErro.style.display = 'block';
    }
});