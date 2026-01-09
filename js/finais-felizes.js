// Variáveis Globais da Página
let itensPorPagina = 7; 
let paginaAtual = 1; 
let filtroAtual = 'todos'; 

// Esta lista guardará todos os dados que vierem do Banco de Dados
let todosOsAnimais = []; 
// Esta lista será a versão filtrada (só cachorros, só gatos ou todos) mostrada na tela
let listaAtualDeHistorias = []; 

// ------------------------- INICIALIZAÇÃO ------------------------- //
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Primeiro calculamos quantos cards cabem na tela
    calcularItensPorPagina();

    // 2. Buscamos os dados reais no Backend
    buscarHistoriasDoBanco();

    // Ouve o redimensionamento da tela para ajustar a paginação
    window.addEventListener('resize', () => {
        calcularItensPorPagina();
        
        const totalPaginas = Math.ceil(listaAtualDeHistorias.length / itensPorPagina);
        if (paginaAtual > totalPaginas && totalPaginas > 0) {
            paginaAtual = 1;
        }
        renderizarPagina();
    });
});

// ------------------------- CONEXÃO COM O BANCO ------------------------- //
async function buscarHistoriasDoBanco() {
    const container = document.getElementById('lista-historias');
    
    try {
        // Busca na nossa API apenas os adotados, ordenados por data
        const response = await fetch('http://localhost:3000/animais?status=adotado');
        const dadosBanco = await response.json();

        // Mapeamos os dados do banco para o formato que seu layout já usa
        todosOsAnimais = dadosBanco.map(animal => {
            
            // Corrige caminho da foto
            let urlFoto = animal.foto;
            if (urlFoto && !urlFoto.startsWith('http')) {
                urlFoto = `http://localhost:3000/${animal.foto}`;
            }

            // Formata a data (AAAA-MM-DD para DD/MM/AAAA)
            let dataFormatada = 'Data não inf.';
            if (animal.data_adocao) {
                const dataObj = new Date(animal.data_adocao);
                dataFormatada = dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            }

            return {
                nome: animal.nome,
                foto: urlFoto,
                titulo: animal.frase_efeito || "Final Feliz!", 
                mensagem: animal.depoimento,
                raca: animal.raca || 'SRD',
                sexo: animal.sexo,
                idade: animal.idade,
                cidade: animal.local,
                dataAdocao: dataFormatada,
                especie: animal.especie // Importante para o filtro
            };
        });

        // Inicializa mostrando todos
        filtrarHistorias('todos');

    } catch (error) {
        console.error("Erro ao buscar histórias:", error);
        if(container) container.innerHTML = '<p style="text-align:center; padding:20px;">Erro ao carregar histórias do servidor.</p>';
    }
}

// ------------------------- LÓGICA DOS FILTROS ------------------------- //
function filtrarHistorias(categoria) {
    filtroAtual = categoria;
    paginaAtual = 1; 

    // Atualiza o visual dos botões
    document.querySelectorAll('.Btn-Filtro').forEach(btn => {
        btn.classList.remove('ativo');
        const textoBtn = btn.innerText.toLowerCase();
        
        // Lógica para marcar o botão certo
        if (
            (categoria === 'todos' && textoBtn.includes('todos')) ||
            (categoria === 'Cachorro' && textoBtn.includes('cães')) ||
            (categoria === 'Gato' && textoBtn.includes('gatos'))
        ) {
            btn.classList.add('ativo');
        }
    });

    // Filtra a lista GLOBAL (todosOsAnimais) vinda do banco
    if (categoria === 'todos') {
        listaAtualDeHistorias = todosOsAnimais;
    } else {
        listaAtualDeHistorias = todosOsAnimais.filter(animal => animal.especie === categoria);
    }

    renderizarPagina();
}

// ------------------------- PAGINAÇÃO RESPONSIVA ------------------------- //
function calcularItensPorPagina() {
    const largura = window.innerWidth;
    
    if (largura < 900) {
        itensPorPagina = 5;  // Celular (reduzi um pouco para não ficar infinito)
    } else if (largura >= 900 && largura < 1400) {
        itensPorPagina = 8; // Tablet
    } else {
        itensPorPagina = 12; // Telas Grandes
    }
}

function mudarPagina(direcao) {
    paginaAtual += direcao;
    renderizarPagina();
    
    const topoLista = document.querySelector('.Topo-Pagina'); 
    if (topoLista) {
        topoLista.scrollIntoView({ behavior: 'smooth' });
    }
}

function atualizarControlesPaginacao() {
    const btnAnt = document.getElementById('btn-ant'); 
    const btnProx = document.getElementById('btn-prox'); 
    const indicador = document.getElementById('indicador-paginacao'); 

    if (!btnAnt || !btnProx || !indicador) return;

    const totalPaginas = Math.ceil(listaAtualDeHistorias.length / itensPorPagina);
    
    if (totalPaginas === 0) {
        indicador.innerText = `0 de 0`;
        btnAnt.disabled = true;
        btnProx.disabled = true;
        return;
    }

    indicador.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
    btnAnt.disabled = (paginaAtual === 1);
    btnProx.disabled = (paginaAtual === totalPaginas);
}

// ------------------------- GERAR PÁGINA (RENDER) ------------------------- //
function renderizarPagina() {
    const container = document.getElementById('lista-historias');
    if(!container) return;
    
    container.innerHTML = '';

    if (listaAtualDeHistorias.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; font-size:1.2rem; color:#666;">Ainda não temos histórias nesta categoria. Em breve!</p>';
        atualizarControlesPaginacao();
        return;
    }

    // Fatia a lista conforme a página atual
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const historiasDaPagina = listaAtualDeHistorias.slice(inicio, fim);

    // Cria os cards HTML
    historiasDaPagina.forEach(historia => {
        // Placeholder caso a foto falhe
        const img = historia.foto || `https://placehold.co/600x400/orange/white?text=${historia.nome}`;

        const cardHTML = `
            <article class="Card-Historia">
                <div class="Foto-Wrapper">
                    <img src="${img}" alt="${historia.nome}" class="Foto-Pet">
                </div>
                <div class="Conteudo-Card">
                    <div class="Cabecalho-Card">
                        <h3>${historia.nome}</h3>
                        <p class="Frase-Efeito">${historia.titulo}</p>
                    </div>
                    
                    <p class="Texto-Depoimento">"${historia.mensagem}"</p>

                    <div class="Tags-Container">
                        <span class="Tag-Marrom">${historia.raca}</span>
                        <span class="Tag-Marrom">${historia.sexo}</span>
                        <span class="Tag-Marrom">${historia.idade}</span>
                        <span class="Tag-Marrom">${historia.cidade}</span>
                        <span class="Tag-Marrom">Adotado em: ${historia.dataAdocao}</span>
                    </div>
                </div>
            </article>
        `;
        container.innerHTML += cardHTML;
    });

    atualizarControlesPaginacao();
}