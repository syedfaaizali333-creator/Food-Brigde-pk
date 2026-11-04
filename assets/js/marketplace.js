var productCatalog = window.foodBridgeData.marketplaceProducts;
var cartItems = { biryani: 0, zinger: 0, sandwich: 0, pizza: 0 };
var countBadge = document.getElementById("cart-count");

function updateCartBadge() {
  var count = 0;
  for (var productId in cartItems) {
    count += cartItems[productId];
  }
  if (countBadge) countBadge.textContent = count;
}

function openDemoCart() {
  var queryParts = [];
  for (var productId in cartItems) {
    if (cartItems[productId] > 0) queryParts.push(productId + "=" + cartItems[productId]);
  }
  if (queryParts.length === 0) queryParts.push("empty=1");
  window.location.href = "cart.html?" + queryParts.join("&");
}

var addButtons = document.querySelectorAll("[data-add-product]");
for (var i = 0; i < addButtons.length; i++) {
  addButtons[i].addEventListener("click", function () {
    var productId = this.getAttribute("data-add-product");
    var quantityInput = document.getElementById("quantity-" + productId);
    var quantity = Number(quantityInput.value);
    if (quantity < 1 || quantity > 20) {
      quantityInput.value = 1;
      showDemoMessage("Choose a quantity from 1 to 20.");
      return;
    }
    cartItems[productId] += quantity;
    updateCartBadge();
    var productName = productId;
    for (var productIndex = 0; productIndex < productCatalog.length; productIndex++) {
      if (productCatalog[productIndex].id === productId) productName = productCatalog[productIndex].name;
    }
    showDemoMessage(quantity + " " + productName + " added to your demo cart.");
  });
}

var cartLinks = document.querySelectorAll("[data-open-cart]");
for (var j = 0; j < cartLinks.length; j++) {
  cartLinks[j].addEventListener("click", function (event) {
    event.preventDefault();
    openDemoCart();
  });
}
updateCartBadge();
