const amiQuestions = [
  "Quel est mon plat préféré ?",
  "Quelle est ma couleur favorite ?",
  "Quel sport j’aime le plus ?",
  "Quelle est ma plus grande peur ?",
  "Quel est mon rêve d’enfance ?",
  "Qui est mon meilleur ami ?",
  "Quelle est ma saison préférée ?",
  "Quel genre de musique j’écoute le plus ?",
  "Quel est mon animal préféré ?",
  "Si je gagnais à la loterie, je ferais quoi en premier ?"
];

const crushQuestions = [
  "Quelle est ma chanson romantique préférée ?",
  "Quelle est ma couleur d’amour ?",
  "Quel est mon signe astrologique ?",
  "Quel cadeau j’aimerais recevoir ?",
  "Où j’aimerais aller pour un premier rendez-vous ?",
  "Quel est mon film d’amour préféré ?",
  "Quelle odeur j’aime le plus ?",
  "Quel est mon moment préféré de la journée ?",
  "Si je t’écris tard le soir, c’est parce que… ?",
  "Comment j’aime qu’on m’appelle ?"
];

const options = ["A", "B", "C", "D"];

document.getElementById("generate").addEventListener("click", () => {
  const mode = document.getElementById("mode").value;
  const qList = mode === "ami" ? amiQuestions : crushQuestions;
  const uid = "defi_" + Math.floor(Math.random() * 1000000);

  localStorage.setItem(uid, JSON.stringify({ mode, qList }));
  alert(`Défi créé avec succès ! 🔗 ID : ${uid}\nPartage ce lien : ${window.location.origin}/play.html?id=${uid}`);
  window.location.href = `play.html?id=${uid}`;
});