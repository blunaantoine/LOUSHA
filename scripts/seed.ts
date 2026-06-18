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
      slug: "set-de-table-soleil",
      name: "Set de table Soleil",
      nameEn: "Sun Placemat",
      description:
        "Un set de table rond en raphia naturel, au motif rayonnant évoquant les rayons du soleil. Tressé main avec un motif ajouré qui apporte une touche d'authenticité à votre table.",
      descriptionEn:
        "A round raffia placemat with a radiant sun-ray pattern. Hand-woven with an openwork design that brings authenticity to your table.",
      priceCents: 2500000,
      categorySlug: "artisanat",
      image: "/images/products/whatsapp-1.jpeg",
      gallery: "/images/products/whatsapp-1.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "1 jour",
      stock: 15,
      badge: "new",
      featured: true,
    },
    {
      slug: "set-de-table-ocean",
      name: "Set de table Océan",
      nameEn: "Ocean Placemat",
      description:
        "Un set de table rond en raphia beige rehaussé de fines rayures bleues. Inspiré des vagues de l'océan, il apporte fraîcheur et élégance à votre service de table.",
      descriptionEn:
        "A round raffia placemat in beige with fine blue stripes. Inspired by ocean waves, it brings freshness and elegance to your table setting.",
      priceCents: 2500000,
      categorySlug: "artisanat",
      image: "/images/products/whatsapp-2.jpeg",
      gallery: "/images/products/whatsapp-2.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "1 jour",
      stock: 15,
      badge: "new",
      featured: true,
    },
    {
      slug: "set-de-table-brume",
      name: "Set de table Brume",
      nameEn: "Mist Placemat",
      description:
        "Un set de table ovale en raphia gris clair, au tressage concentrique tressé main. Sa forme ovale et sa teinte douce s'intègrent à tous les styles de décoration.",
      descriptionEn:
        "An oval placemat in light gray raffia with hand-woven concentric braiding. Its oval shape and soft tone blend into any decor style.",
      priceCents: 2500000,
      categorySlug: "artisanat",
      image: "/images/products/whatsapp-3.jpeg",
      gallery: "/images/products/whatsapp-3.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "1 jour",
      stock: 15,
      badge: "none",
      featured: false,
    },
    {
      slug: "trio-sets-de-table",
      name: "Trio de Sets de Table",
      nameEn: "Trio of Placemats",
      description:
        "Un ensemble de trois sets de table ronds en raphia naturel, aux motifs spiralés et étoilés. Parfaits pour une table conviviale, ils habillent vos repas avec authenticité.",
      descriptionEn:
        "A set of three round raffia placemats with spiral and star patterns. Perfect for a convivial table, they dress your meals with authenticity.",
      priceCents: 6000000,
      categorySlug: "artisanat",
      image: "/images/products/whatsapp-4.jpeg",
      gallery: "/images/products/whatsapp-4.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "3 jours",
      stock: 10,
      badge: "bestseller",
      featured: true,
    },
    {
      slug: "panier-jardin",
      name: "Panier Jardin",
      nameEn: "Garden Basket",
      description:
        "Un panier rond en raphia aux motifs verts et jaunes vifs. Inspiré par les jardins tropicaux, il apporte une touche de couleur et de gaieté à votre intérieur. Idéal pour ranger ou décorer.",
      descriptionEn:
        "A round raffia basket with bright green and yellow patterns. Inspired by tropical gardens, it brings color and cheerfulness to your interior. Ideal for storage or decoration.",
      priceCents: 5500000,
      categorySlug: "decoration",
      image: "/images/products/whatsapp-5.jpeg",
      gallery: "/images/products/whatsapp-5.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "3 jours",
      stock: 12,
      badge: "bestseller",
      featured: true,
    },
    {
      slug: "panier-abeille",
      name: "Panier Abeille",
      nameEn: "Bee Basket",
      description:
        "Un panier rond en raphia aux motifs jaunes et noirs, évoquant les rayons d'abeille. Une pièce audacieuse et graphique qui se fait remarquer dans toute pièce.",
      descriptionEn:
        "A round raffia basket with yellow and black patterns, evoking honeycombs. A bold and graphic piece that stands out in any room.",
      priceCents: 5500000,
      categorySlug: "decoration",
      image: "/images/products/whatsapp-6.jpeg",
      gallery: "/images/products/whatsapp-6.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "3 jours",
      stock: 12,
      badge: "new",
      featured: true,
    },
    {
      slug: "panier-etagere",
      name: "Panier Étagère",
      nameEn: "Shelf Basket",
      description:
        "Un panier étagère multi-niveaux en raphia naturel, au design ouvert et étagéré. Parfait pour organiser vos objets tout en les mettant en valeur. Une pièce fonctionnelle et décorative.",
      descriptionEn:
        "A multi-tiered shelf basket in natural raffia with an open, tiered design. Perfect for organizing your objects while showcasing them. A functional and decorative piece.",
      priceCents: 7000000,
      categorySlug: "decoration",
      image: "/images/products/whatsapp-7.jpeg",
      gallery: "/images/products/whatsapp-7.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "4 jours",
      stock: 8,
      badge: "bestseller",
      featured: true,
    },
    {
      slug: "panier-couvercle",
      name: "Panier à Couvercle",
      nameEn: "Lidded Basket",
      description:
        "Un panier à couvercle en raphia naturel, au tressage en spirale régulier. Élégant et pratique, il conserve vos effets personnels tout en apportant une touche d'artisanat à votre décoration.",
      descriptionEn:
        "A lidded basket in natural raffia with regular spiral weaving. Elegant and practical, it stores your belongings while adding a touch of craftsmanship to your decor.",
      priceCents: 6500000,
      categorySlug: "decoration",
      image: "/images/products/whatsapp-8.jpeg",
      gallery: "/images/products/whatsapp-8.jpeg",
      material: "Raphia 100% naturel",
      origin: "Togo",
      craftingTime: "3 jours",
      stock: 10,
      badge: "new",
      featured: true,
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
