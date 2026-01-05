// Variáveis Globais da Página.
let itensPorPagina = 7; 
let paginaAtual = 1; 
let filtroAtual = 'todos'; 
let listaAtualDeHistorias = []; 

// ------------------------- INICIALIZAÇÃO ------------------------- //
document.addEventListener('DOMContentLoaded', () => {

    calcularItensPorPagina();

    filtrarHistorias('todos');

    // Ouve o redimensionamento da tela para ajustar a paginação.
    window.addEventListener('resize', () => {
        calcularItensPorPagina();
        
        // Se a mudança de tela reduzir as páginas volta para a página 1.
        const totalPaginas = Math.ceil(listaAtualDeHistorias.length / itensPorPagina);
        if (paginaAtual > totalPaginas && totalPaginas > 0) {
            paginaAtual = 1;
        }
        renderizarPagina();
    });
});

// ------------------------- LÓGICA DOS FILTROS ------------------------- //
function filtrarHistorias(categoria) {
    filtroAtual = categoria;
    paginaAtual = 1; 

    // Atualiza o visual dos botões de filtro.
    document.querySelectorAll('.Btn-Filtro').forEach(btn => {
        btn.classList.remove('ativo');
        const textoBtn = btn.innerText.toLowerCase();
        if (
            (categoria === 'todos' && textoBtn.includes('todos')) ||
            (categoria === 'Cachorro' && textoBtn.includes('cães')) ||
            (categoria === 'Gato' && textoBtn.includes('gatos'))
        ) {
            btn.classList.add('ativo');
        }
    });

    // Filtra os dados da lista original animaisAdotados que vem de dados.js.
    if (categoria === 'todos') {
        listaAtualDeHistorias = animaisAdotados;
    } else {
        listaAtualDeHistorias = animaisAdotados.filter(animal => animal.especie === categoria);
    }

    renderizarPagina();
}

// ------------------------- PAGINAÇÃO RESPONSIVA ------------------------- //
function calcularItensPorPagina() {
    const largura = window.innerWidth;
    
    // Número de Cards de acordo com o tamanho da tela.
    if (largura < 900) {
        itensPorPagina = 7;  // Celular.
    } else if (largura >= 900 && largura < 1400) {
        itensPorPagina = 10; // Tablet / Laptop.
    } else {
        itensPorPagina = 12; // Telas Grandes.
    }
}

function mudarPagina(direcao) {
    paginaAtual += direcao;
    renderizarPagina();
    
    // Rola suavemente para o topo da lista ao mudar de página.
    const topoLista = document.querySelector('.Topo-Pagina'); 
    if (topoLista) {
        topoLista.scrollIntoView({ behavior: 'smooth' });
    }
}
// Busca os elementos de controle.
function atualizarControlesPaginacao() {
    const btnAnt = document.getElementById('btn-ant'); 
    const btnProx = document.getElementById('btn-prox'); 
    const indicador = document.getElementById('indicador-paginacao'); 

    if (!btnAnt || !btnProx || !indicador) return;

    // Calcula o total de páginas.
    const totalPaginas = Math.ceil(listaAtualDeHistorias.length / itensPorPagina);
    
    // Se não tiver itens.
    if (totalPaginas === 0) {
        indicador.innerText = `Página 0 de 0`;
        btnAnt.disabled = true;
        btnProx.disabled = true;
        return;
    }

    // Atualiza texto.
    indicador.innerText = `Página ${paginaAtual} de ${totalPaginas}`;

    // Desativa 'Anterior' na página 1.
    btnAnt.disabled = (paginaAtual === 1);
    
    // Desativa 'Próxima' na última página.
    btnProx.disabled = (paginaAtual === totalPaginas);
}

// ------------------------- GERAR PÁGINA ------------------------- //
function renderizarPagina() {
    const container = document.getElementById('lista-historias');
    container.innerHTML = '';

    // Verifica se a lista está vazia.
    if (listaAtualDeHistorias.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px; font-size:1.2rem; color:#666;">Nenhuma história encontrada nesta categoria.</p>';
        atualizarControlesPaginacao();
        return;
    }

    // Fatia a lista conforme a página atual.
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const historiasDaPagina = listaAtualDeHistorias.slice(inicio, fim);

    // Cria os cards HTML.
    historiasDaPagina.forEach(historia => {
        // Placeholder se a foto estiver vazia
        const img = historia.foto && historia.foto.trim().length > 1 
            ? historia.foto 
            : `https://placehold.co/600x400/orange/white?text=${historia.nome}`;

        // Monta o HTML do card.
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
                        <span class="Tag-Marrom">Adotado em: ${historia.dataAdocao || historia.dataAdoção || 'Data não inf.'}</span>
                    </div>
                </div>
            </article>
        `;
        container.innerHTML += cardHTML;
    });

    atualizarControlesPaginacao();
}