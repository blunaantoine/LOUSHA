import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

async function main() {
  const zai = await ZAI.create();
  const prompt =
    "A single elegant handmade raffia tote bag with leather handles, natural ecru color, floating in space, professional product photography, studio lighting, perfectly cut out on a pure white seamless background, high detail of woven raffia texture, luxury African craftsmanship, centered composition, soft natural shadow beneath, high quality, photorealistic, no text";
  console.log("Generating transparent raffia bag...");
  const res = await zai.images.generations.create({
    prompt,
    size: "1024x1024",
  });
  const b64 = res.data[0].base64;
  fs.writeFileSync(
    "/home/z/my-project/public/images/hero-bag.png",
    Buffer.from(b64, "base64")
  );
  console.log("Saved /home/z/my-project/public/images/hero-bag.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
