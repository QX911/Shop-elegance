// script.js

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
  }
}

// عرض المنتجات مع فلترة وبحث
function displayProducts(productsToShow) {
  const container = document.getElementById("products-grid");
  if (!container) return;
  container.innerHTML = "";

  if (productsToShow.length === 0) {
    container.innerHTML = "<p>لا توجد منتجات.</p>";
    return;
  }

  productsToShow.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.price} ريال</p>
        <p class="product-description">${product.description}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">أضف للسلة</button>
        <button class="add-to-cart-btn" style="background:#444;margin-top:5px;" onclick="goToProduct(${product.id})">التفاصيل</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// توجه لصفحة تفاصيل المنتج
function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

// إضافة منتج للسلة
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const cartItem = cart.find(item => item.id === id);
  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  saveCart();
  alert("تمت إضافة المنتج للسلة");
}

// عرض تفاصيل المنتج في صفحة product.html
function displayProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const product = products.find(p => p.id === id);

  if (!product) {
    container.innerHTML = "<p>المنتج غير موجود.</p>";
    return;
  }

  container.innerHTML = `
    <div class="product-card" style="max-width:600px; margin:auto;">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-info">
        <h2 class="product-name">${product.name}</h2>
        <p class="product-price">${product.price} ريال</p>
        <p class="product-description">${product.description}</p>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">أضف للسلة</button>
      </div>
    </div>
  `;
}

// عرض محتويات السلة في صفحة cart.html
function displayCart() {
  const container = document.getElementById("cart-items");
  const totalContainer = document.getElementById("cart-total");
  if (!container || !totalContainer) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>سلة المشتريات فارغة.</p>";
    totalContainer.textContent = "";
    return;
  }

  let totalPrice = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;

    const itemTotal = product.price * item.quantity;
    totalPrice += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div class="cart-item-details">
        <p class="cart-item-name">${product.name}</p>
        <p class="cart-item-price">${product.price} ريال × ${item.quantity} = ${itemTotal} ريال</p>
        <div class="cart-item-quantity">
          <button onclick="changeQuantity(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity(${item.id}, 1)">+</button>
        </div>
      </div>
    `;
    container.appendChild(cartItem);
  });

  totalContainer.textContent = `الإجمالي: ${totalPrice} ريال`;
}

// تغيير كمية منتج في السلة
function changeQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
  displayCart();
}

// تفريغ السلة
function clearCart() {
  if (confirm("هل تريد تفريغ سلة المشتريات؟")) {
    cart = [];
    saveCart();
    displayCart();
  }
}

// فلترة المنتجات حسب الفئة
function filterProducts(category) {
  let filtered = category === "الكل" ? products : products.filter(p => p.category === category);
  const searchText = document.getElementById("search")?.value.trim().toLowerCase() || "";
  if (searchText) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchText) || p.description.toLowerCase().includes(searchText));
  }
  displayProducts(filtered);
}

// البحث الحي عند كتابة في مربع البحث
function setupSearch() {
  const searchInput = document.getElementById("search");
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const activeCategoryBtn = document.querySelector(".filter-btn.active");
    const category = activeCategoryBtn ? activeCategoryBtn.dataset.category : "الكل";
    filterProducts(category);
  });
}

// إعداد أزرار الفلترة
function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filterProducts(btn.dataset.category);
    });
  });
}

// التهيئة العامة حسب الصفحة
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  if (document.getElementById("products-grid")) {
    // صفحة الرئيسية
    setupFilters();
    setupSearch();
    filterProducts("الكل");
  }

  if (document.getElementById("product-detail")) {
    // صفحة تفاصيل المنتج
    displayProductDetail();
    updateCartCount();
  }

  if (document.getElementById("cart-items")) {
    // صفحة السلة
    displayCart();
    document.getElementById("clear-cart")?.addEventListener("click", clearCart);
    updateCartCount();
  }
});
