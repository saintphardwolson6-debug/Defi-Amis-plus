import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnDW725laagCdj0INT9gaA2z0FsLn6cO4",
  authDomain: "defi-amis-plus.firebaseapp.com",
  projectId: "defi-amis-plus",
  storageBucket: "defi-amis-plus.firebasestorage.app",
  messagingSenderId: "714241330241",
  appId: "1:714241330241:web:b103510ee952233ef64ac0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Vérifie VIP
window.checkVIP = function() {
  const vip = localStorage.getItem("vip");
  if (vip === "true") {
    document.getElementById("status").textContent = "✅ Accès VIP actif !";
  } else {
    alert("💰 Pour devenir VIP, paie 50 HTG via NatCash (509 5586 5621)");
    if (confirm("Simuler le paiement ?")) {
      localStorage.setItem("vip", "true");
      localStorage.setItem("vipCode", "TCH-VIP-509");
      alert("Félicitations 🎉 Vous êtes maintenant VIP !");
      document.getElementById("status").textContent = "✅ Accès VIP activé !";
    }
  }
};

// Démarrer défi
window.startDefi = function() {
  const vip = localStorage.getItem("vip");
  if (vip === "true") {
    window.location.href = "defi-create.html";
  } else {
    alert("⚠️ Accès réservé aux membres VIP !");
  }
};

// Sauvegarder défi
window.saveDefi = async function() {
  const nom = document.getElementById("nom").value;
  const mode = document.getElementById("mode").value;
  const q1 = document.getElementById("q1").value;
  const q2 = document.getElementById("q2").value;
  const q3 = document.getElementById("q3").value;

  if (!nom || !q1 || !q2 || !q3) {
    alert("Remplis toutes les questions !");
    return;
  }

  const id = Date.now().toString();
  await setDoc(doc(db, "defis", id), {
    nom, mode, q1, q2, q3, date: new Date().toISOString()
  });

  alert(`🎉 Défi de ${nom} sauvegardé avec succès !`);
  localStorage.setItem("points", (Number(localStorage.getItem("points")) || 0) + 10);
  window.location.href = "classement.html";
};

// Classement
window.goClassement = function() {
  window.location.href = "classement.html";
};

window.onload = async function() {
  if (window.location.pathname.includes("classement.html")) {
    const cont = document.getElementById("classement");
    const points = Number(localStorage.getItem("points")) || 0;
    let badge = "🥉 Débutant Loyal";
    if (points >= 100) badge = "🥇 Leader TLD";
    else if (points >= 50) badge = "🥈 Membre Dynastie";
    cont.innerHTML = `<h3>Ton rang : ${badge}</h3><p>Points : ${points}</p>`;
  }
};