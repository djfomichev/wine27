"use strict";
let manifest = null;
let slides = [];
const image = document.getElementById("slide-image");
const title = document.getElementById("slide-title");
const previous = document.getElementById("previous");
const next = document.getElementById("next");
const presentation = document.getElementById("presentation");
const stage = document.getElementById("stage");
const gridDialog = document.getElementById("grid-dialog");
const textDialog = document.getElementById("text-dialog");
const grid = document.getElementById("slide-grid");
const search = document.getElementById("slide-search");
const fullButton = document.getElementById("fullscreen");
let current = 0;
let gridBuilt = false;
let touchStart = null;
const preload = [new Image(), new Image()];

function clampIndex(index, total) {
  return Math.max(0, Math.min(total - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
}
function destinationIndex(index, action, total) {
  if (action === "first") return 0;
  if (action === "last") return total - 1;
  return clampIndex(index + (action === "next" ? 1 : action === "previous" ? -1 : 0), total);
}
function indexFromHash(hash, total) {
  const match = /^#(?:slide-)?(\d+)$/.exec(hash);
  return match ? clampIndex(Number(match[1]) - 1, total) : 0;
}
function cleanSearch(value) {
  return value.toLocaleLowerCase("ru").replace(/ё/g,"е").trim();
}
function setParagraphs(element, value) {
  element.replaceChildren();
  String(value || "").split(/\n\s*\n/).filter(Boolean).forEach(function (part) {
    const paragraph = document.createElement("p");
    paragraph.textContent = part;
    element.appendChild(paragraph);
  });
}
function show(index, updateHash = true) {
  if (!slides.length) return;
  current = clampIndex(index, slides.length);
  const slide = slides[current];
  document.getElementById("image-error").hidden = true;
  image.alt = slide.title;
  image.src = slide.src;
  title.textContent = slide.title;
  title.title = slide.title;
  document.getElementById("current-number").textContent = String(current + 1);
  document.getElementById("total-number").textContent = String(slides.length);
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  document.getElementById("announcement").textContent = "Слайд " + (current + 1) + " из " + slides.length + ": " + slide.title;
  document.getElementById("accessible-title").textContent = slide.title;
  setParagraphs(document.getElementById("accessible-text"), slide.text);
  document.title = slide.title + " · Белый мыс 2027";
  if (gridBuilt) {
    grid.querySelectorAll(".thumb").forEach(function (button) {
      if (Number(button.dataset.index) === current) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }
  if (updateHash) {
    try { history.replaceState(null, "", "#slide-" + (current + 1)); }
    catch (error) { /* The presentation still works when history is unavailable. */ }
  }
  [current - 1, current + 1].forEach(function (nearby, slot) {
    if (nearby >= 0 && nearby < slides.length) preload[slot].src = slides[nearby].src;
  });
}
function navigate(action) { if(!slides.length)return;show(destinationIndex(current, action, slides.length)); }
function buildGrid() {
  if (gridBuilt) return;
  const fragment = document.createDocumentFragment();
  slides.forEach(function (slide, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumb";
    button.dataset.index = String(index);
    button.dataset.search = cleanSearch(slide.title+" "+slide.text);
    button.setAttribute("aria-label", "Слайд " + (index + 1) + ". " + slide.title);
    if (index === current) button.setAttribute("aria-current", "true");
    const wrap = document.createElement("span");
    wrap.className = "thumb-image-wrap";
    const thumbnail = document.createElement("img");
    thumbnail.src = slide.thumbnail || slide.src;
    thumbnail.alt = "";
    thumbnail.loading = "lazy";
    thumbnail.decoding = "async";
    thumbnail.width = 320;
    thumbnail.height = 180;
    wrap.appendChild(thumbnail);
    const caption = document.createElement("span");
    caption.className = "thumb-caption";
    const number = document.createElement("span");
    number.className = "thumb-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const captionTitle = document.createElement("span");
    captionTitle.className = "thumb-title";
    captionTitle.textContent = slide.title;
    caption.append(number, captionTitle);
    button.append(wrap, caption);
    button.addEventListener("click", function () { show(index); gridDialog.close(); stage.focus({preventScroll:true}); });
    fragment.appendChild(button);
  });
  grid.appendChild(fragment);
  gridBuilt = true;
}
function openGrid() {
  if(!slides.length)return;
  buildGrid();
  search.value = "";
  filterGrid();
  gridDialog.showModal();
  requestAnimationFrame(function () {
    const selected = grid.querySelector('[aria-current="true"]');
    if (selected) selected.scrollIntoView({block:"center", behavior:"auto"});
    if (window.matchMedia("(max-width:620px)").matches) document.getElementById("close-grid").focus({preventScroll:true});
    else search.focus({preventScroll:true});
  });
}
function filterGrid() {
  const query = cleanSearch(search.value);
  let count = 0;
  grid.querySelectorAll(".thumb").forEach(function (button) {
    const number = Number(button.dataset.index) + 1;
    const numeric = /^\d+$/.test(query);
    const matches = !query || (numeric ? number === Number(query) : button.dataset.search.includes(query));
    button.hidden = !matches;
    if (matches) count++;
  });
  document.getElementById("no-results").hidden = count > 0;
}
function openText() {
  if(!slides.length)return;
  document.getElementById("text-title").textContent = slides[current].title;
  setParagraphs(document.getElementById("text-body"), slides[current].text);
  textDialog.showModal();
  document.getElementById("text-body").scrollTop = 0;
}
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
  } catch (error) { /* Keep the normal viewer available if the browser declines. */ }
}
function refreshFullscreen() {
  const active = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  fullButton.setAttribute("aria-pressed", String(active));
  fullButton.setAttribute("aria-label", active ? "Выйти из полного экрана" : "На весь экран");
  fullButton.title = active ? "Выйти из полного экрана (F)" : "На весь экран (F)";
}
previous.addEventListener("click", function () { navigate("previous"); });
next.addEventListener("click", function () { navigate("next"); });
document.getElementById("open-grid").addEventListener("click", openGrid);
document.getElementById("close-grid").addEventListener("click", function () { gridDialog.close(); });
document.getElementById("open-text").addEventListener("click", openText);
document.getElementById("close-text").addEventListener("click", function () { textDialog.close(); });
search.addEventListener("input", filterGrid);
search.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const found = grid.querySelectorAll(".thumb:not([hidden])");
    if (found.length === 1) { event.preventDefault(); found[0].click(); }
  }
});
fullButton.addEventListener("click", toggleFullscreen);
if (!document.documentElement.requestFullscreen && !document.documentElement.webkitRequestFullscreen) fullButton.hidden = true;
document.addEventListener("fullscreenchange", refreshFullscreen);
document.addEventListener("webkitfullscreenchange", refreshFullscreen);
image.addEventListener("error", function () { document.getElementById("image-error").hidden = false; });
window.addEventListener("hashchange", function () { show(indexFromHash(location.hash, slides.length), false); });
document.addEventListener("keydown", function (event) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
  if (gridDialog.open || textDialog.open) return;
  const target = event.target;
  if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
  const actions = {ArrowRight:"next", ArrowLeft:"previous", PageDown:"next", PageUp:"previous", Home:"first", End:"last"};
  if (actions[event.key]) { event.preventDefault(); navigate(actions[event.key]); }
  else if (event.key.toLowerCase() === "g") { event.preventDefault(); openGrid(); }
  else if (event.key.toLowerCase() === "t") { event.preventDefault(); openText(); }
  else if (event.key.toLowerCase() === "f") { event.preventDefault(); toggleFullscreen(); }
});
stage.addEventListener("pointerdown", function (event) {
  if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
  if ((window.visualViewport?.scale || 1)>1 || touchStart) {touchStart=null; return;}
  touchStart = {x:event.clientX, y:event.clientY, time:performance.now(), id:event.pointerId};
});
stage.addEventListener("pointercancel", function () { touchStart = null; });
stage.addEventListener("pointerup", function (event) {
  if (!touchStart || touchStart.id !== event.pointerId) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  const elapsed = performance.now() - touchStart.time;
  touchStart = null;
  if (elapsed < 1800 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) navigate(dx < 0 ? "next" : "previous");
});
[gridDialog, textDialog].forEach(function (dialog) {
  dialog.addEventListener("click", function (event) {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});
boot();
refreshFullscreen();

function nearestSurvivor(oldSlides,index,newSlides){
 const keys=new Map(newSlides.map((s,i)=>[s.key,i]));
 for(let distance=0;distance<oldSlides.length;distance++)for(const candidate of [index-distance,index+distance])if(oldSlides[candidate]&&keys.has(oldSlides[candidate].key))return keys.get(oldSlides[candidate].key);
 return clampIndex(index,newSlides.length);
}
async function checkedManifest(){
 const response=await fetch('manifest.json',{cache:'no-store'});if(!response.ok)throw Error('manifest');const m=await response.json();
 const htmlRelease=document.querySelector('meta[name="wine27-version"]').content;
 if(m.releaseId!==htmlRelease){const error=Error('release');error.candidate=m;throw error;}
 const version=await fetch('site-version.json',{cache:'no-store'}).then(r=>r.json());if(version.version!==m.releaseId||version.contentRevision!==m.contentRevision)throw Error('version');
 if(m.pageCount!==m.slides.length||new Set(m.slides.map(s=>s.key)).size!==m.pageCount)throw Error('pages');
 const proof=await fetch(m.assetManifestUrl,{cache:'no-store'}).then(r=>r.json());
 if(proof.pdfSha256!==m.pdfSha256||proof.contentRevision!==m.contentRevision||proof.pageCount!==m.pageCount)throw Error('assets');
 const head=await fetch(m.pdfUrl,{method:'HEAD',cache:'no-cache'});if(!head.ok||Number(head.headers.get('content-length'))!==m.pdfBytes)throw Error('pdf');
 return m;
}
function install(m){
 const selected=slides.length?nearestSurvivor(slides,current,m.slides):indexFromHash(location.hash,m.slides.length);
 manifest=m;slides=m.slides;gridBuilt=false;grid.replaceChildren();
 const download=document.getElementById('download-pdf');download.href=m.pdfUrl;download.setAttribute('download',m.pdfUrl.split('/').pop());
 document.getElementById('viewer-version').textContent='Версия '+m.presentationVersion+' · '+new Date(m.generatedAt).toLocaleDateString('ru-RU');
 show(selected,false);
}
async function recoverRelease(candidate){
 const nextHTML=await fetch('index.html?v='+encodeURIComponent(candidate.releaseId),{cache:'no-store'}).then(r=>r.text());
 if(!nextHTML.includes('content="'+candidate.releaseId+'"'))return false;
 const version=await fetch('site-version.json',{cache:'no-store'}).then(r=>r.json());
 if(version.version!==candidate.releaseId||version.contentRevision!==candidate.contentRevision)return false;
 const proof=await fetch(candidate.assetManifestUrl,{cache:'no-store'}).then(r=>r.json());
 const head=await fetch(candidate.pdfUrl,{method:'HEAD',cache:'no-cache'});
 if(proof.pdfSha256!==candidate.pdfSha256||proof.contentRevision!==candidate.contentRevision||proof.pageCount!==candidate.pageCount||!head.ok||Number(head.headers.get('content-length'))!==candidate.pdfBytes)return false;
 const index=slides.length?nearestSurvivor(slides,current,candidate.slides):indexFromHash(location.hash,candidate.slides.length);
 location.replace('index.html?v='+encodeURIComponent(candidate.releaseId)+'#slide-'+(index+1));return true;
}
async function boot(){
 try {const m=await checkedManifest();install(m);} catch(error){
  if(error.candidate){try{if(await recoverRelease(error.candidate))return;}catch(recoveryError){/* Wait for a coherent publication. */}}
  document.getElementById('image-error').textContent='Презентация обновляется. Повторяем загрузку…';document.getElementById('image-error').hidden=false;setTimeout(boot,5000);return;
 }
 setInterval(async()=>{
  if(document.hidden||gridDialog.open||textDialog.open)return;
  try{const candidate=await fetch('manifest.json',{cache:'no-store'}).then(r=>r.json());if(candidate.releaseId!==manifest.releaseId)await recoverRelease(candidate);}catch(error){/* Keep the working version while publication/CDN catches up. */}
 },15000);
}
