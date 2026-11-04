function statusClass(status) {
  if (status === "Requested") return "status-requested";
  if (status === "Approved") return "status-approved";
  if (status === "Collected") return "status-collected";
  if (status === "Completed") return "status-completed";
  if (status === "Rejected") return "status-rejected";
  if (status === "Expired") return "status-expired";
  return "";
}

var listingRows = document.getElementById("donor-listings");
var donorSamples = [
  { food: "Vegetable biryani boxes", quantity: "12 meal boxes", pickup: "Today, 7:30 pm", status: "Available" },
  { food: "Fresh bakery bread", quantity: "15 packs", pickup: "Today, 8:00 pm", status: "Requested" },
  { food: "Chickpea curry portions", quantity: "8 portions", pickup: "Today, 6:00 pm", status: "Approved" },
  { food: "Seasonal fruit basket", quantity: "6 family bags", pickup: "Yesterday", status: "Completed" }
];

function showDonorRows() {
  if (!listingRows) return;
  var rows = "";
  for (var i = 0; i < donorSamples.length; i++) {
    var item = donorSamples[i];
    var action = "—";
    if (item.status === "Approved") {
      action = '<button class="btn btn-soft btn-sm" data-donor-action="collected" data-row="' + i + '">Mark collected</button>';
    } else if (item.status === "Collected") {
      action = '<button class="btn btn-soft btn-sm" data-donor-action="completed" data-row="' + i + '">Mark complete</button>';
    }
    rows += '<tr><td><strong>' + item.food + '</strong></td><td>' + item.quantity + '</td><td>' + item.pickup + '</td><td><span class="status-pill ' + statusClass(item.status) + '">' + item.status + '</span></td><td>' + action + '</td></tr>';
  }
  listingRows.innerHTML = rows;
}

if (listingRows) {
  listingRows.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-donor-action]");
    if (!button) return;
    var row = Number(button.getAttribute("data-row"));
    donorSamples[row].status = button.getAttribute("data-donor-action") === "collected" ? "Collected" : "Completed";
    showDonorRows();
  });
  showDonorRows();
}

var adminRows = document.getElementById("admin-requests");
var adminSamples = [
  { id: "FB-1042", receiver: "Ayesha K.", food: "Vegetable biryani boxes", area: "Clifton", status: "Requested" },
  { id: "FB-1041", receiver: "Bilal R.", food: "Bakery bread & rolls", area: "PECHS", status: "Requested" },
  { id: "FB-1038", receiver: "Hira M.", food: "Seasonal fruit basket", area: "Bahadurabad", status: "Approved" },
  { id: "FB-1035", receiver: "Omar S.", food: "Grilled chicken rolls", area: "North Nazimabad", status: "Rejected" }
];

function showAdminRows() {
  if (!adminRows) return;
  var rows = "";
  for (var i = 0; i < adminSamples.length; i++) {
    var request = adminSamples[i];
    var action = "—";
    if (request.status === "Requested") {
      action = '<div class="action-row"><button class="btn btn-brand btn-sm" data-admin-action="Approved" data-row="' + i + '">Approve</button><button class="btn btn-outline-brand btn-sm" data-admin-action="Rejected" data-row="' + i + '">Reject</button></div>';
    }
    rows += '<tr><td><strong>' + request.id + '</strong></td><td>' + request.receiver + '<span class="table-sub">' + request.area + '</span></td><td>' + request.food + '</td><td><span class="status-pill ' + statusClass(request.status) + '">' + request.status + '</span></td><td>' + action + '</td></tr>';
  }
  adminRows.innerHTML = rows;
}

if (adminRows) {
  adminRows.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-admin-action]");
    if (!button) return;
    var row = Number(button.getAttribute("data-row"));
    adminSamples[row].status = button.getAttribute("data-admin-action");
    showAdminRows();
    showDemoMessage("Request " + adminSamples[row].status.toLowerCase() + " in this demo.");
  });
  showAdminRows();
}

var receiverRows = document.getElementById("receiver-requests");
if (receiverRows) {
  var receiverItems = window.foodBridgeData.requests;
  var newRequestId = new URLSearchParams(window.location.search).get("new");
  if (newRequestId) {
    var newFood = getListingById(newRequestId);
    receiverItems.unshift({ id: "FB-DEMO", food: newFood.name, donor: newFood.donor, date: "Just now", status: "Requested" });
    var requestNotice = document.getElementById("request-notice");
    requestNotice.innerHTML = '<strong>Request added for this visit.</strong> ' + newFood.name + ' is shown as Requested. The demo does not save it permanently.';
    requestNotice.classList.remove("d-none");
  }
  var receiverHtml = "";
  for (var j = 0; j < receiverItems.length; j++) {
    var receiverItem = receiverItems[j];
    receiverHtml += '<tr><td><strong>' + receiverItem.id + '</strong></td><td>' + receiverItem.food + '<span class="table-sub">' + receiverItem.donor + '</span></td><td>' + receiverItem.date + '</td><td><span class="status-pill ' + statusClass(receiverItem.status) + '">' + receiverItem.status + '</span></td></tr>';
  }
  receiverRows.innerHTML = receiverHtml;
}

var trackingList = document.getElementById("tracking-list");
if (trackingList) {
  var demoRequests = window.foodBridgeData.requests;
  var trackingNewId = new URLSearchParams(window.location.search).get("new");
  if (trackingNewId) {
    var trackingFood = getListingById(trackingNewId);
    demoRequests.unshift({ id: "FB-DEMO", food: trackingFood.name, donor: trackingFood.donor, date: "Just now", status: "Requested" });
  }

  function showTrackingRequests() {
    var trackingHtml = "";
    for (var k = 0; k < demoRequests.length; k++) {
      var tracked = demoRequests[k];
      var states = ["Available", "Requested", "Approved", "Collected", "Completed"];
      var currentIndex = 0;
      for (var s = 0; s < states.length; s++) {
        if (states[s] === tracked.status) currentIndex = s;
      }
      var steps = "";
      var isAlternateStatus = tracked.status === "Rejected" || tracked.status === "Expired";
      if (!isAlternateStatus) {
        for (var stepIndex = 0; stepIndex < states.length; stepIndex++) {
          var stepClass = "";
          if (stepIndex < currentIndex) stepClass = "done";
          if (stepIndex === currentIndex) stepClass = "current";
          steps += '<div class="progress-step ' + stepClass + '"><i>' + (stepIndex < currentIndex ? "✓" : stepIndex + 1) + '</i><span>' + states[stepIndex] + '</span></div>';
        }
      }
      trackingHtml += '<article class="panel-card mb-3"><div class="d-flex flex-wrap justify-content-between gap-2"><div><span class="table-sub">' + tracked.id + ' · ' + tracked.date + '</span><h2 class="mb-1 mt-2">' + tracked.food + '</h2><p class="text-secondary small mb-0">Shared by ' + tracked.donor + '</p></div><span class="status-pill ' + statusClass(tracked.status) + ' align-self-start">' + tracked.status + '</span></div>';
      if (isAlternateStatus) {
        trackingHtml += '<div class="callout callout-warning mt-3"><strong>This request was ' + tracked.status.toLowerCase() + '.</strong><p>It will not continue through the pickup steps.</p></div>';
      } else {
        trackingHtml += '<div class="progress-track">' + steps + '</div>';
      }
      if (tracked.status === "Approved") trackingHtml += '<button class="btn btn-soft btn-sm" data-track-action="Collected" data-row="' + k + '">Confirm pickup</button>';
      if (tracked.status === "Collected") trackingHtml += '<button class="btn btn-soft btn-sm" data-track-action="Completed" data-row="' + k + '">Confirm received</button>';
      trackingHtml += '</article>';
    }
    trackingList.innerHTML = trackingHtml;
  }

  trackingList.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-track-action]");
    if (!button) return;
    var requestIndex = Number(button.getAttribute("data-row"));
    demoRequests[requestIndex].status = button.getAttribute("data-track-action");
    showTrackingRequests();
  });
  showTrackingRequests();
}
