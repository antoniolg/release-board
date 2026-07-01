const { z } = require("zod");

const releaseSchema = z.object({
  name: z.string().min(1).max(255),
  version: z.string().min(1).max(50),
});

const columnSchema = z.object({
  release_id: z.coerce.number().int().positive(),
  name: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  position: z.coerce.number().int().min(0).optional(),
});

const cardSchema = z.object({
  column_id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  labels: z.array(z.string()).max(20).optional(),
  position: z.coerce.number().int().min(0).optional(),
});

const cardUpdateSchema = cardSchema.partial().extend({
  title: z.string().min(1).max(500).optional(),
});

const cardMoveSchema = z.object({
  column_id: z.coerce.number().int().positive().optional(),
  position: z.coerce.number().int().min(0).optional(),
});

const checklistItemSchema = z.object({
  card_id: z.coerce.number().int().positive(),
  text: z.string().min(1).max(1000),
});

const checklistItemUpdateSchema = z.object({
  text: z.string().min(1).max(1000).optional(),
  checked: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

module.exports = {
  releaseSchema,
  columnSchema,
  cardSchema,
  cardUpdateSchema,
  cardMoveSchema,
  checklistItemSchema,
  checklistItemUpdateSchema,
};
