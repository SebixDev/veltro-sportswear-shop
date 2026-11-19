const CART_KEY = "veltro-cart";
const MAX_QUANTITY = 99;

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");
const productList = document.getElementById("product-list");
const productError = document.getElementById("product-error");
const filterButtons = document.querySelectorAll(".filter-btn");

const cartOpen = document.getElementById("cart-open");
const cartClose = document.getElementById("cart-close");
const cartDialog = document.getElementById("cart-dialog");
const cartItems = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartFoot = document.getElementById("cart-foot");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartClear = document.getElementById("cart-clear");

let allProducts = [];
let currentFilter = "Alle";
let cart = loadCart();

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

function loadCart() {
    try {
        const stored = JSON.parse(localStorage.getItem(CART_KEY));
        const cleaned = {};

        if (stored && typeof stored === "object" && !Array.isArray(stored)) {
            Object.entries(stored).forEach(([id, quantity]) => {
                if (Number.isInteger(quantity) && quantity > 0) {
                    cleaned[id] = Math.min(quantity, MAX_QUANTITY);
                }
            });
        }

        return cleaned;
    } catch (error) {
        return {};
    }
}

function saveCart() {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error(error);
    }
}

function getProduct(id) {
    return allProducts.find((product) => String(product.id) === String(id));
}

function updateCart() {
    saveCart();
    renderCart();
}

function addToCart(id) {
    const key = String(id);
    cart[key] = Math.min((cart[key] || 0) + 1, MAX_QUANTITY);
    updateCart();
}

function changeQuantity(id, change) {
    const next = (cart[id] || 0) + change;

    if (next <= 0) {
        delete cart[id];
    } else {
        cart[id] = Math.min(next, MAX_QUANTITY);
    }

    updateCart();
}

function removeFromCart(id) {
    delete cart[id];
    updateCart();
}

function clearCart() {
    cart = {};
    updateCart();
}

function pruneCart() {
    Object.keys(cart).forEach((id) => {
        if (!getProduct(id)) {
            delete cart[id];
        }
    });
    updateCart();
}

function createQuantityButton(label, action, productName) {
    const button = document.createElement("button");
    button.className = "qty-btn";
    button.type = "button";
    button.dataset.action = action;
    button.textContent = label;
    button.setAttribute(
        "aria-label",
        (action === "increase" ? "Menge erhöhen: " : "Menge verringern: ") + productName
    );
    return button;
}

function createCartItem(product, quantity) {
    const item = document.createElement("li");
    item.className = "cart-item";
    item.dataset.id = String(product.id);

    const main = document.createElement("div");
    main.className = "cart-item-main";

    const name = document.createElement("p");
    name.className = "cart-item-name";
    name.textContent = product.name;

    const unitPrice = document.createElement("p");
    unitPrice.className = "cart-item-price";
    unitPrice.textContent = formatPrice(product.price) + " pro Stück";

    const controls = document.createElement("div");
    controls.className = "cart-qty";

    const value = document.createElement("span");
    value.className = "qty-value";
    value.textContent = String(quantity);

    controls.append(
        createQuantityButton("−", "decrease", product.name),
        value,
        createQuantityButton("+", "increase", product.name)
    );

    main.append(name, unitPrice, controls);

    const side = document.createElement("div");
    side.className = "cart-item-side";

    const lineTotal = document.createElement("p");
    lineTotal.className = "cart-line-total";
    lineTotal.textContent = formatPrice((Math.round(product.price * 100) * quantity) / 100);

    const remove = document.createElement("button");
    remove.className = "cart-remove";
    remove.type = "button";
    remove.dataset.action = "remove";
    remove.textContent = "Entfernen";
    remove.setAttribute("aria-label", product.name + " entfernen");

    side.append(lineTotal, remove);
    item.append(main, side);
    return item;
}

function renderCart() {
    const entries = Object.entries(cart);
    const totalQuantity = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
    let totalCents = 0;

    cartItems.replaceChildren();

    entries.forEach(([id, quantity]) => {
        const product = getProduct(id);

        if (!product) {
            return;
        }

        totalCents += Math.round(product.price * 100) * quantity;
        cartItems.appendChild(createCartItem(product, quantity));
    });

    cartCount.textContent = String(totalQuantity);
    cartTotal.textContent = formatPrice(totalCents / 100);
    cartEmpty.hidden = totalQuantity > 0;
    cartFoot.hidden = totalQuantity === 0;
}

cartOpen.addEventListener("click", () => {
    cartDialog.showModal();
});

cartClose.addEventListener("click", () => {
    cartDialog.close();
});

cartDialog.addEventListener("click", (event) => {
    if (event.target === cartDialog) {
        cartDialog.close();
    }
});

cartClear.addEventListener("click", clearCart);

cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) {
        return;
    }

    const id = button.closest(".cart-item").dataset.id;

    if (button.dataset.action === "increase") {
        changeQuantity(id, 1);
    } else if (button.dataset.action === "decrease") {
        changeQuantity(id, -1);
    } else if (button.dataset.action === "remove") {
        removeFromCart(id);
    }
});

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

    const addButton = document.createElement("button");
    addButton.className = "add-btn";
    addButton.type = "button";
    addButton.textContent = "In den Warenkorb";
    addButton.setAttribute("aria-label", product.name + " in den Warenkorb legen");
    addButton.addEventListener("click", () => addToCart(product.id));

    card.append(image, name, category, price, addButton);
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
        pruneCart();
        renderProducts();
    } catch (error) {
        productError.textContent = "Die Produkte konnten nicht geladen werden.";
        console.error(error);
    }
}

renderCart();
loadProducts();