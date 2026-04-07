/* ============================================
   CRUMB & CHEESE — Main Script
   ============================================ */

// ── State ──────────────────────────────────────
let allProducts = [];
let storeData   = {};
let activeCategory = '';
let searchQuery    = '';
let modalQty       = 1;
let currentProduct = null;

// ── DOM References ─────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const productsGrid   = $('#products-grid');
const categoryFilters = $('#category-filters');
const searchInput    = $('#search-input');
const loadingSpinner = $('#loading-spinner');

const cartBtn     = $('#cart-btn');
const cartBadge   = $('#cart-badge');
const cartSidebar = $('#cart-sidebar');
const cartOverlay = $('#cart-overlay');
const cartItems   = $('#cart-items');
const cartEmpty   = $('#cart-empty');
const cartFooter  = $('#cart-footer');
const cartTotal   = $('#cart-total');
const cartClose   = $('#cart-close');
const checkoutBtn = $('#checkout-btn');

const productModal = $('#product-modal');
const modalClose   = $('#modal-close');
const modalImage   = $('#modal-image');
const modalName    = $('#modal-name');
const modalDesc    = $('#modal-desc');
const modalPrice   = $('#modal-price');
const modalTag     = $('#modal-tag');
const modalVariant = $('#modal-variant');
const modalQtyVal  = $('#modal-qty-value');
const modalQtyPlus = $('#modal-qty-plus');
const modalQtyMinus = $('#modal-qty-minus');
const modalEgglessWrap = $('#modal-eggless-wrap');
const modalEggless     = $('#modal-eggless');
const modalMessageWrap = $('#modal-message-wrap');
const modalMessage     = $('#modal-message');
const modalAddCart     = $('#modal-add-cart');

const checkoutModal  = $('#checkout-modal');
const checkoutClose  = $('#checkout-close');
const checkoutForm   = $('#checkout-form');
const checkoutStep1  = $('#checkout-step-1');
const checkoutStep2  = $('#checkout-step-2');
const checkoutStep3  = $('#checkout-step-3');
const paymentTotal   = $('#payment-total');
const paymentQR      = $('#payment-qr');
const gpayLink       = $('#gpay-link');
const paymentDoneBtn = $('#payment-done-btn');
const confirmClose   = $('#confirmation-close');

const aboutText    = $('#about-text');
const contactCards = $('#contact-cards');
const toastContainer = $('#toast-container');

// ── Toast Notifications ───────────────────────
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="toast__msg">${message}</span>
  `;
  toastContainer.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, duration);
}

// ── Number Formatting ─────────────────────────
function formatPrice(amount) {
  const currency = storeData.currency || '₹';
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

// ── FormSubmit.co Email ───────────────────────
// No initialization needed — FormSubmit works via simple POST
// Config is in email-config.js (just the target email)
function getFormSubmitURL() {
  const email = (typeof FORMSUBMIT_EMAIL !== 'undefined' && FORMSUBMIT_EMAIL)
    ? FORMSUBMIT_EMAIL
    : 'vineshcool1990@gmail.com';
  return `https://formsubmit.co/ajax/${email}`;
}

// ── Cart (LocalStorage) ───────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('cnc_cart')) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('cnc_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  cartBadge.textContent = count;
  // Hide badge when empty
  cartBadge.style.display = count > 0 ? 'flex' : 'none';
  if (count > 0) {
    cartBadge.classList.add('bounce');
    setTimeout(() => cartBadge.classList.remove('bounce'), 500);
  }
}

function addToCart(item) {
  const cart = getCart();
  // Check if same product + variant exists
  const idx = cart.findIndex(c =>
    c.productId === item.productId &&
    c.variant === item.variant &&
    c.eggless === item.eggless &&
    c.cakeMessage === item.cakeMessage
  );
  if (idx >= 0) {
    cart[idx].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartSidebar();
}

function updateCartItemQty(index, delta) {
  const cart = getCart();
  cart[index].quantity += delta;
  if (cart[index].quantity < 1) cart.splice(index, 1);
  saveCart(cart);
  renderCartSidebar();
}

// ── JSON Loader ───────────────────────────────
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Failed to load products');
    storeData = await res.json();
    allProducts = storeData.products || [];
    renderCategoryFilters();
    renderProducts();
    renderAbout();
    renderContact();
    loadingSpinner.classList.add('hidden');
  } catch (err) {
    loadingSpinner.innerHTML = `<p style="color:var(--clr-danger);">Could not load products. Please refresh the page.</p>`;
    console.error(err);
  }
}

// ── Render Category Filters ───────────────────
function renderCategoryFilters() {
  const cats = storeData.categories || [];
  if (!activeCategory && cats.length > 0) activeCategory = cats[0];
  categoryFilters.innerHTML = cats.map(c =>
    `<button class="filter-pill${c === activeCategory ? ' active' : ''}" data-cat="${c}">${c}</button>`
  ).join('');

  categoryFilters.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-pill')) return;
    activeCategory = e.target.dataset.cat;
    $$('.filter-pill').forEach(p => p.classList.remove('active'));
    e.target.classList.add('active');
    renderProducts();
  });
}

// ── Render Products Grid ──────────────────────
function renderProducts() {
  const filtered = allProducts.filter(p => {
    if (!p.available) return false;
    const matchCat = p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = `<p style="text-align:center;grid-column:1/-1;padding:2rem;color:var(--clr-brown-light);">No items found.</p>`;
    return;
  }

  productsGrid.innerHTML = filtered.map(p => {
    const soldOut = p.qty <= 0;
    const badgeHTML = p.tags && p.tags.length > 0
      ? `<span class="product-card__badge product-card__badge--${p.tags[0]}">${p.tags[0]}</span>`
      : '';
    const soldOutHTML = soldOut
      ? `<div class="product-card__sold-out">Sold Out</div>`
      : '';
    const currency = storeData.currency || '₹';

    // Build variant toggle pills
    const variantHTML = p.variants && p.variants.length > 0
      ? `<div class="card-variants" data-id="${p.id}">
          ${p.variants.map((v, i) => `<button class="card-variants__pill${i === 0 ? ' active' : ''}" data-idx="${i}" data-price="${v.price}" data-id="${p.id}">${v.label}</button>`).join('')}
         </div>`
      : '';

    const firstPrice = p.variants && p.variants.length > 0 ? p.variants[0].price : p.price;
    const showQtySelector = (p.category === 'Tarts' || p.category === 'Cupcakes');
    const qtyHTML = showQtySelector
      ? `<div class="card-qty" data-id="${p.id}">
            <button class="card-qty__btn card-qty__minus" data-id="${p.id}">−</button>
            <span class="card-qty__val" data-id="${p.id}">1</span>
            <button class="card-qty__btn card-qty__plus" data-id="${p.id}">+</button>
          </div>`
      : '';

    return `
      <div class="product-card" data-id="${p.id}">
        <div class="product-card__img-wrap">
          <img src="${p.image}" alt="${p.name}" class="product-card__img" loading="lazy" decoding="async" />
          ${badgeHTML}
          ${soldOutHTML}
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${p.name}</h3>
          <p class="product-card__price" data-id="${p.id}">${currency}${firstPrice}</p>
          ${variantHTML}
          ${qtyHTML}
          <div class="card-controls">
            <button class="card-add-btn add-cart-btn" data-id="${p.id}" ${soldOut ? 'disabled' : ''}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
              Add
            </button>
          </div>
        </div>
      </div>`;
  }).join('');

  // Helper: update displayed price based on variant + qty
  function updateCardPrice(id) {
    const currency = storeData.currency || '₹';
    const activePill = document.querySelector(`.card-variants__pill.active[data-id="${id}"]`);
    const qtyEl = document.querySelector(`.card-qty__val[data-id="${id}"]`);
    const priceEl = document.querySelector(`.product-card__price[data-id="${id}"]`);
    if (!priceEl) return;
    const unitPrice = activePill ? parseInt(activePill.dataset.price) : (allProducts.find(x => x.id === id)?.price || 0);
    const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
    priceEl.textContent = `${currency}${unitPrice * qty}`;
  }

  // Variant pill click → toggle active + update price
  $$('.card-variants__pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const id = pill.dataset.id;
      document.querySelectorAll(`.card-variants__pill[data-id="${id}"]`).forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      updateCardPrice(id);
    });
  });

  // Qty selector +/- for Tarts & Cupcakes
  $$('.card-qty__plus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const valEl = document.querySelector(`.card-qty__val[data-id="${id}"]`);
      let qty = parseInt(valEl.textContent) || 1;
      qty++;
      valEl.textContent = qty;
      updateCardPrice(id);
    });
  });

  $$('.card-qty__minus').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const valEl = document.querySelector(`.card-qty__val[data-id="${id}"]`);
      let qty = parseInt(valEl.textContent) || 1;
      if (qty > 1) qty--;
      valEl.textContent = qty;
      updateCardPrice(id);
    });
  });

  // Add to cart with selected variant and qty
  $$('.add-cart-btn').forEach(btn => btn.addEventListener('click', () => {
    const productId = btn.dataset.id;
    const p = allProducts.find(x => x.id === productId);
    if (!p || p.qty <= 0) return;

    const activePill = document.querySelector(`.card-variants__pill.active[data-id="${productId}"]`);
    const qtyEl = document.querySelector(`.card-qty__val[data-id="${productId}"]`);
    const qty = qtyEl ? parseInt(qtyEl.textContent) : 1;

    let variant, price;
    if (activePill && p.variants && p.variants.length > 0) {
      const idx = parseInt(activePill.dataset.idx);
      variant = p.variants[idx];
      price = variant.price;
    } else {
      variant = null;
      price = p.price;
    }

    addToCart({
      productId: p.id,
      name: p.name,
      image: p.image,
      variant: variant ? variant.label : 'Standard',
      price: price,
      quantity: qty,
      eggless: false,
      cakeMessage: ''
    });

    // Reset qty back to 1 after adding
    if (qtyEl) {
      qtyEl.textContent = '1';
      updateCardPrice(productId);
    }

    // Button feedback
    btn.classList.add('added');
    setTimeout(() => btn.classList.remove('added'), 1200);

    showToast(`${p.name} added to cart`);
  }));

  // Lazy image fade-in once loaded
  $$('.product-card__img').forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });
}

// ── Search (debounced) ────────────────────────
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = e.target.value.trim();
    renderProducts();
  }, 300);
});

// ── Quick Add (default variant, qty 1) ────────
function quickAddToCart(productId) {
  const p = allProducts.find(x => x.id === productId);
  if (!p || p.qty <= 0) return;

  const variant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
  addToCart({
    productId: p.id,
    name: p.name,
    image: p.image,
    variant: variant ? variant.label : 'Standard',
    price: variant ? variant.price : p.price,
    quantity: 1,
    eggless: false,
    cakeMessage: ''
  });

  // Button feedback
  const btn = document.querySelector(`.add-cart-btn[data-id="${productId}"]`);
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.background = 'var(--clr-success)';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1200);
  }

  showToast(`${p.name} added to cart`);
}

// ── Product Detail Modal ──────────────────────
function openProductModal(productId) {
  currentProduct = allProducts.find(x => x.id === productId);
  if (!currentProduct) return;

  const p = currentProduct;
  const currency = storeData.currency || '₹';

  modalImage.src = p.image;
  modalImage.alt = p.name;
  modalName.textContent = p.name;
  modalDesc.textContent = p.description || '';
  modalQty = 1;
  modalQtyVal.textContent = modalQty;

  // Tag
  if (p.tags && p.tags.length > 0) {
    modalTag.textContent = p.tags[0];
    modalTag.className = `modal__tag product-card__badge--${p.tags[0]}`;
    modalTag.style.display = 'inline-block';
  } else {
    modalTag.style.display = 'none';
  }

  // Variants
  modalVariant.innerHTML = (p.variants || []).map((v, i) =>
    `<option value="${i}">${v.label} — ${currency}${v.price}</option>`
  ).join('');
  updateModalPrice();

  // Customisation
  if (p.customizationOptions && p.customizationOptions.eggless) {
    modalEgglessWrap.style.display = 'block';
    modalEggless.checked = false;
  } else {
    modalEgglessWrap.style.display = 'none';
  }

  if (p.customizationOptions && p.customizationOptions.messageOnCake) {
    modalMessageWrap.style.display = 'block';
    modalMessage.value = '';
  } else {
    modalMessageWrap.style.display = 'none';
  }

  productModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateModalPrice() {
  if (!currentProduct) return;
  const currency = storeData.currency || '₹';
  const vi = parseInt(modalVariant.value) || 0;
  const variant = currentProduct.variants && currentProduct.variants[vi];
  const unitPrice = variant ? variant.price : currentProduct.price;
  modalPrice.textContent = `${currency}${unitPrice * modalQty}`;
}

modalVariant.addEventListener('change', updateModalPrice);

modalQtyPlus.addEventListener('click', () => {
  modalQty++;
  modalQtyVal.textContent = modalQty;
  updateModalPrice();
});

modalQtyMinus.addEventListener('click', () => {
  if (modalQty > 1) modalQty--;
  modalQtyVal.textContent = modalQty;
  updateModalPrice();
});

modalAddCart.addEventListener('click', () => {
  if (!currentProduct) return;
  const p = currentProduct;
  const vi = parseInt(modalVariant.value) || 0;
  const variant = p.variants && p.variants[vi];

  addToCart({
    productId: p.id,
    name: p.name,
    image: p.image,
    variant: variant ? variant.label : 'Standard',
    price: variant ? variant.price : p.price,
    quantity: modalQty,
    eggless: modalEggless.checked,
    cakeMessage: modalMessage.value.trim()
  });

  closeProductModal();

  // Brief feedback: open cart sidebar so user sees the item
  setTimeout(() => openCart(), 350);
  showToast(`${p.name} added to cart`);
});

function closeProductModal() {
  productModal.classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
}

modalClose.addEventListener('click', closeProductModal);
productModal.addEventListener('click', (e) => { if (e.target === productModal) closeProductModal(); });

// ── Cart Sidebar ──────────────────────────────
function openCart() {
  renderCartSidebar();
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ── Cart Clear ────────────────────────────────
const cartClear = $('#cart-clear');
cartClear.addEventListener('click', () => {
  if (getCart().length === 0) return;
  if (confirm('Remove all items from cart?')) {
    localStorage.removeItem('cnc_cart');
    updateCartBadge();
    renderCartSidebar();
    showToast('Cart cleared', 'info');
  }
});

function renderCartSidebar() {
  const cart = getCart();
  const currency = storeData.currency || '₹';

  if (cart.length === 0) {
    cartItems.innerHTML = '';
    cartEmpty.classList.add('show');
    cartFooter.style.display = 'none';
    return;
  }

  cartEmpty.classList.remove('show');
  cartFooter.style.display = 'block';

  let total = 0;
  cartItems.innerHTML = cart.map((item, i) => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;
    const extras = [];
    if (item.eggless) extras.push('Eggless');
    if (item.cakeMessage) extras.push(`"${item.cakeMessage}"`);

    return `
      <div class="cart-item" style="animation: cartItemSlide 0.3s ease ${i * 0.05}s both;">
        <img src="${item.image}" alt="${item.name}" class="cart-item__img" />
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__variant">${item.variant}</div>
          ${extras.length ? `<div class="cart-item__extras">${extras.join(' · ')}</div>` : ''}
          <div class="cart-item__bottom">
            <div class="cart-item__qty">
              <button onclick="updateCartItemQty(${i}, -1)">−</button>
              <span>${item.quantity}</span>
              <button onclick="updateCartItemQty(${i}, 1)">+</button>
            </div>
            <span class="cart-item__price">${formatPrice(lineTotal)}</span>
          </div>
          <div class="cart-item__remove" onclick="removeFromCart(${i})">Remove</div>
        </div>
      </div>`;
  }).join('');

  cartTotal.textContent = formatPrice(total);
}

// ── Checkout Flow ─────────────────────────────
checkoutBtn.addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) return;
  closeCart();
  openCheckout();
});

function openCheckout() {
  checkoutStep1.style.display = 'block';
  checkoutStep2.style.display = 'none';
  checkoutStep3.style.display = 'none';
  checkoutModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Set min date to tomorrow (orders require 24 hours)
  // Use local date parts to avoid UTC timezone shift
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  const minDate = `${y}-${m}-${d}`;
  const dateInput = $('#cust-date');
  dateInput.setAttribute('min', minDate);
  dateInput.value = minDate;

  // Enforce min date if user bypasses the picker
  dateInput.addEventListener('change', function () {
    if (this.value < minDate) {
      this.value = minDate;
      showToast('Delivery requires at least 24 hours. Date set to earliest available.', 'error');
    }
  });
}

function closeCheckout() {
  checkoutModal.classList.remove('open');
  document.body.style.overflow = '';
}

checkoutClose.addEventListener('click', closeCheckout);
checkoutModal.addEventListener('click', (e) => { if (e.target === checkoutModal) closeCheckout(); });

// Step 1 → Step 2
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Basic validation
  const name    = $('#cust-name').value.trim();
  const phone   = $('#cust-phone').value.trim();
  const address = $('#cust-address').value.trim();
  const date    = $('#cust-date').value;

  let valid = true;
  $$('.checkout-form input, .checkout-form textarea').forEach(el => el.classList.remove('invalid'));

  if (!name)    { $('#cust-name').classList.add('invalid'); valid = false; }
  if (!phone)   { $('#cust-phone').classList.add('invalid'); valid = false; }
  if (!address) { $('#cust-address').classList.add('invalid'); valid = false; }
  if (!date) {
    $('#cust-date').classList.add('invalid'); valid = false;
  } else {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const minVal = `${tmr.getFullYear()}-${String(tmr.getMonth() + 1).padStart(2, '0')}-${String(tmr.getDate()).padStart(2, '0')}`;
    if (date < minVal) {
      $('#cust-date').classList.add('invalid');
      showToast('Delivery requires at least 24 hours. Please select a future date.', 'error');
      valid = false;
    }
  }

  if (!valid) {
    showToast('Please fill all required fields correctly', 'error');
    return;
  }

  // Show payment step
  const cart = getCart();
  const currency = storeData.currency || '₹';
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  paymentTotal.textContent = formatPrice(total);

  // Render order summary
  const orderSummary = $('#order-summary');
  orderSummary.innerHTML = `
    <h3 class="order-summary__title">Order Summary</h3>
    <div class="order-summary__items">
      ${cart.map(item => {
        const extras = [];
        if (item.eggless) extras.push('Eggless');
        if (item.cakeMessage) extras.push(`"${item.cakeMessage}"`);
        return `<div class="order-summary__row">
          <span>${item.name} (${item.variant}) ×${item.quantity}
            ${extras.length ? `<small>${extras.join(', ')}</small>` : ''}
          </span>
          <span>${formatPrice(item.price * item.quantity)}</span>
        </div>`;
      }).join('')}
    </div>
    <div class="order-summary__total">
      <strong>Total</strong>
      <strong>${formatPrice(total)}</strong>
    </div>
  `;

  // Generate UPI link
  const upiId = storeData.upiId || '22harshu-1@okhdfcbank';
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeData.storeName || 'Crumb & Cheese')}&am=${total}&cu=INR`;
  gpayLink.href = upiLink;

  // Populate mobile UPI amount
  const gpayAmountEl = $('#gpay-amount');
  if (gpayAmountEl) gpayAmountEl.textContent = total.toLocaleString('en-IN');

  // Mobile vs Desktop detection
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
  const mobileSection = $('#payment-mobile');
  const desktopSection = $('#payment-desktop');

  if (mobileSection && desktopSection) {
    if (isMobile) {
      // Mobile: show UPI button prominently, QR smaller as fallback
      mobileSection.style.display = 'block';
      desktopSection.style.display = 'block';
      desktopSection.classList.add('payment-desktop--secondary');
    } else {
      // Desktop: show QR prominently, UPI link as copy-able text
      mobileSection.style.display = 'none';
      desktopSection.style.display = 'block';
      desktopSection.classList.remove('payment-desktop--secondary');
    }
  }

  // Static QR code image (QRScanner.jpeg) is used instead of dynamic generation

  checkoutStep1.style.display = 'none';
  checkoutStep2.style.display = 'block';
});

// Back button: Step 2 → Step 1
const paymentBackBtn = $('#payment-back-btn');
paymentBackBtn.addEventListener('click', () => {
  checkoutStep2.style.display = 'none';
  checkoutStep1.style.display = 'block';
});

// Step 2 → Step 3 (Send Email via FormSubmit.co)
let lastOrderParams = null;  // stored for retry

paymentDoneBtn.addEventListener('click', async () => {
  const cart = getCart();
  const currency = storeData.currency || '₹';
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  // Format the delivery date nicely
  const rawDate = $('#cust-date').value;
  const deliveryDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : rawDate;

  const orderItems = cart.map((item, i) => {
    const extras = [];
    if (item.eggless) extras.push('Eggless');
    if (item.cakeMessage) extras.push(`Message: "${item.cakeMessage}"`);
    return `${i + 1}. ${item.name} (${item.variant}) x${item.quantity} — ${currency}${item.price * item.quantity}${extras.length ? ' [' + extras.join(', ') + ']' : ''}`;
  }).join('\n');

  const orderTime = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  // FormSubmit.co payload
  const formData = {
    _subject: `🧁 New Order from ${$('#cust-name').value.trim()} — Crumb & Cheese`,
    _template: 'table',
    'Customer Name':       $('#cust-name').value.trim(),
    'Phone':               $('#cust-phone').value.trim(),
    'Email':               $('#cust-email').value.trim() || 'Not provided',
    'Delivery Address':    $('#cust-address').value.trim(),
    'Delivery Date':       deliveryDate,
    'Special Instructions': $('#cust-notes').value.trim() || 'None',
    'Order Items':         orderItems,
    'Total Amount':        formatPrice(total),
    'Transaction ID':      $('#txn-id').value.trim() || 'Not provided',
    'Order Time':          orderTime
  };

  // Store for retry
  lastOrderParams = formData;

  paymentDoneBtn.textContent = 'Sending...';
  paymentDoneBtn.disabled = true;

  try {
    const res = await fetch(getFormSubmitURL(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await res.json();

    if (result.success) {
      console.log('✅ Order email sent via FormSubmit.co');
      localStorage.removeItem('cnc_cart');
      updateCartBadge();
      checkoutStep2.style.display = 'none';
      checkoutStep3.style.display = 'block';
      showToast('Order placed successfully! 🎉');
    } else {
      throw new Error(result.message || 'FormSubmit returned an error');
    }

  } catch (err) {
    console.error('Email send failed:', err);
    showToast('Could not send confirmation — see options below', 'error', 5000);

    // Build a mailto fallback link
    const subject = encodeURIComponent(`New Order — ${formData['Customer Name']}`);
    const body = encodeURIComponent(
      `Order from Crumb & Cheese Website\n\n` +
      `Customer: ${formData['Customer Name']}\n` +
      `Phone: ${formData['Phone']}\n` +
      `Email: ${formData['Email']}\n` +
      `Address: ${formData['Delivery Address']}\n` +
      `Delivery Date: ${formData['Delivery Date']}\n` +
      `Special Instructions: ${formData['Special Instructions']}\n\n` +
      `Order Items:\n${formData['Order Items']}\n\n` +
      `Total: ${formData['Total Amount']}\n` +
      `Transaction ID: ${formData['Transaction ID']}`
    );
    const mailtoLink = `mailto:vineshcool1990@gmail.com?subject=${subject}&body=${body}`;

    // Show fallback UI with retry + manual email option
    checkoutStep2.innerHTML = `
      <div class="checkout-step" style="padding:2rem;text-align:center;">
        <h2 class="modal__title">Almost done!</h2>
        <p style="margin-bottom:1rem;color:var(--clr-brown-light);">
          Payment received, but we couldn't send the automated confirmation.<br>
          Please try again or email us directly.
        </p>
        <button class="btn btn--primary" id="retry-email-btn" style="margin-bottom:0.8rem;width:100%;">🔄 Retry Sending</button>
        <a href="${mailtoLink}" class="btn btn--outline" style="display:block;width:100%;text-align:center;">✉️ Email Us Directly</a>
        <button class="btn btn--outline" id="skip-email-btn" style="margin-top:0.8rem;width:100%;opacity:0.6;">Skip — I'll contact later</button>
      </div>
    `;

    // Retry button
    $('#retry-email-btn').addEventListener('click', async () => {
      if (!lastOrderParams) { showToast('No order data to retry', 'error'); return; }
      try {
        $('#retry-email-btn').textContent = 'Sending...';
        const retryRes = await fetch(getFormSubmitURL(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(lastOrderParams)
        });
        const retryResult = await retryRes.json();
        if (retryResult.success) {
          showToast('Order email sent! 🎉');
          localStorage.removeItem('cnc_cart');
          updateCartBadge();
          checkoutStep2.style.display = 'none';
          checkoutStep3.style.display = 'block';
        } else {
          throw new Error('Retry failed');
        }
      } catch (retryErr) {
        showToast('Still failing — please email us directly', 'error');
        $('#retry-email-btn').textContent = '🔄 Retry Sending';
      }
    });

    // Skip button
    $('#skip-email-btn').addEventListener('click', () => {
      localStorage.removeItem('cnc_cart');
      updateCartBadge();
      checkoutStep2.style.display = 'none';
      checkoutStep3.style.display = 'block';
      showToast('Order saved — please contact us to confirm', 'info');
    });

  } finally {
    paymentDoneBtn.textContent = "I've Completed Payment";
    paymentDoneBtn.disabled = false;
  }
});

// Confirmation close
confirmClose.addEventListener('click', () => {
  closeCheckout();
  checkoutForm.reset();
});

// ── Render About ──────────────────────────────
function renderAbout() {
  if (storeData.about) {
    aboutText.textContent = storeData.about;
  }
}

// ── Render Contact (Premium) ───────────────────
function renderContact() {
  const c = storeData.contact;
  if (!c) return;

  // SVG icons for each contact type
  const svgIcons = {
    email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="22,4 12,13 2,4"/></svg>`,
    phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
    location: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`
  };

  const cards = [];
  if (c.email) cards.push({ type: 'email', icon: svgIcons.email, label: 'Email', value: `<a href="mailto:${c.email}">${c.email}</a>` });
  if (c.phone) cards.push({ type: 'phone', icon: svgIcons.phone, label: 'Phone', value: `<a href="tel:${c.phone.replace(/\s/g,'')}">${c.phone}</a>` });
  if (c.instagram) cards.push({ type: 'instagram', icon: svgIcons.instagram, label: 'Instagram', value: `<a href="${c.instagram}" target="_blank" rel="noopener">@crumbandcheese</a>` });
  if (c.address) cards.push({ type: 'location', icon: svgIcons.location, label: 'Location', value: c.address });

  contactCards.innerHTML = cards.map((cd, i) =>
    `<div class="contact-card contact-card--${cd.type}" style="transition-delay: ${i * 0.12}s">
      <div class="contact-card__icon-ring">${cd.icon}</div>
      <div class="contact-card__label">${cd.label}</div>
      <div class="contact-card__value">${cd.value}</div>
    </div>`
  ).join('');

  // Stagger entrance animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  contactCards.querySelectorAll('.contact-card').forEach(card => observer.observe(card));
}

// ── Navbar Scroll Effect + Active Link ────────
const navSections = ['home', 'menu', 'about', 'contact'];
window.addEventListener('scroll', () => {
  const navbar = $('#navbar');
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  // Highlight active nav link based on scroll position
  let currentSection = '';
  navSections.forEach(id => {
    const section = document.getElementById(id);
    if (section && section.offsetTop - 120 <= window.scrollY) {
      currentSection = id;
    }
  });
  $$('.navbar__links a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
  });
});

// ── Scroll Reveal (IntersectionObserver) ──────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

// ── Keyboard support ──────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (checkoutModal.classList.contains('open')) closeCheckout();
    else if (productModal.classList.contains('open')) closeProductModal();
    else if (cartSidebar.classList.contains('open')) closeCart();
  }
});

// ── Init (single DOMContentLoaded) ────────────
document.addEventListener('DOMContentLoaded', () => {
  // Scroll reveal
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Close mobile nav on link click
  $$('.navbar__links a').forEach(link => {
    link.addEventListener('click', () => {
      const toggle = $('#nav-toggle');
      if (toggle) toggle.checked = false;
    });
  });

  // Boot
  updateCartBadge();
  loadProducts();
});
