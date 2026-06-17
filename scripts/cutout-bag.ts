import sharp from "sharp";
import fs from "fs";

/**
 * Détoure le fond d'une image produit.
 * Stratégie combinée :
 * 1. Chromaticité : le fond gris neutre (R≈G≈B, saturation faible) est marqué fond.
 *    Le sac raphia a une teinte chaude (R > B, saturation plus forte).
 * 2. Luminosité : seuil élevé pour les zones très claires.
 * 3. Bord progressif pour un détourage lisse (anti-halo).
 */
async function main() {
  const input = "/home/z/my-project/public/images/hero-bag.png";
  const output = "/home/z/my-project/public/images/hero-bag-transparent.png";

  if (!fs.existsSync(input)) {
    console.error("Input not found:", input);
    process.exit(1);
  }

  const { data, info } = await sharp(input)
    .removeAlpha()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Seuil de saturation en-dessous duquel un pixel clair est considéré comme fond gris
  const satThreshold = 0.06;
  const lumThreshold = 0.55; // au-dessus de ça + faible saturation → fond

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b);
    const sat = max === 0 ? 0 : (max - min) / max; // saturation 0..1

    // Fond : gris clair (saturation faible ET luminosité élevée)
    const isBg = sat < satThreshold && lum > lumThreshold;

    if (isBg) {
      data[i + 3] = 0;
    } else {
      // Bord progressif : si on est proche du seuil de saturation, lisser l'alpha
      const dist = sat - satThreshold; // > 0
      let alpha = 255;
      if (dist < 0.05 && lum > lumThreshold - 0.05) {
        // Zone de transition (bord du sac sur fond clair)
        alpha = Math.round(Math.max(0, Math.min(255, (dist / 0.05) * 255)));
      }
      data[i + 3] = alpha;
      // Réduire légèrement les valeurs pour éviter les halos clairs sur les bords
      if (alpha < 255) {
        const f = alpha / 255;
        data[i] = Math.round(r * 255 * f);
        data[i + 1] = Math.round(g * 255 * f);
        data[i + 2] = Math.round(b * 255 * f);
      }
    }
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .toFile(output);

  // Stats
  const { data: outData, info: outInfo } = await sharp(output)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let transparent = 0, opaque = 0;
  for (let i = 0; i < outData.length; i += outInfo.channels) {
    if (outData[i + 3] === 0) transparent++;
    else opaque++;
  }
  const total = outInfo.width * outInfo.height;
  console.log("Saved:", output);
  console.log("Transparent:", transparent, "(" + (transparent/total*100).toFixed(1) + "%)");
  console.log("Opaque:", opaque, "(" + (opaque/total*100).toFixed(1) + "%)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
