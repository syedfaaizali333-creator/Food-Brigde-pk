var detailContainer = document.getElementById("food-detail");
var query = new URLSearchParams(window.location.search);
var selectedFood = getListingById(query.get("id") || "biryani-boxes");

detailContainer.innerHTML = '<div class="row g-4 g-lg-5 align-items-start">' +
  '<div class="col-lg-7"><div class="detail-visual ' + selectedFood.visual + '"><span class="food-emoji" aria-hidden="true">' + selectedFood.emoji + '</span></div></div>' +
  '<div class="col-lg-5"><span class="badge-soft">' + selectedFood.type + ' · Available</span>' +
  '<h1 class="mt-3 mb-2" style="color:var(--forest);font-size:clamp(2rem,4vw,3rem);font-weight:780;letter-spacing:-.055em">' + selectedFood.name + '</h1>' +
  '<p class="text-secondary">' + selectedFood.description + '</p>' +
  '<p class="location-line mb-4">⌖ ' + selectedFood.location + ' &nbsp;·&nbsp; Shared by ' + selectedFood.donor + '</p>' +
  '<div class="detail-panel mb-3"><h2>Pickup details</h2><ul class="detail-list">' +
  '<li><span>Quantity</span><span>' + selectedFood.quantity + '</span></li>' +
  '<li><span>Prepared</span><span>' + selectedFood.prepared + '</span></li>' +
  '<li><span>Pickup by</span><span>' + selectedFood.deadline + '</span></li>' +
  '<li><span>Pickup window</span><span>' + selectedFood.pickup + '</span></li>' +
  '</ul></div>' +
  '<div class="callout callout-warning mb-4"><strong>Food safety reminder</strong><p>' + selectedFood.storage + ' ' + selectedFood.allergens + ' Confirm details with the donor before collection.</p></div>' +
  '<a class="btn btn-brand w-100" href="my-requests.html?new=' + selectedFood.id + '">Request this food</a>' +
  '<p class="form-text mt-2 text-center">A request is a frontend demonstration, not a confirmed reservation.</p></div></div>';
