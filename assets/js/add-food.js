var listingForm = document.getElementById("add-food-form");
var listingSuccess = document.getElementById("listing-success");
var donationType = document.getElementById("type-donation");
var saleType = document.getElementById("type-sale");
var salePriceWrap = document.getElementById("sale-price-wrap");
var salePrice = document.getElementById("sale-price");

function updateSalePriceField() {
  var isSale = saleType.checked;
  salePriceWrap.classList.toggle("d-none", !isSale);
  salePrice.required = isSale;
  if (!isSale) salePrice.value = "";
}

donationType.addEventListener("change", updateSalePriceField);
saleType.addEventListener("change", updateSalePriceField);

listingForm.addEventListener("submit", function (event) {
  event.preventDefault();
  document.getElementById("pickup-by").setCustomValidity("");
  if (!listingForm.checkValidity()) {
    listingForm.classList.add("was-validated");
    return;
  }

  var preparedDate = new Date(document.getElementById("prepared-at").value);
  var pickupDate = new Date(document.getElementById("pickup-by").value);
  if (pickupDate <= preparedDate) {
    document.getElementById("pickup-by").setCustomValidity("Pickup deadline must be after the preparation time.");
    document.getElementById("pickup-by").reportValidity();
    return;
  }
  document.getElementById("pickup-by").setCustomValidity("");

  var foodName = document.getElementById("food-name").value;
  var listingType = document.querySelector('input[name="listing-type"]:checked').value;
  listingSuccess.textContent = "Your " + listingType.toLowerCase() + " listing for “" + foodName + "” is ready for review. It is only a preview on this page and has not been sent or saved.";
  listingSuccess.classList.add("show");
  listingSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("pickup-by").addEventListener("input", function () {
  this.setCustomValidity("");
});
