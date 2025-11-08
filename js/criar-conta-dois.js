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


// Envio da foto do Perfil.
const btnSelecionarFoto = document.getElementById('btn-selecionar-foto');
const inputFotoPerfil = document.getElementById('input-foto-perfil');
const imagemPreview = document.getElementById('imagem-preview');

btnSelecionarFoto.addEventListener('click', () => {
    inputFotoPerfil.click();
});

inputFotoPerfil.addEventListener('change', (event) => {
    const arquivo = event.target.files[0];

    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = (e) => {
            imagemPreview.src = e.target.result;

            imagemPreview.style.borderRadius = '50%';
            imagemPreview.style.objectFit = 'cover';
        };

        leitor.readAsDataURL(arquivo);

    }
});


// Busca altomática de cep, usando a API ViaCEP.
const estadosBrasileiros = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas', 'BA': 'Bahia',
    'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo', 'GO': 'Goiás',
    'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul', 'MG': 'Minas Gerais',
    'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná', 'PE': 'Pernambuco', 'PI': 'Piauí',
    'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte', 'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina', 'SP': 'São Paulo',
    'SE': 'Sergipe', 'TO': 'Tocantins'
};

cepInput.addEventListener('input', async (event) => {
    const apenasNumeros = event.target.value.replace(/\D/g, '');

    if (apenasNumeros.length === 8) {
        cepInput.style.cursor = 'wait';
        cidadeInput.placeholder = 'Buscando...';
        estadoInput.placeholder = 'Buscando...';

        try {
            const response = await fetch(`https://viacep.com.br/ws/${apenasNumeros}/json/`);
            const data = await response.json();

            if (!data.erro) {
                cidadeInput.value = data.localidade;
                estadoInput.value = estadosBrasileiros[data.uf] || data.uf;
            } else {
                alert('CEP não Encontrado.')
                cidadeInput.value = '';
                estadoInput.value = '';
            }

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);

        } finally {
            cepInput.style.cursor = 'text';
            cidadeInput.placeholder = 'Ex: Lajedo';
            estadoInput.placeholder = 'Ex: Pernambuco';
        }
    }
});


// Validação do formulário e envio para o servidor.
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    mensagemErro.style.display = 'none';

    // É preciso usar o 'FormData' para enviar arquivos e textos para o servidor.
    const formData = new FormData();

    formData.append('email', emailUsuario);
    formData.append('numero', numeroInput.value.trim());
    formData.append('cep', cepInput.value.trim());
    formData.append('cidade', cidadeInput.value.trim());
    formData.append('estado', estadoInput.value.trim());

    if (inputFotoPerfil.files[0]) {
        formData.append('foto_perfil', inputFotoPerfil.files[0]);
    }

    try {
        const response = await fetch('http://localhost:3000/completar-perfil', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
                console.log('Perfil Atualizado:', data.user);
                alert('Parabéns! Seu Cadastro foi Concluído com Sucesso! Faça o Login.');
                window.location.href = 'entrar.html';
        } else { 
            mensagemErro.textContent = data.mensagem;
            mensagemErro.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        mensagemErro.textContent = 'Erro na Conexão. Tente Novamente mais Tarde.';
        mensagemErro.style.display = 'block';
    }
});