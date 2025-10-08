const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get("id");

let defi = localStorage.getItem(uid);
if (defi) defi = JSON.parse(defi);

document.getElementById("start").addEventListener("click", () => {
  const nom = document.getElementById("nom").value.trim();
  if (!nom) return alert("Entre ton nom !");
  startQuiz(defi.qList, nom);
});

function startQuiz(questions, nom) {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";
  let score = 0;
  let index = 0;

  function showQuestion() {
    if (index >= questions.length) {
      alert(`${nom}, tu as fini le défi ! Score : ${score}/${questions.length}`);
      saveScore(nom, score);
      window.location.href = "ranking.html";
      return;
    }

    quizDiv.innerHTML = `
      <h3>${questions[index]}</h3>
      <button onclick="next(1)">A</button>
      <button onclick="next(0)">B</button>
      <button onclick="next(0)">C</button>
      <button onclick="next(0)">D</button>
    `;
  }

  window.next = (rep) => {
    score += rep;
    index++;
    showQuestion();
  };

  showQuestion();
}

function saveScore(nom, score) {
  const global = JSON.parse(localStorage.getItem("globalScores") || "[]");
  global.push({ nom, score });
  localStorage.setItem("globalScores", JSON.stringify(global));
}