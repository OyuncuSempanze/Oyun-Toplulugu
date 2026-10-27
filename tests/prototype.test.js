import assert from "node:assert/strict";
import test from "node:test";
import { mockStore } from "../src/js/mock-store.js";

test("örnek rehberler kopya olarak döner ve geçici işlemler tutarlı çalışır", async () => {
  const initialGuides = await mockStore.listGuides();
  assert.ok(initialGuides.length >= 1, "En az bir örnek rehber olmalı");

  assert.ok(initialGuides.some((guide) => guide.id === "dw-official-resource" && guide.source && guide.sourceKind === "official"),
    "Kaynak filtresini denemek için türü belirtilmiş resmî bağlantılı bir örnek bulunmalı");

  const target = initialGuides.find((guide) => guide.id === "dw-speed-boost");
  assert.ok(target, "DATA WING örnek rehberi bulunmalı");
  const originalTitle = target.title;
  const originalVotes = target.votes;

  target.title = "Bu değişiklik depoya yansımamalı";
  const unchangedGuides = await mockStore.listGuides();
  assert.equal(unchangedGuides.find((guide) => guide.id === target.id).title, originalTitle);

  const upVote = await mockStore.vote(target.id, 1, 0);
  assert.equal(upVote.votes, originalVotes + 1);
  const downVote = await mockStore.vote(target.id, -1, 1);
  assert.equal(downVote.votes, originalVotes - 1);
  const clearedVote = await mockStore.vote(target.id, 0, -1);
  assert.equal(clearedVote.votes, originalVotes);

  const beforeComments = unchangedGuides.find((guide) => guide.id === target.id).comments.length;
  const comment = await mockStore.addComment(target.id, "  Deneme yorumu  ");
  assert.equal(comment.body, "Deneme yorumu");
  const afterCommentGuides = await mockStore.listGuides();
  assert.equal(afterCommentGuides.find((guide) => guide.id === target.id).comments.length, beforeComments + 1);

  const submission = await mockStore.submitGuide({
    game: "Diğer",
    title: "Test rehberi",
    typeLabel: "Rehber",
    body: "Bu kayıt örnek test için oluşturuldu.",
    source: "",
    sourceKind: ""
  });
  assert.equal(submission.status, "pending");
  assert.equal(submission.title, "Test rehberi");
  assert.equal(submission.experienced, false);
});
