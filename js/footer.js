// Carregar o Footer em todos as páginas.
async function carregarFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    // Variável local para guardar o caminho (evita conflito com o header)
    let basePathFooter = ''; 

    try {
        // TENTATIVA 1: Busca na raiz
        let response = await fetch('components/footer.html');
        
        // Se der erro, tenta buscar voltando uma pasta
        if (!response.ok) {
            response = await fetch('../components/footer.html');
            if (response.ok) {
                basePathFooter = '../';
            }
        }

        if (!response.ok) throw new Error('Footer não encontrado!');

        const html = await response.text();
        footer.innerHTML = html;

        // Passamos o basePath descoberto para a função de ajuste
        ajustarLinksDoFooter(footer, basePathFooter);

    } catch (error) {
        console.error('Erro ao carregar o footer', error);
    }
}

// Função recebe o container E o caminho correto
function ajustarLinksDoFooter(container, caminhoBase) {
    // Ajusta IMAGENS
    const imagens = container.querySelectorAll('img');
    imagens.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('../') && !src.startsWith('/')) {
            img.src = caminhoBase + src;
        }
    });
    
    // Ajusta LINKS
    const links = container.querySelectorAll('a');
    links.forEach(a => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('../') && !href.startsWith('#') && !href.startsWith('/')) {
            a.href = caminhoBase + href;
        }
    });
}

document.addEventListener('DOMContentLoaded', carregarFooter);