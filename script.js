
// ==============================
// BE AWESOME - MAIN JAVASCRIPT
// ==============================

// MOBILE MENU

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("show");

    const icon = menuToggle.querySelector("i");

    icon.classList.toggle("bi-list");
    icon.classList.toggle("bi-x-lg");
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("show");

        const icon = menuToggle.querySelector("i");
        icon.classList.add("bi-list");
        icon.classList.remove("bi-x-lg");
    });
});


// PRODUCT IMAGE SLIDERS

document.querySelectorAll(".product-card").forEach(card => {

    const slider = card.querySelector(".product-slider");
    const images = slider.querySelectorAll("img");

    const prevButton = card.querySelector(".prev");
    const nextButton = card.querySelector(".next");
    const counter = card.querySelector(".slider-counter");

    let currentIndex = 0;
    let startX = 0;
    let endX = 0;
    let isDragging = false;

    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;

        counter.textContent =
            `${String(currentIndex + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    }

    function nextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        updateSlider();
    }

    function previousImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateSlider();
    }

    nextButton.addEventListener("click", nextImage);
    prevButton.addEventListener("click", previousImage);

    // Touch / Mobile Swipe

    slider.addEventListener("touchstart", event => {
        startX = event.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", event => {
        endX = event.changedTouches[0].clientX;

        const difference = startX - endX;

        if (Math.abs(difference) > 40) {
            difference > 0 ? nextImage() : previousImage();
        }
    }, { passive: true });

    // Mouse Drag

    slider.addEventListener("mousedown", event => {
        startX = event.clientX;
        isDragging = true;
    });

    slider.addEventListener("mouseup", event => {
        if (!isDragging) return;

        endX = event.clientX;
        isDragging = false;

        const difference = startX - endX;

        if (Math.abs(difference) > 40) {
            difference > 0 ? nextImage() : previousImage();
        }
    });

    slider.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    updateSlider();

});


// FAVORITES

document.querySelectorAll(".product-favorite").forEach(button => {

    button.addEventListener("click", () => {

        button.classList.toggle("liked");

        const icon = button.querySelector("i");

        if (button.classList.contains("liked")) {
            icon.classList.remove("bi-heart");
            icon.classList.add("bi-heart-fill");
        } else {
            icon.classList.remove("bi-heart-fill");
            icon.classList.add("bi-heart");
        }

    });

});


// PRODUCT COLORS

document.querySelectorAll(".product-colors").forEach(colorGroup => {

    colorGroup.querySelectorAll(".color-dot").forEach(color => {

        color.addEventListener("click", () => {

            colorGroup.querySelectorAll(".color-dot").forEach(dot => {
                dot.classList.remove("active");
            });

            color.classList.add("active");

            const card = color.closest(".product-card");
            card.dataset.color = color.getAttribute("aria-label");

        });

    });

});


// NEWSLETTER DEMO

document.getElementById("newsletterForm").addEventListener("submit", event => {

    event.preventDefault();

    const email = event.target.querySelector("input").value;

    alert("Obrigado pelo teu interesse na BE AWESOME!");

    console.log("Email registado para demonstração:", email);

    event.target.reset();

});


// HEADER SCROLL EFFECT

window.addEventListener("scroll", () => {

    const header = document.querySelector(".main-header");

    if (window.scrollY > 30) {
        header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
    } else {
        header.style.boxShadow = "none";
    }

});







/* =================================
   BE AWESOME - SHOPPING CART
================================= */

const WHATSAPP_NUMBER = "258845725879";

let cart = JSON.parse(localStorage.getItem("beAwesomeCart")) || [];

const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");

function formatPrice(price) {
    return price.toLocaleString("pt-MZ") + " MT";
}

function saveCart() {
    localStorage.setItem("beAwesomeCart", JSON.stringify(cart));
}

function updateCart() {
    const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCount.textContent = quantity;
    cartTotal.textContent = formatPrice(total);

    if (!cart.length) {
        cartItems.innerHTML =
            '<p class="empty-cart">O teu carrinho está vazio.</p>';
        saveCart();
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Cor: ${item.color}</p>
                <strong>${formatPrice(item.price)}</strong>

                <div class="cart-quantity">
                    <button data-action="decrease" data-index="${index}">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="increase" data-index="${index}">+</button>
                </div>

                <button class="remove-cart-item"
                    data-action="remove" data-index="${index}">
                    Remover
                </button>
            </div>
        </div>
    `).join("");

    saveCart();
}

/* ADICIONAR PRODUTO */

document.querySelectorAll(".add-cart-button").forEach(button => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");

        const name = card.dataset.name;
        const price = Number(card.dataset.price);
        const color = card.dataset.color;
        const image = card.querySelector(".product-slider img").getAttribute("src");

        const existing = cart.find(item =>
            item.name === name && item.color === color
        );

        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ name, price, color, image, quantity: 1 });
        }

        updateCart();

        const original = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check2"></i> ADICIONADO';

        setTimeout(() => {
            button.innerHTML = original;
        }, 1200);
    });
});

/* ALTERAR QUANTIDADE E REMOVER */

cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === "increase") cart[index].quantity++;

    if (action === "decrease") {
        cart[index].quantity--;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    }

    if (action === "remove") cart.splice(index, 1);

    updateCart();
});

/* ABRIR E FECHAR */

function openCart() {
    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

/* FINALIZAR PELO WHATSAPP */

document.getElementById("checkoutButton").addEventListener("click", () => {
    if (!cart.length) {
        alert("O teu carrinho está vazio!");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    let message = "Olá BE AWESOME! Gostaria de fazer uma encomenda:\n\n";

    cart.forEach(item => {
        message +=
            `Produto: ${item.name}\n` +
            `Cor: ${item.color}\n` +
            `Quantidade: ${item.quantity}\n` +
            `Preço unitário: ${formatPrice(item.price)}\n` +
            `Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `TOTAL: ${formatPrice(total)}\n\n`;
    message += "Gostaria de confirmar a disponibilidade da encomenda.";

    const url = `https://wa.me/${258845725879}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
});

/* INICIALIZAR */

updateCart();














// ==========================================
// BE AWESOME - LIGHTBOX PRODUTOS + GALERIA
// ==========================================

const lightbox = document.getElementById("imageLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCounter = document.getElementById("lightboxCounter");

const closeLightbox = document.getElementById("lightboxClose");
const prevLightbox = document.getElementById("lightboxPrev");
const nextLightbox = document.getElementById("lightboxNext");

let currentLightboxImages = [];
let currentLightboxIndex = 0;
let previousOverflow = "";

// VERIFICAR ELEMENTOS
if (
    lightbox &&
    lightboxImage &&
    lightboxCounter &&
    closeLightbox &&
    prevLightbox &&
    nextLightbox
) {

    // ATUALIZAR IMAGEM
    function updateLightbox() {

        if (!currentLightboxImages.length) return;

        lightboxImage.src = currentLightboxImages[currentLightboxIndex];

        lightboxCounter.textContent =
            `${String(currentLightboxIndex + 1).padStart(2, "0")} / ${String(currentLightboxImages.length).padStart(2, "0")}`;

    }

    // ABRIR LIGHTBOX
    function openLightbox(images, index) {

        if (!images.length) return;

        currentLightboxImages = images;
        currentLightboxIndex = index;

        previousOverflow = document.body.style.overflow;

        updateLightbox();

        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";

    }

    // FECHAR LIGHTBOX
    function closeImageLightbox() {

        lightbox.classList.remove("active");

        document.body.style.overflow = previousOverflow;

        lightboxImage.src = "";
        currentLightboxImages = [];

    }

    // PRÓXIMA IMAGEM
    function nextImageLightbox() {

        if (!currentLightboxImages.length) return;

        currentLightboxIndex =
            (currentLightboxIndex + 1) % currentLightboxImages.length;

        updateLightbox();

    }

    // IMAGEM ANTERIOR
    function previousImageLightbox() {

        if (!currentLightboxImages.length) return;

        currentLightboxIndex =
            (currentLightboxIndex - 1 + currentLightboxImages.length) %
            currentLightboxImages.length;

        updateLightbox();

    }

    // IDENTIFICAR CLIQUES NOS PRODUTOS E NA GALERIA
    document.addEventListener("click", function(event) {

        const clickedImage = event.target.closest(
            ".product-slider img, .gallery-grid img"
        );

        if (!clickedImage) return;

        let images = [];
        let selectedIndex = 0;

        // FOTOGRAFIAS DOS PRODUTOS
        const productCard = clickedImage.closest(".product-card");

        if (productCard) {

            const productImages = productCard.querySelectorAll(
                ".product-slider img"
            );

            images = Array.from(productImages).map(img =>
                img.currentSrc || img.src
            );

            selectedIndex = Array.from(productImages).indexOf(clickedImage);

        }

        // FOTOGRAFIAS DA GALERIA
        else {

            const gallery = clickedImage.closest(".gallery-grid");

            if (!gallery) return;

            const galleryImages = gallery.querySelectorAll(
                ".gallery-item img"
            );

            images = Array.from(galleryImages).map(img =>
                img.currentSrc || img.src
            );

            selectedIndex = Array.from(galleryImages).indexOf(clickedImage);

        }

        if (selectedIndex < 0) return;

        openLightbox(images, selectedIndex);

    }, true);

    // BOTÕES DE NAVEGAÇÃO
    closeLightbox.addEventListener("click", closeImageLightbox);

    nextLightbox.addEventListener("click", nextImageLightbox);

    prevLightbox.addEventListener("click", previousImageLightbox);

    // FECHAR AO CLICAR NO FUNDO
    lightbox.addEventListener("click", function(event) {

        if (event.target === lightbox) {
            closeImageLightbox();
        }

    });

    // TECLADO
    document.addEventListener("keydown", function(event) {

        if (!lightbox.classList.contains("active")) return;

        if (event.key === "Escape") {
            closeImageLightbox();
        }

        if (event.key === "ArrowRight") {
            nextImageLightbox();
        }

        if (event.key === "ArrowLeft") {
            previousImageLightbox();
        }

    });

    // DESLIZAR NO TELEMÓVEL
    let touchStartX = 0;

    lightbox.addEventListener("touchstart", function(event) {

        touchStartX = event.touches[0].clientX;

    }, { passive: true });

    lightbox.addEventListener("touchend", function(event) {

        const touchEndX = event.changedTouches[0].clientX;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > 50) {

            if (difference > 0) {
                nextImageLightbox();
            } else {
                previousImageLightbox();
            }

        }

    }, { passive: true });

}
