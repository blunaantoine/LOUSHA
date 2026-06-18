import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/services/auth-service";

async function main() {
  console.log("🌱 Seeding Lousha Accessories database...");

  // Clean (ordre important pour les relations)
  await db.payment.deleteMany();
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.coupon.deleteMany();
  await db.heroSlide.deleteMany();
  await db.user.deleteMany();
  await db.product.deleteMany();
  await db.category.deleteMany();

  // --- Utilisateur admin par défaut (mot de passe hashé via scrypt) ---
  const adminPassword = await hashPassword("lousha-admin");
  await db.user.create({
    data: {
      name: "Admin Lousha",
      email: "admin@lousha-accessories.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user created (admin@lousha-accessories.com / lousha-admin)");

  // --- Gestionnaire (MANAGER) de test ---
  const managerPassword = await hashPassword("lousha-manager");
  await db.user.create({
    data: {
      name: "Manager Lousha",
      email: "manager@lousha-accessories.com",
      password: managerPassword,
      role: "MANAGER",
    },
  });
  console.log("✓ Manager user created (manager@lousha-accessories.com / lousha-manager)");

  // --- Coupon de bienvenue ---
  await db.coupon.create({
    data: {
      code: "BIENVENUE10",
      discountPct: 10,
      active: true,
    },
  });
  console.log("✓ Coupon BIENVENUE10 created (-10%)");

  const categories = [
    {
      slug: "decoration",
      name: "Décoration",
      nameEn: "Decoration",
      tagline: "La nature, invitée chez vous",
      taglineEn: "Nature, invited home",
      description:
        "Paniers, suspensions et objets de décoration en raphia qui apportent chaleur et authenticité à vos intérieurs. La pièce maîtresse de la maison Lousha.",
      descriptionEn:
        "Baskets, pendants and decorative objects in raffia that bring warmth and authenticity to your interiors. The centerpiece of the Lousha house.",
      image: "/images/categories/cat-decoration.png",
      order: 1,
    },
    {
      slug: "artisanat",
      name: "Artisanat",
      nameEn: "Craft",
      tagline: "Le geste, dans le détail",
      taglineEn: "The gesture, in detail",
      description:
        "Sets de table, éventails et petites pièces de décoration artisanale qui célèbrent la précision du tressage et le savoir-faire togolais.",
      descriptionEn:
        "Table sets, fans and small crafted decoration pieces celebrating the precision of weaving and Togolese know-how.",
      image: "/images/categories/cat-artisanat.png",
      order: 2,
    },
    {
      slug: "sacs",
      name: "Sacs",
      nameEn: "Bags",
      tagline: "L'art du porté",
      taglineEn: "The art of carrying",
      description:
        "Cabas et pochettes en raphia tressé main, pour porter l'élégance naturelle de Lousha au quotidien.",
      descriptionEn:
        "Totes and clutches in hand-woven raffia, to carry Lousha's natural elegance every day.",
      image: "/images/categories/cat-sacs.png",
      order: 3,
    },
    {
      slug: "chapeaux",
      name: "Chapeaux",
      nameEn: "Hats",
      tagline: "Sous le soleil, avec grâce",
      taglineEn: "Under the sun, with grace",
      description:
        "Chapeaux de soleil et bobs en raphia, façonnés pour vous protéger tout en sublimant chaque silhouette.",
      descriptionEn:
        "Sun hats and bucket hats in raffia, crafted to protect while enhancing every silhouette.",
      image: "/images/categories/cat-chapeaux.png",
      order: 4,
    },
  ];

  for (const c of categories) {
    await db.category.create({ data: c });
  }

  const products = [
    {
      slug: "sac-cabas-elegance",
      name: "Sac cabas Élégance",
      nameEn: "Élégance Tote Bag",
      description:
        "Un cabas généreux en raphia naturel écru, orné de anses en cuir véritable. Spacieux et léger, il accompagne vos journées avec la quiet confidence de l'artisanat bien fait. Chaque tressage est unique, réalisé à la main dans nos ateliers au Togo.",
      descriptionEn:
        "A generous tote in natural ecru raffia, finished with genuine leather handles. Spacious and light, it carries your days with the quiet confidence of well-made craft. Each weave is unique, handmade in our Togo ateliers.",
      priceCents: 9700000,
      categorySlug: "sacs",
      image: "/images/products/sac-1.png",
      gallery: "/images/products/sac-1.png",
      material: "Raphia 100% naturel, cuir véritable",
      origin: "Togo",
      craftingTime: "3 jours",
      stock: 12,
      badge: "bestseller",
      featured: true,
    },
    {
      slug: "pochette-terre",
      name: "Pochette Terre",
      nameEn: "Terre Crossbody",
      description:
        "Une pochette bandoulière aux tons terre cuite, tressée selon un motif géométrique hérité des traditions togolaises. Compacte et élégante, elle se porte du jour au soir.",
      descriptionEn:
        "A crossbody clutch in terracotta tones, woven with a geometric pattern inherited from Togolese tradition. Compact and elegant, worn from day to night.",
      priceCents: 6300000,
      categorySlug: "sacs",
      image: "/images/products/sac-2.png",
      gallery: "/images/products/sac-2.png",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "2 jours",
      stock: 12,
      badge: "new",
      featured: true,
    },
    {
      slug: "chapeau-solaire",
      name: "Chapeau Solaire",
      nameEn: "Solaire Sun Hat",
      description:
        "Un chapeau de soleil à large bord en raphia sable, rehaussé d'un fin lien en cuir brun. Pensé pour les longues journées d'été, il protège avec élégance.",
      descriptionEn:
        "A wide-brim sun hat in sand raffia, accented with a slim brown leather band. Designed for long summer days, it protects with elegance.",
      priceCents: 4450000,
      categorySlug: "chapeaux",
      image: "/images/products/chapeau-1.png",
      gallery: "/images/products/chapeau-1.png",
      material: "Raphia 100% naturel, cuir",
      origin: "Togo",
      craftingTime: "1,5 jour",
      stock: 12,
      badge: "bestseller",
      featured: true,
    },
    {
      slug: "bob-sahel",
      name: "Bob Sahel",
      nameEn: "Sahel Bucket Hat",
      description:
        "Le bob Sahel en raphia écru au tressage géométrique discret. Une pièce décontractée et raffinée, idéale pour les escapades au soleil.",
      descriptionEn:
        "The Sahel bucket hat in ecru raffia with subtle geometric weave. A relaxed and refined piece, ideal for sunny getaways.",
      priceCents: 3550000,
      categorySlug: "chapeaux",
      image: "/images/products/chapeau-2.png",
      gallery: "/images/products/chapeau-2.png",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "1 jour",
      stock: 12,
      badge: "new",
      featured: false,
    },
    {
      slug: "trio-paniers-tresses",
      name: "Trio de Paniers Tressés",
      nameEn: "Trio of Woven Baskets",
      description:
        "Un ensemble de trois paniers emboîtables en raphia, aux tons chauds. Parfaits pour ranger, organiser ou simplement habiller une étagère.",
      descriptionEn:
        "A set of three nesting baskets in raffia, in warm tones. Perfect to store, organize or simply dress up a shelf.",
      priceCents: 5400000,
      categorySlug: "decoration",
      image: "/images/products/deco-1.png",
      gallery: "/images/products/deco-1.png",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "4 jours",
      stock: 12,
      badge: "bestseller",
      featured: true,
    },
    {
      slug: "suspension-lumiere",
      name: "Suspension Lumière",
      nameEn: "Lumière Pendant",
      description:
        "Une suspension luminaire en raphia tressé qui filtre la lumière en créant une atmosphère chaleureuse. Une pièce maîtresse pour vos espaces de vie.",
      descriptionEn:
        "A raffia woven pendant light that filters light into a warm atmosphere. A statement piece for your living spaces.",
      priceCents: 7800000,
      categorySlug: "decoration",
      image: "/images/products/deco-2.png",
      gallery: "/images/products/deco-2.png",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "5 jours",
      stock: 12,
      badge: "new",
      featured: true,
    },
    {
      slug: "ensemble-table",
      name: "Ensemble Table",
      nameEn: "Table Set",
      description:
        "Un set de table et ses dessous de plat assortis, au tressage fin et régulier. Le détail qui transforme chaque repas en moment d'exception.",
      descriptionEn:
        "A placemat set with matching coasters, in fine and regular weaving. The detail that turns every meal into an exceptional moment.",
      priceCents: 3000000,
      categorySlug: "artisanat",
      image: "/images/products/art-1.png",
      gallery: "/images/products/art-1.png",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "1 jour",
      stock: 12,
      badge: "none",
      featured: false,
    },
    {
      slug: "eventail-decouverte",
      name: "Éventail Découverte",
      nameEn: "Découverte Fan",
      description:
        "Un éventail artisanal en raphia au motif décoratif, à la fois objet utile et pièce d'art. Un souvenir authentique du Togo.",
      descriptionEn:
        "An artisanal raffia fan with decorative pattern, both useful object and art piece. An authentic souvenir from Togo.",
      priceCents: 2100000,
      categorySlug: "artisanat",
      image: "/images/products/art-2.png",
      gallery: "/images/products/art-2.png",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "1 jour",
      stock: 12,
      badge: "new",
      featured: false,
    },
  ];

  for (const p of products) {
    await db.product.create({ data: p });
  }

  // --- Slides du carrousel hero ---
  const heroSlides = [
    {
      image: "/images/hero/hero-1.png",
      eyebrowFr: "Le geste",
      eyebrowEn: "The gesture",
      titleFr: "Le savoir-faire des artisans",
      titleEn: "The artisans' know-how",
      textFr: "Chaque objet de décoration naît de mains expertes et de fibres naturelles.",
      textEn: "Each decorative object is born from expert hands and natural fibers.",
      order: 0,
      active: true,
    },
    {
      image: "/images/hero/hero-2.png",
      eyebrowFr: "La matière",
      eyebrowEn: "The material",
      titleFr: "Raphia 100% naturel",
      titleEn: "100% natural raffia",
      textFr: "Une fibre noble, durable, puisée dans la richesse du Togo.",
      textEn: "A noble, durable fiber drawn from the richness of Togo.",
      order: 1,
      active: true,
    },
    {
      image: "/images/hero/hero-3.png",
      eyebrowFr: "L'élégance",
      eyebrowEn: "Elegance",
      titleFr: "Un intérieur habité d'âme",
      titleEn: "An interior filled with soul",
      textFr: "Des créations de décoration qui réchauffent vos espaces de vie.",
      textEn: "Decorative creations that warm your living spaces.",
      order: 2,
      active: true,
    },
  ];
  for (const s of heroSlides) {
    await db.heroSlide.create({ data: s });
  }
  console.log(`✓ ${heroSlides.length} hero slides created`);

  console.log(`✅ Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
