var loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!loginForm.checkValidity()) {
      loginForm.classList.add("was-validated");
      return;
    }
    var role = document.getElementById("login-role").value;
    var destination = role === "donor" ? "donor-dashboard.html" : "receiver-dashboard.html";
    document.getElementById("login-success").classList.add("show");
    window.setTimeout(function () { window.location.href = destination; }, 1100);
  });
}

var registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!registerForm.checkValidity()) {
      registerForm.classList.add("was-validated");
      return;
    }
    document.getElementById("register-success").classList.add("show");
    registerForm.reset();
  });
}
