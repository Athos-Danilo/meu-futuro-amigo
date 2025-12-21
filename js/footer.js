// --- LÓGICA INTELIGENTE DE CAMINHOS (Igual ao Header) ---
const isPages = window.location.pathname.includes('/pages/');
const basePath = isPages ? '../' : ''; 

// Carregar o Footer em todos as páginas.
async function carregarFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    try {
        // CORREÇÃO 1: Usamos o basePath para buscar o arquivo no lugar certo
        const response = await fetch(basePath + 'components/footer.html');

        if (!response.ok) {
            throw new Error(`Erro HTTP! status: ${response.status}`);
        }

        const html = await response.text();
        footer.innerHTML = html;
        
        // CORREÇÃO 2: Ajustar links e imagens dentro do footer
        ajustarLinksDoFooter(footer);

    } catch (error) {
        console.error('Erro ao carregar o footer', error);
    }
}

// Função para corrigir caminhos de imagens/links dentro do HTML do footer
function ajustarLinksDoFooter(container) {
    if (isPages) {
        // Corrige imagens (ex: logos, ícones de redes sociais)
        const imagens = container.querySelectorAll('img');
        imagens.forEach(img => {
            const src = img.getAttribute('src');
            // Só ajusta se for caminho relativo local (não mexe em http nem ../)
            if (src && !src.startsWith('http') && !src.startsWith('../')) {
                img.src = basePath + src;
            }
        });
        
        // Corrige links (ex: links do mapa do site)
        const links = container.querySelectorAll('a');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('http') && !href.startsWith('../') && !href.startsWith('#')) {
                a.href = basePath + href;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', carregarFooter);