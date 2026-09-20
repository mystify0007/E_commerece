import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";

// Draft-suggestion generator for artisans listing a new product. This is a
// real, deterministic keyword/heuristic algorithm — not a fabricated "AI"
// response. When AI_API_KEY/AI_API_URL are configured, a real external
// model call (e.g. a vision-capable LLM given `imageUrl`, or a text model
// given name/description) belongs right here instead of the heuristic
// below; that integration is intentionally not stubbed out with guessed
// request/response shapes, the same way the payment gateways aren't —
// wiring a specific provider is a follow-up once real credentials and a
// verified API contract are available.
//
// Whatever this returns is ALWAYS a suggestion: the artisan reviews and
// edits it in the UI, and nothing here writes to a Product document.

const MATERIAL_KEYWORDS = [
  "leather", "canvas", "suede", "rubber", "synthetic", "cotton", "jute", "hemp", "mesh", "denim", "wool", "felt",
];

const COLOR_KEYWORDS = [
  "black", "brown", "white", "red", "blue", "green", "tan", "beige", "grey", "gray", "navy", "maroon", "olive", "cream", "gold", "silver",
];

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "with", "for", "of", "in", "on", "is", "this", "that", "to", "it", "are", "be",
  "your", "our", "you", "we", "from", "by", "at", "as", "will", "can", "made",
]);

function extractKeywords(text, vocabulary) {
  const lower = text.toLowerCase();
  return vocabulary.filter((word) => lower.includes(word));
}

function extractTags(name, description) {
  const words = `${name} ${description}`
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return [...new Set(words)].slice(0, 8);
}

async function guessCategory(text) {
  const categories = await Category.find({ isActive: true });
  const lower = text.toLowerCase();
  let best = null;
  let bestScore = 0;

  for (const category of categories) {
    const words = category.name.toLowerCase().split(/\s+/);
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }

  return best ? { _id: best._id, name: best.name } : null;
}

export async function suggestProductAttributes({ name = "", description = "" }) {
  if (!name && !description) {
    throw ApiError.badRequest("Provide at least a product name or description to get suggestions");
  }

  const combinedText = `${name} ${description}`;
  const materials = extractKeywords(combinedText, MATERIAL_KEYWORDS);
  const colors = extractKeywords(combinedText, COLOR_KEYWORDS);
  const tags = extractTags(name, description);
  const suggestedCategory = await guessCategory(combinedText);

  const suggestedDescription = description
    ? description.trim()
    : name
      ? `Handcrafted ${name.toLowerCase()}${materials[0] ? `, made from ${materials[0]}` : ""}${colors[0] ? ` in ${colors[0]}` : ""}.`
      : null;

  return {
    suggestedCategory,
    suggestedMaterial: materials[0] || null,
    suggestedColors: colors,
    suggestedTags: tags,
    suggestedDescription,
    note: "AI-assisted suggestions — review and edit before publishing. Nothing is applied automatically.",
  };
}
