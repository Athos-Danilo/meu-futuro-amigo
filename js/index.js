// --- 1. SLIDER DOS BANNERS (Mantido igual ao seu) ---
let indiceAtual = 0; 
const slides = document.querySelectorAll('.slide-item');
const totalSlides = slides.length;

function passarSlide() {
    // Verifica se existem slides para evitar erros
    if(totalSlides === 0) return;
    
    slides[indiceAtual].classList.remove('ativa');
    indiceAtual = (indiceAtual + 1) % totalSlides;
    slides[indiceAtual].classList.add('ativa');
}

setInterval(passarSlide, 5000);


// --- 2. FUNÇÃO QUE BUSCA DO BANCO E CRIA OS CARDS ---
async function carregarAdotados() {
    const container = document.getElementById('lista-adotados');
    
    if (!container) return;

    // Limpa o container antes de começar
    container.innerHTML = '';

    try {
        // A. BUSCAR DADOS NO SERVIDOR
        const response = await fetch('http://localhost:3000/animais?status=adotado');
        const dadosBanco = await response.json();

        // B. LIMITADOR DE TELA (Atualizado com suas regras!) 📏
        const larguraTela = window.innerWidth;
        let limite;

        if (larguraTela < 900) {
            limite = 5; // Celular
        } else if (larguraTela >= 900 && larguraTela < 1400) {
            limite = 6; // Tablet (Notebooks menores)
        } else {
            limite = 8; // Telas Grandes (Desktop)
        }

        // C. RECORTAR A LISTA
        const listaFinal = dadosBanco.slice(0, limite);

        if (listaFinal.length === 0) {
            container.innerHTML = '<p>Nenhum animal adotado recentemente.</p>';
            return;
        }

        // D. GERAR O HTML
        listaFinal.forEach(animal => {
            
            let urlFoto = animal.foto;
            if (!urlFoto.startsWith('http')) {
                urlFoto = `http://localhost:3000/${animal.foto}`;
            }

            const textoTipo = `${animal.especie} / ${animal.sexo}`;
            // Lembra que mudamos para usar frase_efeito aqui?
            const textoFrase = animal.frase_efeito ? `"${animal.frase_efeito}"` : '"Final Feliz!"';
            
            // Formatação da Data
            let textoData = 'Data não inf.';
            if (animal.data_adocao) {
                const dataObj = new Date(animal.data_adocao);
                textoData = dataObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            }

            const cardHTML = `
                <div class="Cartão-Adotado">
                    <img src="${urlFoto}" alt="${animal.nome}">
                    <div class="Nome-animal">${animal.nome}</div>
                    <div class="Detalhes-animal">
                        <div class="linha"></div>
                        <p>
                            ${textoTipo}<br>
                            ${animal.local}<br>
                            Adotado em ${textoData}<br>
                            <strong>${textoFrase}</strong>
                        </p>
                    </div>
                </div>
            `;

            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error('Erro ao carregar adotados:', error);
        container.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

// --- 3. OUVINTES DE EVENTOS ---
document.addEventListener('DOMContentLoaded', carregarAdotados);
window.addEventListener('resize', carregarAdotados);