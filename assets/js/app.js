// Small shared helpers used by more than one page.
function showDemoMessage(message) {
  var toast = document.getElementById("site-toast");
  if (!toast) {
    alert(message);
    return;
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(function () {
    toast.classList.remove("show");
  }, 2800);
}

function getListingById(id) {
  var listings = window.foodBridgeData.foodListings;
  for (var i = 0; i < listings.length; i++) {
    if (listings[i].id === id) {
      return listings[i];
    }
  }
  return listings[0];
}

// Highlight the current page in the shared navigation.
var pageName = window.location.pathname.split("/").pop() || "index.html";
var navLinks = document.querySelectorAll(".navbar .nav-link");
for (var navIndex = 0; navIndex < navLinks.length; navIndex++) {
  var navHref = navLinks[navIndex].getAttribute("href");
  if (navHref === pageName) {
    navLinks[navIndex].classList.add("active");
    navLinks[navIndex].setAttribute("aria-current", "page");
  }
}

var yearLabel = document.getElementById("current-year");
if (yearLabel) {
  yearLabel.textContent = new Date().getFullYear();
}
