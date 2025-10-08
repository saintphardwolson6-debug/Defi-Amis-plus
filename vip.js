document.getElementById("validerVIP").addEventListener("click", function() {
  const code = document.getElementById("code").value.trim();
  if (code === "VIP1234") {
    localStorage.setItem("vip", "true");
    alert("✅ Accès VIP activé !");
    window.location.href = "create.html";
  } else {
    alert("❌ Code invalide ou paiement non vérifié !");
  }
});