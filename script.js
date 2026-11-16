const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");
const productList = document.getElementById("product-list");
const productError = document.getElementById("product-error");

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

async function loadProducts() {
    try {
        const response = await fetch("products.json");

        if (!response.ok) {
            throw new Error("Datei konnte nicht geladen werden");
        }

        const products = await response.json();
        products.forEach((product) => {
            productList.appendChild(createProductCard(product));
        });
    } catch (error) {
        productError.textContent = "Die Produkte konnten nicht geladen werden.";
        console.error(error);
    }
}

loadProducts();