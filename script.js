
/* ====== PENGATURAN: ganti bagian ini ====== */
const CONFIG = {
  brand: "churrosByte",
  instagram: "churos.byte",                                 
  gformUrl: "https://forms.gle/C8wtvDczcAaYqcoW8",                                            
};
const SIZES = { S: {label:"15 pcs", mult:1},};
const MENU = [
  {id:"cho", name:"Chocolate ", desc:"Disiram saus cokelat pekat yang meleleh.", base:10000, c:"#6C3BFF", drip:"#5A2E1B"},
  {id:"mat", name:"Matcha ", desc:"Matcha creamy dengan sedikit pahit.", base:10000, c:"#00B8A9", drip:"#9BE564"},
  ];
/* ========================================== */

const $ = s => document.querySelector(s);
const rp = n => "Rp" + n.toLocaleString("id-ID");
const priceOf = (m, s) => Math.round(m.base * SIZES[s].mult / 1000) * 1000;
let cart = [];

function bite(fill, drip){
  return `<svg viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="34" ry="6" fill="rgba(0,0,0,.15)"/><rect x="14" y="14" width="72" height="62" rx="30" fill="#E3A24F"/><path d="M26 30q4-10 14-8M60 24q12-4 18 8" stroke="#F6C77F" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M20 38q12 14 22 0t22 0t16-4v10q-12 14-22 2t-22 2t-16-2z" fill="${drip}"/><circle cx="36" cy="56" r="3" fill="${fill}"/><circle cx="58" cy="60" r="3" fill="#fff"/><circle cx="70" cy="52" r="3" fill="${fill}"/></svg>`;
}

/* hero */
$("#stage").innerHTML = [["#FFE3A3","#FF3D81"],["#FFC400","#6C3BFF"],["#fff","#5A2E1B"],["#9BE564","#00B8A9"],["#2F7BFF","#F4F4F4"]].map(a=>bite(a[1],a[0])).join("");

/* menu */
$("#grid").innerHTML = MENU.map(m => `
  <article class="card" style="--c:${m.c}">
    <div class="pic">${bite("#fff", m.drip)}</div>
    <div class="body">
      <h3>${m.name}</h3>
      <p>${m.desc}</p>
      <div class="sizes" role="radiogroup" aria-label="Ukuran ${m.name}">
        ${Object.keys(SIZES).map((k,i)=>`<label><input type="radio" name="sz-${m.id}" value="${k}" ${i===0?"checked":""}><span>${SIZES[k].label}</span></label>`).join("")}
      </div>
      <div class="buy">
        <span class="price" data-price="${m.id}">${rp(priceOf(m,"S"))}</span>
        <button class="add" data-add="${m.id}">Tambah</button>
      </div>
    </div>
  </article>`).join("");

function selSize(id){ return (document.querySelector(`input[name="sz-${id}"]:checked`)||{}).value || "S"; }
document.querySelectorAll(".sizes input").forEach(r => r.addEventListener("change", e => {
  const id = e.target.name.replace("sz-","");
  const m = MENU.find(x => x.id === id);
  document.querySelector(`[data-price="${id}"]`).textContent = rp(priceOf(m, e.target.value));
}));
document.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
  const id = b.dataset.add, s = selSize(id), key = id + s;
  const ex = cart.find(l => l.key === key);
  ex ? ex.qty++ : cart.push({key, id, s, qty:1});
  render(); toast("Ditambahkan ke keranjang");
}));


/* ringkasan + kirim */
function summary(){
  const lines = cart.map(l => { const m = MENU.find(x=>x.id===l.id); return `- ${m.name} (${SIZES[l.s].label}) x${l.qty} = ${rp(priceOf(m,l.s)*l.qty)}`; });
  const out = [`Pesanan ${CONFIG.brand}`, ...lines, `Total: ${rp(total())}`, "",
    `Nama: ${$("#nama").value.trim()}`, `WhatsApp: ${$("#wa").value.trim()}`, `Metode: ${$("#metode").value}`];
  if($("#metode").value === "Diantar") out.push(`Alamat: ${$("#alamat").value.trim()}`);
  if($("#catatan").value.trim()) out.push(`Catatan: ${$("#catatan").value.trim()}`);
  return out.join("\n");
}
function check(){
  if(!cart.length){ toast("Tambahkan menu dulu"); return false; }
  if(!$("#nama").value.trim() || !$("#wa").value.trim()){ toast("Isi nama dan nomor WhatsApp"); return false; }
  if($("#metode").value === "Diantar" && !$("#alamat").value.trim()){ toast("Isi alamat antar"); return false; }
  return true;
}
async function copyText(t){
  const box = $("#sum"); box.value = t; box.hidden = false;
  try { await navigator.clipboard.writeText(t); return true; }
  catch(_) { box.select(); try { return document.execCommand("copy"); } catch(__) { return false; } }
}
$("#sendForm").addEventListener("click", async () => {
  if(!check()) return;
  const text = summary(); const ok = await copyText(text);
  let url = CONFIG.gformUrl;
  if(CONFIG.gformEntryId) url += (url.includes("?") ? "&" : "?") + "usp=pp_url&" + CONFIG.gformEntryId + "=" + encodeURIComponent(text);
  window.open(url, "_blank", "noopener");
  toast(ok ? "Pesanan disalin. Tempel di Google Form." : "Salin ringkasan di kotak, lalu tempel di form.");
});
$("#sendIG").addEventListener("click", async () => {
  if(!check()) return;
  const ok = await copyText(summary());
  window.open("https://www.instagram.com/churos.byte/" + CONFIG.instagram, "_blank", "noopener");
  toast(ok ? "Pesanan disalin. Tempel di DM Instagram." : "Salin ringkasan di kotak, lalu tempel di DM.");
});

/* tautan */
const igUrl = "https://www.instagram.com/churos.byte/" + CONFIG.instagram;
["#igNav","#igHero","#igFoot"].forEach(s => $(s).href = igUrl);
$("#gfFoot").href = CONFIG.gformUrl;

let tt; function toast(t){ const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(()=>el.classList.remove("on"), 2600); }
render();
