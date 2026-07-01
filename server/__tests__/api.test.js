const request = require("supertest");
const { createDb } = require("../db");
const { createMigrator } = require("../migrations");
const createApp = require("../createApp");

describe("API integration tests", () => {
  let app, db;

  beforeAll(async () => {
    db = createDb(":memory:");
    await createMigrator(db).up();
    app = createApp(db, { enableCsrf: false });
  });

  afterAll(() => {
    if (db) db.close();
  });

  describe("health endpoint", () => {
    it("GET /api/health returns ok", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });
  });

  describe("release lifecycle", () => {
    let releaseId;

    it("POST /api/releases creates a release with default columns", async () => {
      const res = await request(app)
        .post("/api/releases")
        .send({ name: "v1.0", version: "1.0.0" });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: "v1.0", version: "1.0.0" });
      expect(res.body.id).toBeDefined();
      releaseId = res.body.id;

      const cols = await request(app).get(`/api/columns/${releaseId}`);
      expect(cols.status).toBe(200);
      expect(cols.body).toHaveLength(4);
      expect(cols.body.map((c) => c.name)).toEqual([
        "Backlog",
        "In Progress",
        "Review",
        "Done",
      ]);
    });

    it("POST /api/releases validates required fields", async () => {
      const res = await request(app)
        .post("/api/releases")
        .send({ name: "" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });

    it("POST /api/releases rejects missing version", async () => {
      const res = await request(app)
        .post("/api/releases")
        .send({ name: "test" });
      expect(res.status).toBe(400);
    });

    it("GET /api/releases lists all releases", async () => {
      const res = await request(app).get("/api/releases");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.find((r) => r.id === releaseId)).toBeDefined();
    });

    it("DELETE /api/releases/:id deletes the release", async () => {
      const res = await request(app).delete(`/api/releases/${releaseId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });

      const list = await request(app).get("/api/releases");
      expect(list.body.find((r) => r.id === releaseId)).toBeUndefined();
    });
  });

  describe("column lifecycle", () => {
    let releaseId, columnId;

    beforeAll(async () => {
      const res = await request(app)
        .post("/api/releases")
        .send({ name: "col-test", version: "1.0" });
      releaseId = res.body.id;
    });

    it("POST /api/columns creates a column", async () => {
      const res = await request(app)
        .post("/api/columns")
        .send({ release_id: releaseId, name: "Testing", color: "#ff0000" });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        release_id: releaseId,
        name: "Testing",
        color: "#ff0000",
      });
      columnId = res.body.id;
    });

    it("POST /api/columns validates color format", async () => {
      const res = await request(app)
        .post("/api/columns")
        .send({ release_id: releaseId, name: "Bad", color: "red" });
      expect(res.status).toBe(400);
    });

    it("GET /api/columns/:releaseId lists columns", async () => {
      const res = await request(app).get(`/api/columns/${releaseId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(5);
    });

    it("PUT /api/columns/:id updates a column", async () => {
      const res = await request(app)
        .put(`/api/columns/${columnId}`)
        .send({ name: "Updated", color: "#00ff00" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated");
      expect(res.body.color).toBe("#00ff00");
    });

    it("PUT /api/columns/:id returns 404 for non-existent", async () => {
      const res = await request(app)
        .put("/api/columns/99999")
        .send({ name: "nope" });
      expect(res.status).toBe(404);
    });

    it("DELETE /api/columns/:id deletes the column", async () => {
      const res = await request(app).delete(`/api/columns/${columnId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });
  });

  describe("card lifecycle", () => {
    let releaseId, columnId, cardId;

    beforeAll(async () => {
      const rel = await request(app)
        .post("/api/releases")
        .send({ name: "card-test", version: "1.0" });
      releaseId = rel.body.id;
      const cols = await request(app).get(`/api/columns/${releaseId}`);
      columnId = cols.body[0].id;
    });

    it("POST /api/cards creates a card", async () => {
      const res = await request(app)
        .post("/api/cards")
        .send({
          column_id: columnId,
          title: "Test card",
          description: "A test card",
          priority: "high",
          labels: ["bug", "urgent"],
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        column_id: columnId,
        title: "Test card",
        description: "A test card",
        priority: "high",
      });
      expect(res.body.labels).toEqual(["bug", "urgent"]);
      expect(res.body.checklist).toEqual([]);
      cardId = res.body.id;
    });

    it("POST /api/cards validates required fields", async () => {
      const res = await request(app)
        .post("/api/cards")
        .send({ column_id: columnId });
      expect(res.status).toBe(400);
    });

    it("POST /api/cards validates priority enum", async () => {
      const res = await request(app)
        .post("/api/cards")
        .send({ column_id: columnId, title: "bad", priority: "invalid" });
      expect(res.status).toBe(400);
    });

    it("GET /api/cards/column/:columnId lists cards by column", async () => {
      const res = await request(app).get(`/api/cards/column/${columnId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.find((c) => c.id === cardId)).toBeDefined();
    });

    it("GET /api/cards/release/:releaseId lists cards by release", async () => {
      const res = await request(app).get(`/api/cards/release/${releaseId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("PUT /api/cards/:id updates a card", async () => {
      const res = await request(app)
        .put(`/api/cards/${cardId}`)
        .send({ title: "Updated card", priority: "critical" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated card");
      expect(res.body.priority).toBe("critical");
    });

    it("PUT /api/cards/:id returns 404 for non-existent", async () => {
      const res = await request(app)
        .put("/api/cards/99999")
        .send({ title: "nope" });
      expect(res.status).toBe(404);
    });

    it("PATCH /api/cards/:id/move moves a card", async () => {
      const cols = await request(app).get(`/api/columns/${releaseId}`);
      const targetColumn = cols.body[1];

      const res = await request(app)
        .patch(`/api/cards/${cardId}/move`)
        .send({ column_id: targetColumn.id, position: 0 });

      expect(res.status).toBe(200);
      expect(res.body.column_id).toBe(targetColumn.id);
    });

    it("PATCH /api/cards/:id/move returns 404 for non-existent", async () => {
      const res = await request(app)
        .patch("/api/cards/99999/move")
        .send({ position: 0 });
      expect(res.status).toBe(404);
    });

    it("DELETE /api/cards/:id deletes the card", async () => {
      const res = await request(app).delete(`/api/cards/${cardId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });

      const list = await request(app).get(`/api/cards/column/${columnId}`);
      expect(list.body.find((c) => c.id === cardId)).toBeUndefined();
    });
  });

  describe("checklist lifecycle", () => {
    let releaseId, columnId, cardId, itemId;

    beforeAll(async () => {
      const rel = await request(app)
        .post("/api/releases")
        .send({ name: "cl-test", version: "1.0" });
      releaseId = rel.body.id;
      const cols = await request(app).get(`/api/columns/${releaseId}`);
      columnId = cols.body[0].id;
      const card = await request(app)
        .post("/api/cards")
        .send({ column_id: columnId, title: "CL card" });
      cardId = card.body.id;
    });

    it("POST /api/checklists creates an item", async () => {
      const res = await request(app)
        .post("/api/checklists")
        .send({ card_id: cardId, text: "First task" });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        card_id: cardId,
        text: "First task",
        checked: 0,
      });
      itemId = res.body.id;
    });

    it("POST /api/checklists validates required fields", async () => {
      const res = await request(app)
        .post("/api/checklists")
        .send({ card_id: cardId });
      expect(res.status).toBe(400);
    });

    it("GET /api/checklists/:cardId lists items", async () => {
      const res = await request(app).get(`/api/checklists/${cardId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.find((i) => i.id === itemId)).toBeDefined();
    });

    it("PUT /api/checklists/:id updates an item", async () => {
      const res = await request(app)
        .put(`/api/checklists/${itemId}`)
        .send({ text: "Updated task", checked: true });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe("Updated task");
      expect(res.body.checked).toBe(1);
    });

    it("PUT /api/checklists/:id returns 404 for non-existent", async () => {
      const res = await request(app)
        .put("/api/checklists/99999")
        .send({ text: "nope" });
      expect(res.status).toBe(404);
    });

    it("DELETE /api/checklists/:id deletes the item", async () => {
      const res = await request(app).delete(`/api/checklists/${itemId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });

      const list = await request(app).get(`/api/checklists/${cardId}`);
      expect(list.body.find((i) => i.id === itemId)).toBeUndefined();
    });
  });

  describe("cascade deletes", () => {
    it("deleting a release cascades to columns, cards, and checklists", async () => {
      const rel = await request(app)
        .post("/api/releases")
        .send({ name: "cascade", version: "1.0" });
      const relId = rel.body.id;

      const cols = await request(app).get(`/api/columns/${relId}`);
      const colId = cols.body[0].id;

      const card = await request(app)
        .post("/api/cards")
        .send({ column_id: colId, title: "will cascade" });
      const cId = card.body.id;

      await request(app)
        .post("/api/checklists")
        .send({ card_id: cId, text: "will cascade" });

      await request(app).delete(`/api/releases/${relId}`);

      const colsAfter = await request(app).get(`/api/columns/${relId}`);
      expect(colsAfter.body).toHaveLength(0);

      const cardsAfter = await request(app).get(`/api/cards/column/${colId}`);
      expect(cardsAfter.body).toHaveLength(0);

      const clAfter = await request(app).get(`/api/checklists/${cId}`);
      expect(clAfter.body).toHaveLength(0);
    });
  });

  describe("forbidden paths", () => {
    it("GET /data returns 403", async () => {
      const res = await request(app).get("/data");
      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: "Forbidden" });
    });
  });

  describe("invalid JSON body", () => {
    it("returns 400 for malformed JSON", async () => {
      const res = await request(app)
        .post("/api/releases")
        .set("Content-Type", "application/json")
        .send("{ invalid json");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid JSON in request body");
    });
  });
});
