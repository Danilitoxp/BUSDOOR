document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handler
    document.getElementById('loginForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const loginInput = document.getElementById('login');
        const senhaInput = document.getElementById('senha');
        const login = loginInput.value;
        const senha = senhaInput.value;
        const errorMessage = document.getElementById('errorMessage');

        if (login === 'Carflax' && senha === '@carflax@') {
            window.location.href = '/Fornecedores/gerenciador.html';
        } else {
            errorMessage.textContent = 'Login ou senha incorretos. Tente novamente.';
            errorMessage.style.display = 'block';
            errorMessage.classList.remove('hidden');
            
            // Adiciona a classe de erro aos inputs
            loginInput.classList.add('error');
            senhaInput.classList.add('error');

            setTimeout(() => {
                errorMessage.classList.add('hidden');
                // Remove a classe de erro após 2 segundos
                loginInput.classList.remove('error');
                senhaInput.classList.remove('error');
            }, 1500);
        }
    });

    // Navbar Active State
    document.querySelectorAll('.navbar a').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelector('.navbar a.active')?.classList.remove('active'); // Remove a classe 'active' do item anterior
            this.classList.add('active'); // Adiciona a classe 'active' ao item clicado

            // Fecha o menu mobile se estiver aberto
            const navbar = document.querySelector('.navbar');
            if (navbar.classList.contains('active')) {
                navbar.classList.remove('active');
            }
        });
    });

    // Scroll to Top
    window.scrollTo(0, 0); // Rola a página para o topo ao carregar

    // Mobile Menu Toggle
    document.getElementById('menu-icon').addEventListener('click', function() {
        const navbar = document.querySelector('.navbar');
        navbar.classList.toggle('active'); // Alterna a classe "active" na navbar
    });

    // Plan Buttons WhatsApp Integration
    const planButtons = document.querySelectorAll('.choose-plan');
    const phoneNumber = '+5511949470039'; // Substitua pelo número de telefone desejado

    planButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault(); // Evita o comportamento padrão do link

            const planValue = button.getAttribute('data-plan-value');
            const message = `Olá, estou interessado neste plano ${planValue}`;
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            window.open(whatsappURL, '_blank'); // Abre o link em uma nova aba
        });
    });

    // Carrossel de Parceiros
    const carousel = document.querySelector('.partners-carousel');
    let isDown = false;
    let startX;
    let scrollLeft;

    carousel.addEventListener('mousedown', (e) => {
        isDown = true;
        carousel.classList.add('active');
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isDown = false;
        carousel.classList.remove('active');
    });

    carousel.addEventListener('mouseup', () => {
        isDown = false;
        carousel.classList.remove('active');
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Ajuste a velocidade do deslizamento
        carousel.scrollLeft = scrollLeft - walk;
    });
});
