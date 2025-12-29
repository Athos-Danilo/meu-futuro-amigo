// Variáveis Globais da Página.
let paginaAtual = 1;
let itensPorPagina = 10; 
let listaAtualDeAnimais = []; 

// Variáveis da Galeria.
let fotosAtuais = []; 
let indiceFotoAtual = 0;
let intervaloGaleria = null; 


// --- FUNÇÕES UTILITÁRIAS: Responsividade, Manipulação de DOM, Formatação de Dados e Geração de HTML ---

// Função que calcula a quantidade de cards de acordo com o tamanho da tela do usuário. 
function calcularItensPorPagina() {
    const largura = window.innerWidth;
    if (largura < 900) {
        itensPorPagina = 10;
    } else if (largura >= 900 && largura < 1400) {
        itensPorPagina = 18;
    } else {
        itensPorPagina = 24;
    }
}

window.addEventListener('resize', () => {
    calcularItensPorPagina();
    const totalPaginas = Math.ceil(listaAtualDeAnimais.length / itensPorPagina);
    if (paginaAtual > totalPaginas && totalPaginas > 0) {
        paginaAtual = 1;
    }
    renderizarPagina();
});

// Função que abre ou fecha o menu dos filtros.
function toggleFiltros() {
    const container = document.getElementById('filtros-container');
    container.classList.toggle('aberto');
    document.body.style.overflow = container.classList.contains('aberto') ? 'hidden' : 'auto';
}

// Função que preenche automaticamente os selects do HTML usando o arquivo "dados.js".  
function preencherSelect(selectId, lista) {
    const select = document.getElementById(selectId);
    if (!select) return; 
    lista.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
    });
}

// Função que converte a data do banco de dados para o formato brasileiro, e caso não seja informado, define como "Recém-chegado".
function formatarData(dataISO) {
    if (!dataISO) return "Recém-chegado";
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR'); 
}

// Função que mostra a quantidade de pessoas que aplicaram para adotar um animal. 
function gerarStatusHTML(interessados) {
    const p = interessados === 1 ? 'pessoa' : 'pessoas';
    return `Atenção: Há ${interessados} ${p} na fila de interesse.`;
}

// Função que mostra os status de saúde de um animal. 
function gerarSaudeHTML(saude) {
    if (!saude) return '';
    return `
        <div class="saude-container">
            <div class="item-saude ${saude.vacinado ? 'ativo' : ''}" title="Vacinado"><span>💉</span> Vacinado</div>
            <div class="item-saude ${saude.castrado ? 'ativo' : ''}" title="Castrado"><span>✂️</span> Castrado</div>
            <div class="item-saude ${saude.vermifugado ? 'ativo' : ''}" title="Vermifugado"><span>💊</span> Vermífugo</div>
        </div>
    `;
}


// ------------------------- LÓGICA DO MODAL ------------------------- //
// Abre o modal preenchendo as informações dinamicamente com base no animal clicado.
const modalAnimal = document.getElementById('modal-animal');

function abrirModal(nomeAnimal) {
    // Busca o objeto do animal correto dentro do nosso "Banco de Dados" (array)
    const animal = animais.find(a => a.nome === nomeAnimal);
    if (!animal) return;

    // Configuração da Galeria.
    fotosAtuais = Array.isArray(animal.fotos) ? animal.fotos : [animal.foto];
    indiceFotoAtual = 0; 
    atualizarVisualizacaoGaleria(); 

    // Preenchimento de informações básicas. 
    document.getElementById('modal-nome').innerText = animal.nome;
    document.getElementById('modal-resumo').innerText = animal.especie; 
    
    // Oculta a seção de história, ela será exclusiva da página de detalhes
    const divHistoria = document.querySelector('.Modal-Historia');
    if (divHistoria) divHistoria.style.display = 'none';

    // Preenchimento das informações especificas. 
    const gridDetalhes = document.querySelector('.Modal-Detalhes-Tecnicos');
    gridDetalhes.innerHTML = `
        <div class="Item-Detalhe"><strong>Raça</strong> <span>${animal.raca}</span></div>
        <div class="Item-Detalhe"><strong>Sexo</strong> <span>${animal.sexo}</span></div>
        <div class="Item-Detalhe"><strong>Local</strong> <span>${animal.local}</span></div>
        <div class="Item-Detalhe"><strong>Idade</strong> <span>${animal.idade}</span></div>
    `;

    // Lógica da fila de adoção. 
    let divStatus = document.getElementById('modal-status-area');
    
    // Só mostramos a caixa de alerta se houver alguém na fila.
    if (animal.interessados && animal.interessados > 0) {
        if (!divStatus) {
            divStatus = document.createElement('div');
            divStatus.id = 'modal-status-area';
            divStatus.className = 'modal-status-alerta'; 
            gridDetalhes.after(divStatus); 
        }
        
        divStatus.innerText = gerarStatusHTML(animal.interessados);
        divStatus.style.display = 'block';

    } else {
        // Se não houver fila, remove a caixa para limpar o visual.
        if (divStatus) divStatus.remove();
    }

    // Funcionalidade do Botão "Quero Conhecer Mais".
    const containerBotoes = document.querySelector('.Modal-Botoes') || document.querySelector('.Botao-Adotar-Modal').parentElement;

    containerBotoes.innerHTML = ''; 

    const btnConhecer = document.createElement('a');
    btnConhecer.className = 'Botao-Conhecer';
    btnConhecer.innerText = 'Quero Conhecer Mais';
    
    // Gera o link para a página de detalhes passando o ID via URL
    const paramUrl = animal.id ? `id=${animal.id}` : `animal=${encodeURIComponent(animal.nome)}`;
    btnConhecer.href = `detalhes.html?${paramUrl}`;
    
    containerBotoes.appendChild(btnConhecer);

    // Os ícones de saúde não devem aparecer no modal.
    const areaSaude = document.getElementById('modal-saude-area');
    if(areaSaude) areaSaude.remove();

    // Lógica do Cronômetro para a Galeria.
    // Limpa qualquer timer anterior por segurança.
    if (intervaloGaleria) clearInterval(intervaloGaleria);

    // Se tiver mais de uma foto, inicia o loop automático.
    if (fotosAtuais.length > 1) {
        intervaloGaleria = setInterval(() => {
            mudarFoto(1); 
        }, 10000); 
    }

    // Mostra o modal e trava o scroll da página de fundo.
    modalAnimal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


/* ------------------------- LÓGICA DA GALERIA ------------------------- */
// Atualiza a interface do modal com a foto atual, o contador e a visibilidade das setas.
function atualizarVisualizacaoGaleria() {
    const imgElement = document.getElementById('modal-img');
    const contador = document.getElementById('contador-fotos');
    const btnAnt = document.querySelector('.seta-galeria.anterior');
    const btnProx = document.querySelector('.seta-galeria.proxima');

    // Deixa a imagem atual transparente.
    imgElement.style.opacity = 0;

    // Aguarda 0,2s antes de trocar.
    setTimeout(() => {
        imgElement.src = fotosAtuais[indiceFotoAtual];
        imgElement.style.opacity = 1;
    }, 200);
    
    // Vincula o clique na imagem para abrir o zoom.
    imgElement.onclick = abrirLightboxProfissional;

    // Atualiza o texto do contador.
    if (contador) contador.innerText = `${indiceFotoAtual + 1} / ${fotosAtuais.length}`;

    // Controle de Setas: Só mostra navegação se houver mais de uma foto.
    if (fotosAtuais.length > 1) {
        if(btnAnt) btnAnt.style.display = 'block';
        if(btnProx) btnProx.style.display = 'block';
    } else {
        // Se tiver apenas uma foto, esconde as setas.
        if(btnAnt) btnAnt.style.display = 'none';
        if(btnProx) btnProx.style.display = 'none';
    }
}

// Loop Infinito do Carrosel.
function mudarFoto(direcao) {
    indiceFotoAtual += direcao;
    
    if (indiceFotoAtual < 0) indiceFotoAtual = fotosAtuais.length - 1;

    else if (indiceFotoAtual >= fotosAtuais.length) indiceFotoAtual = 0;
    
    atualizarVisualizacaoGaleria();
}

/* ------------------------- Modo de Visualização com a Tela Cheia ------------------------- */
// Converte as fotos para o formato do Fancybox e abre a galeria em tela cheia.
function abrirLightboxProfissional() {
    // O Fancybox precisa de objetos {src, type}, não apenas strings.
    const galeriaFancybox = fotosAtuais.map(fotoUrl => {
        return { src: fotoUrl, type: "image" };
    });

    // Inicialização da Biblioteca.
    Fancybox.show(galeriaFancybox, {
        startIndex: indiceFotoAtual, 
        loop: true,                  
        Toolbar: {
            display: {
                left: ["infobar"],   
                middle: [],
                right: ["slideshow", "thumbs", "close"], 
            },
        },
    });
}

// Função para fechar o Modal.
function fecharModalDetalhes() {
    modalAnimal.style.display = 'none';
    document.body.style.overflow = 'auto';

    // DESLIGA O CRONÔMETRO
    if (intervaloGaleria) {
        clearInterval(intervaloGaleria);
        intervaloGaleria = null; // Zera a variável
    }
}

window.onclick = function(event) {
    if (event.target == modalAnimal && window.innerWidth >= 900) {
        fecharModalDetalhes();
    }
}


/* ------------------------- RENDERIZAÇÃO E PAGINAÇÃO ------------------------- */
// Atualiza a lista de Cards após o uso de um filtro de pesquisa.
function atualizarListaAnimais(lista) {
    listaAtualDeAnimais = lista; 
    paginaAtual = 1; 
    calcularItensPorPagina(); // Recalcula quantos cards cabem na tela.
    renderizarPagina();       
}

// Função que pega os dados do Array e cria os Cards HTML na tela.
function renderizarPagina() {
    const grid = document.getElementById('grid-animais');
    const msgSemResultados = document.getElementById('mensagem-sem-resultados');
    const paginacaoContainer = document.getElementById('paginacao-container');

    grid.innerHTML = '';

    // Verificação de Lista Sem Resultados.
    if (listaAtualDeAnimais.length === 0) {
        msgSemResultados.style.display = 'block'; 
        if(paginacaoContainer) paginacaoContainer.style.display = 'none'; 
        return; 
    } else {
        msgSemResultados.style.display = 'none';
        if(paginacaoContainer) paginacaoContainer.style.display = 'flex';
    }

    // Calculo da Paginação de cada página.
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const animaisDaPagina = listaAtualDeAnimais.slice(inicio, fim);

    // Criação dos Cards.
    animaisDaPagina.forEach(animal => {
        // A primeira ou única foto do array de cada animal será a foto da capa do Card.
        let fotoCapa = Array.isArray(animal.fotos) ? animal.fotos[0] : animal.foto;
        
        // Data do Cadastro do Animal.
        const htmlData = formatarData(animal.dataAdicao);

        // Montagem do HTML do Card.
        const cardHTML = `
            <div class="cartao-animal" onclick="abrirModal('${animal.nome}')">
                <div style="position: relative;">
                    <img src="${fotoCapa}" alt="${animal.nome}" onerror="this.src='https://placehold.co/300x250?text=Foto+Indisponível'">
                </div>
                <div class="info-card">
                    <h3>${animal.nome}</h3>
                    <p>${animal.especie} | ${animal.sexo}</p>
                    <p>${animal.local}</p>
                    
                    <p class="data-adicao">Adicionado em: ${htmlData}</p>
                </div>
            </div>
        `;
        
        grid.innerHTML += cardHTML;
    });

    atualizarControlesPaginacao();
}

// Controla o estado visual dos botões (habilitado/desabilitado) e atualiza a numeração da página. 
function atualizarControlesPaginacao() {
    const btnAnt = document.getElementById('btn-ant');
    const btnProx = document.getElementById('btn-prox');
    const indicador = document.getElementById('indicador-paginacao');
    
    if (!btnAnt || !btnProx || !indicador) return;

    const totalPaginas = Math.ceil(listaAtualDeAnimais.length / itensPorPagina);
    
    // Atualiza o número da página.
    indicador.innerText = `Página ${paginaAtual} de ${totalPaginas}`;

    // Desativa 'Anterior' se estiver na primeira página.
    btnAnt.disabled = (paginaAtual === 1);
    
    // Desativa 'Próxima' se estiver na última página ou se não houver mais páginas.
    btnProx.disabled = (paginaAtual === totalPaginas || totalPaginas === 0);
}

// Função para mudar de páginas.
function mudarPagina(direcao) {
    paginaAtual += direcao;
    
    renderizarPagina();
    
    // Rola a tela suavemente de volta ao topo da galeria.
    const topoGaleria = document.querySelector('.Galeria-Animais');
    if (topoGaleria) topoGaleria.scrollIntoView({ behavior: 'smooth' });
}


/* ------------------------- LÓGICA DE FILTRAGEM ------------------------- */
// Lê todos os campos dos filtros e mostra o Card de um Animal se ele atender a todos os critérios preenchidos.
function aplicarFiltros() {
    // Coleta os valores atuais dos inputs.
    const cidadeValor = document.getElementById('cidade').value.toLowerCase();
    const especieValor = document.getElementById('filtro-especie').value;
    const porteValor = document.getElementById('filtro-porte').value;
    const sexoValor = document.getElementById('filtro-sexo').value;
    const idadeValor = document.getElementById('filtro-idade').value;
    const origemValor = document.getElementById('filtro-origem').value;

    // Verifica o select de espécie e, de acordo com ele, mostra o select de raça.
    let racaValor = "";
    if (especieValor === "Cachorro") racaValor = document.getElementById('filtro-raca-cachorro').value;
    else if (especieValor === "Gato") racaValor = document.getElementById('filtro-raca-gato').value;

    // Filtragem do Array: O método .filter cria uma nova lista apenas com os aprovados.
    const filtrados = animais.filter(animal => {
        // Verifica cada critério. Se o campo estiver vazio ou "Todos", aceita qualquer valor (true).
        const matchCidade = animal.local.toLowerCase().includes(cidadeValor);
        const matchEspecie = (especieValor === "" || especieValor === "Selecione...") ? true : animal.especie === especieValor;
        const matchPorte = (porteValor === "" || porteValor === "Todos") ? true : animal.porte === porteValor;
        const matchSexo = (sexoValor === "" || sexoValor === "Todos") ? true : animal.sexo === sexoValor;
        const matchIdade = (idadeValor === "" || idadeValor === "Todas") ? true : animal.idade === idadeValor;
        const matchOrigem = (origemValor === "" || origemValor === "Todas") ? true : (animal.origem === origemValor);
        const matchRaca = (racaValor === "" || racaValor === "Todas") ? true : animal.raca.includes(racaValor);

        // Retorna TRUE apenas se passar em TODAS as verificações.
        return matchCidade && matchEspecie && matchPorte && matchSexo && matchIdade && matchOrigem && matchRaca;
    });

    // Atualiza a tela com a nova lista filtrada.
    atualizarListaAnimais(filtrados);
    
    // Se estiver no celular/tablet, fecha o menu lateral automaticamente após filtrar.
    if (window.innerWidth < 1400) toggleFiltros();
}

// Função que limpa todos os campos de busca e restaura a lista completa.
function limparFiltros() {
    document.getElementById('cidade').value = '';
    document.getElementById('filtro-especie').value = '';
    document.getElementById('filtro-porte').value = '';
    document.getElementById('filtro-sexo').value = '';
    document.getElementById('filtro-idade').value = '';
    document.getElementById('filtro-origem').value = '';
    
    // Restaura a lista original completa (variável 'animais' do dados.js)
    atualizarListaAnimais(animais);
}



/* ------------------------- INICIALIZAÇÃO E EVENTOS ------------------------- */
// Executa assim que o HTML termina de carregar. Prepara os selects, datalists e eventos iniciais.
document.addEventListener('DOMContentLoaded', () => {
    
    // Popula o Autocomplete de Cidades.
    const datalist = document.getElementById("cidades");
    cidadesPE.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade;
        datalist.appendChild(option);
    });

    // Preenche os selects dinâmicos usando as listas do dados.js.
    preencherSelect("filtro-raca-cachorro", racasCachorros);
    preencherSelect("filtro-raca-gato", racasGatos);
    preencherSelect("filtro-idade", idades);

    // Configura o evento de mudança da Espécie (Mostrar/Esconder Raças).
    const selectEspecie = document.getElementById('filtro-especie');
    const divRacaCachorro = document.getElementById('container-raca-cachorro');
    const divRacaGato = document.getElementById('container-raca-gato');

    selectEspecie.addEventListener('change', (evento) => {
        const valor = evento.target.value;
        // Reseta, esconde ambos.
        divRacaCachorro.style.display = 'none';
        divRacaGato.style.display = 'none';
        
        // Mostra o específico.
        if (valor === 'Cachorro') divRacaCachorro.style.display = 'flex';
        if (valor === 'Gato') divRacaGato.style.display = 'flex';
    });

    // Calcula itens por página e desenha a lista completa
    calcularItensPorPagina();
    atualizarListaAnimais(animais);
});