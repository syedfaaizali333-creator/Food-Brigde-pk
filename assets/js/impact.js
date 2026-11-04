var impactStats = { sharedMeals: 1248, communityDonors: 86, partnerAreas: 12, foodSavedKg: 642 };
var statTargets = document.querySelectorAll("[data-impact-stat]");
for (var i = 0; i < statTargets.length; i++) {
  var statName = statTargets[i].getAttribute("data-impact-stat");
  statTargets[i].textContent = impactStats[statName].toLocaleString();
}
