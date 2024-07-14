import { conv } from "./utils.js";
export var STAGES;
(function (STAGES) {
    STAGES[STAGES["BLAST_HORNET"] = 1] = "BLAST_HORNET";
    STAGES[STAGES["BLIZZARD_BUFFALO"] = 2] = "BLIZZARD_BUFFALO";
    STAGES[STAGES["GRAVITY_BEETLE"] = 3] = "GRAVITY_BEETLE";
    STAGES[STAGES["TOXIC_SEAHORSE"] = 4] = "TOXIC_SEAHORSE";
    STAGES[STAGES["VOLT_CATFISH"] = 5] = "VOLT_CATFISH";
    STAGES[STAGES["CRUSH_CRAWFISH"] = 6] = "CRUSH_CRAWFISH";
    STAGES[STAGES["TUNNEL_RHINO"] = 7] = "TUNNEL_RHINO";
    STAGES[STAGES["NEON_TIGER"] = 8] = "NEON_TIGER";
    STAGES[STAGES["VILE"] = 9] = "VILE";
    STAGES[STAGES["DOPPLER_1"] = 10] = "DOPPLER_1";
    STAGES[STAGES["DOPPLER_2"] = 11] = "DOPPLER_2";
    STAGES[STAGES["DOPPLER_3"] = 12] = "DOPPLER_3";
    STAGES[STAGES["DOPPLER_4"] = 13] = "DOPPLER_4";
})(STAGES || (STAGES = {}));
export const MT_ITEM = 0;
export const MT_ENEMY = 3;
export var ITEMID;
(function (ITEMID) {
    ITEMID[ITEMID["SUBTANK"] = 5] = "SUBTANK";
    ITEMID[ITEMID["HEART_TANK"] = 11] = "HEART_TANK";
    ITEMID[ITEMID["RIDE_ARMOUR_ITEM"] = 23] = "RIDE_ARMOUR_ITEM";
})(ITEMID || (ITEMID = {}));
export const ENEMYID_HANGERTER = 0x4c;
export const ENEMYID_CAPSULE = 0x4d;
export var ENEMYID;
(function (ENEMYID) {
    ENEMYID[ENEMYID["BLIZZARD_BUFFALO"] = 82] = "BLIZZARD_BUFFALO";
    ENEMYID[ENEMYID["BLAST_HORNET"] = 83] = "BLAST_HORNET";
    ENEMYID[ENEMYID["CRUSH_CRAWFISH"] = 84] = "CRUSH_CRAWFISH";
    ENEMYID[ENEMYID["TUNNEL_RHINO"] = 85] = "TUNNEL_RHINO";
    ENEMYID[ENEMYID["NEON_TIGER"] = 86] = "NEON_TIGER";
    ENEMYID[ENEMYID["TOXIC_SEAHORSE"] = 87] = "TOXIC_SEAHORSE";
    ENEMYID[ENEMYID["VOLT_CATFISH"] = 88] = "VOLT_CATFISH";
    ENEMYID[ENEMYID["GRAVITY_BEETLE"] = 89] = "GRAVITY_BEETLE";
})(ENEMYID || (ENEMYID = {}));
export const DECOMP_DATA_IDX_RIDE_ARMOUR_ITEM = 0x3b;
export const ENTITY_DATA = {
    RIDE_ARMOUR_HOLDER: [MT_ENEMY, ENEMYID_HANGERTER],
    CAPSULE: [MT_ENEMY, ENEMYID_CAPSULE],
    RIDE_ARMOUR_ITEM: [MT_ITEM, ITEMID.RIDE_ARMOUR_ITEM],
    HEART_TANK: [MT_ITEM, ITEMID.HEART_TANK],
    SUBTANK: [MT_ITEM, ITEMID.SUBTANK],
};
export const ENEMIES = {
    'Blady': {
        id: 0x03,
        decomp_idx: 0x1a,
        decomp_size: 0x500,
    }, 'Earth Commander': {
        id: 0x06,
        decomp_idx: 0x05,
        decomp_size: 0x500,
    }, 'Notor Banger': {
        id: 0x08,
        decomp_idx: 0x02,
        decomp_size: 0x400,
        sub_idx: 0, // bit 7 set means affected by conveyor? and 1 means moves?
    }, 'Caterkiller': {
        id: 0x0b,
        decomp_idx: 0x08,
        decomp_size: 0x200,
        sub_idx: 0, // bit 7 set means attached to left wall? TODO
    }, 'Drimole W': {
        id: 0x0c,
        decomp_idx: 0x03,
        decomp_size: 0x400,
    }, 'Helit': {
        id: 0x0d,
        decomp_idx: 0x04,
        decomp_size: 0x200,
    }, 'Wall Cancer': {
        id: 0x0e,
        decomp_idx: 0x16,
        decomp_size: 0x300,
        sub_idx: 0, // 0 on right wall, 1 on left
    }, 'Crablaster': {
        id: 0x11,
        decomp_idx: 0x11,
        decomp_size: 0x500,
        sub_idx: 0, // b0 means upside down TODO
    }, 'Meta Capsule': {
        id: 0x16,
        decomp_idx: 0x29,
        decomp_size: 0x200,
        sub_idx: 0, // 0 - floor, 1 - ceiling TODO
    }, 'Head Gunner Customer': {
        id: 0x18,
        decomp_idx: 0x28,
        decomp_size: 0x500,
        pal_idx: 0x1d2,
        sub_idx: 0, // 1 faces right, 2 faces left, 0.. ???, 80 doppler 1
    }, 'Head Gunner Masspro': {
        id: 0x18,
        decomp_idx: 0x28,
        decomp_size: 0x500,
        pal_idx: 0x86,
        sub_idx: 0x80, // 1 faces right, 2 faces left, 0.. ???, 80 doppler 1
    }, 'Mine Tortoise': {
        id: 0x1c,
        decomp_idx: 0x15,
        decomp_size: 0x500,
    }, 'Wild Tank': {
        id: 0x1d,
        decomp_idx: 0x21,
        decomp_size: 0x400,
    }, 'Victoroid': {
        id: 0x1e,
        decomp_idx: 0x20,
        decomp_size: 0x800,
        pal_idx: 0x82,
        sub_idx: 0,
    }, 'Victoroid Customer': {
        id: 0x1e,
        decomp_idx: 0x20,
        decomp_size: 0x800,
        pal_idx: 0x1d0,
        sub_idx: 1,
    }, 'Tombort': {
        id: 0x1f,
        decomp_idx: 0x4a,
        decomp_size: 0x300,
    }, 'Atareeter': {
        id: 0x22,
        decomp_idx: 0x4b,
        decomp_size: 0x400,
    }, 'Snow Rider': {
        id: 0x23,
        decomp_idx: 0x12,
        decomp_size: 0x400,
        sub_idx: 2,
    }, 'Snow Slider': {
        id: 0x23,
        decomp_idx: 0x12,
        decomp_size: 0x400,
        sub_idx: 0,
    }, 'Walk Blaster': {
        id: 0x28,
        decomp_idx: 0x50,
        decomp_size: 0x300,
    }, 'Ice De Voux': {
        id: 0x29,
        decomp_idx: 0x57,
        decomp_size: 0x400,
        pal_idx: 0x1c6,
        sub_idx: 2, // other ice is 3,4
    }, 'Iwan De Voux': {
        id: 0x29,
        decomp_idx: 0x57,
        decomp_size: 0x400,
        pal_idx: 0xf4,
        sub_idx: 5, // other rock is 83,82,7,88,9
    }, 'Drill Waying': {
        id: 0x2b,
        decomp_idx: 0x4f,
        decomp_size: 0x300,
    },
    'Hamma Hamma': {
        id: 0x2d,
        decomp_idx: 0x5d,
        decomp_size: 0x500,
        sub_idx: 0, // 1 - destroys crush crawfish bridge, 2 - destroys crush crawfish boat
    }, 'Ganseki Carrier': {
        id: 0x35,
        decomp_idx: 0x8a,
        decomp_size: 0x500,
        sub_idx: 2, // with rocks is 1
    }, 'Trapper': {
        id: 0x3d,
        decomp_idx: 0xc6,
        decomp_size: 0x300,
        sub_idx: 0, // 0 - long moving laser, 1 - short unmoving laser, 2 - short moving laser
    },
};
// New ram vars noted here
// (TODO: have labels in banks, with base addrs), and routine to add labels
let gotHyperArmour = 0x7ef4e3;
// idxes into a table of $26 weakness vars
export const enemyWeaknesses = {
    0x12: "Gravity Well / Spinning Blade",
    0x13: "Parasitic Bomb",
    0x14: "Ray Splasher / Parasitic Bomb",
    0x15: "Frost Shield",
    0x16: "Tornado Fang",
    0x17: "Triad Thunder",
    0x18: "Acid Burst",
    0x19: "Spinning Blade",
};
export const subweapons = [
    "Acid Burst",
    "Parasitic Bomb",
    "Triad Thunder",
    "Spinning Blade",
    "Ray Splasher",
    "Gravity Well",
    "Frost Shield",
    "Tornado Fang",
];
class BossDatum {
    newHealth;
    newWeakness;
    newDrop;
    extraWeakness;
    maxHealth;
    id;
    idx;
    subwepReward;
    subwepCheck;
    health;
    weakness;
    drop;
    constructor(extraWeakness, maxHealth, id, idx, subwepReward, subwepCheck) {
        this.extraWeakness = extraWeakness;
        this.maxHealth = maxHealth;
        this.id = id;
        this.idx = idx;
        this.subwepReward = subwepReward;
        this.subwepCheck = subwepCheck;
    }
}
export let bossData = {
    'Blast Hornet': {
        maxHealth: conv(0x39, 0x9dc2),
        id: ENEMYID.BLAST_HORNET,
        idx: 0,
        subwepReward: conv(0x39, 0xa14c), // +1 from `sta` to point to `abs` param
        subwepCheck: conv(0x39, 0x9c86), // +1 from `bit` to point to `abs` param
        extraWeakness: [],
    }, 'Blizzard Buffalo': {
        maxHealth: conv(0x03, 0xc9cb),
        id: ENEMYID.BLIZZARD_BUFFALO,
        idx: 1,
        subwepReward: conv(0x03, 0xcd9d),
        subwepCheck: conv(0x03, 0xc8a8),
        extraWeakness: [conv(0x03, 0xcd30)],
    }, 'Gravity Beetle': {
        maxHealth: conv(0x13, 0xf3c3),
        id: ENEMYID.GRAVITY_BEETLE,
        idx: 2,
        subwepReward: conv(0x13, 0xf7c2),
        subwepCheck: conv(0x13, 0xf280),
        extraWeakness: [conv(0x13, 0xf683), conv(0x13, 0xf778)],
    }, 'Toxic Seahorse': {
        maxHealth: conv(0x13, 0xe612),
        id: ENEMYID.TOXIC_SEAHORSE,
        idx: 3,
        subwepReward: conv(0x13, 0xe9c8),
        subwepCheck: conv(0x13, 0xe4d8),
        extraWeakness: [conv(0x13, 0xe892)],
    }, 'Volt Catfish': {
        maxHealth: conv(0x13, 0xebc0),
        id: ENEMYID.VOLT_CATFISH,
        idx: 4,
        subwepReward: conv(0x13, 0xf0bf),
        subwepCheck: conv(0x13, 0xeaac),
        extraWeakness: [conv(0x13, 0xf045)],
    }, 'Crush Crawfish': {
        maxHealth: conv(0x03, 0xd1b2),
        id: ENEMYID.CRUSH_CRAWFISH,
        idx: 5,
        subwepReward: conv(0x03, 0xd5b4),
        subwepCheck: conv(0x03, 0xd089),
        extraWeakness: [],
    }, 'Tunnel Rhino': {
        maxHealth: conv(0x3f, 0xe765),
        id: ENEMYID.TUNNEL_RHINO,
        idx: 6,
        subwepReward: conv(0x3f, 0xeb13),
        subwepCheck: conv(0x3f, 0xe62a),
        extraWeakness: [conv(0x3f, 0xe9eb), conv(0x3f, 0xeab5)],
    }, 'Neon Tiger': {
        maxHealth: conv(0x13, 0xde11),
        id: ENEMYID.NEON_TIGER,
        idx: 7,
        subwepReward: conv(0x13, 0xe3ab),
        subwepCheck: conv(0x13, 0xdce7),
        extraWeakness: [conv(0x13, 0xdf3e), conv(0x13, 0xe27d)],
    },
};
