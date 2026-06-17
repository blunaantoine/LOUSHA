/**
 * Lousha Accessories — Luxury Raffia Image Generator
 * ---------------------------------------------------
 * Generates a full set of editorial/luxury product, hero, category, and atelier
 * images for the Lousha Accessories (Made-in-Togo) brand using z-ai-web-dev-sdk.
 *
 * Run with:  bun run scripts/gen-images.ts
 *
 * Aesthetic: luxury, minimalist, airy (Zara / LVMH inspiration), warm neutral
 * tones (ecru, beige, sand, terracotta, natural raffia fiber), natural light,
 * editorial fashion photography, African craftsmanship. No text in images.
 */

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type Size =
        | '1024x1024'
        | '768x1344'
        | '864x1152'
        | '1344x768'
        | '1152x864'
        | '1440x720'
        | '720x1440'
        | '1440x768'
        | '768x1440';

interface ImageJob {
        id: number;
        name: string;
        size: Size;
        relativePath: string; // relative to /home/z/my-project/public/images
        prompt: string;
}

const PROJECT_ROOT = '/home/z/my-project';
const IMAGES_ROOT = path.join(PROJECT_ROOT, 'public', 'images');

const MAX_RETRIES = 3;
const INTER_REQUEST_DELAY_MS = 500;
const RETRY_BACKOFF_MS = 1500;

// Shared quality suffix appended to every prompt to enforce luxury editorial look.
const QUALITY_SUFFIX =
        'high quality, editorial, luxury, natural light, professional photography, ' +
        'minimalist, refined, no text, no watermark, no logo, no words, no letters';

// ---------------------------------------------------------------------------
// Image job definitions (18 images total)
// ---------------------------------------------------------------------------

const jobs: ImageJob[] = [
        // ---- HERO IMAGES (1440x720) -----------------------------------------
        {
                id: 1,
                name: 'hero-1',
                size: '1440x768', // task asked for 1440x720, but API requires multiples of 32 (720 is not); 1440x768 is the closest valid wide-cinematic substitute
                relativePath: 'hero/hero-1.png',
                prompt:
                        'Wide editorial photograph of a Togolese artisan woman\'s hands weaving natural raffia fiber in a sunlit workshop, ' +
                        'warm golden natural light streaming through a window, shallow depth of field, neutral beige and ecru background, ' +
                        'dried raffia strands in soft focus, intimate close-up of skilled craftsmanship, dignified and serene mood, ' +
                        'documentary luxury style, warm earthy tones, ' + QUALITY_SUFFIX,
        },
        {
                id: 2,
                name: 'hero-2',
                size: '1440x768', // see note on hero-1
                relativePath: 'hero/hero-2.png',
                prompt:
                        'Wide editorial product photograph of an elegant handmade raffia tote bag styled on a neutral cream pedestal in a ' +
                        'minimalist studio, soft directional shadows, terracotta and sand color palette, woven raffia texture detail, ' +
                        'sophisticated still life composition, luxury fashion product photography, airy negative space, ' + QUALITY_SUFFIX,
        },
        {
                id: 3,
                name: 'hero-3',
                size: '1440x768', // see note on hero-1
                relativePath: 'hero/hero-3.png',
                prompt:
                        'Wide editorial fashion photograph of an elegant African woman model wearing a raffia sun hat and holding a raffia bag, ' +
                        'neutral linen outfit in ecru tones, warm golden hour light, minimalist African luxury fashion editorial, ' +
                        'soft desert or studio backdrop in sand tones, serene and refined mood, full body elegant pose, ' + QUALITY_SUFFIX,
        },

        // ---- CATEGORY IMAGES (1024x1024) ------------------------------------
        {
                id: 4,
                name: 'cat-sacs',
                size: '1024x1024',
                relativePath: 'categories/cat-sacs.png',
                prompt:
                        'A beautifully crafted handmade raffia handbag tote bag, three-quarter view, on warm sand-colored linen fabric, ' +
                        'soft natural shadows, ecru and beige raffia weave with subtle texture, luxury product photography, ' +
                        'minimalist styling, neutral background, ' + QUALITY_SUFFIX,
        },
        {
                id: 5,
                name: 'cat-chapeaux',
                size: '1024x1024',
                relativePath: 'categories/cat-chapeaux.png',
                prompt:
                        'An elegant handmade raffia sun hat with a subtle thin brown leather ribbon, placed on a neutral cream background, ' +
                        'editorial styling, soft natural light, warm sand color raffia, refined minimalist product photography, ' +
                        'fashion accessory still life, ' + QUALITY_SUFFIX,
        },
        {
                id: 6,
                name: 'cat-decoration',
                size: '1024x1024',
                relativePath: 'categories/cat-decoration.png',
                prompt:
                        'A raffia woven decorative bowl and vase set of objects, styled on a warm wooden surface, soft warm light, ' +
                        'minimalist still life composition, ecru and terracotta tones, natural texture, artisanal home decor, ' +
                        'luxury interior styling, ' + QUALITY_SUFFIX,
        },
        {
                id: 7,
                name: 'cat-artisanat',
                size: '1024x1024',
                relativePath: 'categories/cat-artisanat.png',
                prompt:
                        'Extreme close-up macro of natural raffia weaving texture and craftsmanship, hands of an artisan weaving raffia strands, ' +
                        'intricate woven pattern detail, warm earthy tones, ecru and beige fibers, artisanal handmade detail, ' +
                        'editorial craftsmanship photography, ' + QUALITY_SUFFIX,
        },

        // ---- PRODUCT IMAGES (1024x1024) — 8 total ---------------------------
        {
                id: 8,
                name: 'sac-1',
                size: '1024x1024',
                relativePath: 'products/sac-1.png',
                prompt:
                        'A raffia tote bag in natural ecru color with brown leather handles, structured shape, studio product shot on a ' +
                        'clean cream background, soft even lighting, centered composition, luxury e-commerce product photography, ' +
                        'fine woven texture detail, ' + QUALITY_SUFFIX,
        },
        {
                id: 9,
                name: 'sac-2',
                size: '1024x1024',
                relativePath: 'products/sac-2.png',
                prompt:
                        'A raffia crossbody bag in warm terracotta tone with intricate woven pattern and a thin leather strap, studio product ' +
                        'shot on a beige background, soft natural light, centered composition, luxury e-commerce product photography, ' +
                        'fine artisanal detail, ' + QUALITY_SUFFIX,
        },
        {
                id: 10,
                name: 'chapeau-1',
                size: '1024x1024',
                relativePath: 'products/chapeau-1.png',
                prompt:
                        'A wide-brim raffia sun hat in natural sand color with a thin brown leather band around the crown, studio shot on a ' +
                        'neutral cream background, soft directional light, elegant fashion accessory product photography, ' +
                        'centered composition, ' + QUALITY_SUFFIX,
        },
        {
                id: 11,
                name: 'chapeau-2',
                size: '1024x1024',
                relativePath: 'products/chapeau-2.png',
                prompt:
                        'A raffia bucket hat in ecru color with a subtle geometric woven pattern, studio shot on a neutral beige background, ' +
                        'soft even lighting, centered composition, luxury e-commerce product photography, fine texture detail, ' + QUALITY_SUFFIX,
        },
        {
                id: 12,
                name: 'deco-1',
                size: '1024x1024',
                relativePath: 'products/deco-1.png',
                prompt:
                        'A set of three raffia woven baskets and storage bowls in graduating sizes, warm ecru and sand tones, styled on a ' +
                        'neutral cream surface, minimalist composition, soft natural light, luxury home decor product photography, ' + QUALITY_SUFFIX,
        },
        {
                id: 13,
                name: 'deco-2',
                size: '1024x1024',
                relativePath: 'products/deco-2.png',
                prompt:
                        'A raffia pendant lamp and woven wall hanging, warm soft glow emanating, neutral cream wall background, ' +
                        'editorial interior styling, ecru and beige woven texture, minimalist luxury home decor photography, ' + QUALITY_SUFFIX,
        },
        {
                id: 14,
                name: 'art-1',
                size: '1024x1024',
                relativePath: 'products/art-1.png',
                prompt:
                        'A raffia placemat and coaster set with an intricate woven pattern, styled on a warm wooden table, top-down flat lay ' +
                        'view, soft natural light, ecru and beige tones with terracotta accents, luxury tableware product photography, ' + QUALITY_SUFFIX,
        },
        {
                id: 15,
                name: 'art-2',
                size: '1024x1024',
                relativePath: 'products/art-2.png',
                prompt:
                        'A raffia woven hand fan with a decorative geometric pattern, a thin wooden handle, placed on neutral linen fabric, ' +
                        'studio product shot, soft directional light, ecru and warm sand tones, luxury artisanal accessory photography, ' + QUALITY_SUFFIX,
        },

        // ---- STORY / ATELIER IMAGES -----------------------------------------
        {
                id: 16,
                name: 'atelier-1',
                size: '1344x768',
                relativePath: 'story/atelier-1.png',
                prompt:
                        'A Togolese raffia weaving atelier interior with several artisans working on raffia crafts, warm natural light pouring ' +
                        'through large windows, dried raffia fibers and finished pieces around, authentic craftsmanship atmosphere, ' +
                        'documentary luxury style, earthy warm tones, dignified mood, ' + QUALITY_SUFFIX,
        },
        {
                id: 17,
                name: 'atelier-2',
                size: '1024x1024',
                relativePath: 'story/atelier-2.png',
                prompt:
                        'Close-up flat lay of dried raffia fibers and natural dye materials arranged beautifully on a neutral linen surface, ' +
                        'bundles of ecru and terracotta raffia strands, small bowls of natural pigment powders, warm earthy tones, ' +
                        'artisanal materials still life, top-down view, editorial styling, ' + QUALITY_SUFFIX,
        },
        {
                id: 18,
                name: 'portrait-artisan',
                size: '864x1152',
                relativePath: 'story/portrait-artisan.png',
                prompt:
                        'Portrait of a Togolese master artisan woman holding her finished raffia creation, warm dignified expression, ' +
                        'natural soft window light, neutral cream background, refined editorial portrait, earthy warm tones, ' +
                        'authentic African craftsmanship, three-quarter view, ' + QUALITY_SUFFIX,
        },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureDirFor(filePath: string): void {
        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });
}

function fileExistsAndNonEmpty(filePath: string): boolean {
        try {
                return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
        } catch {
                return false;
        }
}

interface GenResult {
        job: ImageJob;
        success: boolean;
        attempts: number;
        path: string;
        error?: string;
        fileSizeKB?: number;
}

async function generateOne(zai: any, job: ImageJob): Promise<GenResult> {
        const fullPath = path.join(IMAGES_ROOT, job.relativePath);
        ensureDirFor(fullPath);

        // Resume capability: skip if a valid file already exists on disk.
        if (fileExistsAndNonEmpty(fullPath)) {
                const sizeKB = Math.round(fs.statSync(fullPath).size / 1024);
                console.log(
                        `  ⊙ SKIP [${job.id}/18] ${job.name} already exists (${sizeKB} KB) — skipping`
                );
                return {
                        job,
                        success: true,
                        attempts: 0,
                        path: fullPath,
                        fileSizeKB: sizeKB,
                };
        }

        let lastError: string | undefined;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                        console.log(
                                `  [${job.id}/18] attempt ${attempt}/${MAX_RETRIES} → ${job.relativePath} (${job.size})`
                        );

                        const response = await zai.images.generations.create({
                                prompt: job.prompt,
                                size: job.size,
                        });

                        const base64 = response?.data?.[0]?.base64;
                        if (!base64) {
                                throw new Error(
                                        'No image data returned by API. Response: ' +
                                                JSON.stringify(response).slice(0, 300)
                                );
                        }

                        const buffer = Buffer.from(base64, 'base64');
                        if (buffer.length < 1024) {
                                throw new Error(`Returned image buffer too small (${buffer.length} bytes)`);
                        }

                        fs.writeFileSync(fullPath, buffer);
                        const fileSizeKB = Math.round(buffer.length / 1024);

                        console.log(
                                `  ✓ OK  [${job.id}/18] ${job.name} → ${job.relativePath}  (${fileSizeKB} KB, attempt ${attempt})`
                        );

                        return {
                                job,
                                success: true,
                                attempts: attempt,
                                path: fullPath,
                                fileSizeKB,
                        };
                } catch (err: any) {
                        lastError = err?.message || String(err);
                        console.warn(
                                `  ✗ FAIL [${job.id}/18] ${job.name} attempt ${attempt}: ${lastError}`
                        );
                        if (attempt < MAX_RETRIES) {
                                const backoff = RETRY_BACKOFF_MS * attempt;
                                console.log(`    retrying in ${backoff}ms...`);
                                await sleep(backoff);
                        }
                }
        }

        return {
                job,
                success: false,
                attempts: MAX_RETRIES,
                path: fullPath,
                error: lastError,
        };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
        console.log('==============================================================');
        console.log(' Lousha Accessories — Luxury Raffia Image Generator');
        console.log('==============================================================');
        console.log(`Output root : ${IMAGES_ROOT}`);
        console.log(`Jobs total  : ${jobs.length}`);
        console.log(`Retries/job : ${MAX_RETRIES}`);
        console.log(`Inter-delay : ${INTER_REQUEST_DELAY_MS}ms`);
        console.log('--------------------------------------------------------------');

        // Ensure all subdirectories exist up-front.
        const subdirs = ['hero', 'categories', 'products', 'story'];
        for (const sd of subdirs) {
                fs.mkdirSync(path.join(IMAGES_ROOT, sd), { recursive: true });
        }

        const zai = await ZAI.create();

        const results: GenResult[] = [];
        const failed: GenResult[] = [];

        for (let i = 0; i < jobs.length; i++) {
                const job = jobs[i];
                console.log(`\n▶ Generating [${job.id}/18] ${job.name} (${job.size})`);

                const result = await generateOne(zai, job);
                results.push(result);
                if (!result.success) failed.push(result);

                // Small delay between requests to be safe (skip after last one).
                if (i < jobs.length - 1) {
                        await sleep(INTER_REQUEST_DELAY_MS);
                }
        }

        // ---------------------------------------------------------------------
        // Final verification pass: ensure every file actually exists & non-empty
        // ---------------------------------------------------------------------
        console.log('\n==============================================================');
        console.log(' Verification — checking all 18 files exist & non-empty');
        console.log('==============================================================');

        const missing: ImageJob[] = [];
        let totalBytes = 0;

        for (const job of jobs) {
                const fullPath = path.join(IMAGES_ROOT, job.relativePath);
                const ok = fileExistsAndNonEmpty(fullPath);
                let sizeKB = 0;
                if (ok) {
                        sizeKB = Math.round(fs.statSync(fullPath).size / 1024);
                        totalBytes += sizeKB * 1024;
                }
                console.log(
                        `  ${ok ? '✓' : '✗'}  ${job.relativePath.padEnd(34)}  ${
                                ok ? sizeKB + ' KB' : 'MISSING'
                        }`
                );
                if (!ok) missing.push(job);
        }

        console.log('--------------------------------------------------------------');
        console.log(
                `Total: ${jobs.length - missing.length}/${jobs.length} images present, ` +
                        `${Math.round(totalBytes / 1024)} KB total.`
        );

        if (failed.length > 0 || missing.length > 0) {
                console.log('\n!! Failures after retries:');
                const allBad = new Map<string, ImageJob>();
                for (const f of failed) allBad.set(f.job.name, f.job);
                for (const m of missing) allBad.set(m.name, m);
                for (const [, job] of allBad) {
                        const res = results.find((r) => r.job.id === job.id);
                        console.log(`  - ${job.name} (${job.relativePath}) — ${res?.error || 'missing on disk'}`);
                }
        } else {
                console.log('\nAll 18 images generated successfully.');
        }

        console.log('\nDone.');
}

main().catch((err) => {
        console.error('Fatal error in main:', err);
        process.exit(1);
});
