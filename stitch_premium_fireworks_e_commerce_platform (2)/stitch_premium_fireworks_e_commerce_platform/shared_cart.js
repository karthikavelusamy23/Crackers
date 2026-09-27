// shared_cart.js
const CART_STORAGE_KEY = 'burstBoxCart';

function getCart() {
  try {
    const cartJson = localStorage.getItem(CART_STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart', e);
  }
}

// Global Cart & UI Helpers
window.addToCart = function(title, price, img) {
  if (typeof price === 'string') {
    price = parseFloat(price.replace(/,/g, ''));
  }
  const cart = getCart();
  const existingItem = cart.find(item => item.title === title);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      title,
      price: price || 0,
      qty: 1,
      img: img || "https://images.unsplash.com/photo-1533202931149-a29d89ddad78?auto=format&fit=crop&q=80&w=200&h=200"
    });
  }
  saveCart(cart);
  renderCart();
  
  if (typeof showToast === 'function') {
    showToast(title + ' added to Burst Box!');
  }
  
  // Open drawer if available
  if (typeof toggleCartDrawer === 'function') {
    toggleCartDrawer(true);
  } else if (typeof toggleCart === 'function') {
    toggleCart(true);
  } else if (typeof openDrawer === 'function') {
    openDrawer();
  }
};

window.updateQty = window.changeQty = window.updateItemQty = function(indexOrElement, delta) {
  const cart = getCart();
  let index = indexOrElement;
  if (typeof indexOrElement === 'object') {
     const itemEl = indexOrElement.closest('.cart-item');
     if (!itemEl) return;
     const title = itemEl.getAttribute('data-name');
     index = cart.findIndex(item => item.title === title);
  }

  if (index >= 0 && index < cart.length) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart(cart);
    renderCart();
  }
};

window.removeItem = window.removeCartItem = function(indexOrElement) {
  const cart = getCart();
  let index = indexOrElement;
  if (typeof indexOrElement === 'object') {
     const itemEl = indexOrElement.closest('.cart-item');
     if (!itemEl) return;
     const title = itemEl.getAttribute('data-name');
     index = cart.findIndex(item => item.title === title);
  }

  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
    if (typeof showToast === 'function') {
      showToast('Item removed from Burst Box');
    }
  }
};

window.renderCart = function() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = subtotal > 1000 ? 1000 : 0;
  const grandTotal = Math.max(0, subtotal - discount);

  // Confirmed order data (saved when payment is authorized)
  const confirmedOrderJson = localStorage.getItem('lastConfirmedOrder');
  const confirmedOrder = confirmedOrderJson ? JSON.parse(confirmedOrderJson) : (cart.length > 0 ? cart : []);
  const confSubtotal = confirmedOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const confDiscount = confSubtotal > 1000 ? 1000 : 0;
  const confGrandTotal = Math.max(0, confSubtotal - confDiscount);

  // Update badges and texts across various possible DOM IDs
  const countElements = ['cartBadge', 'headerCartCount', 'cartItemCountLabel', 'cart-badge-count', 'cart-count-display', 'mobileCartBadge'];
  countElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = totalCount;
  });

  const subtotalElements = ['cartSubtotal', 'checkout-subtotal'];
  subtotalElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '₹' + subtotal.toLocaleString('en-IN');
  });

  const totalElements = ['cartGrandTotal', 'checkout-grandtotal'];
  totalElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '₹' + grandTotal.toLocaleString('en-IN');
  });
  
  const discountElements = ['checkout-discount', 'cartDiscount'];
  discountElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '-₹' + discount.toLocaleString('en-IN');
  });
  
  // Confirmation Page totals
  const confSubtotalEl = document.getElementById('confirmation-subtotal');
  if (confSubtotalEl) confSubtotalEl.innerText = '₹' + confSubtotal.toLocaleString('en-IN');
  
  const confDiscountEl = document.getElementById('confirmation-discount');
  if (confDiscountEl) confDiscountEl.innerText = '-₹' + confDiscount.toLocaleString('en-IN');

  const confGrandTotalEl = document.getElementById('confirmation-grandtotal');
  if (confGrandTotalEl) confGrandTotalEl.innerText = '₹' + confGrandTotal.toLocaleString('en-IN');

  const crateCounter = document.getElementById('crate-counter');
  if (crateCounter) {
    crateCounter.innerText = totalCount + (totalCount === 1 ? ' CRATE' : ' CRATES');
  }

  // Render logic for different container types
  const checkoutList = document.getElementById('checkout-cart-item-list') || document.getElementById('cart-item-list');
  const drawerList = document.getElementById('cartItemsList') || document.getElementById('cartItemList');
  const confirmationList = document.getElementById('confirmation-cart-item-list');

  if (checkoutList && window.location.href.includes('billing_checkout')) {
    if (cart.length === 0) {
      checkoutList.innerHTML = `<div class="py-8 text-center text-[#365F56] font-sans text-sm">Your Burst Box is empty. <a href="../products_bright_pastel_festive_catalog/index.html" class="text-[#076653] font-bold underline ml-1">Explore Products</a></div>`;
    } else {
      checkoutList.innerHTML = cart.map((item, idx) => `
        <div class="py-4 space-y-3" id="cart-item-${idx}">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-grow min-w-0 pr-2">
              <h3 class="font-serif text-sm sm:text-base font-bold text-[#0C342C] break-words">${item.title}</h3>
            </div>
            <div class="text-right shrink-0">
              <span class="font-display text-base sm:text-lg font-bold text-[#076653] whitespace-nowrap">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div class="flex items-center justify-between pt-1 gap-2 flex-wrap">
            <div class="flex items-center gap-1 sm:gap-2 border border-[#E2FBCE] bg-white px-2 py-1 rounded">
              <span class="font-display text-[10px] sm:text-[11px] text-[#365F56] uppercase font-bold pr-1">Qty:</span>
              <button type="button" class="w-6 h-6 flex items-center justify-center bg-[#E2FBCE] hover:bg-[#076653] hover:text-white border border-[#E2FBCE] text-[#076653] font-bold text-sm leading-none transition-colors rounded" onclick="updateQty(${idx}, -1)" title="Decrease">−</button>
              <span class="font-display text-xs font-bold text-[#0C342C] px-1.5 sm:px-2">${item.qty}</span>
              <button type="button" class="w-6 h-6 flex items-center justify-center bg-[#E2FBCE] hover:bg-[#076653] hover:text-white border border-[#E2FBCE] text-[#076653] font-bold text-sm leading-none transition-colors rounded" onclick="updateQty(${idx}, 1)" title="Increase">+</button>
            </div>
            <button type="button" class="flex items-center gap-1 font-display text-xs font-bold text-[#076653] hover:text-red-600 uppercase tracking-wider transition-colors px-2 py-1" onclick="removeItem(${idx})">
              <span class="material-symbols-outlined text-sm" data-icon="delete">delete</span>
              <span>Remove</span>
            </button>
          </div>
        </div>
      `).join('');
    }
  } else if (confirmationList) {
    if (confirmedOrder.length === 0) {
      confirmationList.innerHTML = `<div class="py-8 text-center text-[#365F56] font-sans text-sm">Your order is empty.</div>`;
    } else {
      confirmationList.innerHTML = confirmedOrder.map((item, idx) => `
        <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-4 min-w-0">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-[#E2FBCE] flex items-center justify-center border border-[#E2FBCE] flex-shrink-0 text-[#076653]">
              <span class="material-symbols-outlined text-xl sm:text-2xl" data-icon="star">star</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] px-2 py-0.5 rounded bg-[#E2FBCE] text-[#076653] font-bold uppercase border border-[#076653]/30">FESTIVE ITEM</span>
                <h3 class="font-serif text-sm sm:text-base font-bold text-[#0C342C] break-words">${item.title}</h3>
              </div>
              <p class="text-xs text-[#365F56] mt-0.5">
                Ceremonial pyrotechnic assortment.
              </p>
              <p class="text-xs text-[#076653] mt-1 font-semibold">Quantity: ${item.qty} Unit(s) · Sivakasi Sealed</p>
            </div>
          </div>
          <div class="text-left sm:text-right sm:flex-shrink-0">
            <p class="text-base sm:text-xl text-[#076653] font-bold">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
          </div>
        </div>
      `).join('');
    }
  } else if (drawerList) {
    if (cart.length === 0) {
      drawerList.innerHTML = `
        <div class="text-center py-10 sm:py-12 text-[#365F56] px-4">
          <span class="material-symbols-outlined text-4xl sm:text-5xl text-[#076653] mb-2 block mx-auto">shopping_basket</span>
          <p class="font-outfit text-base font-bold text-[#0C342C]">Your Burst Box is empty</p>
          <p class="text-xs mt-1 text-[#365F56]">Add items from the catalog to ignite celebrations!</p>
        </div>
      `;
    } else {
      drawerList.innerHTML = cart.map((item, idx) => `
        <div class="cart-item bg-white p-3 rounded-lg border border-[#E2FBCE] shadow-sm flex items-center justify-between gap-2.5 sm:gap-3" data-name="${item.title}">
          ${item.img ? `<img src="${item.img}" class="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded shrink-0 border border-[#E2FBCE]" alt="${item.title}" />` : ''}
          <div class="flex-1 min-w-0 pr-1">
            <h4 class="font-serif text-xs sm:text-sm font-bold text-[#0C342C] truncate" title="${item.title}">${item.title}</h4>
            <p class="font-outfit text-[#076653] font-black text-xs sm:text-sm mt-0.5">₹<span class="item-price">${(item.price * item.qty).toLocaleString('en-IN')}</span></p>
          </div>
          <div class="flex items-center border border-[#E2FBCE] rounded bg-[#FFFDEE] shrink-0">
            <button type="button" onclick="updateQty(${idx}, -1)" class="w-6 h-6 flex items-center justify-center text-[#0C342C] hover:text-[#076653] hover:bg-[#E2FBCE] font-bold text-sm leading-none transition-colors" title="Decrease">-</button>
            <span class="item-qty px-1.5 py-0.5 text-xs font-outfit font-bold text-[#0C342C] min-w-[1.25rem] text-center">${item.qty}</span>
            <button type="button" onclick="updateQty(${idx}, 1)" class="w-6 h-6 flex items-center justify-center text-[#0C342C] hover:text-[#076653] hover:bg-[#E2FBCE] font-bold text-sm leading-none transition-colors" title="Increase">+</button>
          </div>
          <button type="button" onclick="removeItem(${idx})" class="text-[#365F56] hover:text-red-600 p-1 transition-colors shrink-0" title="Remove item">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      `).join('');
    }
  }
};

window.getBaseUrl = function() {
  const subdirs = [
    'about_us_heritage_purity_editorial_modern_edition',
    'billing_checkout_bright_pastel_edition',
    'contact_store_locator_bright_pastel_edition',
    'home_bright_pastel_festive_edition',
    'payment_confirmation_order_status_sovereign_pyrotechnics',
    'product_detail_120_shot_brocade_bright_pastel_edition',
    'products_bright_pastel_festive_catalog'
  ];
  for (let i = 0; i < subdirs.length; i++) {
    if (window.location.pathname.includes(subdirs[i]) || window.location.href.includes(subdirs[i])) {
      return '..';
    }
  }
  return '.';
};

window.proceedToCheckout = function(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const cart = getCart();
  if (cart.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Your Burst Box is empty. Add items to checkout.');
    } else {
      alert('Your Burst Box is empty. Add items to checkout.');
    }
    return false;
  }
  
  const baseUrl = window.getBaseUrl();
  window.location.href = baseUrl + '/billing_checkout_bright_pastel_edition/index.html';
};

// Universal Cart Drawer Toggle Handlers
window.toggleCartDrawer = function(open) {
  const drawer = document.getElementById('cartDrawer') || document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cartBackdrop') || document.getElementById('cartDrawerBackdrop');
  
  if (!drawer) return;

  // Handle hidden/translate class variations
  if (open) {
    if (backdrop) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
      backdrop.classList.add('opacity-100');
    }
    drawer.classList.remove('translate-x-full', 'hidden');
    drawer.classList.add('cart-drawer-open');
    document.body.style.overflow = 'hidden';
  } else {
    if (backdrop) {
      backdrop.classList.remove('opacity-100');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
    drawer.classList.add('translate-x-full', 'hidden');
    drawer.classList.remove('cart-drawer-open');
    document.body.style.overflow = '';
  }
};

window.toggleCart = function(forceOpen) {
  const drawer = document.getElementById('cartDrawer') || document.getElementById('cart-drawer');
  if (!drawer) return;
  const isOpen = !drawer.classList.contains('translate-x-full') && !drawer.classList.contains('hidden') && drawer.classList.contains('cart-drawer-open');
  const targetState = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
  toggleCartDrawer(targetState);
};

window.openDrawer = function() {
  toggleCartDrawer(true);
};

window.closeDrawer = function() {
  toggleCartDrawer(false);
};

// Universal Mobile Menu Toggle
window.toggleMobileNav = function(forceState) {
  const mobileNav = document.getElementById('mobileNavDrawer');
  const mobileIcon = document.getElementById('mobileNavIcon');
  if (!mobileNav) return;

  const isHidden = mobileNav.classList.contains('hidden');
  const shouldOpen = typeof forceState === 'boolean' ? forceState : isHidden;

  if (shouldOpen) {
    mobileNav.classList.remove('hidden');
    if (mobileIcon) mobileIcon.innerText = 'close';
    document.body.style.overflow = 'hidden';
  } else {
    mobileNav.classList.add('hidden');
    if (mobileIcon) mobileIcon.innerText = 'menu';
    document.body.style.overflow = '';
  }
};

// Global Toast helper
window.showToast = function(message) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'fixed bottom-5 right-5 sm:bottom-6 sm:right-6 bg-[#FFFDEE] border-2 border-[#076653] text-[#0C342C] px-4 py-3 rounded-lg shadow-2xl z-50 transform translate-y-20 opacity-0 transition-all duration-300 flex items-center gap-3 max-w-[90vw] sm:max-w-md';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[#076653] text-2xl shrink-0">check_circle</span>
      <div class="min-w-0">
        <h5 class="font-outfit text-xs sm:text-sm font-bold text-[#0C342C]" id="toastTitle">Added to Burst Box!</h5>
        <p class="text-[11px] text-[#365F56] truncate">Your festive cart has been updated.</p>
      </div>
    `;
    document.body.appendChild(toast);
  }
  const title = document.getElementById('toastTitle') || toast.querySelector('h5');
  if (title) title.innerText = message || 'Added to Burst Box!';
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2600);
};

// Close drawers on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleCartDrawer(false);
    toggleMobileNav(false);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  
  // Wire openCartBtn if present
  const openCartBtn = document.getElementById('openCartBtn');
  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => toggleCartDrawer(true));
  }
  
  const closeCartBtn = document.getElementById('closeCartBtn');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => toggleCartDrawer(false));
  }
});
