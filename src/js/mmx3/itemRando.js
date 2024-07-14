import { STAGES, ENTITY_DATA, MT_ITEM, ITEMID, DECOMP_DATA_IDX_RIDE_ARMOUR_ITEM, } from './constants.js';
import { findStageEntityData, writeWord, getDynamicSpriteData, readWord, replaceText, conv, getTextAddrs, hexc, } from './utils.js';
var Upgrade;
(function (Upgrade) {
    Upgrade[Upgrade["HeadChip"] = 0] = "HeadChip";
    Upgrade[Upgrade["LegChip"] = 1] = "LegChip";
    Upgrade[Upgrade["KangarooArmor"] = 2] = "KangarooArmor";
    Upgrade[Upgrade["HornetHeart"] = 3] = "HornetHeart";
    Upgrade[Upgrade["BuffaloHeart"] = 4] = "BuffaloHeart";
    Upgrade[Upgrade["BuffaloSubtank"] = 5] = "BuffaloSubtank";
    Upgrade[Upgrade["BodyChip"] = 6] = "BodyChip";
    Upgrade[Upgrade["HawkArmor"] = 7] = "HawkArmor";
    Upgrade[Upgrade["ArmChip"] = 8] = "ArmChip";
    Upgrade[Upgrade["FrogArmor"] = 9] = "FrogArmor";
    Upgrade[Upgrade["ArmUpgrade"] = 10] = "ArmUpgrade";
    Upgrade[Upgrade["HelmetUpgrade"] = 11] = "HelmetUpgrade";
    Upgrade[Upgrade["RhinoHeart"] = 12] = "RhinoHeart";
    Upgrade[Upgrade["BodyUpgrade"] = 13] = "BodyUpgrade";
    Upgrade[Upgrade["CatfishSubtank"] = 14] = "CatfishSubtank";
    Upgrade[Upgrade["CrawfishHeart"] = 15] = "CrawfishHeart";
    Upgrade[Upgrade["CatfishHeart"] = 16] = "CatfishHeart";
    Upgrade[Upgrade["BeetleHeart"] = 17] = "BeetleHeart";
    Upgrade[Upgrade["RhinoSubtank"] = 18] = "RhinoSubtank";
    Upgrade[Upgrade["TigerHeart"] = 19] = "TigerHeart";
    Upgrade[Upgrade["TigerSubtank"] = 20] = "TigerSubtank";
    Upgrade[Upgrade["SeahorseHeart"] = 21] = "SeahorseHeart";
    Upgrade[Upgrade["ChimeraArmor"] = 22] = "ChimeraArmor";
    Upgrade[Upgrade["LegUpgrade"] = 23] = "LegUpgrade";
})(Upgrade || (Upgrade = {}));
export function itemRandomize(rom, rng, opts, m) {
    const isNormal = opts.romType === 'normal';
    // Replace the rider armour holder enemy dynamic sprites with the chimera rider armour item
    let start = findStageEntityData(rom, STAGES.BLAST_HORNET, ...ENTITY_DATA.RIDE_ARMOUR_HOLDER);
    rom[start + 0] = MT_ITEM;
    writeWord(rom, start + 1, 0x790);
    rom[start + 3] = ITEMID.RIDE_ARMOUR_ITEM;
    rom[start + 4] = 0x01;
    start = getDynamicSpriteData(rom, STAGES.BLAST_HORNET, 6, 3);
    rom[start] = DECOMP_DATA_IDX_RIDE_ARMOUR_ITEM;
    writeWord(rom, start + 3, 0x1c);
    // Move capsule locations down to the ground
    // (6:ccbe - 3c:xxxx data)
    for (const [stage, offset] of [
        [STAGES.BLAST_HORNET, 0x272 - 0x260],
        [STAGES.BLIZZARD_BUFFALO, 0x282 - 0x280],
        [STAGES.GRAVITY_BEETLE, 0x482 - 0x490],
        [STAGES.TOXIC_SEAHORSE, 0x262 - 0x262],
        [STAGES.VOLT_CATFISH, 0x282 - 0x290],
        [STAGES.CRUSH_CRAWFISH, 0x782 - 0x790],
        [STAGES.TUNNEL_RHINO, 0x282 - 0x2a0],
        [STAGES.NEON_TIGER, 0x182 - 0x1c0],
    ]) {
        start = findStageEntityData(rom, stage, ...ENTITY_DATA.CAPSULE);
        let y = readWord(rom, start + 1);
        writeWord(rom, start + 1, y + offset + 0x20);
    }
    // Give the capsules their new subtypes
    for (const [stage, newSubType] of [
        [STAGES.TUNNEL_RHINO, 0x01],
        [STAGES.NEON_TIGER, 0x02],
        [STAGES.VOLT_CATFISH, 0x04],
        [STAGES.BLIZZARD_BUFFALO, 0x08],
    ]) {
        start = findStageEntityData(rom, stage, ...ENTITY_DATA.CAPSULE);
        rom[start + 4] = newSubType;
    }
    // Make capsule text shorter
    for (const [textIdx, text] of [
        [0x40, "Head chip"],
        [0x41, "Body chip"],
        [0x42, "Arm chip"],
        [0x43, "Leg chip"],
        [0x46, "Hyper chip"],
        [0x0b, "Leg upgrade"],
        [0x0c, "Helmet upgrade"],
        [0x0d, "Body upgrade"],
        [0x0e, "Arm upgrade"],
    ]) {
        replaceText(rom, textIdx, isNormal, ["You got the", text]);
    }
    /*
    Build slots and randomize
    */
    // This is done here for the 'find'-type functions
    // This is not in `constants.js` as `prep.js` needs to modify the base rom 1st
    // added index list for slots/items for easier randomization.
    let slots = [{
            // Blast hornet has 2 requirements, so it needs processed first after doppler's potential 4 reqs
            slotindex: Upgrade.HeadChip,
            name: "Blast Hornet Capsule",
            stageIdx: STAGES.BLAST_HORNET,
            itemName: "Head Chip",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.BLAST_HORNET, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.BLAST_HORNET, 3, 0),
            minimapMarkerEntry: 0,
            textIdx: 0x5d,
        }, {
            //forcing frog armour checks for next two checks
            slotindex: Upgrade.LegChip,
            name: "Toxic Seahorse Capsule",
            stageIdx: STAGES.TOXIC_SEAHORSE,
            itemName: "Leg Chip",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.TOXIC_SEAHORSE, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.TOXIC_SEAHORSE, 7, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x5d,
        }, {
            slotindex: Upgrade.KangarooArmor,
            name: "Toxic Seahorse Kangaroo Ride Armour",
            stageIdx: STAGES.TOXIC_SEAHORSE,
            itemName: "Kangaroo Armour",
            itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGES.TOXIC_SEAHORSE, ...ENTITY_DATA.RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.TOXIC_SEAHORSE, 4, 2),
            minimapMarkerEntry: 1,
            textIdx: 0x59,
        }, {
            // 1 req checks
            slotindex: Upgrade.HornetHeart,
            name: "Blast Hornet Heart Tank",
            stageIdx: STAGES.BLAST_HORNET,
            itemName: "Hornet Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.BLAST_HORNET, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.BLAST_HORNET, 9, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x24,
        }, {
            slotindex: Upgrade.BuffaloHeart,
            name: "Blizzard Buffalo Heart Tank",
            stageIdx: STAGES.BLIZZARD_BUFFALO,
            itemName: "Buffalo Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.BLIZZARD_BUFFALO, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.BLIZZARD_BUFFALO, 1, 0),
            tileDataOffset: 0x1e00,
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        }, {
            slotindex: Upgrade.BuffaloSubtank,
            name: "Blizzard Buffalo Subtank",
            stageIdx: STAGES.BLIZZARD_BUFFALO,
            itemName: "Buffalo Subtank",
            itemType: "Tank",
            entityEntry: findStageEntityData(rom, STAGES.BLIZZARD_BUFFALO, ...ENTITY_DATA.SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.BLIZZARD_BUFFALO, 5, 3),
            minimapMarkerEntry: 1,
            textIdx: 0x55,
        }, {
            slotindex: Upgrade.BodyChip,
            name: "Crush Crawfish Capsule",
            stageIdx: STAGES.CRUSH_CRAWFISH,
            itemName: "Body Chip",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.CRUSH_CRAWFISH, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.CRUSH_CRAWFISH, 3, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x5d,
        }, {
            slotindex: Upgrade.HawkArmor,
            name: "Crush Crawfish Hawk Ride Armour",
            stageIdx: STAGES.CRUSH_CRAWFISH,
            itemName: "Hawk Armour",
            itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGES.CRUSH_CRAWFISH, ...ENTITY_DATA.RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.CRUSH_CRAWFISH, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x5b,
        }, {
            slotindex: Upgrade.ArmChip,
            name: "Gravity Beetle Capsule",
            stageIdx: STAGES.GRAVITY_BEETLE,
            itemName: "Arm Chip",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.GRAVITY_BEETLE, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.GRAVITY_BEETLE, 10, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x5d,
        }, {
            slotindex: Upgrade.FrogArmor,
            name: "Gravity Beetle Frog Ride Armour",
            stageIdx: STAGES.GRAVITY_BEETLE,
            itemName: "Frog Armour",
            itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGES.GRAVITY_BEETLE, ...ENTITY_DATA.RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.GRAVITY_BEETLE, 5, 3),
            minimapMarkerEntry: 1,
            textIdx: 0x57,
        }, {
            slotindex: Upgrade.ArmUpgrade,
            name: "Neon Tiger Capsule",
            stageIdx: STAGES.NEON_TIGER,
            itemName: "Arm Upgrade",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.NEON_TIGER, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.NEON_TIGER, 2, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x67,
        }, {
            slotindex: Upgrade.HelmetUpgrade,
            name: "Tunnel Rhino Capsule",
            stageIdx: STAGES.TUNNEL_RHINO,
            itemName: "Helmet Upgrade",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.TUNNEL_RHINO, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.TUNNEL_RHINO, 7, 1),
            minimapMarkerEntry: 2,
            textIdx: 0x65,
        }, {
            slotindex: Upgrade.RhinoHeart,
            name: "Tunnel Rhino Heart Tank",
            stageIdx: STAGES.TUNNEL_RHINO,
            itemName: "Rhino Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.TUNNEL_RHINO, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.TUNNEL_RHINO, 2, 0),
            tileDataOffset: 0x1600,
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        }, {
            slotindex: Upgrade.BodyUpgrade,
            name: "Volt Catfish Capsule",
            stageIdx: STAGES.VOLT_CATFISH,
            itemName: "Body Upgrade",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.VOLT_CATFISH, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.VOLT_CATFISH, 4, 1),
            minimapMarkerEntry: 0,
            textIdx: 0x63,
        }, {
            slotindex: Upgrade.CatfishSubtank,
            name: "Volt Catfish Subtank",
            stageIdx: STAGES.VOLT_CATFISH,
            itemName: "Catfish Subtank",
            itemType: "Tank",
            entityEntry: findStageEntityData(rom, STAGES.VOLT_CATFISH, ...ENTITY_DATA.SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.VOLT_CATFISH, 8, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x55,
        }, {
            slotindex: Upgrade.CrawfishHeart,
            name: "Crush Crawfish Heart Tank",
            stageIdx: STAGES.CRUSH_CRAWFISH,
            itemName: "Crawfish Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.CRUSH_CRAWFISH, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.CRUSH_CRAWFISH, 2, 2),
            minimapMarkerEntry: 2,
            textIdx: 0x24,
        }, {
            slotindex: Upgrade.CatfishSubtank,
            name: "Volt Catfish Heart Tank",
            stageIdx: STAGES.VOLT_CATFISH,
            itemName: "Catfish Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.VOLT_CATFISH, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.VOLT_CATFISH, 3, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x24,
        }, {
            // rearranged slots so that 0 req checks are processed last.
            slotindex: Upgrade.BeetleHeart,
            name: "Gravity Beetle Heart Tank",
            stageIdx: STAGES.GRAVITY_BEETLE,
            itemName: "Beetle Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.GRAVITY_BEETLE, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.GRAVITY_BEETLE, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        }, {
            // swapped CCHT as it does req a non frog armor
            slotindex: Upgrade.RhinoSubtank,
            name: "Tunnel Rhino Subtank",
            stageIdx: STAGES.TUNNEL_RHINO,
            itemName: "Rhino Subtank",
            itemType: "Tank",
            entityEntry: findStageEntityData(rom, STAGES.TUNNEL_RHINO, ...ENTITY_DATA.SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.TUNNEL_RHINO, 4, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x55,
        }, {
            slotindex: Upgrade.TigerHeart,
            name: "Neon Tiger Heart Tank",
            stageIdx: STAGES.NEON_TIGER,
            itemName: "Tiger Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.NEON_TIGER, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.NEON_TIGER, 8, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x24,
        }, {
            slotindex: Upgrade.TigerSubtank,
            name: "Neon Tiger Subtank",
            stageIdx: STAGES.NEON_TIGER,
            itemName: "Tiger Subtank",
            itemType: "Tank",
            entityEntry: findStageEntityData(rom, STAGES.NEON_TIGER, ...ENTITY_DATA.SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.NEON_TIGER, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x55,
        }, {
            slotindex: Upgrade.SeahorseHeart,
            name: "Toxic Seahorse Heart Tank",
            stageIdx: STAGES.TOXIC_SEAHORSE,
            itemName: "Seahorse Heart",
            itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGES.TOXIC_SEAHORSE, ...ENTITY_DATA.HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.TOXIC_SEAHORSE, 1, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        }, {
            slotindex: Upgrade.ChimeraArmor,
            name: "Blast Hornet Chimera Ride Armour",
            stageIdx: STAGES.BLAST_HORNET,
            itemName: "Chimera Armour",
            itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGES.BLAST_HORNET, ...ENTITY_DATA.RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.BLAST_HORNET, 6, 3),
            minimapMarkerEntry: 2,
            textIdx: 0x28,
        }, {
            slotindex: Upgrade.LegUpgrade,
            name: "Blizzard Buffalo Capsule",
            stageIdx: STAGES.BLIZZARD_BUFFALO,
            itemName: "Leg Upgrade",
            itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGES.BLIZZARD_BUFFALO, ...ENTITY_DATA.CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGES.BLIZZARD_BUFFALO, 6, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x61,
        },
    ];
    // points to stage1 of this table, $13 bytes per stage, 6 bytes per entry
    const minimapMarkerTable = conv(6, 0xb01c);
    const bytesPerStage = 0x13;
    const bytesPerEntry = 6;
    let items = [];
    for (let slot of slots) {
        let ramByteLowToCheck;
        let ramBitToCheck;
        if (slot.minimapMarkerEntry !== undefined) {
            let minimapMarkerEntry = minimapMarkerTable
                + bytesPerStage * (slot.stageIdx - 1)
                + bytesPerEntry * slot.minimapMarkerEntry;
            ramByteLowToCheck = rom[minimapMarkerEntry + 3];
            ramBitToCheck = rom[minimapMarkerEntry + 5];
        }
        else {
            // Doppler 1
            ramByteLowToCheck = 0xd7;
            ramBitToCheck = 0xf0;
        }
        items.push({
            itemindex: slot.slotindex,
            name: slot.name,
            // split name into name and itemName
            itemName: slot.itemName,
            //added itemType for check clarity
            itemType: slot.itemType,
            majorType: rom[slot.entityEntry + 0],
            type: rom[slot.entityEntry + 3],
            subType: rom[slot.entityEntry + 4],
            decompIdx: rom[slot.dynamicSpriteEntry + 0],
            paletteId: readWord(rom, slot.dynamicSpriteEntry + 3),
            ramByteLowToCheck: ramByteLowToCheck,
            ramBitToCheck: ramBitToCheck,
            textIdx: slot.textIdx,
        });
    }
    let newSlots = [];
    // randomly fill slots with items
    let available_items = [...items];
    let available_slots = [...slots];
    let s = 0;
    for (let i = 0; i < slots.length; i += 1) {
        let chosen_slot = 0;
        let chosen_item = Math.floor(rng() * available_items.length);
        //find index number of item and slot for logic checks to reduce resources used on continually pulling names and locations.
        let itemcheck = available_items[chosen_item].itemindex;
        let slotcheck = available_slots[s].slotindex;
        //insert itemcheck number vs chosen slot number for logic checks, increment item number slot if incorrect, checking for clear check. while statement to make sure it clears all checks.
        const Chips = [
            Upgrade.HeadChip,
            Upgrade.LegChip,
            Upgrade.BodyChip,
            Upgrade.ArmChip,
        ];
        const Parts = [
            Upgrade.ArmUpgrade,
            Upgrade.HelmetUpgrade,
            Upgrade.BodyUpgrade,
            Upgrade.LegUpgrade,
        ];
        const Capsules = [...Chips, ...Parts];
        let LogicBlacklist = {
            [Upgrade.HeadChip]: [Upgrade.HawkArmor, Upgrade.ArmUpgrade, Upgrade.LegUpgrade],
            [Upgrade.LegChip]: [Upgrade.FrogArmor],
            [Upgrade.KangarooArmor]: [Upgrade.FrogArmor, ...Capsules],
            [Upgrade.HornetHeart]: [Upgrade.LegUpgrade],
            // Buffalo Heart Tank (4) cannot be either kangaroo armour (2) or chimera armour (22) if the other is already placed.
            //   all multi armour checks have Chimera Armor (23) in them, so I will exclude chimera armor from all these locations, 
            //   thus keeping a circular lock from happening at all locations. 
            [Upgrade.BuffaloHeart]: [Upgrade.ChimeraArmor, ...Capsules],
            [Upgrade.BuffaloSubtank]: [],
            [Upgrade.BodyChip]: [Upgrade.LegUpgrade, ...Capsules],
            /**
             * Crawfish Capsule (6) cannot be Kangaroo Armour (2), Hawk Armour (7) or Chimera Armour (22) if the other two are placed.
             * Excluding Chimera (22) as per previous multiarmour check above (4).
             */
            [Upgrade.HawkArmor]: [Upgrade.ArmUpgrade],
            [Upgrade.ArmChip]: [Upgrade.KangarooArmor],
            [Upgrade.FrogArmor]: [Upgrade.LegUpgrade],
            [Upgrade.ArmUpgrade]: [Upgrade.LegUpgrade],
            [Upgrade.HelmetUpgrade]: [Upgrade.ArmUpgrade],
            [Upgrade.RhinoHeart]: [Upgrade.ArmUpgrade],
            [Upgrade.BodyUpgrade]: [Upgrade.ArmUpgrade],
            /**
             * Catfish SubTank (14) requires one armour (2,7,9,22), removing Chimera Armour (22) as per in check above (4)
             */
            [Upgrade.CatfishSubtank]: [Upgrade.ChimeraArmor],
            /**
             * Crawfish Heart Tank (15) cannot be Kangaroo Armour (2), Hawk Armour (7), or Chimera
             * Armour (22) if the other two are placed. Excluding Chimera (22) as per previous
             * multiarmour check above (4). (also adding checks for all capsules. 0,1,6,8,10,11,13,23)
             */
            [Upgrade.CrawfishHeart]: [Upgrade.KangarooArmor, Upgrade.HawkArmor, Upgrade.ChimeraArmor, ...Capsules],
            [Upgrade.CatfishHeart]: [...Capsules],
            [Upgrade.BeetleHeart]: [],
            [Upgrade.RhinoSubtank]: [],
            [Upgrade.TigerHeart]: [],
            [Upgrade.TigerSubtank]: [],
            [Upgrade.SeahorseHeart]: [],
            [Upgrade.ChimeraArmor]: [],
            [Upgrade.LegUpgrade]: []
        };
        let bl = LogicBlacklist[slotcheck];
        if (bl !== undefined && bl.includes(itemcheck)) {
            slotcheck = available_slots[s].slotindex;
            s = (s + 1) % available_slots.length;
        }
        //prelim (while loop, if incorrect, increment check available slots length, if < max, increment s by one and pull new slotindex, if = to max, reset s to 0 and pull index for check)
        //lock slot AFTER checks
        chosen_slot = 0;
        for (let z = 0; z < available_slots.length;) {
            if (available_slots[z].slotindex = slotcheck) {
                chosen_slot = z;
            }
            z++;
        }
        // pushes the item and slot to locked array for building
        newSlots.push({
            item: available_items[chosen_item],
            slot: available_slots[chosen_slot],
        });
        // removes the item from both arrays.
        available_items.splice(chosen_item, 1);
        available_slots.splice(chosen_slot, 1);
        //reset s for next loop
        s = 0;
    }
    /*
    Mutate
    */
    // 4 bytes: flag, ram addr, text idx
    // per 3 texts per 8 stages
    let stageSelItemFlagAddrText = new Array(3 * 4 * 8);
    // mutate slots
    for (let FinalSlot of newSlots) {
        let slot = FinalSlot.slot;
        let item = FinalSlot.item;
        rom[slot.entityEntry + 0] = item.majorType;
        rom[slot.entityEntry + 3] = item.type;
        rom[slot.entityEntry + 4] = item.subType;
        rom[slot.dynamicSpriteEntry + 0] = item.decompIdx;
        if (slot.tileDataOffset !== undefined) {
            writeWord(rom, slot.dynamicSpriteEntry + 1, slot.tileDataOffset);
        }
        writeWord(rom, slot.dynamicSpriteEntry + 3, item.paletteId);
        // Change minimap marker entry details
        let minimapMarkerEntry = minimapMarkerTable +
            0x13 * (slot.stageIdx - 1) + 6 * slot.minimapMarkerEntry;
        rom[minimapMarkerEntry + 3] = item.ramByteLowToCheck;
        rom[minimapMarkerEntry + 5] = item.ramBitToCheck;
        if (slot.minimapMarkerEntry !== undefined) {
            let base = (slot.stageIdx - 1) * 4 * 3 + slot.minimapMarkerEntry * 4;
            stageSelItemFlagAddrText[base] = item.ramBitToCheck;
            stageSelItemFlagAddrText[base + 1] = item.ramByteLowToCheck;
            stageSelItemFlagAddrText[base + 2] = 0x1f;
            stageSelItemFlagAddrText[base + 3] = item.textIdx;
        }
    }
    m.addAsm(null, null, `
    StageSelItemFlagAddrText:
    `);
    let chosenBank = m.getLabelBank('StageSelItemFlagAddrText');
    m.addBytes(chosenBank, stageSelItemFlagAddrText, rom);
    // qol - stage select shows correct items
    for (let _textIdx of [
        0x24, 0x28, 0x55, 0x57, 0x59, 0x5b,
        0x5d, 0x61, 0x63, 0x65, 0x67
    ]) {
        for (let textIdx of [_textIdx, _textIdx + 1]) {
            let textAddrs = getTextAddrs(rom, textIdx, isNormal);
            for (let textAddr of textAddrs) {
                if (rom[textAddr] != 0x89)
                    throw new Error(`Stage select text byte 0 not $89: ${hexc(textIdx)}`);
                let palByte = rom[textAddr + 3];
                if ((palByte & 0xf0) !== 0xc0)
                    throw new Error(`Stage select text 4th byte not a palette: ${hexc(textIdx)}`);
                rom[textAddr] = palByte;
                rom[textAddr + 1] = palByte;
                rom[textAddr + 2] = palByte;
            }
        }
    }
    if (isNormal) {
        m.addAsm(3, 0x8583, `
            jsr AddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(3, 0x859a, `
            jsr AddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(3, 0x85ae, `
            jsr AddTextThreadForStageSelect.l
            nop
            nop
        `);
    }
    else {
        m.addAsm(3, 0x8583, `
            jsr ZeroModAddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(3, 0x859a, `
            jsr ZeroModAddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(3, 0x85ae, `
            jsr ZeroModAddTextThreadForStageSelect.l
            nop
            nop
        `);
        m.addAsm(null, null, `
        ; A - text line
        ; A8 I8
        ZeroModAddTextThreadForStageSelect:
            pha

            lda wSubTanksAndUpgradesGottenBitfield.w
            sta $0014.w
            lda wHealthTanksGottenBitfield.w
            sta $0016.w
            jsr $caaa51.l
            bvs _allHealthTanksGot
        
            bra _setHealthTanksForStageSelItems
        
        _allHealthTanksGot:
            lda #$ff.b
        
        _setHealthTanksForStageSelItems:
            sta wHealthTanksGottenBitfield.w
            lda $7ef418.l
            sta wSubTanksAndUpgradesGottenBitfield.w
            jsr $caaa62.l
            ora wSubTanksAndUpgradesGottenBitfield.w
            sta wSubTanksAndUpgradesGottenBitfield.w

            pla
            jsr AddTextThreadForStageSelect.l
            pha

            lda $0014.w
            sta wSubTanksAndUpgradesGottenBitfield.w
            lda $0016.w
            sta wHealthTanksGottenBitfield.w

            pla
            rtl
        `);
    }
    m.addAsm(null, null, `
    ; A - text line
    ; A8 I8
    AddTextThreadForStageSelect:
        pha

    ; $9c0c = StageSelectLocationsData.w+8 - valid stage idx selected
        ldx $36.b
        lda $9c0c.w, X
        rep #$10.b
        ldy #$0942.w
        cmp #$01.b
        beq _setStageSelText

        cmp #$03.b
        beq _setStageSelText

        cmp #$05.b
        beq _setStageSelText

        cmp #$07.b
        beq _setStageSelText

        ldy #$0956.w

    _setStageSelText:
        sty wTextRowVramAddr.w

    ; Y = stage idx selected, X = text line
        tay
        lda #$00.b
        xba
        pla
        inc a
        tax

    ; Re-use some dp vars
        lda $37.b
        pha
        lda $38.b
        pha
        lda $39.b
        pha

    ; Stage * 12
        dey
        tya
        asl a
        asl a
        sta $37.b
        asl a
        clc
        adc $37.b

        rep #$20.b

    ; 4 bytes per minimap marker entry
    _nextMinMapEntryForStageSelHud:
        dex
        beq _afterMinMapEntryForStageSelHud
        clc
        adc #4.w

        pha
        lda wTextRowVramAddr.w
        clc
        adc #$40.w
        sta wTextRowVramAddr.w
        pla
        bra _nextMinMapEntryForStageSelHud

    _afterMinMapEntryForStageSelHud:
        tax
        sep #$20.b

        lda StageSelItemFlagAddrText.l,X
        sta $39.b
        inx
        lda StageSelItemFlagAddrText.l,X
        sta $37.b
        inx
        lda StageSelItemFlagAddrText.l,X
        sta $38.b
        inx

        lda ($37)
        bit $39.b
        bne _keepStageSelText

        pla
        sta $39.b
        pla
        sta $38.b
        pla
        sta $37.b
        lda StageSelItemFlagAddrText.l,X
        inc a
        sep #$10.b
        rtl

    _keepStageSelText:
        pla
        sta $39.b
        pla
        sta $38.b
        pla
        sta $37.b
        lda StageSelItemFlagAddrText.l,X
        sep #$10.b
        rtl
    `);
    // Get the right text idx for Dr Light
    m.addAsm(2, 0xfd02, `
        jsr SetCapsuleItemGiverTextIdx.l
        nop
        nop
    `);
    m.addAsm(2, 0xd58a, `
    SetCarryIfEntityWayOutOfView:
    `);
    m.addAsm(5, null, `
    SetCapsuleItemGiverTextIdx:
        phd
        phx

        pea wEnemyEntities.w
        pld
        ldx #$00.w

    _nextEntity:
        lda Enemy_type.b
        cmp #$4d.b
        bne _toNextEntity

        jsr SetCarryIfEntityWayOutOfView.l
        bcc _exitLoop

    _toNextEntity:
        rep #$20.b
        tdc
        clc
        adc #Enemy_sizeof.w
        tcd
        cmp #$10d8.w
        sep #$20.b
        beq _noCapsule

        bra _nextEntity

    _noCapsule:
        lda $0008.w
        bra _setTextIdx

    _exitLoop:
        lda Enemy_subType.b

        ldy #$0c.w
        cmp #$01.b
        beq _setCapsuleTextIdx

        ldy #$0e.w
        cmp #$02.b
        beq _setCapsuleTextIdx

        ldy #$0d.w
        cmp #$04.b
        beq _setCapsuleTextIdx

        ldy #$0b.w
        cmp #$08.b
        beq _setCapsuleTextIdx

        ldy #$40.w
        cmp #$10.b
        beq _setCapsuleTextIdx

        ldy #$42.w
        cmp #$20.b
        beq _setCapsuleTextIdx

        ldy #$41.w
        cmp #$40.b
        beq _setCapsuleTextIdx

        ldy #$43.w
        cmp #$80.b
        beq _setCapsuleTextIdx

        ldy #$46.w

    _setCapsuleTextIdx:
        tya

    _setTextIdx:
        plx
        sta $0006.w, X

        pld
        rtl

    `);
    // Allow randomizing capsules
    // remove all camera snapping data from capsules
    start = conv(6, 0xcd9f);
    for (let i = 0; i < 15 * 4; i++) {
        rom[start + i] = 0;
    }
    // various hooks to use subtype to determine item, rather than stage
    m.addAsm(0x13, isNormal ? 0xc031 : 0xc034, `
    InitialCapsuleCheck:
        jmp _InitialCapsuleCheck.w
    ReturnFrom_InitialCapsuleCheck:
        tay
        nop
        nop
    `);
    m.addAsm(0x13, isNormal ? 0xc065 : 0xc05e, `
    CantGetCapsuleItem:
    `);
    m.addAsm(0x13, isNormal ? 0xc06d : 0xc066, `
    DeleteCapsuleEntity:
    `);
    m.addAsm(0x13, isNormal ? 0xc071 : 0xc06a, `
    GoodToGoWithCapsule:
    `);
    //readded capsule logic with hyper stripped completely.
    m.addAsm(0x13, null, `
    _InitialCapsuleCheck:
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
        cmp #$08.b
        bne _returnFrom_IntialCapsuleCheck
    ; We good
        jmp GoodToGoWithCapsule.w

    _returnFrom_IntialCapsuleCheck:
        jmp ReturnFrom_InitialCapsuleCheck.w
    `);
    m.addAsm(0x13, 0xc37d, `
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
    `);
    m.addAsm(0x13, 0xc37d, `
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
    `);
    if (isNormal) {
        m.addAsm(0x13, 0xc3b1, `
            jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
        `);
    }
    m.addAsm(0x13, 0xc510, `
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
    `);
    if (isNormal) {
        m.addAsm(0x13, 0xc54b, `
            jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
        `);
    }
    else {
        m.addAsm(0x4a, 0x92da, `
            jsr FarConvertNewCapsuleParamToCapsuleItemGivingEntityParam.l
            nop
            nop
        `);
        m.addAsm(0x13, null, `
        FarConvertNewCapsuleParamToCapsuleItemGivingEntityParam:
            jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
            and #$00ff.w
            rtl
        `);
    }
    m.addAsm(0x13, 0xc5c0, `
        jsr ConvertNewCapsuleParamToCapsuleItemGivingEntityParam.w
    `);
    m.addAsm(0x13, null, `
        AdjustCapsuleBaseTileIdx:
            lda $18.b
            sec
            sbc #$40.b
            sta $18.b
            rts

        SetCapsuleNonFlipForcedAttrs:
            lda $11.b
            ora #$30.b
            sta $11.b
            rts

        ConvertNewCapsuleParamToCapsuleItemGivingEntityParam:
        ; this will utterly fail if subtype is 0
        ; acc or idx can be 8/16
        ; Returns hyper armour = 8, upgrades=0-3, chips=4-7
            pha
            phx
            php

            sep #$30.b
            ldy #$08.b
            lda Enemy_subType.b
            cmp #$ff.b
            bne _startNonHyper
            bra _returnYasA

        _startNonHyper:
            ldy #$00.b
        _nonHyperLoop:
            lsr
            bcs _returnYasA
            iny
            bra _nonHyperLoop

        _returnYasA:
            plp
            plx
            pla

            tya
            rts
    `);
    // More than 1 chip can be gotten
    if (isNormal)
        rom[conv(0x13, 0xc05b)] = 0x80; // bra
    // Make capsule tile offset not fixed
    m.addAsm(0x13, isNormal ? 0xc075 : 0xc06e, `
        jsr AdjustCapsuleBaseTileIdx.w
        nop
    `);
    // Make capsule tile attr not fixed, except for setting max obj priority
    m.addAsm(0x13, isNormal ? 0xc07b : 0xc074, `
        jsr SetCapsuleNonFlipForcedAttrs.w
        nop
    `);
    // Adjust capsule to be level with the floor
    m.addAsm(0x13, isNormal ? 0xc09e : 0xc097, `
        lda Enemy_y.b
        sec
        sbc #$0018.w
        sta Enemy_y.b
        nop
        nop
    `);
    return newSlots;
}
