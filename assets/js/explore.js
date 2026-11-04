var foodGrid = document.getElementById("food-grid");
var searchInput = document.getElementById("food-search");
var categorySelect = document.getElementById("food-category");
var emptyState = document.getElementById("food-empty");

function makeFoodCard(food) {
  return '<div class="col-md-6 col-xl-4"><article class="food-card">' +
    '<div class="food-visual ' + food.visual + '"><span class="food-emoji" aria-hidden="true">' + food.emoji + '</span></div>' +
    '<div class="food-card-body"><span class="badge-soft">' + food.type + '</span>' +
    '<h2 class="food-card-title">' + food.name + '</h2>' +
    '<div class="location-line">⌖ ' + food.location + '</div>' +
    '<div class="food-card-meta"><span>▦ ' + food.quantity + '</span><span>◷ ' + food.pickup + '</span></div>' +
    '<div class="food-card-bottom"><a class="link-arrow" href="food-details.html?id=' + food.id + '">View details <span>→</span></a>' +
    '<a class="btn btn-brand btn-sm" href="my-requests.html?new=' + food.id + '">Request food</a></div></div></article></div>';
}

function showFoodListings() {
  var searchText = searchInput.value.toLowerCase().trim();
  var chosenCategory = categorySelect.value;
  var visibleCount = 0;
  var cards = "";
  var listings = window.foodBridgeData.foodListings;

  for (var i = 0; i < listings.length; i++) {
    var food = listings[i];
    var matchesName = food.name.toLowerCase().indexOf(searchText) !== -1;
    var matchesCategory = chosenCategory === "all" || food.category === chosenCategory;
    if (matchesName && matchesCategory) {
      cards += makeFoodCard(food);
      visibleCount++;
    }
  }

  foodGrid.innerHTML = cards;
  emptyState.classList.toggle("d-none", visibleCount > 0);
}

searchInput.addEventListener("input", showFoodListings);
categorySelect.addEventListener("change", showFoodListings);
showFoodListings();
