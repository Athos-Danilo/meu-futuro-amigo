/* =======================================================
   LÓGICA DA PÁGINA QUERO ADOTAR (V5.0 - COMPLETO)
   Funcionalidades: Paginação + Galeria Fancybox + Status + Saúde + Data
   Arquivo: js/adotar.js
   ======================================================= */

/* --- VARIÁVEIS GLOBAIS --- */
let paginaAtual = 1;
let itensPorPagina = 10; 
let listaAtualDeAnimais = []; 

// VARIÁVEIS DA GALERIA
let fotosAtuais = []; 
let indiceFotoAtual = 0;


/* --- 1. FUNÇÕES DE INTERFACE E AUXILIARES --- */

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

function toggleFiltros() {
    const container = document.getElementById('filtros-container');
    container.classList.toggle('aberto');
    document.body.style.overflow = container.classList.contains('aberto') ? 'hidden' : 'auto';
}

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

// --- FUNÇÕES DE DATA E STATUS (NOVAS) ---
function formatarData(dataISO) {
    if (!dataISO) return "Recém-chegado";
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR'); 
}

function gerarStatusHTML(interessados) {
    // Retorna apenas o TEXTO, pois o estilo bege será fixo do container
    if (!interessados || interessados === 0) {
        return "Este amigo está disponível para adoção!";
    } else {
        const p = interessados === 1 ? 'pessoa' : 'pessoas';
        return `Atenção: Há ${interessados} ${p} na fila de interesse.`;
    }
}

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

/* --- 2. LÓGICA DO MODAL (ATUALIZADA) --- */
const modalAnimal = document.getElementById('modal-animal');

function abrirModal(nomeAnimal) {
    const animal = animais.find(a => a.nome === nomeAnimal);
    if (!animal) return;

    // 1. Galeria
    fotosAtuais = Array.isArray(animal.fotos) ? animal.fotos : [animal.foto];
    indiceFotoAtual = 0; 
    atualizarVisualizacaoGaleria(); 

    // 2. Textos Básicos
    document.getElementById('modal-nome').innerText = animal.nome;
    document.getElementById('modal-resumo').innerText = animal.especie; 
    
    // Esconde história (como já tínhamos feito)
    const divHistoria = document.querySelector('.Modal-Historia');
    if (divHistoria) divHistoria.style.display = 'none';

    // 3. Grid Técnica (4 itens)
    const gridDetalhes = document.querySelector('.Modal-Detalhes-Tecnicos');
    gridDetalhes.innerHTML = `
        <div class="Item-Detalhe"><strong>Raça</strong> <span>${animal.raca}</span></div>
        <div class="Item-Detalhe"><strong>Sexo</strong> <span>${animal.sexo}</span></div>
        <div class="Item-Detalhe"><strong>Local</strong> <span>${animal.local}</span></div>
        <div class="Item-Detalhe"><strong>Idade</strong> <span>${animal.idade}</span></div>
    `;

    // 4. STATUS (A NOVA CAIXA BEGE)
    // Verifica se já existe a caixa, se não, cria.
    let divStatus = document.getElementById('modal-status-area');
    if (!divStatus) {
        divStatus = document.createElement('div');
        divStatus.id = 'modal-status-area';
        divStatus.className = 'modal-status-alerta'; // A classe CSS nova
        gridDetalhes.after(divStatus); // Insere DEPOIS da grid
    }
    // Preenche com o texto
    divStatus.innerText = gerarStatusHTML(animal.interessados);


    // 5. Botão "Quero Conhecer"
    const containerBotoes = document.querySelector('.Modal-Botoes') || document.querySelector('.Botao-Adotar-Modal').parentElement;
    containerBotoes.innerHTML = ''; 

    const btnConhecer = document.createElement('a');
    btnConhecer.className = 'Botao-Conhecer';
    btnConhecer.innerText = 'Quero Conhecer +';
    // Link temporário até criarmos a página
    btnConhecer.href = `detalhes.html?animal=${encodeURIComponent(animal.nome)}`;
    
    containerBotoes.appendChild(btnConhecer);

    // Limpeza extra
    const areaSaude = document.getElementById('modal-saude-area');
    if(areaSaude) areaSaude.remove();

    modalAnimal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}


// --- FUNÇÕES DA GALERIA NO MODAL ---
function atualizarVisualizacaoGaleria() {
    const imgElement = document.getElementById('modal-img');
    const contador = document.getElementById('contador-fotos');
    const btnAnt = document.querySelector('.seta-galeria.anterior');
    const btnProx = document.querySelector('.seta-galeria.proxima');

    imgElement.src = fotosAtuais[indiceFotoAtual];
    imgElement.onclick = abrirLightboxProfissional;

    if (contador) contador.innerText = `${indiceFotoAtual + 1} / ${fotosAtuais.length}`;

    if (fotosAtuais.length > 1) {
        if(btnAnt) btnAnt.style.display = 'block';
        if(btnProx) btnProx.style.display = 'block';
    } else {
        if(btnAnt) btnAnt.style.display = 'none';
        if(btnProx) btnProx.style.display = 'none';
    }
}

function mudarFoto(direcao) {
    indiceFotoAtual += direcao;
    if (indiceFotoAtual < 0) indiceFotoAtual = fotosAtuais.length - 1;
    else if (indiceFotoAtual >= fotosAtuais.length) indiceFotoAtual = 0;
    atualizarVisualizacaoGaleria();
}

// --- FUNÇÃO DE ZOOM (FANCYBOX) ---
function abrirLightboxProfissional() {
    const galeriaFancybox = fotosAtuais.map(fotoUrl => {
        return { src: fotoUrl, type: "image" };
    });

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

function fecharModalDetalhes() {
    modalAnimal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    if (event.target == modalAnimal && window.innerWidth >= 900) {
        fecharModalDetalhes();
    }
}


/* --- 3. BANCO DE DADOS (ATUALIZADO COM DATA, STATUS E SAÚDE) --- */

const cidadesPE = [
  "Abreu e Lima", "Afogados da Ingazeira", "Afrânio", "Agrestina", "Água Preta",
  "Águas Belas", "Alagoinha", "Aliança", "Altinho", "Amaraji", "Angelim", 
  "Araçoiaba", "Araripina", "Arcoverde", "Barra de Guabiraba", "Barreiros", 
  "Belém de Maria", "Belém do São Francisco", "Belo Jardim", "Betânia", "Bezerros", 
  "Bodocó", "Bom Conselho", "Bom Jardim", "Bonito", "Brejão", "Brejinho", 
  "Brejo da Madre de Deus", "Buenos Aires", "Buíque", "Cabo de Santo Agostinho", 
  "Cabrobó", "Cachoeirinha", "Caetés", "Calçado", "Calumbi", "Camaragibe", 
  "Camocim de São Félix", "Camutanga", "Canhotinho", "Capoeiras", "Carnaíba", 
  "Carnaubeira da Penha", "Carpina", "Caruaru", "Casinhas", "Catende", "Cedro", 
  "Chã de Alegria", "Chã Grande", "Condado", "Correntes", "Cortês", "Cumaru", 
  "Cupira", "Custódia", "Dormentes", "Escada", "Exu", "Feira Nova", 
  "Fernando de Noronha", "Ferreiros", "Flores", "Floresta", "Frei Miguelinho", 
  "Gameleira", "Garanhuns", "Glória do Goitá", "Goiana", "Granito", "Gravatá", 
  "Iati", "Ibimirim", "Ibirajuba", "Igarassu", "Iguaracy", "Inajá", "Ingazeira", 
  "Ipojuca", "Ipubi", "Itacuruba", "Itaíba", "Ilha de Itamaracá", "Itambé", 
  "Itapetim", "Itapissuma", "Itaquitinga", "Jaboatão dos Guararapes", "Jaqueira", 
  "Jataúba", "Jatobá", "João Alfredo", "Joaquim Nabuco", "Jucati", "Jupi", "Jurema", 
  "Lagoa do Carro", "Lagoa do Itaenga", "Lagoa do Ouro", "Lagoa dos Gatos", 
  "Lagoa Grande", "Lajedo", "Limoeiro", "Macaparana", "Machados", "Manari", 
  "Maraial", "Mirandiba", "Moreilândia", "Moreno", "Nazaré da Mata", "Olinda", 
  "Orobó", "Orocó", "Ouricuri", "Palmares", "Palmeirina", "Panelas", "Paranatama", 
  "Parnamirim", "Passira", "Paudalho", "Paulista", "Pedra", "Pesqueira", 
  "Petrolândia", "Petrolina", "Poção", "Pombos", "Primavera", "Quipapá", "Quixaba", 
  "Recife", "Riacho das Almas", "Ribeirão", "Rio Formoso", "Sairé", "Salgadinho", 
  "Salgueiro", "Saloá", "Sanharó", "Santa Cruz", "Santa Cruz da Baixa Verde", 
  "Santa Cruz do Capibaribe", "Santa Filomena", "Santa Maria da Boa Vista", 
  "Santa Maria do Cambucá", "Santa Terezinha", "São Benedito do Sul", 
  "São Bento do Una", "São CaitAno", "São João", "São Joaquim do Monte", 
  "São José da Coroa Grande", "São José do Belmonte", "São José do Egito", 
  "São Lourenço da Mata", "São Vicente Ferrer", "Serra Talhada", "Serrita", 
  "Sertânia", "Sirinhaém", "Solidão", "Surubim", "Tabira", "Tacaimbó", "Terezinha", 
  "Terra Nova", "Timbaúba", "Toritama", "Tracunhaém", "Trindade", "Triunfo", 
  "Tupanatinga", "Tuparetama", "Venturosa", "Verdejante", "Vertente do Lério", 
  "Vertentes", "Vicência", "Vitória de Santo Antão", "Xexéu"
];

const racasCachorros = [
  "Labrador Retriever", "Golden Retriever", "Pastor Alemão", "Bulldog",
  "Poodle", "Beagle", "Rottweiler", "Shih Tzu", "Yorkshire Terrier",
  "Boxer", "Dachshund (Teckel)", "Chihuahua", "Border Collie", "SRD (Vira-lata)",
  "Husky Siberiano", "Doberman", "Maltês", "Akita", "Cocker Spaniel",
  "Pinscher", "Pit Bull"
];

const racasGatos = [
  "Persa", "Siamês", "Maine Coon", "Angorá", "Sphynx (Sem pelo)",
  "Ragdoll", "British Shorthair", "Bengal", "Himalaio", "SRD (Vira-lata)",
  "Norueguês da Floresta", "Abissínio", "Exótico", "Scottish Fold",
  "Bombay", "Oriental", "Savannah", "Tonquinês", "Manx"
];

const idades = [
  "Recém-Nascido", "1 Mês", "2 Meses", "3 Meses", "4 Meses", "5 Meses", "6 Meses", "7 Meses", "8 Meses", "9 Meses", "10 Meses",
  "11 Meses", "1 Ano", "2 Anos", "3 Anos", "4 Anos", "5 Anos", "6 Anos", "7 Anos", "8 Anos", "9 Anos", "10 Anos", "11 Anos",
  "12 Anos", "13 Anos", "14 Anos", "15 Anos +"
];

const animais = [
    // ZEZINHO ATUALIZADO (Exemplo Completo)
    { 
        nome: "Zezinho", 
        especie: "Cachorro", 
        sexo: "Macho", 
        porte: "Médio", 
        raca: "Beagle", 
        idade: "3 Meses", 
        local: "Garanhuns - PE", 
        fotos: [
            "../img/zezinho.jpg", 
            "https://placehold.co/600x400/orange/white?text=Brincando", 
            "https://placehold.co/600x400/green/white?text=Dormindo"
        ],
        origem: "Ong", 
        historia: "Encontrado perto do parque, Zezinho adora correr e brincar de bola.",
        // NOVOS DADOS
        dataAdicao: "2024-05-20", 
        interessados: 3, 
        saude: { vacinado: true, castrado: false, vermifugado: true }
    },
    // OUTROS ANIMAIS (Atualizados com dados padrão)
    { nome: "Luna", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Bobtail", idade: "2 Anos", local: "Garanhuns - PE", foto: "../img/luna.jpg", origem: "Protetor", historia: "Luna é muito carinhosa...", dataAdicao: "2024-01-10", interessados: 0, saude: { vacinado: true, castrado: true, vermifugado: true } },
    { nome: "Simba", especie: "Cachorro", sexo: "Macho", porte: "Médio", raca: "SRD (Vira-lata)", idade: "6 Meses", local: "Lajedo - PE", foto: "../img/Simba.jpg", dataAdicao: "2024-05-22", interessados: 6, saude: { vacinado: false, castrado: false, vermifugado: true } },
    { nome: "Bob", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Bobtail", idade: "3 Anos", local: "Garanhuns - PE", foto: "../img/Bob.jpg", dataAdicao: "2023-12-05", interessados: 1 },
    { nome: "Jujuba", especie: "Cachorro", sexo: "Fêmea", porte: "Médio", raca: "SRD (Vira-lata)", idade: "3 Anos", local: "Canhotinho - PE", foto: "../img/Jujuba.jpg", dataAdicao: "2024-03-15", interessados: 0 },
    { nome: "Romário", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "Pinscher", idade: "6 Anos", local: "Jupi - PE", foto: "../img/romário.jpg", dataAdicao: "2023-11-20", interessados: 2 },
    { nome: "Bela", especie: "Cachorro", sexo: "Fêmea", porte: "Grande", raca: "Husky Siberiano", idade: "4 Anos", local: "Garanhuns - PE", foto: "../img/Bela.jpg", dataAdicao: "2024-04-01", interessados: 8, saude: { vacinado: true, castrado: true, vermifugado: true } },
    { nome: "Thor", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "1 Ano", local: "Lajedo - PE", foto: "../img/Thor.jpg", dataAdicao: "2024-02-15", interessados: 4 },
    { nome: "Gaia", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "2 Meses", local: "Jupi - PE", foto: "../img/Gaia.jpg", dataAdicao: "2024-05-25", interessados: 1 },
    { nome: "Rocky", especie: "Cachorro", sexo: "Macho", porte: "Médio", raca: "SRD (Vira-lata)", idade: "5 Anos", local: "Lajedo - PE", foto: "../img/Rocky.jpg", dataAdicao: "2024-01-01", interessados: 0 },
    { nome: "Silvana", especie: "Gato", sexo: "Fêmea", porte: "Pequeno", raca: "Siamês", idade: "3 Anos", local: "Garanhuns - PE", foto: "../img/Silvana.jpg", dataAdicao: "2024-03-30", interessados: 5 },
    { nome: "Chico", especie: "Cachorro", sexo: "Macho", porte: "Pequeno", raca: "SRD (Vira-lata)", idade: "3 Anos", local: "Jupi - PE", foto: "../img/Chico.jpg", dataAdicao: "2024-04-10", interessados: 2 }
];


/* --- 4. RENDERIZAÇÃO (CARD AGORA MOSTRA STATUS E DATA) --- */

function atualizarListaAnimais(lista) {
    listaAtualDeAnimais = lista; 
    paginaAtual = 1; 
    calcularItensPorPagina(); 
    renderizarPagina(); 
}

function renderizarPagina() {
    const grid = document.getElementById('grid-animais');
    const msgSemResultados = document.getElementById('mensagem-sem-resultados');
    const paginacaoContainer = document.getElementById('paginacao-container');

    grid.innerHTML = '';

    if (listaAtualDeAnimais.length === 0) {
        msgSemResultados.style.display = 'block';
        if(paginacaoContainer) paginacaoContainer.style.display = 'none';
        return;
    } else {
        msgSemResultados.style.display = 'none';
        if(paginacaoContainer) paginacaoContainer.style.display = 'flex';
    }

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const animaisDaPagina = listaAtualDeAnimais.slice(inicio, fim);

    animaisDaPagina.forEach(animal => {
        let fotoCapa = Array.isArray(animal.fotos) ? animal.fotos[0] : animal.foto;
        
        // Gera os novos HTMLs
        const htmlStatus = gerarStatusHTML(animal.interessados);
        const htmlData = formatarData(animal.dataAdicao);

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

function atualizarControlesPaginacao() {
    const btnAnt = document.getElementById('btn-ant');
    const btnProx = document.getElementById('btn-prox');
    const indicador = document.getElementById('indicador-paginacao');
    
    if (!btnAnt || !btnProx || !indicador) return;

    const totalPaginas = Math.ceil(listaAtualDeAnimais.length / itensPorPagina);
    indicador.innerText = `Página ${paginaAtual} de ${totalPaginas}`;

    btnAnt.disabled = (paginaAtual === 1);
    btnProx.disabled = (paginaAtual === totalPaginas || totalPaginas === 0);
}

function mudarPagina(direcao) {
    paginaAtual += direcao;
    renderizarPagina();
    const topoGaleria = document.querySelector('.Galeria-Animais');
    if (topoGaleria) topoGaleria.scrollIntoView({ behavior: 'smooth' });
}


/* --- 5. FILTRAGEM --- */

function aplicarFiltros() {
    const cidadeValor = document.getElementById('cidade').value.toLowerCase();
    const especieValor = document.getElementById('filtro-especie').value;
    const porteValor = document.getElementById('filtro-porte').value;
    const sexoValor = document.getElementById('filtro-sexo').value;
    const idadeValor = document.getElementById('filtro-idade').value;
    const origemValor = document.getElementById('filtro-origem').value;

    let racaValor = "";
    if (especieValor === "Cachorro") racaValor = document.getElementById('filtro-raca-cachorro').value;
    else if (especieValor === "Gato") racaValor = document.getElementById('filtro-raca-gato').value;

    const filtrados = animais.filter(animal => {
        const matchCidade = animal.local.toLowerCase().includes(cidadeValor);
        const matchEspecie = (especieValor === "" || especieValor === "Selecione...") ? true : animal.especie === especieValor;
        const matchPorte = (porteValor === "" || porteValor === "Todos") ? true : animal.porte === porteValor;
        const matchSexo = (sexoValor === "" || sexoValor === "Todos") ? true : animal.sexo === sexoValor;
        const matchIdade = (idadeValor === "" || idadeValor === "Todas") ? true : animal.idade === idadeValor;
        const matchOrigem = (origemValor === "" || origemValor === "Todas") ? true : (animal.origem === origemValor);
        const matchRaca = (racaValor === "" || racaValor === "Todas") ? true : animal.raca.includes(racaValor);

        return matchCidade && matchEspecie && matchPorte && matchSexo && matchIdade && matchOrigem && matchRaca;
    });

    atualizarListaAnimais(filtrados);
    if (window.innerWidth < 1400) toggleFiltros();
}

function limparFiltros() {
    document.getElementById('cidade').value = '';
    document.getElementById('filtro-especie').value = '';
    document.getElementById('filtro-porte').value = '';
    document.getElementById('filtro-sexo').value = '';
    document.getElementById('filtro-idade').value = '';
    document.getElementById('filtro-origem').value = '';
    atualizarListaAnimais(animais);
}


/* --- 6. INICIALIZAÇÃO --- */

document.addEventListener('DOMContentLoaded', () => {
    const datalist = document.getElementById("cidades");
    cidadesPE.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade;
        datalist.appendChild(option);
    });

    preencherSelect("filtro-raca-cachorro", racasCachorros);
    preencherSelect("filtro-raca-gato", racasGatos);
    preencherSelect("filtro-idade", idades);

    const selectEspecie = document.getElementById('filtro-especie');
    const divRacaCachorro = document.getElementById('container-raca-cachorro');
    const divRacaGato = document.getElementById('container-raca-gato');

    selectEspecie.addEventListener('change', (evento) => {
        const valor = evento.target.value;
        divRacaCachorro.style.display = 'none';
        divRacaGato.style.display = 'none';
        if (valor === 'Cachorro') divRacaCachorro.style.display = 'flex';
        if (valor === 'Gato') divRacaGato.style.display = 'flex';
    });

    calcularItensPorPagina();
    atualizarListaAnimais(animais);
});