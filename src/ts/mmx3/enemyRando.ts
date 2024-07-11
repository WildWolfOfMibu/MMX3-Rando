import { M65816 } from '../asm65816.js';
import { RandoOptions } from '../mmx3.js';
import { ENEMIES, EnemyData } from './constants.js'
import { conv, hexc, readWord, writeWord } from './utils.js';

const getDynDecompIdxAddrs = function (rom: number[], decomp_idx: number): number[] {
    let table = conv(8, 0x8623);

    let dataPtrs: number[] = []
    for (let i = conv(8, 0x8647); i < conv(8, 0x8647); i += 2)
        dataPtrs.push(readWord(rom, i) + table);

    let retAddrs: number[] = [];
    for (let dataPtr of dataPtrs) {
        for (let readDecompIdx = rom[dataPtr]; readDecompIdx !== 0xff; dataPtr += 6) {
            if (readDecompIdx === decomp_idx)
                retAddrs.push(dataPtr)
        }
    }
    return retAddrs;
}

const getStageEntityDecompIdxAddrs = function (rom: number[], entity_id: number): number[] {
    let table = conv(0x3c, 0xce4b);
    let retAddrs: number[] = [];
    for (let stage = 0; stage < 0xf; stage++) {
        let start = conv(0x3c, readWord(rom, table + stage * 2));

        let lastCol: number | null = null;
        let column = rom[start++];
        while (column !== lastCol) {
            lastCol = column;
            while (1) {
                if (rom[start + 3] === entity_id && rom[start] == 3)
                    retAddrs.push(start);
                if (rom[start + 6] & 0x80)
                    break;
                start += 7;
            }
            start += 7;
            column = rom[start++];
        }
    }
    return retAddrs;
}

export function enemyRandomize(rom: number[], rng: () => number, opts: RandoOptions, _: M65816) {
    if (!opts.random_enemies) return;

    // Get missing details
    type FullEnemyDatum = EnemyData & {
        dynAddrs: number[]
        entAddrs: number[]
        newEnemyName?: string
    }
    let fullEnemyDeets: { [name: string]: FullEnemyDatum } = {};

    let enemyNames: string[] = [];
    for (let name in ENEMIES) {
        enemyNames.push(name);
        let deets = ENEMIES[name]

        let decomp_idx = deets.decomp_idx;
        let entity_id = deets.id;
        let dynAddrs = getDynDecompIdxAddrs(rom, decomp_idx);
        let entAddrs = getStageEntityDecompIdxAddrs(rom, entity_id);

        let pal_idx = deets.pal_idx;
        if (pal_idx === undefined) {

            let pal_idxes = new Set<number>();
            for (let addr of dynAddrs) {
                pal_idxes.add(readWord(rom, addr + 3));
            }
            if (pal_idxes.size > 1) {
                console.log('Name:', name);
                console.log('pal_idxes', [...pal_idxes].map(hexc));
                for (let addr of dynAddrs) {
                    console.log(hexc(addr), rom[addr + 4]);
                }
            } else {
                pal_idx = [...pal_idxes][0];
            }
        }

        let sub_idx = deets.sub_idx;
        if (sub_idx === undefined) {

            let sub_idxes = new Set<number>();
            for (let addr of entAddrs) {
                sub_idxes.add(rom[addr + 4]);
            }
            if (sub_idxes.size > 1) {
                console.log('Name:', name);
                console.log('sub_idxes', [...sub_idxes].map(hexc));
                for (let addr of entAddrs) {
                    console.log(hexc(addr), rom[addr + 4]);
                }
            } else {
                sub_idx = [...sub_idxes][0];
            }
        }
        if (name === 'Hamma Hamma') {
            // 2 story-related hammas + 1 that shares the same dynamic spec
            dynAddrs.splice(dynAddrs.indexOf(conv(8, 0x8c8f)), 1);
            dynAddrs.splice(dynAddrs.indexOf(conv(8, 0x8cca)), 1);
            entAddrs.splice(entAddrs.indexOf(conv(0x3c, 0xe594)), 1);
            entAddrs.splice(entAddrs.indexOf(conv(0x3c, 0xe6e6)), 1);
            entAddrs.splice(entAddrs.indexOf(conv(0x3c, 0xe71a)), 1);
        }
        fullEnemyDeets.name = {
            ...deets,
            pal_idx: pal_idx,
            sub_idx: sub_idx,
            dynAddrs: dynAddrs,
            entAddrs: entAddrs,
        }
    }

    // Randomly associate
    for (let name in fullEnemyDeets) {
        while (1) {
            let newEnemyIdx = Math.floor(rng() * enemyNames.length)
            let newEnemyName = enemyNames[newEnemyIdx]
            if (fullEnemyDeets[newEnemyName].decomp_size <= fullEnemyDeets[name].decomp_size) {
                fullEnemyDeets[name].newEnemyName = newEnemyName
                break;
            }
        }
    }

    // Mutate
    for (let name in fullEnemyDeets) {
        let deets = fullEnemyDeets[name]
        if (typeof deets.newEnemyName == 'undefined') { return }
        let newEnemy = fullEnemyDeets[deets.newEnemyName]

        for (let addr of deets.dynAddrs) {
            rom[addr] = newEnemy.decomp_idx
            writeWord(rom, addr + 3, newEnemy.pal_idx!);
        }
        for (let addr of deets.entAddrs) {
            rom[addr + 3] = newEnemy.id
            rom[addr + 4] = newEnemy.sub_idx!
        }
    }
}