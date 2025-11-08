// Lê a url para pegar o email que foi passado por ela.
const params = new URLSearchParams(window.location.search);
const emailUsuario = params.get('email');

// Se não tiver um email na url o usuário e redirecionado para a tela anterior.
if (!emailUsuario) {
    alert('Erro de Segurança: Nenhum E-mail identificado. Voltando para o Início.');
    window.location.href = 'criar-conta-um.html';
} else {
    console.log('Completando perfil para o Usuário', emailUsuario);
}


// Selecionando elementos.
const form = document.querySelector('form');
const numeroInput = document.getElementById('número-celular');
const cepInput = document.getElementById('número-cep');
const cidadeInput = document.getElementById('cidade');
const estadoInput = document.getElementById('estado');
const mensagemErro = document.getElementById('mensagemErro');


// Validação do formulário e envio para o servidor.
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagemErro.style.display = 'none';

    const numero = numeroInput.value.trim();
    const cep = cepInput.value.trim();
    const cidade = cidadeInput.value.trim();
    const estado = estadoInput.value.trim();

    if (!numero || !cep || !cidade || !estado) {
        mensagemErro.textContent = 'Por favor, preencha todos os campos para continuar.';
        mensagemErro.style.display = 'block';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/completar-perfil', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: emailUsuario,
                numero: numero,
                cep: cep,
                cidade: cidade,
                estado: estado
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Perfil Atualizado:', data.user);
            alert('Parabéns! Seu Cadastro foi Concluído com Sucesso!');
            
            window.location.href = 'index.html';

        } else { 
            mensagemErro.textContent = data.mensagem || 'Erro ao Atualizar Perfil.';
            mensagemErro.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        mensagemErro.textContent = 'Erro na Conexão. Tente Novamente mais Tarde.';
        mensagemErro.style.display = 'block';
    }
});