// shared_cart.js
const CART_STORAGE_KEY = 'burstBoxCart';

function getCart() {
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  return cartJson ? JSON.parse(cartJson) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Ensure the drawer toggle state is preserved across pages if needed, though usually it's just triggered
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
      img: img || "https://images.unsplash.com/photo-1533202931149-a29d89ddad78?auto=format&fit=crop&q=80&w=200&h=200" // Fallback image
    });
  }
  saveCart(cart);
  renderCart();
  
  if (typeof showToast === 'function') {
    showToast(title + ' added!');
  }
  
  // Optionally open drawer if toggleCartDrawer exists (e.g. index.html)
  if (typeof toggleCartDrawer === 'function') {
    toggleCartDrawer(true);
  } else if (typeof openDrawer === 'function') {
    openDrawer();
  }
}

window.updateQty = window.changeQty = window.updateItemQty = function(indexOrElement, delta) {
  const cart = getCart();
  
  // Handle both array index and DOM element variations from different pages
  let index = indexOrElement;
  if (typeof indexOrElement === 'object') {
     // If it's a DOM element from the old index.html format
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
}

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
}

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

  // Update badges and texts across various possible DOM IDs (active cart)
  const countElements = ['cartBadge', 'headerCartCount', 'cartItemCountLabel', 'cart-badge-count', 'cart-count-display'];
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
  
  // Confirmation Page totals (from confirmed paid order)
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
      checkoutList.innerHTML = `<div class="py-8 text-center text-[#365F56] font-sans text-sm">Your Burst Box is empty.</div>`;
    } else {
      checkoutList.innerHTML = cart.map((item, idx) => `
        <div class="py-4 space-y-3" id="cart-item-${idx}">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-grow">
              <h3 class="font-serif text-base font-bold text-[#0C342C]">${item.title}</h3>
            </div>
            <div class="text-right">
              <span class="font-display text-lg font-bold text-[#076653] whitespace-nowrap">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2 border border-[#E2FBCE] bg-white px-2 py-1">
              <span class="font-display text-[11px] text-[#365F56] uppercase font-bold pr-1">Qty:</span>
              <button type="button" class="w-6 h-6 flex items-center justify-center bg-[#E2FBCE] hover:bg-[#076653] hover:text-white border border-[#E2FBCE] text-[#076653] font-bold text-sm leading-none transition-colors" onclick="updateQty(${idx}, -1)" title="Decrease">−</button>
              <span class="font-display text-xs font-bold text-[#0C342C] px-2">${item.qty}</span>
              <button type="button" class="w-6 h-6 flex items-center justify-center bg-[#E2FBCE] hover:bg-[#076653] hover:text-white border border-[#E2FBCE] text-[#076653] font-bold text-sm leading-none transition-colors" onclick="updateQty(${idx}, 1)" title="Increase">+</button>
            </div>
            <button type="button" class="flex items-center gap-1 font-display text-xs font-bold text-[#076653] hover:text-[#0C342C] uppercase tracking-wider transition-colors px-2 py-1" onclick="removeItem(${idx})">
              <span class="material-symbols-outlined text-sm" data-icon="delete">delete</span>
              <span class="">Remove</span>
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
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-lg bg-[#E2FBCE] flex items-center justify-center border border-[#E2FBCE] flex-shrink-0 text-[#076653]">
              <span class="material-symbols-outlined text-2xl" data-icon="star">star</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-label-sm font-label-sm px-2 py-0.5 rounded bg-[#E2FBCE] text-[#076653] font-bold uppercase border border-[#076653]/30">FESTIVE ITEM</span>
                <h3 class="font-serif text-base font-bold text-[#0C342C]">${item.title}</h3>
              </div>
              <p class="text-body-sm font-body-sm text-[#365F56] mt-0.5">
                Ceremonial pyrotechnic assortment.
              </p>
              <p class="text-label-sm font-label-sm text-[#076653] mt-1 font-semibold">Quantity: ${item.qty} Unit(s) · Sivakasi Sealed</p>
            </div>
          </div>
          <div class="text-right sm:flex-shrink-0">
            <p class="text-headline-sm font-headline-sm text-[#076653] font-bold">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
          </div>
        </div>
      `).join('');
    }
  } else if (drawerList) {
    if (cart.length === 0) {
      drawerList.innerHTML = `
        <div class="text-center py-12 text-[#365F56]">
          <span class="material-symbols-outlined text-5xl text-[#076653] mb-2">shopping_basket</span>
          <p class="font-outfit text-base font-bold text-[#0C342C]">Your Burst Box is empty</p>
          <p class="text-xs mt-1 text-[#365F56]">Add items from the catalog to ignite celebrations!</p>
        </div>
      `;
    } else {
      drawerList.innerHTML = cart.map((item, idx) => `
        <div class="cart-item bg-white p-3.5 rounded-lg border border-[#E2FBCE] shadow-sm flex items-center justify-between gap-3" data-name="${item.title}">
          ${item.img ? `<img src="${item.img}" class="w-12 h-12 object-cover rounded shrink-0" alt="${item.title}" />` : ''}
          <div class="flex-1 min-w-0">
            <h4 class="font-serif text-sm font-bold text-[#0C342C] truncate">${item.title}</h4>
            <p class="font-outfit text-[#076653] font-black text-sm">₹<span class="item-price">${(item.price * item.qty).toLocaleString('en-IN')}</span></p>
          </div>
          <div class="flex items-center border border-[#E2FBCE] rounded bg-[#FFFDEE]">
            <button type="button" onclick="updateQty(${idx}, -1)" class="px-2 py-0.5 text-[#0C342C] hover:text-[#076653] font-bold">-</button>
            <span class="item-qty px-2 py-0.5 text-xs font-outfit font-bold text-[#0C342C]">${item.qty}</span>
            <button type="button" onclick="updateQty(${idx}, 1)" class="px-2 py-0.5 text-[#0C342C] hover:text-[#076653] font-bold">+</button>
          </div>
          <button type="button" onclick="removeItem(${idx})" class="text-[#365F56] hover:text-[#076653] text-xs font-bold uppercase">Remove</button>
        </div>
      `).join('');
    }
  }
}

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
    if (window.location.href.includes(subdirs[i])) {
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
  // Navigate to checkout
  window.location.href = baseUrl + '/billing_checkout_bright_pastel_edition/index.html';
};

document.addEventListener('DOMContentLoaded', renderCart);

