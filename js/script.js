document.addEventListener('DOMContentLoaded', () => {

    // Lógica para o menu mobile
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Fecha o menu mobile ao clicar em um link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // Lógica para a animação de fade-in ao rolar a página
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.25, // A seção aparece quando 25% dela está visível
        rootMargin: "0px 0px -50px 0px" // Começa a observar um pouco antes de entrar na tela
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

});
