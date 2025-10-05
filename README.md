# Défi-Amis+ (version 1.0)

Défi-Amis+ est une version premium et interactive du jeu "qui te connaît le mieux".
- Front-end uniquement (no backend) — données locales (localStorage).
- Pour déployer: GitHub Pages / Netlify / n'importe quel hébergeur static.
- Kòd natCash pou premium se lis nan `codes-valid.txt`.

Structure:
- index.html: accueil (créer / rejoindre / accès premium)
- create.html: créer un défi (host)
- play.html: jouer un défi (players + leaderboard)
- verify.html: entrer un code natCash pour unlock premium
- premium.html: page d'information et instructions natCash
- style.css: styles et animations

Test local:
```bash
npx http-server .
# puis ouvrir http://127.0.0.1:8080/index.html
---

## 4) `codes-valid.txt`