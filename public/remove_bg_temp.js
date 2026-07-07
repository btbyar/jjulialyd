const Jimp = require('jimp');
const path = require('path');

const files = [
    'lily_accent_2.png',
    'lily_accent.png',
    'lily_bottom_left.png',
    'lily_bottom_right.png',
    'lily_corner.png',
    'lily_top_left.png',
    'lily_top_right.png',
];

const inputDir = 'C:/Users/user/Desktop/ww/public';

function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

async function removeBackground(filePath, tolerance = 45) {
    const img = await Jimp.read(filePath);
    const width = img.bitmap.width;
    const height = img.bitmap.height;

    // Sample background from top-left corner
    const bgHex = img.getPixelColor(0, 0);
    const bgColor = Jimp.intToRGBA(bgHex);
    const bgR = bgColor.r, bgG = bgColor.g, bgB = bgColor.b;
    console.log(`  BG color: rgb(${bgR},${bgG},${bgB})`);

    // BFS flood fill from all 4 corners
    const visited = new Uint8Array(width * height);
    const queueX = [];
    const queueY = [];

    const tryAdd = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return;
        const idx = y * width + x;
        if (visited[idx]) return;
        const hex = img.getPixelColor(x, y);
        const { r, g, b } = Jimp.intToRGBA(hex);
        if (colorDistance(r, g, b, bgR, bgG, bgB) <= tolerance) {
            visited[idx] = 1;
            queueX.push(x);
            queueY.push(y);
        }
    };

    tryAdd(0, 0);
    tryAdd(width - 1, 0);
    tryAdd(0, height - 1);
    tryAdd(width - 1, height - 1);

    let head = 0;
    while (head < queueX.length) {
        const x = queueX[head];
        const y = queueY[head];
        head++;
        tryAdd(x + 1, y);
        tryAdd(x - 1, y);
        tryAdd(x, y + 1);
        tryAdd(x, y - 1);
    }

    // Make flooded pixels transparent
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (visited[y * width + x]) {
                img.setPixelColor(0x00000000, x, y);
            }
        }
    }

    return img;
}

(async () => {
    for (const file of files) {
        const filePath = path.join(inputDir, file);
        console.log(`Processing: ${file}`);
        try {
            const img = await removeBackground(filePath, 45);
            await img.writeAsync(filePath);
            console.log(`  ✓ Saved: ${file}`);
        } catch (e) {
            console.error(`  ✗ Error: ${e.message}`);
        }
    }
    console.log('\nDone!');
})();
