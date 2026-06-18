import type { Lang } from "@/lib/store";

export const dict = {
  fr: {
    nav: {
      home: "Accueil",
      shop: "Boutique",
      contact: "Contact",
      cart: "Panier",
      account: "Profil",
    },
    hero: {
      eyebrow: "Made in Togo · Raphia fait main",
      title1: "L'art du raphia,",
      title2: "tressé à la main",
      subtitle:
        "Des objets de décoration et accessoires d'intérieur en raphia 100% naturel, façonnés par les artisans de Lousha au cœur du Togo.",
      cta1: "Découvrir nos collections",
      cta2: "Notre histoire",
      slides: [
        {
          eyebrow: "Le geste",
          title: "Le savoir-faire des artisans",
          text: "Chaque objet de décoration naît de mains expertes et de fibres naturelles.",
        },
        {
          eyebrow: "La matière",
          title: "Raphia 100% naturel",
          text: "Une fibre noble, durable, puisée dans la richesse du Togo.",
        },
        {
          eyebrow: "L'élégance",
          title: "Un intérieur habité d'âme",
          text: "Des créations de décoration qui réchauffent vos espaces de vie.",
        },
      ],
    },
    categories: {
      title: "Nos collections",
      subtitle: "L'univers décoration Lousha",
      discover: "Découvrir",
    },
    engagements: {
      title: "Nos engagements",
      items: [
        {
          title: "Livraison offerte",
          text: "Partout en France à partir de 80€",
        },
        {
          title: "Qualité garantie",
          text: "Chaque pièce est vérifiée à la main",
        },
        {
          title: "Support 24/7",
          text: "Une équipe à votre écoute, jour et nuit",
        },
        {
          title: "Paiement sécurisé",
          text: "Vos transactions protégées",
        },
      ],
    },
    promo: {
      eyebrow: "Made in Togo · Fait main",
      title: "L'art du raphia,",
      titleAccent: "à portée de main",
      text: "Des objets de décoration uniques en raphia 100% naturel, tressés main par nos artisans au Togo. Pour habiller vos intérieurs d'authenticité et de chaleur.",
      cta: "Découvrir nos collections",
      secondary: "Nos engagements",
    },
    products: {
      title: "Nouveautés & Best-sellers",
      subtitle: "Les pièces signature Lousha",
      new: "Nouveauté",
      bestseller: "Best-seller",
      addToCart: "Ajouter au panier",
      quickView: "Aperçu rapide",
      from: "À partir de",
      viewAll: "Voir toutes nos collections",
    },
    shop: {
      title: "LOUSHA",
      subtitle: "Toutes nos créations de décoration en raphia fait main",
      all: "Toutes",
      sort: "Trier",
      sortNew: "Nouveautés",
      sortPriceAsc: "Prix croissant",
      sortPriceDesc: "Prix décroissant",
      empty: "Aucune création dans cette catégorie pour l'instant.",
      results: (n: number) => `${n} pièce${n > 1 ? "s" : ""}`,
    },
    product: {
      addToCart: "Ajouter au panier",
      buyNow: "Je craque",
      material: "Matière",
      origin: "Origine",
      craftingTime: "Temps de fabrication",
      related: "Vous aimerez aussi",
      inStock: "En stock",
      outOfStock: "Épuisé",
      quantity: "Quantité",
      details: "Le détail",
    },
    cart: {
      title: "Votre panier",
      empty: "Votre panier est vide.",
      emptyCta: "Explorer nos collections",
      subtotal: "Sous-total",
      shipping: "Livraison",
      shippingFree: "Offerte",
      shippingInfo: "Calculée à l'étape suivante",
      total: "Total",
      checkout: "Passer commande",
      continue: "Continuer mes achats",
      remove: "Retirer",
    },
    checkout: {
      title: "Finaliser la commande",
      subtitle: "Livraison & paiement",
      contact: "Coordonnées",
      email: "Adresse e-mail",
      fullName: "Nom complet",
      phone: "Téléphone",
      shipping: "Adresse de livraison",
      address: "Adresse",
      city: "Ville",
      zip: "Code postal",
      country: "Pays",
      payment: "Paiement sécurisé",
      cardNumber: "Numéro de carte",
      cardExpiry: "MM/AA",
      cardCvc: "CVC",
      pay: "Payer",
      payAmount: (amt: string) => `Payer ${amt}`,
      success: "Commande confirmée",
      successText:
        "Merci ! Votre commande a bien été enregistrée. Vous recevrez un e-mail de confirmation sous peu.",
      back: "Retour au panier",
      backHome: "Retour à l'accueil",
      backShop: "Continuer mes achats",
      orderSummary: "Récapitulatif",
      note: "Vos données sont chiffrées et sécurisées. Nous acceptons les cartes bancaires et le paiement mobile.",
    },
    story: {
      eyebrow: "Notre histoire",
      title: "Né au Togo, tressé pour le monde",
      text1:
        "Lousha est née d'une conviction simple : le savoir-faire artisanal togolais mérite une place de choix dans l'univers de la décoration. Dans nos ateliers, des mains expertes transforment la fibre de raphia en pièces uniques, héritières d'un tressage transmis de génération en génération.",
      text2:
        "Chaque panier, chaque suspension, chaque objet de décoration raconte cette rencontre entre tradition africaine et esthétique contemporaine. Nous célébrons la lenteur du geste juste, la beauté des matières naturelles, et la fierté de celles et ceux qui créent.",
      stats: [
        { value: "100%", label: "Fait main" },
        { value: "8", label: "Artisans associés" },
        { value: "Togo", label: "Atelier d'origine" },
        { value: "0", label: "Intermédiaire" },
      ],
      cta: "Explorer nos créations",
    },
    material: {
      eyebrow: "La matière",
      title: "Le raphia, une fibre noble",
      text1:
        "Le raphia est une fibre végétale naturelle récoltée sur le palmier raphia. Souple, résistante et lumineuse, elle se prête à un tressage d'une finesse remarquable, idéal pour habiller vos intérieurs.",
      text2:
        "Récolté de manière responsable puis séché, teinté à l'eau et à la main, le raphia de Lousha conserve ses tons chauds et vivants. Chaque objet de décoration est unique, et peut présenter de subtiles variations de teinte qui témoignent de son caractère artisanal.",
      points: [
        { title: "Naturel", text: "Fibre 100% végétale, sans plastique." },
        { title: "Durable", text: "Des pièces pensées pour durer dans le temps." },
        { title: "Responsable", text: "Récolte raisonnée et teintures à l'eau." },
        { title: "Unique", text: "Chaque pièce porte la trace de son artisan." },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Parlons de votre intérieur",
      subtitle:
        "Une question, une commande de décoration sur-mesure, une envie de collaboration ? Notre équipe vous répond avec plaisir.",
      whatsapp: "Écrire sur WhatsApp",
      whatsappNumber: "+228 96 69 29 72",
      email: "E-mail",
      emailValue: "bonjour@lousha-accessories.com",
      hours: "Horaires",
      hoursValue: "Lun – Sam · 9h – 19h (GMT)",
      form: {
        name: "Votre nom",
        email: "Votre e-mail",
        message: "Votre message",
        send: "Envoyer le message",
        success: "Message envoyé. Nous vous répondrons rapidement.",
      },
    },
    footer: {
      tagline: "Objets de décoration & accessoires d'intérieur en raphia, faits main au Togo.",
      explore: "Explorer",
      maison: "La Maison",
      help: "Aide",
      newsletter: "Lettre Lousha",
      newsletterText:
        "Recevez en avant-première nos nouvelles collections et nos histoires d'atelier.",
      subscribe: "S'abonner",
      emailPlaceholder: "Votre adresse e-mail",
      rights: "Tous droits réservés.",
      links: {
        story: "Notre histoire",
        material: "La matière",
        engagements: "Nos engagements",
        shipping: "Livraison & retours",
        faq: "FAQ",
        contact: "Contact",
      },
    },
    whatsapp: {
      label: "Besoin d'aide ? Écrivez-nous",
    },
    common: {
      loading: "Chargement…",
      currency: "€",
    },
  },
  en: {
    nav: {
      home: "Home",
      shop: "Shop",
      contact: "Contact",
      cart: "Cart",
      account: "Account",
    },
    hero: {
      eyebrow: "Made in Togo · Handmade raffia",
      title1: "The art of raffia,",
      title2: "handwoven",
      subtitle:
        "Decorative objects and home accessories in 100% natural raffia, crafted by the artisans of Lousha in the heart of Togo.",
      cta1: "Discover our collections",
      cta2: "Our story",
      slides: [
        {
          eyebrow: "The gesture",
          title: "The artisans' know-how",
          text: "Each decorative object is born from expert hands and natural fibers.",
        },
        {
          eyebrow: "The material",
          title: "100% natural raffia",
          text: "A noble, durable fiber drawn from the richness of Togo.",
        },
        {
          eyebrow: "Elegance",
          title: "An interior filled with soul",
          text: "Decorative creations that warm your living spaces.",
        },
      ],
    },
    categories: {
      title: "Our collections",
      subtitle: "The Lousha decoration universe",
      discover: "Discover",
    },
    engagements: {
      title: "Our commitments",
      items: [
        { title: "Free shipping", text: "Throughout France from €80" },
        { title: "Quality guaranteed", text: "Each piece hand-checked" },
        { title: "24/7 support", text: "A team at your service, day and night" },
        { title: "Secure payment", text: "Your transactions protected" },
      ],
    },
    promo: {
      eyebrow: "Made in Togo · Handmade",
      title: "The art of raffia,",
      titleAccent: "within reach",
      text: "Unique decorative objects in 100% natural raffia, hand-woven by our artisans in Togo. To dress your interiors with authenticity and warmth.",
      cta: "Discover our collections",
      secondary: "Our commitments",
    },
    products: {
      title: "New & Best-sellers",
      subtitle: "The signature Lousha pieces",
      new: "New",
      bestseller: "Best-seller",
      addToCart: "Add to cart",
      quickView: "Quick view",
      from: "From",
      viewAll: "View all our collections",
    },
    shop: {
      title: "LOUSHA",
      subtitle: "All our handmade raffia decoration creations",
      all: "All",
      sort: "Sort",
      sortNew: "Newest",
      sortPriceAsc: "Price low to high",
      sortPriceDesc: "Price high to low",
      empty: "No creations in this category yet.",
      results: (n: number) => `${n} piece${n > 1 ? "s" : ""}`,
    },
    product: {
      addToCart: "Add to cart",
      buyNow: "I love it",
      material: "Material",
      origin: "Origin",
      craftingTime: "Crafting time",
      related: "You may also like",
      inStock: "In stock",
      outOfStock: "Sold out",
      quantity: "Quantity",
      details: "The detail",
    },
    cart: {
      title: "Your cart",
      empty: "Your cart is empty.",
      emptyCta: "Explore our collections",
      subtotal: "Subtotal",
      shipping: "Shipping",
      shippingFree: "Free",
      shippingInfo: "Calculated at the next step",
      total: "Total",
      checkout: "Checkout",
      continue: "Continue shopping",
      remove: "Remove",
    },
    checkout: {
      title: "Finalize your order",
      subtitle: "Shipping & payment",
      contact: "Contact details",
      email: "Email address",
      fullName: "Full name",
      phone: "Phone",
      shipping: "Shipping address",
      address: "Address",
      city: "City",
      zip: "Postal code",
      country: "Country",
      payment: "Secure payment",
      cardNumber: "Card number",
      cardExpiry: "MM/YY",
      cardCvc: "CVC",
      pay: "Pay",
      payAmount: (amt: string) => `Pay ${amt}`,
      success: "Order confirmed",
      successText:
        "Thank you! Your order has been recorded. You will receive a confirmation email shortly.",
      back: "Back to cart",
      backHome: "Back to home",
      backShop: "Continue shopping",
      orderSummary: "Summary",
      note: "Your data is encrypted and secure. We accept bank cards and mobile payment.",
    },
    story: {
      eyebrow: "Our story",
      title: "Born in Togo, woven for the world",
      text1:
        "Lousha was born from a simple conviction: Togolese artisanal know-how deserves a place of choice in the world of decoration. In our ateliers, expert hands transform raffia fiber into unique pieces, heirs of a weaving passed down from generation to generation.",
      text2:
        "Each basket, each pendant light, each decorative object tells of this encounter between African tradition and contemporary aesthetics. We celebrate the slowness of the right gesture, the beauty of natural materials, and the pride of those who create.",
      stats: [
        { value: "100%", label: "Handmade" },
        { value: "8", label: "Artisans partnered" },
        { value: "Togo", label: "Atelier of origin" },
        { value: "0", label: "Middlemen" },
      ],
      cta: "Explore our creations",
    },
    material: {
      eyebrow: "The material",
      title: "Raffia, a noble fiber",
      text1:
        "Raffia is a natural plant fiber harvested from the raffia palm. Supple, resistant and luminous, it lends itself to a remarkably fine weave, ideal for dressing your interiors.",
      text2:
        "Harvested responsibly then dried, dyed with water and by hand, Lousha's raffia retains its warm and vibrant tones. Each decorative object is unique, and may show subtle shade variations that testify to its artisanal character.",
      points: [
        { title: "Natural", text: "100% plant fiber, plastic-free." },
        { title: "Durable", text: "Pieces designed to last over time." },
        { title: "Responsible", text: "Reasoned harvest and water dyes." },
        { title: "Unique", text: "Each piece bears the trace of its maker." },
      ],
    },
    contact: {
      eyebrow: "Contact",
      title: "Let's talk about your interior",
      subtitle:
        "A question, a made-to-measure decoration order, a desire to collaborate? Our team replies with pleasure.",
      whatsapp: "Message on WhatsApp",
      whatsappNumber: "+228 96 69 29 72",
      email: "Email",
      emailValue: "bonjour@lousha-accessories.com",
      hours: "Hours",
      hoursValue: "Mon – Sat · 9am – 7pm (GMT)",
      form: {
        name: "Your name",
        email: "Your email",
        message: "Your message",
        send: "Send message",
        success: "Message sent. We will reply shortly.",
      },
    },
    footer: {
      tagline: "Decorative objects & home accessories in raffia, handmade in Togo.",
      explore: "Explore",
      maison: "The House",
      help: "Help",
      newsletter: "Lousha Letter",
      newsletterText:
        "Get a first look at our new collections and atelier stories.",
      subscribe: "Subscribe",
      emailPlaceholder: "Your email address",
      rights: "All rights reserved.",
      links: {
        story: "Our story",
        material: "The material",
        engagements: "Our commitments",
        shipping: "Shipping & returns",
        faq: "FAQ",
        contact: "Contact",
      },
    },
    whatsapp: {
      label: "Need help? Message us",
    },
    common: {
      loading: "Loading…",
      currency: "€",
    },
  },
} as const;

export type Dict = typeof dict.fr;

export function useDict(lang: Lang): Dict {
  return dict[lang] as Dict;
}

export function formatPrice(cents: number, lang: Lang): string {
  const value = (cents / 100).toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value}${dict[lang].common.currency}`;
}
