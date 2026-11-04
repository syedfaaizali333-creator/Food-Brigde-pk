var cartCatalog = window.foodBridgeData.marketplaceProducts;
var cartQuery = new URLSearchParams(window.location.search);
var cartLines = document.getElementById("cart-lines");
var cartSummary = document.getElementById("cart-summary");
var cartEmpty = document.getElementById("cart-empty");
var cartTotals = { biryani: 0, zinger: 0, sandwich: 0, pizza: 0 };
var hasQueryItems = false;

for (var i = 0; i < cartCatalog.length; i++) {
  var product = cartCatalog[i];
  var queryQuantity = Number(cartQuery.get(product.id));
  if (queryQuantity > 0) {
    cartTotals[product.id] = queryQuantity;
    hasQueryItems = true;
  }
}

// Opening the cart directly loads a small sample cart for demonstration.
if (!hasQueryItems && !cartQuery.has("empty")) {
  cartTotals.biryani = 1;
  cartTotals.sandwich = 1;
}

function redrawCart() {
  var rows = "";
  var subtotal = 0;
  var itemsCount = 0;
  for (var i = 0; i < cartCatalog.length; i++) {
    var product = cartCatalog[i];
    var quantity = cartTotals[product.id];
    if (quantity > 0) {
      var lineTotal = product.price * quantity;
      subtotal += lineTotal;
      itemsCount += quantity;
      rows += '<div class="cart-line"><div class="cart-line-name"><span class="cart-mini-visual ' + product.visual + '" aria-hidden="true">' + product.emoji + '</span><span>' + product.name + '<span class="table-sub">Rs. ' + product.price + ' each</span></span></div><div class="cart-quantity"><button type="button" data-cart-change="-1" data-product="' + product.id + '" aria-label="Remove one ' + product.name + '">−</button><span class="px-1">' + quantity + '</span><button type="button" data-cart-change="1" data-product="' + product.id + '" aria-label="Add one ' + product.name + '">+</button></div><strong class="line-total">Rs. ' + lineTotal + '</strong></div>';
    }
  }
  cartLines.innerHTML = rows;
  cartEmpty.classList.toggle("d-none", itemsCount > 0);
  cartSummary.classList.toggle("d-none", itemsCount === 0);
  document.getElementById("subtotal-value").textContent = "Rs. " + subtotal;
  document.getElementById("total-value").textContent = "Rs. " + subtotal;
}

cartLines.addEventListener("click", function (event) {
  var button = event.target.closest("button[data-cart-change]");
  if (!button) return;
  var productId = button.getAttribute("data-product");
  cartTotals[productId] += Number(button.getAttribute("data-cart-change"));
  if (cartTotals[productId] < 0) cartTotals[productId] = 0;
  redrawCart();
});

document.getElementById("checkout-demo").addEventListener("click", function () {
  showDemoMessage("Demo only — no payment is processed and no order is placed.");
});

document.getElementById("clear-cart").addEventListener("click", function () {
  for (var productId in cartTotals) cartTotals[productId] = 0;
  redrawCart();
});

redrawCart();
