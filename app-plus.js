import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnDW725laagCdj0INT9gaA2z0FsLn6cO4",
  authDomain: "defi-amis-plus.firebaseapp.com",
  databaseURL: "https://defi-amis-plus-default-rtdb.firebaseio.com",
  projectId: "defi-amis-plus",
  storageBucket: "defi-amis-plus.firebasestorage.app",
  messagingSenderId: "714241330241",
  appId: "1:714241330241:web:b103510ee952233ef64ac0"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🎵 Gestion du son
const bgMusic = document.getElementById("bg-music");
const muteBtn = document.getElementById("muteBtn");
if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    bgMusic.muted = !bgMusic.muted;
  });
}

// 💰 Simulation paiement NatCash
const simulatePayment = document.getElementById("simulatePayment");
if (simulatePayment) {
  simulatePayment.addEventListener("click", () => {
    localStorage.setItem("vipCode", "TCH-VIP-509");
    document.getElementById("vipCodeBox").style.display = "block";
  });
}

// ✅ Vérification VIP
const verifyVip = document.getElementById("verifyVip");
if (verifyVip) {
  verifyVip.addEventListener("click", () => {
    const input = document.getElementById("vipInput").value.trim();
    const status = document.getElementById("vipStatus");
    if (input === "TCH-VIP-509") {
      status.textContent = "✅ Accès Premium autorisé !";
      status.style.color = "lime";
      localStorage.setItem("isVIP", true);
    } else {
      status.textContent = "❌ Code invalide.";
      status.style.color = "red";
    }
  });
}

// ✍️ Sauvegarde défi VIP
const createForm = document.getElementById("createForm");
if (createForm) {
  createForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const questions = document.getElementById("questions").value;
    const vipCode = localStorage.getItem("vipCode");
    if (vipCode === "TCH-VIP-509") {
      set(ref(db, "defis/" + username), {
        user: username,
        questions: questions
      });
      alert("✅ Défi sauvegardé avec succès !");
    } else {
      alert("❌ Tu dois être VIP pour sauvegarder ton défi !");
    }
  });
}