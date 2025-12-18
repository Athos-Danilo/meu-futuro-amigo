// Slide dos Banners da Tela Inicial.
let indiceAtual = 0; 
const slides = document.querySelectorAll('.slide-item');
const totalSlides = slides.length;

// Função de que altera as imagens. 
function passarSlide() {
    slides[indiceAtual].classList.remove('ativa');
    indiceAtual = (indiceAtual + 1) % totalSlides;
    slides[indiceAtual].classList.add('ativa');
}

// Chama a função "passarSlide" a cada 5 segundos.
setInterval(passarSlide, 5000);


// Gerar os Cards dos Animais Adotados Recentemente.

// 1. BANCO DE DADOS (Simulado)
const animaisAdotados = [
    {
        nome: "Fubá",
        foto: "img/Fubá.jpg",
        tipo: "Cachorro / Macho",
        local: "Garanhuns - PE",
        data: "Outubro/2025",
        frase: "\"Ele completou nossa família!\""
    },
    {
        nome: "Rafaela",
        foto: "img/Rafaela.jpg",
        tipo: "Gato / Fêmea",
        local: "Jupi - PE",
        data: "Outubro/2025",
        frase: "\"Virou minha companheira!\""
    },
    {
        nome: "Sandrinha",
        foto: "img/Sandrinha.jpg",
        tipo: "Cachorro / Fêmea",
        local: "Lajedo - PE",
        data: "Setembro/2025",
        frase: "\"Uma princesa desastrada\""
    },
    {
        nome: "Geovanni",
        foto: "img/Geovanni.jpg",
        tipo: "Cachorro / Macho",
        local: "Canhotinho - PE",
        data: "Setembro/2025",
        frase: "\"Me ensinou a ter paciência\""
    },
    {
        nome: "Fofinho",
        foto: "img/Fofinho.jpg",
        tipo: "Gato / Macho",
        local: "Garanhuns - PE",
        data: "Setembro/2025",
        frase: "\"Ele é um amor\""
    },
    {
        nome: "Kiko",
        foto: "img/Kiko.jpg",
        tipo: "Cachorro / Macho",
        local: "Garanhuns - PE",
        data: "Setembro/2025",
        frase: "\"Ele é uma gracinha\""
    },
    {
        nome: "Cristiano",
        foto: "img/Cristiano.jpg",
        tipo: "Gato / Macho",
        local: "Lajedo - PE",
        data: "Setembro/2025",
        frase: "\"O amor não tem idade.\""
    },
    {
        nome: "Mel",
        foto: "img/Mel.jpg",
        tipo: "Cachorro / Fêmea",
        local: "Caruaru - PE",
        data: "Setembro/2025",
        frase: "\"Colore meus dias\""
    },
    {
        nome: "Janaina",
        foto: "img/Janaína.jpg",
        tipo: "Gato / Fêmea",
        local: "Jupi - PE",
        data: "Setembro/2025",
        frase: "\"Só sabe dormir\""
    },
    {
        nome: "Claudio",
        foto: "img/Claudio.jpg",
        tipo: "Cachorro / Macho",
        local: "Garanhuns - PE",
        data: "Setembro/2025",
        frase: "\"Virou minha sombra\""
    },
    {
        nome: "Osquinha",
        foto: "img/Osquinha.jpg",
        tipo: "Gato / Macho",
        local: "Lajedo - PE",
        data: "Agosto/2025",
        frase: "\"O mais lindo\""
    },
    {
        nome: "Titã",
        foto: "img/Titã.jpg",
        tipo: "Cachorro / Macho",
        local: "Garanhuns - PE",
        data: "Agosto/2025",
        frase: "\"Meu guarda\""
    }
];

// 2. FUNÇÃO FÁBRICA DE CARDS (Com Limitador de Tela)
function carregarAdotados() {
    const container = document.getElementById('lista-adotados');
    
    // Verifica se o container existe
    if (!container) return;

    // Limpa o container
    container.innerHTML = '';

    // --- A LÓGICA DO LIMITADOR ---
    const larguraTela = window.innerWidth; // Mede a largura da tela do usuário
    let limite;

    if (larguraTela < 900) {
        limite = 5; // Celular: mostra só 5
    } else {
        limite = animaisAdotados.length; // Desktop: mostra todos (ou use 10 se quiser travar)
    }

    // Cria uma nova lista cortada com o tamanho do limite
    const listaRecortada = animaisAdotados.slice(0, limite);

    // --- O LOOP (Agora percorre a listaRecortada) ---
    listaRecortada.forEach(animal => {
        
        const cardHTML = `
            <div class="Cartão-Adotado">
                <img src="${animal.foto}" alt="${animal.nome}">
                <div class="Nome-animal">${animal.nome}</div>
                <div class="Detalhes-animal">
                    <div class="linha"></div>
                    <p>
                        ${animal.tipo}<br>
                        ${animal.local}<br>
                        Adotado em ${animal.data}<br>
                        <strong>${animal.frase}</strong>
                    </p>
                </div>
            </div>
        `;

        container.innerHTML += cardHTML;
    });
}

// 3. OUVINTES DE EVENTOS
// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', carregarAdotados);

// Executa se o usuário redimensionar a tela (opcional, mas bom pra testar no PC)
window.addEventListener('resize', carregarAdotados);