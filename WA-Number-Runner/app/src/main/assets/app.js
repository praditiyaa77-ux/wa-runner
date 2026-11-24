const STATUS = { pending: "Menunggu", verified: "Terverifikasi", review: "Perlu ditinjau" };
let numbers = [];
let history = [];

function bridgeAvailable() {
  return typeof AndroidBridge !== "undefined";
}
function loadStore() {
  try {
    if (bridgeAvailable()) {
      const saved = JSON.parse(AndroidBridge.loadNumbers() || "[]");
      numbers = Array.isArray(saved) ? saved : [];
    } else {
      numbers = JSON.parse(localStorage.getItem("numbers") || "[]");
      history = JSON.parse(localStorage.getItem("history") || "[]");
    }
  } catch (_) { numbers = []; }
}
function persist() {
  const payload = JSON.stringify(numbers);
  if (bridgeAvailable()) AndroidBridge.saveNumbers(payload);
  else localStorage.setItem("numbers", payload);
  if (!bridgeAvailable()) localStorage.setItem("history", JSON.stringify(history));
}
function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2100);
}
function logActivity(title, detail) {
  history.unshift({ title, detail, time: new Date().toISOString() });
  history = history.slice(0, 100);
  persist();
  renderHistory();
}
function normalizeNumber(value) {
  return String(value || "").trim().replace(/[^\d]/g, "");
}
function addNumber(raw) {
  const number = normalizeNumber(raw);
  if (number.length < 7 || number.length > 15) { toast("Nomor harus 7–15 digit"); return; }
  if (numbers.some(n => n.number === number)) { toast("Nomor sudah ada"); return; }
  numbers.unshift({ id: cryptoId(), number, status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  persist(); logActivity("Nomor ditambahkan", number); renderAll(); toast("Nomor berhasil ditambahkan");
}
function cryptoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function setStatus(id, status) {
  const item = numbers.find(n => n.id === id);
  if (!item) return;
  item.status = status; item.updatedAt = new Date().toISOString();
  persist(); logActivity("Status diperbarui", `${item.number} · ${STATUS[status]}`);
  renderAll(); toast("Status diperbarui");
}
function removeNumber(id) {
  const item = numbers.find(n => n.id === id);
  if (!item) return;
  if (!confirm(`Hapus nomor ${item.number}?`)) return;
  numbers = numbers.filter(n => n.id !== id);
  persist(); logActivity("Nomor dihapus", item.number); renderAll(); toast("Nomor dihapus");
}
function openWhatsApp(number) {
  if (bridgeAvailable()) AndroidBridge.openWhatsApp(number);
  else window.open("https://wa.me/" + number, "_blank");
}
function renderStats() {
  document.getElementById("totalCount").textContent = numbers.length;
  document.getElementById("verifiedCount").textContent = numbers.filter(n => n.status === "verified").length;
  document.getElementById("pendingCount").textContent = numbers.filter(n => n.status === "pending").length;
  document.getElementById("reviewCount").textContent = numbers.filter(n => n.status === "review").length;
  document.getElementById("listCount").textContent = `${numbers.length} nomor`;
}
function renderNumbers() {
  const q = document.getElementById("searchInput").value.trim();
  const list = document.getElementById("numberList");
  const filtered = numbers.filter(n => n.number.includes(q));
  list.innerHTML = "";
  document.getElementById("emptyState").style.display = filtered.length ? "none" : "block";
  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "number-card";
    const main = document.createElement("div"); main.className = "number-main";
    const strong = document.createElement("strong"); strong.textContent = "+" + item.number;
    const small = document.createElement("small"); small.textContent = "Ditambahkan " + new Date(item.createdAt).toLocaleDateString("id-ID");
    main.append(strong, small);
    const badge = document.createElement("span"); badge.className = "status status-" + item.status; badge.textContent = STATUS[item.status] || "Menunggu";
    const wrap = document.createElement("div"); wrap.style.width = "100%";
    const top = document.createElement("div"); top.style.display = "flex"; top.style.alignItems = "center"; top.style.gap = "8px"; top.append(main, badge);
    const actions = document.createElement("div"); actions.className = "card-actions";
    const open = makeButton("Buka WhatsApp", "open", () => openWhatsApp(item.number));
    const verified = makeButton("Terverifikasi", "", () => setStatus(item.id, "verified"));
    const review = makeButton("Perlu ditinjau", "", () => setStatus(item.id, "review"));
    const pending = makeButton("Reset", "", () => setStatus(item.id, "pending"));
    const del = makeButton("Hapus", "delete", () => removeNumber(item.id));
    actions.append(open, verified, review, pending, del); wrap.append(top, actions); card.append(wrap); list.append(card);
  });
}
function makeButton(label, cls, action) {
  const b = document.createElement("button"); b.className = "mini-btn " + cls; b.textContent = label; b.addEventListener("click", action); return b;
}
function renderHistory() {
  const list = document.getElementById("historyList"); list.innerHTML = "";
  document.getElementById("historyEmpty").style.display = history.length ? "none" : "block";
  history.slice(0, 60).forEach(item => {
    const card = document.createElement("article"); card.className = "history-item";
    const title = document.createElement("strong"); title.textContent = item.title;
    const detail = document.createElement("p"); detail.textContent = item.detail;
    const time = document.createElement("time"); time.textContent = new Date(item.time).toLocaleString("id-ID");
    card.append(title, detail, time); list.append(card);
  });
}
function renderAll() { renderStats(); renderNumbers(); renderHistory(); }
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.toggle("active", p.id === "page-" + name));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("selected", b.dataset.page === name));
}
document.querySelectorAll("[data-page]").forEach(b => b.addEventListener("click", () => showPage(b.dataset.page)));
document.getElementById("addBtn").addEventListener("click", () => {
  const input = document.getElementById("numberInput"); addNumber(input.value); input.value = "";
});
document.getElementById("numberInput").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("addBtn").click(); });
document.getElementById("searchInput").addEventListener("input", renderNumbers);
document.getElementById("importBtn").addEventListener("click", () => document.getElementById("fileInput").click());
document.getElementById("fileInput").addEventListener("change", async e => {
  const file = e.target.files[0]; if (!file) return;
  const text = await file.text(); let added = 0, skipped = 0;
  text.split(/\r?\n/).forEach(line => {
    const candidate = line.split(/[;,]/)[0].replace(/^["']|["']$/g, "").trim();
    if (!candidate || /phone|number|nomor/i.test(candidate)) return;
    const n = normalizeNumber(candidate);
    if (n.length < 7 || n.length > 15 || numbers.some(x => x.number === n)) { skipped++; return; }
    numbers.unshift({ id: cryptoId(), number: n, status: "pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); added++;
  });
  persist(); if (added) logActivity("Import nomor", `${added} ditambahkan, ${skipped} dilewati`);
  renderAll(); toast(`${added} nomor ditambahkan · ${skipped} dilewati`); e.target.value = "";
});
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = { app: "WA Number Runner", version: "1.0.0", exportedAt: new Date().toISOString(), numbers, history };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = "wa-number-runner-backup.json"; a.click(); URL.revokeObjectURL(url); toast("Cadangan JSON dibuat");
});
document.getElementById("clearBtn").addEventListener("click", () => {
  if (!confirm("Yakin hapus seluruh nomor dan riwayat? Tindakan ini tidak dapat dibatalkan.")) return;
  numbers = []; history = []; persist(); renderAll(); toast("Semua data lokal dihapus");
});
loadStore(); renderAll();
