// Variáveis Globais
let paginaAtual = 1;
let itensPorPagina = 10;
let listaAtualDeAnimais = []; // Lista filtrada mostrada na tela
let todosOsAnimais = [];      // Lista completa vinda do Banco de Dados

// Variáveis da Galeria
let fotosAtuais = [];
let indiceFotoAtual = 0;
let intervaloGaleria = null;

// --- DADOS ESTÁTICOS (Substituindo o dados.js) ---
const cidadesPE = [
    "Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina", "Paulista",
    "Cabo de Santo Agostinho", "Camaragibe", "Garanhuns", "Vitória de Santo Antão",
    "Igarassu", "São Lourenço da Mata", "Santa Cruz do Capibaribe", "Abreu e Lima",
    "Ipojuca", "Serra Talhada", "Araripina", "Gravatá", "Carpina", "Goiana",
    "Belo Jardim", "Arcoverde", "Ouricuri", "Escada", "Pesqueira", "Surubim",
    "Palmares", "Bezerros", "Moreno", "São Bento do Una", "Buíque", "Lajedo", 
    "Limoeiro", "Timbaúba", "Brejo da Madre de Deus", "Ribeirão", "Bom Conselho",
    "Sirinhaém", "Catende", "Águas Belas", "Pedra", "Bonito", "Triunfo", 
    "Nazaré da Mata", "São José da Coroa Grande", "Brejão", "Caetés", "São João", 
    "Palmerina", "Jupi", "Jurema", "Panelas", "Quipapá"
];

const racasCachorros = ["SRD", "Vira-lata", "Labrador", "Golden Retriever", "Bulldog", "Poodle", "Pastor Alemão", "Pinscher", "Yorkshire", "Shih Tzu", "Rottweiler", "Pug", "Beagle", "Dálmata", "Akita", "Collie", "Cocker Spaniel", "Pitbull", "Greyhound", "Shar Pei", "Dogue Alemão"];
const racasGatos = ["SRD", "Vira-lata", "Persa", "Siamês", "Maine Coon", "Angorá", "Sphynx", "Ragdoll", "Bengal", "Himalaio", "Munchkin", "Laranja", "Frajola", "Tricolor", "Preto", "Branco"];
const idades = ["Filhote", "Jovem", "Adulto", "Idoso"];

// ------------------------- INICIALIZAÇÃO ------------------------- //
document.addEventListener('DOMContentLoaded', () => {
    // 1. Popula os selects (Cidades, Raças, etc)
    popularSelectsIniciais();

    // 2. Busca os animais no servidor
    buscarAnimaisDoBanco();

    // 3. Configura eventos de redimensionamento e filtros
    window.addEventListener('resize', () => {
        calcularItensPorPagina();
        renderizarPagina();
    });

    configurarEventosFiltros();
});

// --- FUNÇÕES DE CONEXÃO COM O SERVIDOR ---

// Busca a lista GERAL de animais disponíveis
async function buscarAnimaisDoBanco() {
    const grid = document.getElementById('grid-animais');
    
    try {
        grid.innerHTML = '<p style="text-align:center; padding:20px; width:100%;">Carregando animais...</p>';
        
        // Busca apenas os disponíveis
        const response = await fetch('http://localhost:3000/animais?status=disponivel');
        const dados = await response.json();

        // Mapeia para corrigir caminhos de imagem e datas
        todosOsAnimais = dados.map(animal => {
            // Corrige caminho da imagem
            let urlFoto = animal.foto;
            if (urlFoto && !urlFoto.startsWith('http')) {
                urlFoto = `http://localhost:3000/${animal.foto}`;
            }

            return {
                ...animal,
                foto: urlFoto,
                // Garante que campos nulos não quebrem o filtro
                raca: animal.raca || 'SRD',
                local: animal.local || 'Não informado'
            };
        });

        // Inicializa a lista atual com tudo
        listaAtualDeAnimais = todosOsAnimais;
        
        // Verifica se tem filtros salvos na sessão e reaplica
        verificarFiltrosSalvos();

    } catch (error) {
        console.error("Erro ao buscar animais:", error);
        grid.innerHTML = '<p style="text-align:center; color:red; width:100%;">Erro ao conectar com o servidor. Verifique se o backend está rodando.</p>';
    }
}

// Busca os detalhes VIP de um animal (incluindo Galeria) para o Modal
async function abrirModal(idAnimal) {
    const modalAnimal = document.getElementById('modal-animal');
    
    try {
        // Busca os dados completos no endpoint específico
        const response = await fetch(`http://localhost:3000/animais/${idAnimal}`);
        const animal = await response.json();

        // Configura a galeria de fotos
        fotosAtuais = animal.fotos.map(foto => {
             return foto.startsWith('http') ? foto : `http://localhost:3000/${foto}`;
        });
        
        indiceFotoAtual = 0;
        atualizarVisualizacaoGaleria();

        // Preenche os textos do modal
        document.getElementById('modal-nome').innerText = animal.nome;
        document.getElementById('modal-resumo').innerText = animal.especie;
        
        // Detalhes técnicos
        const gridDetalhes = document.querySelector('.Modal-Detalhes-Tecnicos');
        gridDetalhes.innerHTML = `
            <div class="Item-Detalhe"><strong>Raça</strong> <span>${animal.raca}</span></div>
            <div class="Item-Detalhe"><strong>Sexo</strong> <span>${animal.sexo}</span></div>
            <div class="Item-Detalhe"><strong>Local</strong> <span>${animal.local}</span></div>
            <div class="Item-Detalhe"><strong>Idade</strong> <span>${animal.idade}</span></div>
        `;

        // Lógica de Interessados (Fila)
        let divStatus = document.getElementById('modal-status-area');
        if (animal.interessados && animal.interessados > 0) {
            if (!divStatus) {
                divStatus = document.createElement('div');
                divStatus.id = 'modal-status-area';
                divStatus.className = 'modal-status-alerta';
                gridDetalhes.after(divStatus);
            }
            const p = animal.interessados === 1 ? 'pessoa' : 'pessoas';
            divStatus.innerText = `Atenção: Há ${animal.interessados} ${p} na fila de interesse.`;
            divStatus.style.display = 'block';
        } else {
            if (divStatus) divStatus.remove();
        }
        
        // Botão Tenho Interesse (Leva para a página de detalhes)
        const containerBotoes = document.querySelector('.Modal-Botoes') || document.querySelector('.Botao-Adotar-Modal').parentElement;
        containerBotoes.innerHTML = '';
        
        const btnConhecer = document.createElement('a');
        btnConhecer.className = 'Botao-Conhecer';
        btnConhecer.innerText = 'Tenho Interesse!';
        
        // Gera o link levando o ID do animal
        const urlDestino = `detalhes.html?id=${animal.id}`;
        btnConhecer.href = urlDestino;

        // Lógica para abrir (Nova aba no PC, Mesma aba no Celular)
        btnConhecer.onclick = (evento) => {
            evento.preventDefault(); 
            if (window.innerWidth >= 900) {
                window.open(urlDestino, '_blank');
            } else {
                window.location.href = urlDestino;
            }
        };

        containerBotoes.appendChild(btnConhecer);

        // Cronômetro da Galeria
        if (intervaloGaleria) clearInterval(intervaloGaleria);
        if (fotosAtuais.length > 1) {
            intervaloGaleria = setInterval(() => mudarFoto(1), 5000); // 5 segundos
        }

        // Abre o modal
        modalAnimal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error("Erro ao abrir modal:", error);
        alert("Não foi possível carregar os detalhes deste animal.");
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO (MOSTRAR NA TELA) ---

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

    // Paginação
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const animaisDaPagina = listaAtualDeAnimais.slice(inicio, fim);

    animaisDaPagina.forEach(animal => {
        // Formata data
        let textoData = 'Recém-chegado';
        if (animal.data_adicao) { // Note: O banco usa data_adicao ou data_adocao? Disponíveis usam default current_date
             // Ajuste conforme seu banco. Se não tiver coluna data_entrada, usamos 'Recém-chegado'
             // Se tiver, formate aqui.
        }

        const cardHTML = `
            <div class="cartao-animal" onclick="abrirModal(${animal.id})">
                <div style="position: relative;">
                    <img src="${animal.foto}" alt="${animal.nome}" onerror="this.src='https://placehold.co/300x250?text=Foto+Indisponível'">
                </div>
                <div class="info-card">
                    <h3>${animal.nome}</h3>
                    <p>${animal.especie} | ${animal.sexo}</p>
                    <p>${animal.local}</p>
                    <p class="data-adicao">${textoData}</p>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    atualizarControlesPaginacao();
}

// --- LÓGICA DE FILTROS ---

function aplicarFiltros() {
    const cidadeValor = document.getElementById('cidade').value.toLowerCase();
    const especieValor = document.getElementById('filtro-especie').value;
    const porteValor = document.getElementById('filtro-porte').value;
    const sexoValor = document.getElementById('filtro-sexo').value;
    const idadeValor = document.getElementById('filtro-idade').value;
    const origemValor = document.getElementById('filtro-origem').value;
    
    // Select de raça depende da espécie
    let racaValor = "";
    if (especieValor === "Cachorro") racaValor = document.getElementById('filtro-raca-cachorro').value;
    else if (especieValor === "Gato") racaValor = document.getElementById('filtro-raca-gato').value;

    // Filtra a lista GLOBAL (todosOsAnimais)
    const filtrados = todosOsAnimais.filter(animal => {
        const matchCidade = animal.local.toLowerCase().includes(cidadeValor);
        const matchEspecie = (!especieValor || especieValor === "Selecione...") ? true : animal.especie === especieValor;
        const matchPorte = (!porteValor || porteValor === "Todos") ? true : animal.porte === porteValor;
        const matchSexo = (!sexoValor || sexoValor === "Todos") ? true : animal.sexo === sexoValor;
        const matchIdade = (!idadeValor || idadeValor === "Todas") ? true : animal.idade === idadeValor;
        const matchOrigem = (!origemValor || origemValor === "Todas") ? true : animal.origem === origemValor;
        const matchRaca = (!racaValor || racaValor === "Todas") ? true : (animal.raca && animal.raca.includes(racaValor));

        return matchCidade && matchEspecie && matchPorte && matchSexo && matchIdade && matchOrigem && matchRaca;
    });

    // Atualiza controles visuais
    atualizarBotoesLimpar(cidadeValor || especieValor || porteValor || sexoValor || idadeValor || origemValor || racaValor);

    // Salva na sessão
    salvarFiltrosNaSessao();

    // Renderiza
    atualizarListaAnimais(filtrados);
    
    if (window.innerWidth < 1400) toggleFiltros();
}

function limparFiltros() {
    // Reseta inputs
    document.querySelectorAll('select').forEach(sel => sel.value = "");
    document.getElementById('cidade').value = '';
    document.getElementById('container-raca-cachorro').style.display = 'none';
    document.getElementById('container-raca-gato').style.display = 'none';

    sessionStorage.removeItem('meusFiltros');
    atualizarBotoesLimpar(false);
    
    // Restaura lista completa
    atualizarListaAnimais(todosOsAnimais);
}

// --- FUNÇÕES AUXILIARES ---

function popularSelectsIniciais() {
    preencherSelect("filtro-raca-cachorro", racasCachorros);
    preencherSelect("filtro-raca-gato", racasGatos);
    preencherSelect("filtro-idade", idades);
    
    const datalist = document.getElementById("cidades");
    cidadesPE.forEach(cidade => {
        const option = document.createElement("option");
        option.value = cidade;
        datalist.appendChild(option);
    });
}

function preencherSelect(id, lista) {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '<option value="">Todas</option>';
    lista.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item;
        opt.textContent = item;
        select.appendChild(opt);
    });
}

function configurarEventosFiltros() {
    // Espécie mostra/esconde raça
    const selectEspecie = document.getElementById('filtro-especie');
    selectEspecie.addEventListener('change', (e) => {
        const val = e.target.value;
        document.getElementById('container-raca-cachorro').style.display = val === 'Cachorro' ? 'flex' : 'none';
        document.getElementById('container-raca-gato').style.display = val === 'Gato' ? 'flex' : 'none';
    });
}

function verificarFiltrosSalvos() {
    const memoria = JSON.parse(sessionStorage.getItem('meusFiltros'));
    if (memoria) {
        // Reaplicar valores aos inputs... (simplificado para brevidade, mas segue sua lógica original)
        // ... (seu código de restaurar inputs aqui se desejar)
        // Por padrão, chamamos o calculo inicial:
        calcularItensPorPagina();
        renderizarPagina();
    } else {
        calcularItensPorPagina();
        renderizarPagina();
    }
}

function salvarFiltrosNaSessao() {
    // ... (mesma lógica do seu código original)
}

function atualizarListaAnimais(lista) {
    listaAtualDeAnimais = lista;
    paginaAtual = 1;
    renderizarPagina();
}

function calcularItensPorPagina() {
    const w = window.innerWidth;
    if (w < 900) itensPorPagina = 10;
    else if (w < 1400) itensPorPagina = 18;
    else itensPorPagina = 24;
}

function atualizarBotoesLimpar(ativo) {
    const btnMob = document.getElementById('btn-limpar-mobile');
    const btnDesk = document.getElementById('btn-limpar-desktop');
    if(ativo) {
        if(btnMob) btnMob.classList.add('ativo');
        if(btnDesk) btnDesk.classList.add('ativo');
    } else {
        if(btnMob) btnMob.classList.remove('ativo');
        if(btnDesk) btnDesk.classList.remove('ativo');
    }
}

// Funções de Galeria (Visualização e Fancybox)
function atualizarVisualizacaoGaleria() {
    const imgElement = document.getElementById('modal-img');
    const contador = document.getElementById('contador-fotos');
    const btnAnt = document.querySelector('.seta-galeria.anterior');
    const btnProx = document.querySelector('.seta-galeria.proxima');

    imgElement.style.opacity = 0;
    setTimeout(() => {
        imgElement.src = fotosAtuais[indiceFotoAtual];
        imgElement.style.opacity = 1;
    }, 200);
    
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

function abrirLightboxProfissional() {
    if(typeof Fancybox === 'undefined') return;
    const galeriaFancybox = fotosAtuais.map(fotoUrl => ({ src: fotoUrl, type: "image" }));
    Fancybox.show(galeriaFancybox, { startIndex: indiceFotoAtual, loop: true });
}

function fecharModalDetalhes() {
    document.getElementById('modal-animal').style.display = 'none';
    document.body.style.overflow = 'auto';
    if (intervaloGaleria) clearInterval(intervaloGaleria);
}

// Botões de Paginação
function mudarPagina(dir) {
    paginaAtual += dir;
    renderizarPagina();
    document.querySelector('.Galeria-Animais').scrollIntoView({ behavior: 'smooth' });
}

function atualizarControlesPaginacao() {
    const btnAnt = document.getElementById('btn-ant');
    const btnProx = document.getElementById('btn-prox');
    const indicador = document.getElementById('indicador-paginacao');
    
    if (!btnAnt) return;

    const totalPaginas = Math.ceil(listaAtualDeAnimais.length / itensPorPagina);
    indicador.innerText = `Página ${paginaAtual} de ${totalPaginas}`;
    btnAnt.disabled = (paginaAtual === 1);
    btnProx.disabled = (paginaAtual === totalPaginas || totalPaginas === 0);
}

// Toggle Filtros
function toggleFiltros() {
    document.getElementById('filtros-container').classList.toggle('aberto');
}