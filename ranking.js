const global = JSON.parse(localStorage.getItem("globalScores") || "[]");
const globalList = document.getElementById("global");

global
  .sort((a, b) => b.score - a.score)
  .forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${s.nom} — ${s.score} pts`;
    globalList.appendChild(li);
  });

const local = JSON.parse(localStorage.getItem("localScores") || "[]");
const localList = document.getElementById("local");

local
  .sort((a, b) => b.score - a.score)
  .forEach((s, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${s.nom} — ${s.score} pts`;
    localList.appendChild(li);
  });