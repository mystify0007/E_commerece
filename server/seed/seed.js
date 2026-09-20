// Development seed script — creates demo data so the app is testable without
// building every listing by hand first. Safe to re-run (idempotent: each
// section only creates what's missing). All demo accounts share the same
// password so they're easy to log into locally.
//
// Product images are placeholder photos from loremflickr.com (keyword-based,
// free, no API key) — NOT real Cloudinary uploads and NOT real product
// photography. They exist purely so the demo storefront doesn't look empty;
// real artisans upload real photos through the app's own Cloudinary-backed
// upload endpoint.
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Artisan } from "../models/Artisan.js";
import { Product } from "../models/Product.js";
import { CustomizationOption } from "../models/CustomizationOption.js";
import { Cart } from "../models/Cart.js";
import { Wishlist } from "../models/Wishlist.js";

const ADMIN_EMAIL = "admin@juttax.local";
const ADMIN_PASSWORD = "Admin@12345";
const DEMO_PASSWORD = "Demo@12345";

const CATEGORY_NAMES = [
  "Handmade Shoes",
  "Sneakers",
  "Formal Shoes",
  "Boots",
  "Sandals",
  "Traditional Footwear",
  "Hiking Footwear",
  "Casual Footwear",
  "Custom Footwear",
];

// Maps a category to a broad, well-photographed Flickr keyword so the
// placeholder image is at least thematically plausible — niche terms like
// "newari" or "oxford" rarely have good keyword coverage on their own.
const CATEGORY_IMAGE_KEYWORD = {
  "Formal Shoes": "dress-shoes",
  Boots: "boots",
  Sandals: "sandals",
  "Traditional Footwear": "leather-shoes",
  "Hiking Footwear": "hiking-boots",
  Sneakers: "sneakers",
};

function placeholderImages({ material, category }, count = 2) {
  const keywords = [material.toLowerCase(), CATEGORY_IMAGE_KEYWORD[category] || "shoes"]
    .map(encodeURIComponent)
    .join(",");
  return Array.from(
    { length: count },
    (_, i) => `https://loremflickr.com/800/800/${keywords}?lock=${Math.floor(Math.random() * 100000) + i}`
  );
}

const ARTISANS = [
  {
    email: "ram.maharjan@demo.juttax.local",
    name: "Ram Maharjan",
    shopName: "Maharjan Leather Works",
    bio: "Third-generation leather artisans crafting handmade formal and casual shoes in Patan since 1985.",
    location: "Patan, Lalitpur",
    yearsOfExperience: 15,
    specialization: ["Leather Shoes", "Formal Footwear"],
    products: [
      {
        name: "Kathmandu Oxford Leather Shoe",
        category: "Formal Shoes",
        description:
          "A classic hand-stitched Oxford crafted from full-grain leather, finished with a traditional leather sole. Made to order in our Patan workshop.",
        material: "Leather",
        colors: ["black", "brown"],
        sizesAvailable: [39, 40, 41, 42, 43, 44],
        soleType: "leather sole",
        price: 4500,
        stock: 12,
        productionTimeDays: 7,
        tags: ["formal", "leather", "handmade", "oxford"],
        isCustomizable: true,
        customizations: [
          { type: "style", label: "Classic Cap-Toe", priceDelta: 0 },
          { type: "style", label: "Wingtip Brogue", priceDelta: 300 },
          { type: "color", label: "Black", priceDelta: 0 },
          { type: "color", label: "Brown", priceDelta: 0 },
          { type: "color", label: "Tan", priceDelta: 200 },
          { type: "sole", label: "Standard Leather Sole", priceDelta: 0 },
          { type: "sole", label: "Cushioned Comfort Sole", priceDelta: 400 },
        ],
      },
      {
        name: "Patan Formal Derby",
        category: "Formal Shoes",
        description: "A handmade derby shoe with clean lines, built for daily office wear and special occasions alike.",
        material: "Leather",
        colors: ["black", "brown"],
        sizesAvailable: [40, 41, 42, 43, 44, 45],
        soleType: "rubber sole",
        price: 4800,
        stock: 8,
        productionTimeDays: 7,
        tags: ["formal", "leather", "derby"],
      },
      {
        name: "Bhaktapur Ankle Boot",
        category: "Boots",
        description: "A handcrafted leather ankle boot with reinforced stitching, equally at home in the office or on the street.",
        material: "Leather",
        colors: ["black", "brown"],
        sizesAvailable: [40, 41, 42, 43, 44, 45],
        soleType: "rubber sole",
        price: 5200,
        stock: 6,
        productionTimeDays: 9,
        tags: ["boots", "leather", "handmade"],
      },
    ],
  },
  {
    email: "sita.shrestha@demo.juttax.local",
    name: "Sita Shrestha",
    shopName: "Bhaktapur Traditional Footwear",
    bio: "Preserving traditional Newari juta-making craftsmanship passed down through generations in Bhaktapur.",
    location: "Bhaktapur",
    yearsOfExperience: 20,
    specialization: ["Traditional Footwear", "Handwoven Juta"],
    products: [
      {
        name: "Dhaka Pattern Leather Juta",
        category: "Traditional Footwear",
        description:
          "A traditional Nepali juta with hand-stitched leather upper and a woven Dhaka fabric trim, made the way our family has for decades.",
        material: "Leather",
        colors: ["red", "black"],
        sizesAvailable: [38, 39, 40, 41, 42, 43],
        soleType: "standard",
        price: 3200,
        stock: 10,
        productionTimeDays: 6,
        tags: ["traditional", "newari", "juta", "handmade"],
        isCustomizable: true,
        customizations: [
          { type: "color", label: "Red Dhaka Trim", priceDelta: 0 },
          { type: "color", label: "Black Dhaka Trim", priceDelta: 0 },
          { type: "color", label: "Maroon Dhaka Trim", priceDelta: 150 },
          { type: "personalization", label: "Embroidered Initials", priceDelta: 250 },
        ],
      },
      {
        name: "Newari Wedding Juta",
        category: "Traditional Footwear",
        description: "An ornate velvet-and-leather juta designed for weddings and festival occasions, hand-embroidered in gold thread.",
        material: "Velvet",
        colors: ["maroon", "gold"],
        sizesAvailable: [38, 39, 40, 41, 42],
        soleType: "standard",
        price: 5500,
        stock: 5,
        productionTimeDays: 12,
        tags: ["traditional", "wedding", "festival", "handmade"],
      },
      {
        name: "Bhaktapur Velvet Mojari",
        category: "Traditional Footwear",
        description: "A hand-embroidered velvet mojari slip-on with a pointed toe, stitched using traditional Newari techniques.",
        material: "Velvet",
        colors: ["maroon", "black", "gold"],
        sizesAvailable: [38, 39, 40, 41, 42, 43],
        soleType: "standard",
        price: 2800,
        stock: 11,
        productionTimeDays: 6,
        tags: ["traditional", "mojari", "handmade"],
      },
    ],
  },
  {
    email: "pemba.sherpa@demo.juttax.local",
    name: "Pemba Sherpa",
    shopName: "Himalayan Trekker Boots",
    bio: "Rugged handmade trekking boots built and tested on the Annapurna and Everest trails.",
    location: "Pokhara",
    yearsOfExperience: 12,
    specialization: ["Hiking Boots", "Trekking Gear"],
    products: [
      {
        name: "Annapurna Trail Boot",
        category: "Hiking Footwear",
        description: "A waterproof-treated leather trekking boot with a grippy rubber sole, built for the Annapurna Circuit and beyond.",
        material: "Leather",
        colors: ["brown", "black"],
        sizesAvailable: [39, 40, 41, 42, 43, 44, 45],
        soleType: "lug rubber sole",
        price: 6500,
        stock: 9,
        productionTimeDays: 8,
        tags: ["hiking", "trekking", "waterproof", "handmade"],
      },
      {
        name: "Everest Base Camp Trekking Boot",
        category: "Hiking Footwear",
        description: "A heavy-duty full-grain leather boot with reinforced ankle support, made for multi-day high-altitude treks.",
        material: "Leather",
        colors: ["brown", "black"],
        sizesAvailable: [40, 41, 42, 43, 44, 45, 46],
        soleType: "lug rubber sole",
        price: 7800,
        stock: 6,
        productionTimeDays: 10,
        tags: ["hiking", "trekking", "everest", "handmade"],
      },
      {
        name: "Langtang Approach Shoe",
        category: "Hiking Footwear",
        description: "A lightweight low-cut hiking shoe with a durable canvas-and-leather build, made for shorter treks and everyday trail walks.",
        material: "Canvas",
        colors: ["olive", "brown", "black"],
        sizesAvailable: [38, 39, 40, 41, 42, 43, 44],
        soleType: "rubber sole",
        price: 4200,
        stock: 13,
        productionTimeDays: 6,
        tags: ["hiking", "trail", "lightweight", "handmade"],
      },
    ],
  },
  {
    email: "anita.tamang@demo.juttax.local",
    name: "Anita Tamang",
    shopName: "Thamel Handmade Sandals",
    bio: "Comfortable handcrafted leather sandals and chappals for everyday wear, made in the heart of Thamel.",
    location: "Kathmandu",
    yearsOfExperience: 8,
    specialization: ["Sandals", "Casual Footwear"],
    products: [
      {
        name: "Thamel Leather Chappal",
        category: "Sandals",
        description: "A simple, comfortable leather chappal handmade for everyday Kathmandu streets.",
        material: "Leather",
        colors: ["brown", "tan"],
        sizesAvailable: [38, 39, 40, 41, 42, 43, 44],
        soleType: "standard",
        price: 1800,
        stock: 20,
        productionTimeDays: 4,
        tags: ["sandal", "casual", "leather", "handmade"],
      },
      {
        name: "Kathmandu Valley Strap Sandal",
        category: "Sandals",
        description: "A durable double-strap leather sandal built for long days of walking around the valley.",
        material: "Leather",
        colors: ["black", "brown"],
        sizesAvailable: [37, 38, 39, 40, 41, 42, 43],
        soleType: "rubber sole",
        price: 2000,
        stock: 15,
        productionTimeDays: 4,
        tags: ["sandal", "casual", "leather"],
      },
      {
        name: "Boudha Comfort Slipper",
        category: "Casual Footwear",
        description: "A soft, cushioned leather slip-on for relaxed everyday wear around the home or neighborhood.",
        material: "Leather",
        colors: ["black", "brown", "tan"],
        sizesAvailable: [38, 39, 40, 41, 42, 43, 44],
        soleType: "standard",
        price: 1600,
        stock: 22,
        productionTimeDays: 3,
        tags: ["slipper", "casual", "comfort", "handmade"],
      },
    ],
  },
  {
    email: "bikash.maharjan@demo.juttax.local",
    name: "Bikash Maharjan",
    shopName: "Kirtipur Shoe Artisans",
    bio: "Modern handmade sneakers blending traditional hand-stitching with contemporary style.",
    location: "Kirtipur",
    yearsOfExperience: 6,
    specialization: ["Sneakers", "Casual Footwear"],
    products: [
      {
        name: "Kirtipur Canvas Sneaker",
        category: "Sneakers",
        description: "A hand-stitched canvas sneaker with a rubber sole, made for everyday comfort with a modern look.",
        material: "Canvas",
        colors: ["white", "navy"],
        sizesAvailable: [38, 39, 40, 41, 42, 43, 44],
        soleType: "rubber sole",
        price: 2800,
        stock: 18,
        productionTimeDays: 5,
        tags: ["sneaker", "canvas", "casual", "handmade"],
        isCustomizable: true,
        customizations: [
          { type: "color", label: "White", priceDelta: 0 },
          { type: "color", label: "Navy", priceDelta: 0 },
          { type: "color", label: "Grey", priceDelta: 0 },
          { type: "sole", label: "Standard Sole", priceDelta: 0 },
          { type: "sole", label: "Thick Cushioned Sole", priceDelta: 350 },
        ],
      },
      {
        name: "Bagmati Casual Sneaker",
        category: "Sneakers",
        description: "A lightweight canvas sneaker designed for daily wear around town.",
        material: "Canvas",
        colors: ["grey", "black"],
        sizesAvailable: [39, 40, 41, 42, 43, 44, 45],
        soleType: "rubber sole",
        price: 3000,
        stock: 14,
        productionTimeDays: 5,
        tags: ["sneaker", "canvas", "casual"],
      },
      {
        name: "Swayambhu High-Top Sneaker",
        category: "Sneakers",
        description: "A hand-stitched canvas high-top with reinforced ankle support, built for a bolder everyday look.",
        material: "Canvas",
        colors: ["black", "white", "red"],
        sizesAvailable: [38, 39, 40, 41, 42, 43, 44, 45],
        soleType: "rubber sole",
        price: 3400,
        stock: 16,
        productionTimeDays: 5,
        tags: ["sneaker", "high-top", "canvas", "handmade"],
      },
    ],
  },
];

const CUSTOMERS = [
  { email: "sunita.gurung@demo.juttax.local", name: "Sunita Gurung" },
  { email: "prakash.rai@demo.juttax.local", name: "Prakash Rai" },
  { email: "nisha.adhikari@demo.juttax.local", name: "Nisha Adhikari" },
];

async function ensureAdmin() {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Demo admin already exists: ${ADMIN_EMAIL}`);
    return;
  }
  const passwordHash = await User.hashPassword(ADMIN_PASSWORD);
  await User.create({ name: "JuttaX Admin", email: ADMIN_EMAIL, passwordHash, role: "admin", isEmailVerified: true });
  console.log(`Created demo admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

async function ensureCategories() {
  const byName = {};
  for (const name of CATEGORY_NAMES) {
    let category = await Category.findOne({ name });
    if (!category) {
      category = await Category.create({ name });
      console.log(`Created category: ${name}`);
    }
    byName[name] = category;
  }
  return byName;
}

async function ensureCustomer({ email, name }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const passwordHash = await User.hashPassword(DEMO_PASSWORD);
  const user = await User.create({ name, email, passwordHash, role: "customer", isEmailVerified: true });
  await Promise.all([Cart.create({ user: user._id, items: [] }), Wishlist.create({ user: user._id, items: [] })]);
  console.log(`Created demo customer: ${email} / ${DEMO_PASSWORD}`);
  return user;
}

async function ensureArtisan(spec) {
  let user = await User.findOne({ email: spec.email });
  let artisan;

  if (!user) {
    const passwordHash = await User.hashPassword(DEMO_PASSWORD);
    user = await User.create({ name: spec.name, email: spec.email, passwordHash, role: "artisan", isEmailVerified: true });
    await Promise.all([Cart.create({ user: user._id, items: [] }), Wishlist.create({ user: user._id, items: [] })]);
    artisan = await Artisan.create({
      user: user._id,
      shopName: spec.shopName,
      bio: spec.bio,
      location: spec.location,
      yearsOfExperience: spec.yearsOfExperience,
      specialization: spec.specialization,
      verificationStatus: "approved",
      verifiedAt: new Date(),
    });
    console.log(`Created demo artisan: ${spec.email} / ${DEMO_PASSWORD} (${spec.shopName})`);
  } else {
    artisan = await Artisan.findOne({ user: user._id });
  }

  return artisan;
}

async function ensureProduct(artisan, categoriesByName, spec) {
  const existing = await Product.findOne({ artisan: artisan._id, name: spec.name });
  if (existing) return existing;

  const product = await Product.create({
    artisan: artisan._id,
    category: categoriesByName[spec.category]._id,
    name: spec.name,
    description: spec.description,
    material: spec.material,
    colors: spec.colors,
    sizesAvailable: spec.sizesAvailable,
    soleType: spec.soleType,
    price: spec.price,
    stock: spec.stock,
    images: placeholderImages({ material: spec.material, category: spec.category }),
    isHandmade: true,
    isCustomizable: Boolean(spec.isCustomizable),
    productionTimeDays: spec.productionTimeDays,
    tags: spec.tags,
    status: "approved",
  });

  if (spec.customizations) {
    await CustomizationOption.insertMany(spec.customizations.map((c) => ({ ...c, product: product._id })));
  }

  console.log(`Created product: ${spec.name} (${artisan.shopName})`);
  return product;
}

async function seed() {
  await connectDB();

  await ensureAdmin();
  const categoriesByName = await ensureCategories();

  for (const customer of CUSTOMERS) {
    await ensureCustomer(customer);
  }

  for (const artisanSpec of ARTISANS) {
    const artisan = await ensureArtisan(artisanSpec);
    for (const productSpec of artisanSpec.products) {
      await ensureProduct(artisan, categoriesByName, productSpec);
    }
  }

  console.log("\nSeed complete.");
  console.log(`Admin:     ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Artisans:  <email above> / ${DEMO_PASSWORD} (all pre-verified)`);
  console.log(`Customers: <email above> / ${DEMO_PASSWORD}`);
  console.log("Log in at /login, or browse /shop and /artisans right away as a guest.");

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
