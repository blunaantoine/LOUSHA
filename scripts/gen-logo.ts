/**
 * Lousha Accessories — Luxury Logo ICON Generator
 * -----------------------------------------------
 * Generates a single 1024x1024 minimalist luxury emblem / monogram icon for
 * the Lousha Accessories brand (handmade raffia accessories from Togo).
 *
 * Run with:  bun run scripts/gen-logo.ts
 *
 * Output:    /home/z/my-project/public/images/lousha-logo.png
 *
 * Aesthetic: minimalist, modern luxury emblem — NOT a wordmark. Inspired by
 * raffia weaving, natural fiber, African craftsmanship. Color palette limited
 * to deep brown (#311B00), near-black (#111111) and white (#FFFFFF). Designed
 * to remain legible and iconic even at favicon / app-icon sizes.
 */

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PROJECT_ROOT = '/home/z/my-project';
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public', 'images', 'lousha-logo.png');
const SIZE = '1024x1024' as const;
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1500;

/**
 * Detailed prompt engineered for a clean, scalable, luxury logo ICON.
 * Emphasizes:
 *   - ICON / emblem / monogram (explicitly NOT a wordmark or readable letters)
 *   - A stylized "L" formed by interlaced raffia strands / woven ribbon
 *   - Limited palette: deep brown #311B00, near-black #111111, pure white #FFFFFF
 *   - Generous negative space, thick confident strokes, geometric symmetry
 *   - Flat vector-style icon, no photo-realism, no gradients beyond subtle weave shading
 *   - Readable at favicon size → bold, simple, no thin detail
 *   - African raffia weaving craft reference woven into the form itself
 */
const LOGO_PROMPT =
        'A minimalist luxury brand logo ICON — an emblem / monogram symbol, ' +
        'absolutely NOT a wordmark and NOT any readable letters or text. ' +
        'The mark is a single bold, geometric, stylized letter "L" monogram ' +
        'formed by two interlaced woven raffia-fiber ribbons crossing each other, ' +
        'evoking African raffia weaving craftsmanship and natural fiber texture. ' +
        'The weave pattern is subtle and tactile but the overall silhouette stays ' +
        'clean, simple and iconic — only two or three woven strands visible. ' +
        'Strictly limited color palette: deep espresso brown (#311B00) for the ' +
        'main woven form, near-black charcoal (#111111) for depth and shadow lines, ' +
        'and pure white (#FFFFFF) for the background and inner negative space. ' +
        'No other colors. Flat vector icon style, modern luxury aesthetic, ' +
        'symmetrical and perfectly centered, generous padding around the emblem, ' +
        'thick confident strokes, strong geometric clarity, designed to remain ' +
        'instantly recognizable and crisp even at tiny favicon / app-icon size. ' +
        'Refined, sophisticated, high-end fashion-house emblem feel in the spirit ' +
        'of luxury maison monograms. ' +
        'No words, no letters, no text, no watermark, no border, no shadow drop, ' +
        'no background scenery — pure isolated icon on a clean white background.';

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

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
        console.log('==============================================================');
        console.log(' Lousha Accessories — Luxury Logo ICON Generator');
        console.log('==============================================================');
        console.log(`Output      : ${OUTPUT_PATH}`);
        console.log(`Size        : ${SIZE}`);
        console.log(`Max retries : ${MAX_RETRIES}`);
        console.log('--------------------------------------------------------------');

        ensureDirFor(OUTPUT_PATH);

        const zai = await ZAI.create();

        let lastError: string | undefined;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                        console.log(`\n▶ attempt ${attempt}/${MAX_RETRIES} → generating logo icon...`);

                        const response = await zai.images.generations.create({
                                prompt: LOGO_PROMPT,
                                size: SIZE,
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

                        fs.writeFileSync(OUTPUT_PATH, buffer);
                        const sizeKB = Math.round(buffer.length / 1024);

                        console.log(`\n✓ OK — logo saved → ${OUTPUT_PATH}  (${sizeKB} KB, attempt ${attempt})`);

                        // Final verification: re-stat the file on disk.
                        const onDisk = fs.existsSync(OUTPUT_PATH) && fs.statSync(OUTPUT_PATH).size > 0;
                        if (!onDisk) {
                                throw new Error('File verification failed: file missing or empty after write.');
                        }

                        console.log('\nDone.');
                        return;
                } catch (err: any) {
                        lastError = err?.message || String(err);
                        console.warn(`\n✗ FAIL attempt ${attempt}: ${lastError}`);
                        if (attempt < MAX_RETRIES) {
                                const backoff = RETRY_BACKOFF_MS * attempt;
                                console.log(`  retrying in ${backoff}ms...`);
                                await sleep(backoff);
                        }
                }
        }

        console.error(`\n!! Logo generation FAILED after ${MAX_RETRIES} attempts.`);
        console.error(`   Last error: ${lastError}`);
        process.exit(1);
}

main().catch((err) => {
        console.error('Fatal error in main:', err);
        process.exit(1);
});
