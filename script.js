document.addEventListener('DOMContentLoaded', () => {

    // ===================================
    // 1. Lógica para o Menu Mobile
    // ===================================
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        // Abre e fecha o menu ao clicar no botão
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Fecha o menu mobile ao clicar em um link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Adiciona 'hidden' para fechar o menu
                mobileMenu.classList.add('hidden');
            });
        });
    }


    // ===================================
    // 2. Lógica para a animação de fade-in
    // ===================================
    const faders = document.querySelectorAll('.fade-in');

    // Verifica se há elementos 'fade-in' na página
    if (faders.length > 0) {
        const appearOptions = {
            threshold: 0.25, // A seção aparece quando 25% dela está visível
            rootMargin: "0px 0px -50px 0px" // Começa a observar um pouco antes de entrar na tela
        };

        const appearOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Para de observar o elemento para que a animação não se repita
                    observer.unobserve(entry.target);
                }
            });
        }, appearOptions);

        faders.forEach(fader => {
            appearOnScroll.observe(fader);
        });
    }

});