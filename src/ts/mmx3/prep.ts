import { STAGES } from "./constants.js"
import { setPaletteAddr, setPaletteSlot } from "./utils.js";

export function prep(rom: number[]) {
    // Make the entry for Crush Crawfish take on its own palette slot, and tile data slot
    setPaletteAddr(rom, STAGES.CRUSH_CRAWFISH, 0, 3, 0x1400);
    setPaletteSlot(rom, STAGES.CRUSH_CRAWFISH, 0, 3, 0x40);

    // Give swappable rider armour items a slot that doesn't conflict with eg health bar
    setPaletteSlot(rom, STAGES.GRAVITY_BEETLE, 5, 3, 0x30);
    setPaletteSlot(rom, STAGES.TOXIC_SEAHORSE, 4, 2, 0x30);
    setPaletteSlot(rom, STAGES.CRUSH_CRAWFISH, 0, 3, 0x30);

    // Separate capsules palette slots from Dr. Light
    for (let [stage, regionIdx, capsuleSpecOffs] of [
        [STAGES.BLAST_HORNET, 3, 0],
        [STAGES.BLIZZARD_BUFFALO, 6, 0],
        [STAGES.CRUSH_CRAWFISH, 3, 0],
        [STAGES.GRAVITY_BEETLE, 10, 0],
        [STAGES.NEON_TIGER, 2, 0],
        [STAGES.TOXIC_SEAHORSE, 7, 0],
        [STAGES.TUNNEL_RHINO, 7, 1],
        [STAGES.VOLT_CATFISH, 4, 1],
    ]) {
        setPaletteSlot(rom, stage, regionIdx, capsuleSpecOffs, 0x60);
    }

    // Shift heart tank graphics up for Crush Crawfish bit where a
    // bridge is crashed, as items/capsules needs 2 rows of tile data
    setPaletteAddr(rom, STAGES.CRUSH_CRAWFISH, 2, 2, 0x1600);
}