/* app.js — gestion locale: rooms, players, VIP requests, validation, ranking
   Tout est stocké dans localStorage (clé unique pour chaque collection).
   - rooms: object { uid: room }
   - pendingPayments: array [{name, txn, date}]
   - vipUsers: object { name: true }
   - globalPlayers: array [{name, score, uid, date}]
*/

export function nowISO(){ return new Date().toISOString(); }

/* ---------- VIP requests ---------- */
export async function requestVip(name, txn){
  const pending = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
  pending.push({ name, txn, date: nowISO() });
  localStorage.setItem('pendingPayments', JSON.stringify(pending));
  return true;
}

export async function listPendingPayments(){
  return JSON.parse(localStorage.getItem('pendingPayments') || '[]');
}

/**
 * validatePayment(txn, removeOnly=false)
 *  - if removeOnly true -> deletes request
 *  - else validates: sets vipUsers[name]=true and removes request
 */
export async function validatePayment(txn, removeOnly=false){
  const pending = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
  const idx = pending.findIndex(p=> p.txn === txn);
  if(idx === -1) return;
  const rec = pending[idx];
  pending.splice(idx,1);
  localStorage.setItem('pendingPayments', JSON.stringify(pending));
  if(!removeOnly){
    const vipUsers = JSON.parse(localStorage.getItem('vipUsers') || '{}');
    vipUsers[rec.name] = true;
    localStorage.setItem('vipUsers', JSON.stringify(vipUsers));
  }
}

/* check if given host name is VIP */
export function isVipUser(name){
  const vipUsers = JSON.parse(localStorage.getItem('vipUsers') || '{}');
  return !!vipUsers[name];
}

/* ---------- Rooms ---------- */
export function genUID(seed='DEF'){
  return (seed||'DEF').toUpperCase().replace(/[^A-Z0-9]+/g,'').slice(0,3) + '-' + Math.random().toString(36).slice(2,7).toUpperCase();
}
export function genOwnerCode(){
  return Math.random().toString(36).slice(2,8).toUpperCase();
}

export async function generateRoom({ host, mode, questions }){
  const uid = genUID(host);
  const ownerCode = genOwnerCode();
  const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
  rooms[uid] = { uid, ownerCode, host, avatar:'', mode, questions, createdAt: nowISO(), players: [] };
  localStorage.setItem('rooms', JSON.stringify(rooms));
  return rooms[uid];
}

export async function openRoomByUID(uid){
  const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
  return rooms[uid] || null;
}

/* ---------- Players (per room) ---------- */
export async function submitPlayerResult(uid, player){
  // player = { name, score, date, verified:false }
  const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
  const room = rooms[uid];
  if(!room) throw new Error('Room introuvable');
  room.players = room.players || [];
  room.players.push(player);
  rooms[uid] = room;
  localStorage.setItem('rooms', JSON.stringify(rooms));
  // also push to global players
  const global = JSON.parse(localStorage.getItem('globalPlayers') || '[]');
  global.push({ name: player.name, score: player.score, uid, date: player.date });
  localStorage.setItem('globalPlayers', JSON.stringify(global));
}

/* listenRoomPlayers(uid, cb) -> here just immediate callback (no real-time)
   In localStorage we can't have real snapshot; consumer can call this to refresh.
*/
export function listenRoomPlayers(uid, cb){
  const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
  const arr = (rooms[uid] && rooms[uid].players) ? rooms[uid].players.slice() : [];
  cb(arr);
  // return a noop unsubscribe
  return ()=> {};
}

/* get players for room */
export async function getRoomPlayers(uid){
  const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
  return (rooms[uid] && rooms[uid].players) ? rooms[uid].players.slice().sort((a,b)=> b.score - a.score) : [];
}

/* get all players global (sorted) */
export async function getAllPlayersGlobal(){
  const global = JSON.parse(localStorage.getItem('globalPlayers') || '[]');
  return global.slice().sort((a,b)=> b.score - a.score);
}

/* owner verify a player by name for a specific room */
export async function ownerVerifyPlayer(uid, playerName){
  const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
  const room = rooms[uid];
  if(!room) throw new Error('Room introuvable');
  room.players = room.players || [];
  const p = room.players.find(pp=> pp.name === playerName);
  if(p) p.verified = true;
  rooms[uid] = room;
  localStorage.setItem('rooms', JSON.stringify(rooms));
}

/* helper to remove room (admin) */
export async function removeRoom(uid){
  const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
  delete rooms[uid];
  localStorage.setItem('rooms', JSON.stringify(rooms));
}

/* expose functions for pages that import this module via <script type="module"> */
export default {
  nowISO, requestVip, listPendingPayments, validatePayment, isVipUser,
  genUID, genOwnerCode, generateRoom, openRoomByUID, submitPlayerResult,
  listenRoomPlayers, getRoomPlayers, getAllPlayersGlobal, ownerVerifyPlayer, removeRoom
};