const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");
const productList = document.getElementById("product-list");
const productError = document.getElementById("product-error");
const filterButtons = document.querySelectorAll(".filter-btn");

let allProducts = [];
let currentFilter = "Alle";

function closeMenu() {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
        closeMenu();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMenu();
    }
});

function formatPrice(price) {
    return price.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}

function createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("div");
    image.className = "product-image";

    const name = document.createElement("h3");
    name.className = "product-name";
    name.textContent = product.name;

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = formatPrice(product.price);

    card.append(image, name, category, price);
    return card;
}

function updateFilterButtons() {
    filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === currentFilter;
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function renderProducts() {
    const visibleProducts = currentFilter === "Alle"
        ? allProducts
        : allProducts.filter((product) => product.category === currentFilter);

    productList.replaceChildren();

    if (visibleProducts.length === 0 && allProducts.length > 0) {
        const empty = document.createElement("p");
        empty.className = "product-empty";
        empty.textContent = "In dieser Kategorie gibt es noch keine Produkte.";
        productList.appendChild(empty);
        return;
    }

    visibleProducts.forEach((product) => {
        productList.appendChild(createProductCard(product));
    });
}

function setFilter(filter) {
    currentFilter = filter;
    updateFilterButtons();
    renderProducts();
}

document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-filter]");

    if (trigger) {
        setFilter(trigger.dataset.filter);
    }
});

async function loadProducts() {
    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Datei konnte nicht geladen werden");
        }

        allProducts = await response.json();
        renderProducts();
    } catch (error) {
        productError.textContent = "Die Produkte konnten nicht geladen werden.";
        console.error(error);
    }
}

loadProducts();