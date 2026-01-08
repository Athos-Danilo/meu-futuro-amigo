// Carregar o Footer em todos as páginas.
async function carregarFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    // Variável local para guardar o caminho.
    let basePathFooter = ''; 

    try {
        // Tentativa de carregar o Footer assumindo que estamos na raiz do projeto.
        let response = await fetch('components/footer.html');
        
        // Se der erro, tenta buscar voltando uma pasta.
        if (!response.ok) {
            response = await fetch('../components/footer.html');
            if (response.ok) {
                // Se deu certo, salva o prefixo para ajustar os links dentro do Footer.
                basePathFooter = '../';
            }
        }

        if (!response.ok) throw new Error('Footer não encontrado!');

        const html = await response.text();
        // Coloca o HTML do componente no DOM.
        footer.innerHTML = html;

        // Passa o basePath descoberto para a função de ajuste.
        ajustarLinksDoFooter(footer, basePathFooter);

    } catch (error) {
        console.error('Erro ao carregar o footer', error);
    }
}

function ajustarLinksDoFooter(container, caminhoBase) {
    // Ajusta o caminho das imagens. 
    const imagens = container.querySelectorAll('img');
    imagens.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('../') && !src.startsWith('/')) {
            img.src = caminhoBase + src;
        }
    });
    
    // Ajusta o caminho dos Links. 
    const links = container.querySelectorAll('a');
    links.forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('../') && !href.startsWith('#') && !href.startsWith('/')) {
            a.href = caminhoBase + href;
        }
    });
}

document.addEventListener('DOMContentLoaded', carregarFooter);