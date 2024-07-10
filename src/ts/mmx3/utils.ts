
/**
 * Returns the full address given a bank and an offset (?)
*/
export const conv = function (bank: number, addr: number): number {
    return bank * 0x8000 + (addr % 0x8000);
}

/**
 * Returns the 16-bit word at the address of the given rom
 * @description necessary extra conversion is done here to 
 *   account for the endianness of the 65c816 microprocesor. 
 */
export const readWord = function (rom: number[], addr: number): number {
    return (rom[addr + 1] << 8) | rom[addr];
}

/**
 * Writes the given 16-bit word at the address of the given rom
 * @param {number[]} rom - the ROM data to modify
 * @param {number} addr - the address at which to modify the ROM
 * @param {number} val - the new value to set at the ROM's address
 * @description necessary extra conversion is done here to 
 *   account for the endianness of the 65c816 microprocesor. 
 */
export const writeWord = function (rom: number[], addr: number, val: number) {
    rom[addr] = val & 0xff;
    rom[addr + 1] = val >> 8;
}

/**
 * Returns the sum of all data values in the supplied byte-array
 * @description handy for calculating checksums
 */
export const sum = function (arr: number[]): number {
    return arr.reduce((sum, entry) => sum + entry);
}

/**
 * Returns a hexidecimal string from a given number
 */
export const hexc = function (num: number): string { return num.toString(16) }

// MMX3

export const findStageEntityData = function (rom: number[], stageIdx: number, majorType: number, type: number): number {
    // +0 main type
    // +1/2 Y coord
    // +3 entity ID
    // +4 sub ID
    // +5/6 X coord

    const table: number = conv(0x3c, 0xce4b);
    let start: number = conv(0x3c, readWord(rom, table + stageIdx * 2));
    let lastCol: number | null = null;
    let maxLoops: number = 1000;
    while (maxLoops-- !== 0) {
        let col: number = rom[start++];
        if (col === lastCol) break;
        lastCol = col;

        let maxInnerLoops: number = 1000;
        while (maxInnerLoops-- !== 0) {
            if ((rom[start] !== majorType) || (rom[start + 3] !== type)) {
                start += 7;
            } else {
                return start;
            }
            if ((rom[start - 1] & 0x80) !== 0) break;
        }
    }
    throw new Error(`Could not find stage entity data ${stageIdx}, ${majorType}, ${hexc(type)}`);
}

export const getDynamicSpriteData = function (rom: number[], stageIdx: number, dynIdx: number, entryIdx: number): number {
    // +0 decomp id
    // +1/2 vram dest
    // +3/4 palette id
    // +5 palette slot
    const table: number = conv(8, 0x8623);
    const stageOffs: number = readWord(rom, table + stageIdx * 2);
    const dynOffs: number = readWord(rom, table + stageOffs + dynIdx * 2);
    return table + dynOffs + entryIdx * 6;
}

export const getEnemyBaseData = function (enemy_idx: number): number {
    return conv(6, 0xe28e + 5 * (enemy_idx - 1));
}

export const getWeaknessTables = function (rom: number[], weaknessIdx: number, isNormal: boolean): number[] {
    let baseTables: number[] = isNormal
        ? [conv(6, 0xe4a5)]
        : [conv(0x4b, 0x8000), conv(0x4b, 0x8080), conv(0x4b, 0x8100)]

    let entries: number[] = [];
    for (let tableAddr of baseTables) {
        let offsOrAddr: number = readWord(rom, tableAddr + weaknessIdx * 2);
        entries.push(isNormal
            ? tableAddr + offsOrAddr
            : conv(0x4b, offsOrAddr)
        );
    }
    return entries;
}

export const getTextAddrs = function (rom: number[], textIdx: number, isNormal: boolean): number[] {
    let addrs: number[] = [];
    if (isNormal) {
        let entry = conv(0x39, 0xc1bc + textIdx * 2);
        addrs.push(conv(0x39, readWord(rom, entry)));
    } else {
        for (let bank: number = 0x40; bank < 0x48; bank += 2) {
            let entry: number = conv(bank, 0x8000 + textIdx * 2);
            addrs.push(conv(bank, readWord(rom, entry)));
        }
    }
    return addrs;
}

export const replaceText = function (rom: number[], textIdx: number, isNormal: boolean, text: [string, string]) {
    // skip 7 bytes
    let addrs: number[] = getTextAddrs(rom, textIdx, isNormal);

    for (let _start of addrs) {
        let start: number = _start + 7;
        for (let line of text) {
            for (let ch of line) {
                rom[start++] = ch.charCodeAt(0);
            }
            rom[start++] = 0x80;
            rom[start++] = 0x80;
        }
        for (let b of [0x81, 0x80, 0x86, 0x0b, 0x87, 0x1e, 0x82]) {
            rom[start++] = b;
        }
    }
}

export const setPaletteAddr = function (rom: number[], stage: number, dynIdx: number, entryIdx: number, newVal: number): void {
    let start: number = getDynamicSpriteData(rom, stage, dynIdx, entryIdx);
    writeWord(rom, start + 1, newVal);
}
export const setPaletteSlot = function (rom: number[], stage: number, dynIdx: number, entryIdx: number, newVal: number): void {
    let start: number = getDynamicSpriteData(rom, stage, dynIdx, entryIdx);
    rom[start + 5] = newVal;
}