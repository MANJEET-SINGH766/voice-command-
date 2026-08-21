import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// Zod Schema to validate structured parser commands
export const CommandSchema = z.object({
  intent: z.enum(["ADD_ITEM", "REMOVE_ITEM", "SEARCH_PRODUCT", "CLEAR_LIST", "UPDATE_QTY", "UNKNOWN"]),
  item: z.string().nullable().default(null),
  quantity: z.number().default(1),
  unit: z.string().nullable().default(null),
  maxPrice: z.number().nullable().default(null),
  brand: z.string().nullable().default(null),
  category: z.string().default("Other")
});

// Category mapping helper
const keywordCategoryMap = {
  "Produce": ["apple", "banana", "strawberry", "spinach", "avocado", "potato", "melon", "watermelon", "orange", "lemon", "lime", "tomato", "onion", "garlic", "fruit", "vegetable", "lettuce", "berry", "grape", "carrot", "sabzi", "aloo", "seb"],
  "Dairy & Eggs": ["milk", "yogurt", "cheese", "butter", "egg", "cream", "cheddar", "chobani", "oatly", "dairy", "doodh", "dahi", "makkhan", "paneer"],
  "Bakery": ["bread", "croissant", "muffin", "bun", "bagel", "toast", "bakery", "cookie", "cake", "pav", "roti"],
  "Meat & Seafood": ["chicken", "salmon", "beef", "pork", "turkey", "steak", "fish", "meat", "shrimp", "seafood", "anda"],
  "Pantry & Dry Goods": ["rice", "peanut", "oil", "pasta", "syrup", "maple", "honey", "flour", "sugar", "salt", "sauce", "bean", "lentil", "cereal", "oats", "pantry", "chawal", "atta", "dal", "cheeni", "namak", "tel"],
  "Beverages": ["water", "juice", "coffee", "tea", "soda", "coke", "drink", "beverage", "sparkling", "paani", "chai"],
  "Snacks & Sweets": ["chip", "chocolate", "almond", "nuts", "popcorn", "pretzel", "candy", "sweet", "snack", "biscuit", "mithai"],
  "Household & Cleaning": ["paper", "towel", "soap", "clean", "dish", "detergent", "trash bag", "sponge", "wipe", "household", "sabun"]
};

// Auto-categorize based on item name
function predictCategory(itemName) {
  if (!itemName) return "Other";
  const name = itemName.toLowerCase();

  for (const [category, keywords] of Object.entries(keywordCategoryMap)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  return "Other";
}

// Hindi & Hinglish Translation Dictionaries
const hindiNumbers = {
  "एक": "1", "दो": "2", "तीन": "3", "चार": "4", "पांच": "5", "पाँच": "5",
  "ek": "1", "do": "2", "teen": "3", "chaar": "4", "paanch": "5"
};

const hindiNouns = {
  "दूध": "milk", "doodh": "milk",
  "सेब": "apple", "seb": "apple",
  "केला": "banana", "kela": "banana",
  "पानी": "water", "paani": "water",
  "सब्जी": "vegetables", "sabzi": "vegetables",
  "आलू": "potato", "aloo": "potato",
  "अंडा": "eggs", "ande": "eggs", "anda": "eggs", "अंडे": "eggs",
  "चाय": "tea", "chai": "tea",
  "चीनी": "sugar", "cheeni": "sugar",
  "मक्खन": "butter", "makkhan": "butter",
  "रोटी": "bread", "roti": "bread",
  "नमक": "salt", "namak": "salt",
  "तेल": "oil", "tel": "oil",
  "कॉफी": "coffee", "coffee": "coffee"
};

const hindiVerbs = {
  "जोड़ो": "add", "jodo": "add", "chahiye": "add", "lao": "add", "daloge": "add",
  "हटाओ": "remove", "hatao": "remove", "nikalo": "remove", "kam": "remove",
  "ढूंढो": "find", "dhundho": "find", "khojo": "find", "dikhao": "find"
};

// Translates and restructures Hindi (SOV) into English (SVO) order
function normalizeHindi(text) {
  let cleaned = text.toLowerCase().trim();

  // Check if verbs exist at the end of the sentence
  let action = null;
  const addRegex = /\b(?:जोड़ो|jodo|chahiye|lao|add\s+karo|daloge)\b$/i;
  const removeRegex = /\b(?:हटाओ|hatao|nikalo|delete\s+karo|kam\s+karo)\b$/i;
  const searchRegex = /\b(?:ढूंढो|dhundho|khojo|search\s+karo|dikhao)\b$/i;

  if (addRegex.test(cleaned)) {
    action = "add";
    cleaned = cleaned.replace(addRegex, "").trim();
  } else if (removeRegex.test(cleaned)) {
    action = "remove";
    cleaned = cleaned.replace(removeRegex, "").trim();
  } else if (searchRegex.test(cleaned)) {
    action = "find";
    cleaned = cleaned.replace(searchRegex, "").trim();
  }

  // Tokenize remainder text and map keywords
  let words = cleaned.split(/\s+/);
  const mapped = words.map(word => {
    if (hindiNumbers[word]) return hindiNumbers[word];
    if (hindiNouns[word]) return hindiNouns[word];
    // Strip Hindi grammatical helper words
    if (["ko", "se", "mera", "mere", "hi", "ki", "ka", "aur", "karo", "please"].includes(word)) return "";
    return word;
  }).filter(w => w !== "");

  // Rebuild in SVO order (e.g. "add 2 apple")
  if (action) {
    return `${action} ${mapped.join(" ")}`;
  }
  return mapped.join(" ");
}

/**
 * Deterministic Regex Parser
 * Runs locally for high-speed, zero-cost parsing
 */
function parseWithRegex(text) {
  const cleaned = text.trim().toLowerCase();
  
  const result = {
    intent: "UNKNOWN",
    item: null,
    quantity: 1,
    unit: null,
    maxPrice: null,
    brand: null,
    category: "Other"
  };

  // 1. CLEAR_LIST Intent
  if (/^(?:clear|empty|delete|erase)\s+(?:all|everything|entire|the\s+whole)\s*(?:list|items)?$/i.test(cleaned)) {
    result.intent = "CLEAR_LIST";
    return result;
  }

  // 2. SEARCH_PRODUCT Intent
  // e.g. "Find toothpaste under $5" or "Find Colgate toothpaste"
  const searchMatch = cleaned.match(/^(?:find|search|look\s+for|show\s+me)\s+(.+)$/i);
  if (searchMatch) {
    result.intent = "SEARCH_PRODUCT";
    let searchTerms = searchMatch[1];

    // Extract price filter (e.g. "under $5" or "under 200 rupees")
    const priceRegex = /\b(?:under|less\s+than|below|sasta)\s+(?:\$|rs\.?|₹)?\s*(\d+(?:\.\d+)?)\b/i;
    const priceMatch = searchTerms.match(priceRegex);
    if (priceMatch) {
      result.maxPrice = parseFloat(priceMatch[1]);
      searchTerms = searchTerms.replace(priceRegex, "").trim();
    }

    // Extract Brand names if present
    const knownBrands = ["earthbound farm", "dole", "driscoll's", "olivia's organics", "calavo", "organic valley", "silk", "chobani", "oatly", "vital farms", "land o'lakes", "tillamook", "dave's killer bread", "udi's", "bell & evans", "marine harvest", "laura's lean", "lundberg", "jif", "bertolli", "barilla", "coombs family farms", "lacroix", "tropicana", "peet's", "tostitos", "green & black's", "blue diamond", "bounty", "mrs. meyer's", "colgate"];
    for (const brand of knownBrands) {
      const brandRegex = new RegExp(`\\b${brand}\\b`, "i");
      if (brandRegex.test(searchTerms)) {
        result.brand = brand;
        // Keep brand in terms for text-search matching, or omit
      }
    }

    result.item = searchTerms.replace(/\b(?:organic|fresh|gluten\s+free)\b/gi, "").replace(/\s+/g, " ").trim();
    return result;
  }

  // 3. REMOVE_ITEM Intent
  // e.g. "Remove milk from my list" or "delete apples"
  const removeMatch = cleaned.match(/^(?:remove|delete|erase|take\s+off)\s+(.+)$/i);
  if (removeMatch) {
    result.intent = "REMOVE_ITEM";
    result.item = removeMatch[1].replace(/\b(?:from\s+my\s+(?:shopping\s+)?list|please)\b/gi, "").trim();
    return result;
  }

  // 4. ADD_ITEM Intent
  // E.g. "Add 3 bottles of water", "Buy milk", "2 bananas"
  // Verb matches
  const addMatch = cleaned.match(/^(?:add|buy|need|get|put)\s+(.+)$/i);
  let addRemainder = addMatch ? addMatch[1] : cleaned;

  // Strip filler phrases
  addRemainder = addRemainder.replace(/\b(?:to\s+my\s+(?:shopping\s+)?list|please)\b/gi, "").trim();

  // Pattern: [Quantity] [Unit] [of] [Item]
  // e.g. "3 bottles of water" or "5 apples" or "2.5 kg potato"
  const qtyUnitRegex = /^(\d+(?:\.\d+)?)\s*(bottles?|packs?|cans?|lbs?|oz|kg|g|boxes?|cartons?|loaves|loaf|pieces?|bags?|units?|packets?|glass)?\s*(?:of)?\s+(.+)$/i;
  const qtyMatch = addRemainder.match(qtyUnitRegex);

  if (qtyMatch) {
    result.intent = "ADD_ITEM";
    result.quantity = parseFloat(qtyMatch[1]);
    result.unit = qtyMatch[2] ? qtyMatch[2].trim() : null;
    result.item = qtyMatch[3].trim();
  } else {
    // Check if it's just an item name, e.g. "milk"
    // (Only treat as ADD_ITEM if there is a valid length string)
    if (addRemainder.length > 0) {
      result.intent = "ADD_ITEM";
      result.quantity = 1;
      result.item = addRemainder;
    }
  }

  if (result.intent !== "UNKNOWN") {
    result.category = predictCategory(result.item);
  }

  return result;
}

/**
 * Gemini AI Parser Fallback
 * Used for complex, unstructured sentences
 */
async function parseWithGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
You are a voice parsing assistant for a grocery shopping list. Analyze the user's spoken text and extract the structured intent and entities.
You must output STRICTLY a JSON object matching this schema structure, do not include any other markdown text or comments:
{
  "intent": "ADD_ITEM" | "REMOVE_ITEM" | "SEARCH_PRODUCT" | "CLEAR_LIST" | "UPDATE_QTY" | "UNKNOWN",
  "item": string | null,
  "quantity": number,
  "unit": string | null,
  "maxPrice": number | null,
  "brand": string | null
}

Rules:
1. "intent" should represent what the user wants to do.
2. Translate all item names to English and extract their singular form (e.g. Devanagari "दूध" or Hinglish "doodh" must be translated to "milk", and plural "apples" to "apple").
3. For quantity, if no number is mentioned, default to 1.
4. Extract units if mentioned (e.g. "bottles", "packets").
5. Extract brand names (e.g. "Colgate", "Oatly") and price filters (e.g. "under $5" -> maxPrice: 5) if searching.
6. If the command cannot be parsed into these intents, return intent as "UNKNOWN".

User speech input: "${text}"
`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text().trim();
  
  // Parse response
  const jsonResult = JSON.parse(rawText);
  return jsonResult;
}

/**
 * Core NLP Parser Router
 */
export async function parseCommand(text, language = "en-US") {
  console.log(`[NLP Parser] Processing input: "${text}" [lang: ${language}]`);
  
  let textToParse = text;

  // If language selection is Hindi or text contains Devanagari script, normalize
  if (language === "hi-IN" || /[\u0900-\u097F]/.test(text)) {
    textToParse = normalizeHindi(text);
    console.log(`[NLP Parser] Hindi input normalized to: "${textToParse}"`);
  }

  // 1. Try local regex parsing first
  let parsed = parseWithRegex(textToParse);

  // 2. If regex fails to determine intent, fall back to Gemini AI
  if (parsed.intent === "UNKNOWN" && process.env.GEMINI_API_KEY) {
    console.log("[NLP Parser] Regex match failed. Calling Gemini AI fallback...");
    try {
      const geminiResult = await parseWithGemini(text);
      
      // Inject category prediction for the parsed item
      geminiResult.category = predictCategory(geminiResult.item);

      // Validate structured output using Zod
      parsed = CommandSchema.parse(geminiResult);
      console.log("[NLP Parser] Gemini parsing successfully validated:", parsed);
    } catch (err) {
      console.error("[NLP Parser] Gemini fallback failed or Zod validation error:", err.message);
      // Let it remain UNKNOWN so the controller can respond with a clear error payload
    }
  }

  // Double check validation of final result using Zod
  return CommandSchema.parse(parsed);
}
