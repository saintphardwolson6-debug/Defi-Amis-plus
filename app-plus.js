// plus/app-plus.js (module) - Défi-Amis+ with PIV & codes
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, addDoc,
  collection, query, orderBy, onSnapshot, where, getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";

/* ---------- YOUR FIREBASE CONFIG ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyBnDW725laagCdj0INT9gaA2z0FsLn6cO4",
  authDomain: "defi-amis-plus.firebaseapp.com",
  databaseURL: "https://defi-amis-plus-default-rtdb.firebaseio.com",
  projectId: "defi-amis-plus",
  storageBucket: "defi-amis-plus.firebasestorage.app",
  messagingSenderId: "714241330241",
  appId: "1:714241330241:web:b103510ee952233ef64ac0",
  measurementId: "G-FL2LEBFVW0"
};
/* ------------------------------------------- */

const app = initializeApp(firebaseConfig);
try{ getAnalytics(app); }catch(e){ /* ignore analytics errors */ }
const db = getFirestore(app);

/* ---------- UTIL ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

/* ---------- avatars placeholders ---------- */
const AVATARS = [
  'assets/avatars/a1.jpg',
  'assets/avatars/a2.jpg',
  'assets/avatars/a3.jpg',
  'https://picsum.photos/200/200?random=1',
  'https://picsum.photos/200/200?random=2'
];

/* ---------- default questions ---------- */
const DEFAULT_QUESTIONS = [
  "Quel est le plat préféré de __NOM__ ?",
  "Quelle est la couleur préférée de __NOM__ ?",
  "Quel est son passe-temps favori ?",
  "Quel est le film préféré de __NOM__ ?",
  "Quelle chanson représente __NOM__ actuellement ?"
];

/* ---------- badge logic ---------- */
function badgeForScore(score, total){
  const pct = score / total;
  if(pct === 1) return '🏆 Légende';
  if(pct >= 0.8) return '🥇 Top ami';
  if(pct >= 0.6) return '🥈 Très proche';
  if(pct >= 0.4) return '🥉 Connaisseur';
  return '✨ Curieux';
}

/* ---------- UID ---------- */
function genUID(seed='ROOM'){
  const s = (seed||'ROOM').toUpperCase().replace(/[^A-Z0-9]+/g,'').slice(0,5) || 'ROOM';
  return `${s}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}

/* ---------- confetti ---------- */
function burstConfetti(){
  let c = document.querySelector('canvas.confetti');
  if(!c){ c=document.createElement('canvas'); c.className='confetti'; document.body.appendChild(c); }
  c.classList.remove('hidden'); c.width = innerWidth; c.height = innerHeight;
  const ctx = c.getContext('2d'), parts=[];
  for(let i=0;i<120;i++) parts.push({x:Math.random()*c.width,y:-20,vx:(Math.random()-.5)*6,vy:Math.random()*4+2,r:Math.random()*6+2,color:['#ff4d7e','#ffd166','#06d6a0','#8ec5ff'][Math.floor(Math.random()*4)]});
  let t=0; function f(){ ctx.clearRect(0,0,c.width,c.height); parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=.05; ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }); if(t++<180) requestAnimationFrame(f); else c.classList.add('hidden'); } f();
}

/* ---------- Page detection ---------- */
const path = location.pathname.split('/').pop() || 'index.html';

/* -------------------- INDEX PAGE -------------------- */
if(path === 'index.html' || path === ''){
  // modal controls
  const btnCreate = $('btnCreate');
  const btnEnterPiv = $('btnEnterPiv');
  const modal = $('modal');
  const closeModal = $('closeModal');
  const validateCode = $('validateCode');
  const accessCodeInput = $('accessCodeInput');

  // Show modal to enter code
  btnEnterPiv && btnEnterPiv.addEventListener('click', ()=> modal.classList.remove('hidden'));
  closeModal && closeModal.addEventListener('click', ()=> modal.classList.add('hidden'));

  // Validate code (either piv_codes or codes collections)
  validateCode && validateCode.addEventListener('click', async ()=>{
    const code = (accessCodeInput.value||'').trim();
    if(!code) return alert('Entrez un code PIV ou code d\'accès.');
    try{
      // check piv_codes
      const pivDoc = await getDoc(doc(db,'piv_codes',code));
      if(pivDoc.exists() && pivDoc.data().valid){
        // store unlocked flag
        localStorage.setItem('premium_access','piv:'+code);
        alert('Accès premium (PIV) validé — vous pouvez maintenant créer un défi.');
        modal.classList.add('hidden');
        return;
      }
      // check codes (paid codes)
      const paidDoc = await getDoc(doc(db,'codes',code));
      if(paidDoc.exists() && paidDoc.data().valid){
        localStorage.setItem('premium_access','code:'+code);
        alert('Accès premium validé — vous pouvez maintenant créer un défi.');
        modal.classList.add('hidden');
        return;
      }
      alert('Code invalide. Vérifiez ou demandez un code au créateur.');
    }catch(e){ console.error(e); alert('Erreur validation code'); }
  });

  // Create button: redirect to create only if unlocked
  btnCreate && btnCreate.addEventListener('click', ()=>{
    const has = localStorage.getItem('premium_access');
    if(!has){
      if(confirm('Vous n\'avez pas d\'accès premium. Voulez-vous entrer un code maintenant ?')){
        modal.classList.remove('hidden'); return;
      } else {
        return;
      }
    }
    location.href='create.html';
  });
}

/* -------------------- CREATE PAGE -------------------- */
if(path === 'create.html'){
  const hostNameInput = $('hostName');
  const avatarList = $('avatarList');
  const questionsList = $('questionsList');
  const themeSelect = $('themeSelect');
  const modeCrush = $('modeCrush');
  const modeAnon = $('modeAnon');
  const createRoomBtn = $('createRoom');
  const previewBtn = $('previewRoom');
  const createdBox = $('createdBox');
  const lockedNotice = $('lockedNotice');

  // check access
  const has = localStorage.getItem('premium_access');
  if(!has){
    lockedNotice.classList.remove('hidden');
    createRoomBtn.disabled = true;
  }

  // render avatars (use fallback if assets missing)
  AVATARS.forEach((src,i)=>{
    const d = document.createElement('div'); d.className='avatar';
    d.dataset.src = src;
    d.innerHTML = `<img src="${src}" alt="avatar ${i+1}" onerror="this.src='https://picsum.photos/200/200?random=${i+10}'" />`;
    d.addEventListener('click', ()=> {
      document.querySelectorAll('.avatar').forEach(a=>a.classList.remove('selected'));
      d.classList.add('selected');
    });
    avatarList.appendChild(d);
  });

  // render questions editors
  DEFAULT_QUESTIONS.forEach((q,i)=>{
    const div = document.createElement('div'); div.className='question';
    div.innerHTML = `<label>Q${i+1}</label>
      <input id="q${i}" value="${q}" />
      <input id="a${i}" placeholder="Réponse de l'hôte (ex : Pizza)" />`;
    questionsList.appendChild(div);
  });

  // create room
  createRoomBtn.addEventListener('click', async ()=>{
    if(!localStorage.getItem('premium_access')) return alert('Accès premium requis.');
    const host = (hostNameInput.value||'').trim();
    if(!host) return alert('Entrez le nom de l\'hôte.');
    const selected = document.querySelector('.avatar.selected');
    const avatar = selected ? selected.dataset.src : AVATARS[0];
    const theme = themeSelect.value;
    const crush = modeCrush.checked;
    const anon = modeAnon.checked;

    const questions = [];
    for(let i=0;i<DEFAULT_QUESTIONS.length;i++){
      const qText = document.getElementById(`q${i}`).value || DEFAULT_QUESTIONS[i];
      const ans = document.getElementById(`a${i}`).value || '';
      questions.push({ question: qText.replace('__NOM__', host), answer: ans });
    }

    const uid = genUID(host);
    const roomDoc = { uid, host, avatar, theme, crushMode: crush, anonMode: anon, premium: true, questions, createdAt: new Date() };

    try{
      await setDoc(doc(db,'rooms',uid), roomDoc);
      createdBox.classList.remove('hidden');
      const base = location.origin + location.pathname.replace(/create\.html.*$/,'');
      const link = `${base}play.html?uid=${encodeURIComponent(uid)}`;
      createdBox.innerHTML = `<h3>✅ Défi premium créé !</h3>
        <p><strong>UID :</strong> ${esc(uid)}</p>
        <input readonly value="${link}" style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd" />
        <div class="row" style="margin-top:8px">
          <button id="copyLink" class="btn ghost">Copier le lien</button>
          <a target="_blank" href="https://wa.me/?text=${encodeURIComponent('Viens deviner le défi de '+host+': '+link)}" class="btn">Partager WA</a>
        </div>`;
      $('copyLink').addEventListener('click', ()=>{ navigator.clipboard.writeText(link); alert('Lien copié !'); });
    }catch(e){ console.error(e); alert('Erreur création room: '+e.message); }
  });

  previewBtn.addEventListener('click', ()=> {
    const host = (hostNameInput.value||'Hôte').trim();
    const selected = document.querySelector('.avatar.selected');
    const avatar = selected ? selected.dataset.src : AVATARS[0];
    const tmp = { host, avatar, theme: themeSelect.value, crushMode: modeCrush.checked, anonMode: modeAnon.checked, questions: [] };
    for(let i=0;i<DEFAULT_QUESTIONS.length;i++){
      tmp.questions.push({ question: document.getElementById(`q${i}`).value || DEFAULT_QUESTIONS[i], answer: document.getElementById(`a${i}`).value||'' });
    }
    sessionStorage.setItem('tmpPremiumPreview', JSON.stringify(tmp));
    window.open('play.html?preview=1','_blank');
  });
}

/* -------------------- PLAY PAGE -------------------- */
if(path === 'play.html'){
  // DOM
  const uidInput = $('uidInput');
  const openByUID = $('openByUID');
  const openByLink = $('openByLink');
  const joinArea = $('joinArea');
  const roomBlock = $('roomBlock');
  const hostAvatarImg = $('hostAvatar');
  const hostNameTitle = $('hostNameTitle');
  const roomMeta = $('roomMeta');
  const quizArea = $('quizArea');
  const playerNameInput = $('playerName');
  const startPlay = $('startPlay');
  const resultBox = $('resultBox');
  const hostDisplay = $('hostDisplay');
  const leaderboard = $('leaderboard');
  const podium = $('podium');
  const shareWA = $('shareWA');
  const shareTik = $('shareTik');
  const shareIG = $('shareIG');
  const copyLinkBtn = $('copyLink');
  const bgMusic = $('bgMusic');
  const toggleMusic = $('toggleMusic');
  const themePreview = $('themePreview');

  let currentRoom = null;
  let currentUID = null;
  let currentPlayer = null;

  async function openRoom(uid, preview=false){
    if(preview){
      const tmp = JSON.parse(sessionStorage.getItem('tmpPremiumPreview') || '{}');
      if(!tmp){ alert('Aucun preview'); return; }
      currentRoom = tmp; currentUID = 'PREVIEW'; renderRoom(); return;
    }

    try{
      const snap = await getDoc(doc(db,'rooms',uid));
      if(!snap.exists()) { alert('Défi introuvable'); return; }
      currentRoom = snap.data(); currentUID = uid; renderRoom();
      // live leaderboard
      const playersCol = collection(db,'rooms',uid,'players');
      onSnapshot(query(playersCol, orderBy('score','desc')), snapPlayers=>{
        const arr=[]; snapPlayers.forEach(d=>arr.push(d.data())); renderLeaderboard(arr);
      });
    }catch(e){ console.error(e); alert('Erreur lecture room: '+e.message); }
  }

  function renderRoom(){
    joinArea.classList.add('hidden'); roomBlock.classList.remove('hidden');
    hostAvatarImg.src = currentRoom.avatar || AVATARS[0];
    hostAvatarImg.onerror = ()=> hostAvatarImg.src = 'https://picsum.photos/200/200?random=5';
    hostNameTitle.textContent = currentRoom.host || 'Hôte';
    hostDisplay.textContent = currentRoom.host || 'Hôte';
    roomMeta.textContent = `${currentRoom.premium ? 'Premium' : 'Standard'} • Thème: ${currentRoom.theme || 'Classique'}`;
    themePreview.innerHTML = `<option>${currentRoom.theme || 'default'}</option>`;

    quizArea.innerHTML = '';
    (currentRoom.questions || []).forEach((q,i)=>{
      const div = document.createElement('div'); div.className='quiz-item';
      div.innerHTML = `<p>${i+1}. ${q.question}</p>`;
      quizArea.appendChild(div);
    });

    const base = location.origin + location.pathname.replace(/play\.html.*$/,'');
    const link = `${base}play.html?uid=${encodeURIComponent(currentUID)}`;
    shareWA.onclick = ()=> window.open(`https://wa.me/?text=${encodeURIComponent('Viens jouer au défi de '+currentRoom.host+' : '+link)}`);
    shareTik.onclick = ()=> { navigator.clipboard.writeText(link); alert('Lien copié — partage sur TikTok'); };
    shareIG.onclick = ()=> { navigator.clipboard.writeText(link); alert('Lien copié — collez sur Instagram'); };
    copyLinkBtn.onclick = ()=> { navigator.clipboard.writeText(link); alert('Lien copié'); };
  }

  function renderLeaderboard(arr){
    leaderboard.innerHTML=''; if(!arr.length){ leaderboard.innerHTML='<li>Aucun joueur pour le moment</li>'; podium.innerHTML=''; return; }
    arr.sort((a,b)=> b.score - a.score);
    const top3 = arr.slice(0,3);
    podium.innerHTML = top3.map((p,i)=>`<div class="slot"><div>${i===0?'🥇':i===1?'🥈':'🥉'}</div><div style="font-weight:700">${esc(p.name)}</div><div>${p.score}/${(currentRoom.questions||[]).length}</div></div>`).join('');
    arr.forEach(p=>{ const li=document.createElement('li'); li.innerHTML=`<strong>${esc(p.name)}</strong> — ${p.score}/${(currentRoom.questions||[]).length} <span class="muted">| ${p.playedAt ? new Date(p.playedAt.seconds*1000).toLocaleString() : ''}</span>`; leaderboard.appendChild(li); });
  }

  openByUID && openByUID.addEventListener('click', ()=> { const id=uidInput.value.trim(); if(!id) return alert('Entrez un UID'); openRoom(id,false); });

  openByLink && openByLink.addEventListener('click', ()=> {
    const params = new URLSearchParams(location.search);
    const uid = params.get('uid');
    const preview = params.get('preview');
    if(uid) openRoom(uid,false); else if(preview) openRoom(null,true); else alert('Aucun paramètre uid dans le lien.');
  });

  // play flow
  startPlay && startPlay.addEventListener('click', ()=> {
    const player = (playerNameInput.value||'').trim(); if(!player) return alert('Entrez votre prénom');
    currentPlayer = player;
    if(currentRoom.premium && currentUID !== 'PREVIEW'){
      const accessKey = `premium_access_${currentUID}`;
      const hasAccess = localStorage.getItem(accessKey);
      if(!hasAccess){
        const code = prompt('Ce défi est premium. Entrez votre code MonCash / NatCash / PIV :');
        if(!code) return;
        // check piv_codes then codes
        getDoc(doc(db,'piv_codes',code)).then(pivDoc=>{
          if(pivDoc.exists() && pivDoc.data().valid){
            localStorage.setItem(accessKey,'piv:'+code); alert('Accès PIV validé'); showQuiz(); return;
          }
          getDoc(doc(db,'codes',code)).then(cdoc=>{
            if(cdoc.exists() && cdoc.data().valid){
              localStorage.setItem(accessKey,'code:'+code); alert('Accès validé'); showQuiz(); return;
            } else {
              alert('Code invalide. Contactez le créateur.');
            }
          });
        }).catch(e=>{ console.error(e); alert('Erreur vérif code'); });
        return;
      }
    }
    showQuiz();
  });

  function showQuiz(){
    const qEls = quizArea.querySelectorAll('.quiz-item');
    qEls.forEach((el,i)=>{
      const q = currentRoom.questions[i];
      if(q && q.options && q.options.length){
        el.innerHTML = `<p>${i+1}. ${q.question}</p>`;
        q.options.forEach(opt=>{ const b=document.createElement('button'); b.className='btn'; b.textContent=opt; b.addEventListener('click', ()=> selectChoice(i,opt)); el.appendChild(b); });
      } else {
        el.innerHTML += `<input id="resp${i}" placeholder="Votre réponse..." style="margin-top:8px;padding:8px;width:100%;border-radius:8px;border:1px solid #ddd" />`;
      }
    });
    const submit = document.createElement('div'); submit.className='row'; submit.style.marginTop='12px';
    const btn = document.createElement('button'); btn.className='btn primary'; btn.textContent='Soumettre'; btn.addEventListener('click', submitAnswers); submit.appendChild(btn); quizArea.appendChild(submit);
    const pf = $('playerForm'); if(pf && pf.classList) pf.classList.add('hidden');
  }

  const answersMap = {};
  function selectChoice(index,opt){ answersMap[index]=opt; }

  async function submitAnswers(){
    let score=0; const total=(currentRoom.questions||[]).length;
    currentRoom.questions.forEach((q,i)=>{ const given = answersMap[i] || (document.getElementById(`resp${i}`)?.value || '').trim(); const correct=q.answer||''; if(correct && given && given.toLowerCase()===correct.toLowerCase()) score++; });
    try{ await addDoc(collection(db,'rooms',currentUID,'players'),{ name: currentPlayer, score, answers: answersMap, playedAt: new Date() }); } catch(e){ console.error(e); }
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = `<h3>Bravo ${esc(currentPlayer)} 🎉</h3><p>Score: <strong>${score}/${total}</strong></p><p>Badge: <strong>${badgeForScore(score,total)}</strong></p><div class="row"><button class="btn ghost" onclick="location.reload()">Rejouer</button><button class="btn primary" onclick="location.href='create.html'">Créer un défi</button></div>`;
    burstConfetti();
  }

  // music control (play requires user gesture)
  toggleMusic && toggleMusic.addEventListener('click', ()=>{ if(bgMusic.paused){ bgMusic.play(); toggleMusic.textContent='⏸ Musique'; } else { bgMusic.pause(); toggleMusic.textContent='⏵ Musique'; } });

  // auto open if uid param present
  const params = new URLSearchParams(window.location.search);
  const uidParam = params.get('uid');
  const preview = params.get('preview');
  if(uidParam) openRoom(uidParam, preview==='1');
}