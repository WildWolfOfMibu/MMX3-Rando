import { palAddrs } from './palAddrs.js'
import { conv, readWord, writeWord } from './utils.js';

export function snes2rgb(snesCol: number): [number, number, number] {
    let r: number = snesCol & 0x1f;
    let g: number = (snesCol >> 5) & 0x1f;
    let b: number = (snesCol >> 10) & 0x1f;
    return [r / 0x1f, g / 0x1f, b / 0x1f];
}

export function rgb2snes(r: number, g: number, b: number): number {
    return ((b & 0x1f) << 10) + ((g & 0x1f) << 5) + (r & 0x1f);
}

export function rgb2hsl(r: number, g: number, b: number): [number, number, number] {
    let maxColVal: number = Math.max(r, g, b);
    let minColVal: number = Math.min(r, g, b);
    let maxCol: string = 'r';
    if (g == maxColVal) maxCol = 'g';
    if (b == maxColVal) maxCol = 'b';
    let delta: number = maxColVal - minColVal;

    let lightness: number = (maxColVal + minColVal) / 2;
    let saturation: number = 0;
    if (delta !== 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }
    let hue: number;
    if (delta === 0) {
        hue = 0;
    } else if (maxCol === 'r') {
        hue = 60 * (((g - b) / delta) % 6);
    } else if (maxCol === 'g') {
        hue = 60 * (((b - r) / delta) + 2);
    } else {
        hue = 60 * (((r - g) / delta) + 4);
    }
    if (hue < 360) hue += 360;
    return [hue, saturation, lightness];
}

export function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
    let C: number = (1 - Math.abs(2 * l - 1)) * s;
    let X: number = C * (1 - Math.abs(((h / 60) % 2) - 1));
    let m: number = l - C / 2;
    let r: number, g: number, b: number;
    if (h < 60) {
        r = C, g = X, b = 0
    } else if (h < 120) {
        r = X, g = C, b = 0
    } else if (h < 180) {
        r = 0, g = C, b = X
    } else if (h < 240) {
        r = 0, g = X, b = C
    } else if (h < 300) {
        r = X, g = 0, b = C
    } else {
        r = C, g = 0, b = X
    }
    return [
        (r + m) * 0x1f,
        (g + m) * 0x1f,
        (b + m) * 0x1f,
    ];
}

export function paletteRandomize(rom: number[], rng: () => number, opts: any, _: any): void {
    const miscPalAddrs: [number, number][] = [
        [conv(7, 0x808a), 1], // X wireframe logo
    ];

    // Add in unused palettes
    let copyPalAddrs: number[] = [...(new Set(palAddrs))].sort();
    let newPalAddrs: number[] = [...(new Set(palAddrs))].sort();
    for (let i: number = 0; i < copyPalAddrs.length - 1; i++) {
        let currAddr: number = copyPalAddrs[i];
        let nextAddr: number = copyPalAddrs[i + 1];
        for (let addr: number = currAddr + 0x20; addr < nextAddr; addr += 0x20) {
            newPalAddrs.push(addr);
        }
    }

    // Randomize palettes
    switch (opts.colours) {
        case 'chaos':
            let newPalettes: number[][] = new Array(newPalAddrs.length);
            let palPool: number[][] = [];
            for (let addr of newPalAddrs) {
                let start: number = conv(0xc, addr);
                palPool.push(rom.slice(start, start + 0x20));
            }
            let unassignedPals: number[] = [];
            for (let i: number = 0; i < newPalAddrs.length; i++) unassignedPals.push(i);

            while (unassignedPals.length !== 0) {
                let slotIdx: number = Math.floor(rng() * unassignedPals.length);
                let palsIdx: number = Math.floor(rng() * palPool.length);
                newPalettes[unassignedPals[slotIdx]] = palPool[palsIdx];
                unassignedPals.splice(slotIdx, 1);
                palPool.splice(palsIdx, 1);
            }
            // mutate
            for (let i: number = 0; i < newPalAddrs.length; i++) {
                let palAddr: number = newPalAddrs[i];
                let start: number = conv(0xc, palAddr);
                let pals: number[] = newPalettes[i];
                for (let j: number = 0; j < 0x20; j++) {
                    rom[start++] = pals[j];
                }
            }
            break;

        case 'hsl_palettes':
            for (let palAddr of newPalAddrs) {
                let start: number = conv(0xc, palAddr);
                let hOffs: number = rng() * 360;
                let sMult: number = rng() + 0.5;
                let lMult: number = rng() + 0.5;
                for (let i: number = 0; i < 0x20; i += 2) {
                    let snesCol: number = readWord(rom, start + i);
                    let [h, s, l]: [number, number, number] = rgb2hsl(...snes2rgb(snesCol));
                    h = (h + hOffs) % 360;
                    s = Math.min(s * sMult, 1);
                    l = Math.min(l * lMult, 1);
                    let newSnesCol: number = rgb2snes(...hsl2rgb(h, s, l));
                    writeWord(rom, start + i, newSnesCol);
                }
            }
            break;

        case 'gb_green':
            let greens: number[] = [
                rgb2snes(0x08, 0x0a, 0x02),
                rgb2snes(0x0e, 0x10, 0x05),
                rgb2snes(0x14, 0x15, 0x08),
                rgb2snes(0x1a, 0x1a, 0x0b),
            ];
            for (let palAddr of newPalAddrs) {
                let start: number = conv(0xc, palAddr);
                for (let i: number = 0; i < 0x20; i += 2) {
                    let snesCol: number = readWord(rom, start + i);
                    let [h, s, l]: [number, number, number] = rgb2hsl(...snes2rgb(snesCol));
                    let greenCol: number = Math.floor(l / 0.25);
                    writeWord(rom, start + i, greens[Math.min(greenCol, 3)]);
                }
            }
            break;

        case 'vb_palettes':
            let reds: number[] = [
                rgb2snes(0x00, 0x00, 0x00),
                rgb2snes(0x0b, 0x00, 0x00),
                rgb2snes(0x14, 0x00, 0x00),
                rgb2snes(0x1e, 0x00, 0x00),
            ];
            for (let palAddr of newPalAddrs) {
                let start: number = conv(0xc, palAddr);
                for (let i: number = 0; i < 0x20; i += 2) {
                    let snesCol: number = readWord(rom, start + i);
                    let [h, s, l]: [number, number, number] = rgb2hsl(...snes2rgb(snesCol));
                    let greenCol: number = Math.floor(l / 0.25);
                    writeWord(rom, start + i, reds[Math.min(greenCol, 3)]);
                }
            }
            break;

        case 'gb_grey':
            let greys: number[] = [
                rgb2snes(0x00, 0x00, 0x00),
                rgb2snes(0x0a, 0x0a, 0x0a),
                rgb2snes(0x14, 0x14, 0x14),
                rgb2snes(0x1e, 0x1e, 0x1e),
            ];
            for (let palAddr of newPalAddrs) {
                let start: number = conv(0xc, palAddr);
                for (let i: number = 0; i < 0x20; i += 2) {
                    let snesCol: number = readWord(rom, start + i);
                    let [h, s, l]: [number, number, number] = rgb2hsl(...snes2rgb(snesCol));
                    let greenCol: number = Math.floor(l / 0.25);
                    writeWord(rom, start + i, greys[Math.min(greenCol, 3)]);
                }
            }
            break;

        case 'greyscale':
            for (let palAddr of newPalAddrs) {
                let start: number = conv(0xc, palAddr);
                for (let i: number = 0; i < 0x20; i += 2) {
                    let snesCol: number = readWord(rom, start + i);
                    let [h, s, l]: [number, number, number] = rgb2hsl(...snes2rgb(snesCol));
                    s = 0;
                    let newSnesCol: number = rgb2snes(...hsl2rgb(h, s, l));
                    writeWord(rom, start + i, newSnesCol);
                }
            }
            break;
    }
}