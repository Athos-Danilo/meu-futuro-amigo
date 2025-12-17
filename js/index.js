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

setInterval(passarSlide, 4000);