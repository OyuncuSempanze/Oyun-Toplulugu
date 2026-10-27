import { mockStore } from "./mock-store.js";

const state = {
  guides: [],
  game: "all",
  search: "",
  sort: "recent",
  sourceOnly: false,
  votes: new Map(),
  activeGuideId: null
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const list = $("#guide-list");
const empty = $("#empty-state");
const resultCount = $("#result-count");
const toast = $("#toast");
const typeLabels = { guide: "Rehber", observation: "Oyun içi gözlem", question: "Soru ve yanıt" };
const sourceKindLabels = { official: "Resmî kaynak", secondary: "İkincil kaynak", other: "Diğer bağlantı" };
let toastTimeout;

const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Tarih belirtilmedi";
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function badgeMarkup(guide) {
  const status = guide.status === "reviewed"
    ? '<span class="badge badge-reviewed">İncelendi</span>'
    : '<span class="badge badge-pending">İnceleme bekliyor</span>';
  const experienced = guide.experienced
    ? '<span class="badge badge-experienced" title="Bu işaret katkı geçmişini belirtir, içeriğin onaylandığını göstermez.">Deneyimli katkıcı</span>'
    : "";
  return `${status}<span class="badge badge-type">${escapeHTML(guide.type)}</span>${experienced}`;
}

function visibleGuides() {
  let filtered = state.guides.filter((guide) => {
    const gameMatches = state.game === "all" || guide.game === state.game;
    const needle = state.search.toLocaleLowerCase("tr-TR");
    const searchMatches = !needle || [guide.title, guide.game, guide.summary, guide.body, guide.source, guide.author, guide.type]
      .some((text) => String(text || "").toLocaleLowerCase("tr-TR").includes(needle));
    const sourceMatches = !state.sourceOnly || Boolean(String(guide.source || "").trim());
    return gameMatches && searchMatches && sourceMatches;
  });
  if (state.sort === "helpful") filtered.sort((a, b) => effectiveVotes(b) - effectiveVotes(a));
  if (state.sort === "discussed") filtered.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
  if (state.sort === "recent") filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return filtered;
}

function effectiveVotes(guide) {
  return Number(guide.votes) || 0;
}

function renderGuide(guide) {
  const voteDirection = state.votes.get(guide.id) || 0;
  const votes = effectiveVotes(guide);
  const commentCount = guide.comments?.length || 0;
  const sourceHint = guide.source
    ? `<span class="source-hint">${escapeHTML(sourceKindLabels[guide.sourceKind] || "Kaynak türü belirtilmedi")}</span>`
    : '<span class="source-hint">Kaynak bağlantısı eklenmemiş</span>';
  const experienced = guide.experienced ? '<span class="experienced-inline" title="Katkı geçmişini belirtir, doğruluk rozeti değildir">deneyimli</span>' : "";
  return `<article class="guide-card" data-guide-id="${escapeHTML(guide.id)}">
    <div class="guide-card-main">
      <div class="guide-meta"><span class="game-label">${escapeHTML(guide.game)}</span><span class="meta-detail">${escapeHTML(formatDate(guide.createdAt))}</span></div>
      <div class="guide-meta">${badgeMarkup(guide)}</div>
      <h3>${escapeHTML(guide.title)}</h3>
      <p class="summary">${escapeHTML(guide.summary)}</p>
      <div class="guide-footer"><span class="author">${escapeHTML(guide.author)}${experienced}</span>${sourceHint}<button class="detail-link" type="button" data-detail="${escapeHTML(guide.id)}">Ayrıntılar ve yorumlar (${commentCount})</button></div>
    </div>
    <div class="vote-panel" aria-label="Rehber oylaması">
      <button class="vote-button ${voteDirection === 1 ? "selected" : ""}" type="button" data-vote="1" data-id="${escapeHTML(guide.id)}" aria-label="Olumlu oy ver" aria-pressed="${voteDirection === 1}">Yararlı</button>
      <span class="vote-count" aria-label="Oy sayısı">${votes}</span>
      <button class="vote-button ${voteDirection === -1 ? "selected" : ""}" type="button" data-vote="-1" data-id="${escapeHTML(guide.id)}" aria-label="Olumsuz oy ver" aria-pressed="${voteDirection === -1}">Yaramadı</button>
      <span class="vote-caption">oy</span>
    </div>
  </article>`;
}

function render() {
  const visible = visibleGuides();
  list.innerHTML = visible.map(renderGuide).join("");
  empty.hidden = visible.length !== 0;
  list.hidden = visible.length === 0;
  resultCount.textContent = `${visible.length} rehber gösteriliyor`;
  $("#source-only").checked = state.sourceOnly;
  $("#all-count").textContent = String(state.guides.length);
  $$(".filter-chip[data-game]").forEach((button) => {
    button.classList.toggle("active", button.dataset.game === state.game);
    if (button.dataset.game !== "all") {
      const count = state.guides.filter((guide) => guide.game === button.dataset.game).length;
      button.dataset.count = String(count);
      let countLabel = button.querySelector("[data-game-count]");
      if (!countLabel) {
        countLabel = document.createElement("span");
        countLabel.dataset.gameCount = "";
        button.append(" ", countLabel);
      }
      countLabel.textContent = String(count);
      button.setAttribute("aria-label", `${button.dataset.game}, ${count} rehber`);
    }
  });
}

function getGuide(id) {
  return state.guides.find((guide) => guide.id === id);
}

function openSubmitModal() {
  $("#submit-feedback").textContent = "";
  $("#submit-modal").showModal();
}

function renderComments(guide) {
  const comments = guide.comments || [];
  $("#comment-count").textContent = `${comments.length} yorum`;
  $("#detail-comments").innerHTML = comments.length ? comments.map((comment) => `
    <article class="comment-item"><div class="comment-head"><strong>${escapeHTML(comment.author)}${comment.experienced ? ' <span class="experienced-inline" title="Katkı geçmişi işareti">deneyimli</span>' : ""}</strong><span>${escapeHTML(comment.createdAt)}</span></div><p>${escapeHTML(comment.body)}</p></article>
  `).join("") : '<p class="small-note">Henüz yorum yok. İlk yorumu bu prototipte taslak olarak ekleyebilirsin.</p>';
}

function openDetail(id) {
  const guide = getGuide(id);
  if (!guide) return;
  state.activeGuideId = id;
  $("#detail-game").textContent = guide.game.toLocaleUpperCase("tr-TR");
  $("#detail-title").textContent = guide.title;
  $("#detail-body").textContent = guide.body || guide.summary;
  $("#detail-badges").innerHTML = badgeMarkup(guide);
  const sourceWrap = $("#detail-source-wrap");
  if (guide.source) {
    $("#detail-source").href = guide.source;
    $("#detail-source-label").textContent = sourceKindLabels[guide.sourceKind] || "Kaynak bağlantısı";
    sourceWrap.hidden = false;
  } else {
    sourceWrap.hidden = true;
  }
  $("#comment-input").value = "";
  renderComments(guide);
  $("#detail-modal").showModal();
}

$("#open-submit-top").addEventListener("click", openSubmitModal);
$("#open-submit-hero")?.addEventListener("click", openSubmitModal);

$$("[data-close]").forEach((button) => button.addEventListener("click", () => {
  const dialog = document.getElementById(button.dataset.close);
  if (dialog?.open) dialog.close();
}));

$("#submit-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = String(form.get("title") || "").trim();
  const game = String(form.get("game") || "").trim();
  const body = String(form.get("body") || "").trim();
  const source = String(form.get("source") || "").trim();
  const sourceKind = source ? String(form.get("sourceKind") || "") : "";
  const type = String(form.get("type") || "guide");
  if (!title || !game || !body) return;
  if (source) {
    try {
      const parsedSource = new URL(source);
      if (!["http:", "https:"].includes(parsedSource.protocol)) {
        $("#submit-feedback").textContent = "Kaynak bağlantısı http veya https ile başlamalı.";
        return;
      }
    } catch {
      $("#submit-feedback").textContent = "Kaynak bağlantısının biçimini kontrol et.";
      return;
    }
  }
  const guide = await mockStore.submitGuide({ title, game, body, source, sourceKind, type, typeLabel: typeLabels[type] || "Rehber" });
  state.guides = await mockStore.listGuides();
  state.game = "all";
  state.search = "";
  state.sort = "recent";
  state.sourceOnly = false;
  $("#search-input").value = "";
  $("#sort-select").value = "recent";
  $("#source-only").checked = false;
  $$(".filter-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.game === "all"));
  render();
  $("#submit-modal").close();
  event.currentTarget.reset();
  showToast("Taslak bu oturumda eklendi. Gerçek sunucuya gönderilmedi.");
  openDetail(guide.id);
});

$("#search-input").addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  render();
});

$("#sort-select").addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

$("#source-only").addEventListener("change", (event) => {
  state.sourceOnly = event.target.checked;
  render();
});

$("#filter-row").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-game]");
  if (!button) return;
  state.game = button.dataset.game;
  render();
});

list.addEventListener("click", async (event) => {
  const detailButton = event.target.closest("[data-detail]");
  if (detailButton) {
    openDetail(detailButton.dataset.detail);
    return;
  }
  const voteButton = event.target.closest("[data-vote]");
  if (!voteButton) return;
  const id = voteButton.dataset.id;
  const direction = Number(voteButton.dataset.vote);
  const previousDirection = state.votes.get(id) || 0;
  const nextDirection = previousDirection === direction ? 0 : direction;
  await mockStore.vote(id, nextDirection, previousDirection);
  state.votes.set(id, nextDirection);
  const guide = getGuide(id);
  if (guide) guide.votes = (Number(guide.votes) || 0) - previousDirection + nextDirection;
  render();
  showToast("Oy yalnızca bu oturumda tutuluyor.");
});

$("#comment-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const body = $("#comment-input").value.trim();
  if (!body || !state.activeGuideId) return;
  await mockStore.addComment(state.activeGuideId, body);
  state.guides = await mockStore.listGuides();
  const currentGuide = getGuide(state.activeGuideId);
  if (currentGuide) renderComments(currentGuide);
  $("#comment-input").value = "";
  render();
  showToast("Yorum taslağı bu oturuma eklendi.");
});

$("#clear-filters").addEventListener("click", () => {
  state.game = "all";
  state.search = "";
  state.sort = "recent";
  state.sourceOnly = false;
  $("#search-input").value = "";
  $("#sort-select").value = "recent";
  render();
});

for (const dialog of $$("dialog")) {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

state.guides = await mockStore.listGuides();
render();
