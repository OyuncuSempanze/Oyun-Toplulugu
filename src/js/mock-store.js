import { sampleGuides } from "./sample-data.js";

// Bu bellek deposu, ileride gerçek API bağlantısı için kullanılan arayüzün deneme uygulamasıdır.
// Sayfa yenilenince tüm kullanıcı işlemleri sıfırlanır. Burada hassas bilgi saklanmamalıdır.
const clone = (value) => JSON.parse(JSON.stringify(value));
let guides = clone(sampleGuides);

export const mockStore = {
  async listGuides() {
    return clone(guides);
  },
  async submitGuide(input) {
    const guide = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      game: input.game,
      title: input.title.trim(),
      type: input.typeLabel,
      status: "pending",
      summary: input.body.trim().replace(/\s+/g, " ").slice(0, 260),
      body: input.body.trim(),
      source: input.source.trim(),
      author: "Senin taslağın",
      experienced: false,
      createdAt: new Date().toISOString().slice(0, 10),
      votes: 0,
      comments: []
    };
    guides = [guide, ...guides];
    return clone(guide);
  },
  async vote(guideId, direction, previousDirection) {
    const guide = guides.find((item) => item.id === guideId);
    if (!guide) return null;
    const current = Number(guide.votes) || 0;
    const next = current - (previousDirection || 0) + direction;
    guide.votes = next;
    return { votes: next };
  },
  async addComment(guideId, body) {
    const guide = guides.find((item) => item.id === guideId);
    if (!guide) return null;
    const comment = {
      author: "Senin yorum taslağın",
      body: body.trim(),
      createdAt: "az önce",
      experienced: false
    };
    guide.comments.push(comment);
    return clone(comment);
  }
};
