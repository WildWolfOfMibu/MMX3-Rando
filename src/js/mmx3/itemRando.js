function itemRandomize(rom, rng, opts, m) {
    let isNormal = opts.romType === 'normal';

    // Replace the rider armour holder enemy dynamic sprites with the chimera rider armour item
    start = findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_RIDE_ARMOUR_HOLDER);
    rom[start+0] = MT_ITEM;
    writeWord(rom, start+1, 0x790);
    rom[start+3] = ITEMID_RIDE_ARMOUR_ITEM;
    rom[start+4] = 0x01;
    start = getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 6, 3);
    rom[start] = DECOMP_DATA_IDX_RIDE_ARMOUR_ITEM;
    writeWord(rom, start+3, 0x1c);

    // Move capsule locations down to the ground
    // (6:ccbe - 3c:xxxx data)
    for (let [stage, offset] of [
        [STAGE_BLAST_HORNET, 0x272-0x260],
        [STAGE_BLIZZARD_BUFFALO, 0x282-0x280],
        [STAGE_GRAVITY_BEETLE, 0x482-0x490],
        [STAGE_TOXIC_SEAHORSE, 0x262-0x262],
        [STAGE_VOLT_CATFISH, 0x282-0x290],
        [STAGE_CRUSH_CRAWFISH, 0x782-0x790],
        [STAGE_TUNNEL_RHINO, 0x282-0x2a0],
        [STAGE_NEON_TIGER, 0x182-0x1c0],
		]) {
        start = findStageEntityData(rom, stage, ...ENT_CAPSULE);
        let y = readWord(rom, start+1);
        writeWord(rom, start+1, y+offset+0x20);
    }
    
    // Give the capsules their new subtypes
    for (let [stage, newSubType] of [
        [STAGE_TUNNEL_RHINO, 0x01],
        [STAGE_NEON_TIGER, 0x02],
        [STAGE_VOLT_CATFISH, 0x04],
        [STAGE_BLIZZARD_BUFFALO, 0x08],
		]) {
        start = findStageEntityData(rom, stage, ...ENT_CAPSULE);
        rom[start+4] = newSubType;
    }

    // Make capsule text shorter
    for (let [textIdx, text] of [
        [0x40, "Head chip"],
        [0x0b, "Leg upgrade"],
        [0x42, "Arm chip"],
        [0x43, "Leg chip"],
        [0x0d, "Body upgrade"],
        [0x41, "Body chip"],
        [0x0c, "Helmet upgrade"],
        [0x0e, "Arm upgrade"],
        [0x46, "Hyper chip"],
    ]) {
        replaceText(rom, textIdx, isNormal, ["You got the", text]);
    }

    /*
    Build slots and randomize
    */

    // This is done here for the 'find'-type functions
    // This is not in `constants.js` as `prep.js` needs to modify the base rom 1st
    // added index list for slots/items for easier randomization.
    let slots = [
	// Blast hornet has 2 requirements, so it needs processed first after doppler's potential 4 reqs
		{
	    slotindex: 0,
            name: "Blast Hornet Capsule",
            stageIdx: STAGE_BLAST_HORNET,
            itemName: "Head Chip",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 3, 0),
            minimapMarkerEntry: 0,
            textIdx: 0x5d,
        },
	//forcing frog armour checks for next two checks
		{
        slotindex: 1,
	    name: "Toxic Seahorse Capsule",
            stageIdx: STAGE_TOXIC_SEAHORSE,
            itemName: "Leg Chip",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 7, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x5d,
        },
        {
	    slotindex: 2,
            name: "Toxic Seahorse Kangaroo Ride Armour",
            stageIdx: STAGE_TOXIC_SEAHORSE,
	    itemName: "Kangaroo Armour",
	    itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 4, 2),
            minimapMarkerEntry: 1,
            textIdx: 0x59,
        },
	// 1 req checks
        {
	    slotindex: 3,
            name: "Blast Hornet Heart Tank",
            stageIdx: STAGE_BLAST_HORNET,
	    itemName: "Hornet Heart",
	    itemType: "Heart", 
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 9, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x24,
        },
        {
	    slotindex: 4,
            name: "Blizzard Buffalo Heart Tank",
            stageIdx: STAGE_BLIZZARD_BUFFALO,
	    itemName: "Buffalo Heart",
	    itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 1, 0),
            tileDataOffset: 0x1e00,
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
        {
	    slotindex: 5,            
	    name: "Blizzard Buffalo Subtank",
            stageIdx: STAGE_BLIZZARD_BUFFALO,
	    itemName: "Buffalo Subtank",
	    itemType: "Tank",
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 5, 3),
            minimapMarkerEntry: 1,
            textIdx: 0x55,
        },
        {
	    slotindex: 6,            
	    name: "Crush Crawfish Capsule",
            stageIdx: STAGE_CRUSH_CRAWFISH,
            itemName: "Body Chip",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 3, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x5d,
        },
        {
	    slotindex: 7,            
	    name: "Crush Crawfish Hawk Ride Armour",
            stageIdx: STAGE_CRUSH_CRAWFISH,
	    itemName: "Hawk Armour",
	    itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x5b,
        },
        {
	    slotindex: 8,
	    name: "Gravity Beetle Capsule",
            stageIdx: STAGE_GRAVITY_BEETLE,
            itemName: "Arm Chip",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 10, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x5d,
        },
        {
	    slotindex: 9,		
            name: "Gravity Beetle Frog Ride Armour",
            stageIdx: STAGE_GRAVITY_BEETLE,
	    itemName: "Frog Armour",
	    itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 5, 3),
            minimapMarkerEntry: 1,
            textIdx: 0x57,
        },
        {
	    slotindex: 10,		
            name: "Neon Tiger Capsule",
            stageIdx: STAGE_NEON_TIGER,
            itemName: "Arm Upgrade",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 2, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x67,
        },
        {
	    slotindex: 11,		
            name: "Tunnel Rhino Capsule",
            stageIdx: STAGE_TUNNEL_RHINO,
            itemName: "Helmet Upgrade",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 7, 1),
            minimapMarkerEntry: 2,
            textIdx: 0x65,
        },
	{
	    slotindex: 12,
	    name: "Tunnel Rhino Heart Tank",
            stageIdx: STAGE_TUNNEL_RHINO,
	    itemName: "Rhino Heart",
	    itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 2, 0),
            tileDataOffset: 0x1600,
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
        {
	    slotindex: 13,
            name: "Volt Catfish Capsule",
            stageIdx: STAGE_VOLT_CATFISH,
            itemName: "Body Upgrade",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 4, 1),
            minimapMarkerEntry: 0,
            textIdx: 0x63,
        },
        {
	    slotindex: 14,	
            name: "Volt Catfish Subtank",
            stageIdx: STAGE_VOLT_CATFISH,
	    itemName: "Catfish Subtank",
	    itemType: "Tank",
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 8, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x55,
        },
	{
	    slotindex: 15,		
            name: "Crush Crawfish Heart Tank",
            stageIdx: STAGE_CRUSH_CRAWFISH,
	    itemName: "Crawfish Heart",
	    itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGE_CRUSH_CRAWFISH, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_CRUSH_CRAWFISH, 2, 2),
            minimapMarkerEntry: 2,
            textIdx: 0x24,
        },
		{
	    slotindex: 16,		
            name: "Volt Catfish Heart Tank",
            stageIdx: STAGE_VOLT_CATFISH,
	    itemName: "Catfish Heart",
	    itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGE_VOLT_CATFISH, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_VOLT_CATFISH, 3, 0),
            minimapMarkerEntry: 1,
            textIdx: 0x24,
        },
	// rearranged slots so that 0 req checks are processed last.
	{
	    slotindex: 17,		
	    name: "Gravity Beetle Heart Tank",
            stageIdx: STAGE_GRAVITY_BEETLE,
	    itemName: "Beetle Heart",
	    itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGE_GRAVITY_BEETLE, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_GRAVITY_BEETLE, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
	// swapped CCHT as it does req a non frog armor
	{
	    slotindex: 18,		    
	    name: "Tunnel Rhino Subtank",
	    stageIdx: STAGE_TUNNEL_RHINO,
            itemName: "Tunnel Subtank",
	    itemType: "Tank",
	    entityEntry: findStageEntityData(rom, STAGE_TUNNEL_RHINO, ...ENT_SUBTANK),
	    dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TUNNEL_RHINO, 4, 0),
	    minimapMarkerEntry: 1,
	    textIdx: 0x55,
        },
	{
	    slotindex: 19,		
            name: "Neon Tiger Heart Tank",
            stageIdx: STAGE_NEON_TIGER,
	    itemName: "Tiger Heart",
	    itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 8, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x24,
        },
        {
	    slotindex: 20,		
            name: "Neon Tiger Subtank",
            stageIdx: STAGE_NEON_TIGER,
    	    itemName: "Tiger Subtank",
	    itemType: "Tank",
            entityEntry: findStageEntityData(rom, STAGE_NEON_TIGER, ...ENT_SUBTANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_NEON_TIGER, 0, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x55,
        },
	{
	    slotindex: 21,
            name: "Toxic Seahorse Heart Tank",
            stageIdx: STAGE_TOXIC_SEAHORSE,
	    itemName: "Seahorse Heart",
	    itemType: "Heart",
            entityEntry: findStageEntityData(rom, STAGE_TOXIC_SEAHORSE, ...ENT_HEART_TANK),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_TOXIC_SEAHORSE, 1, 3),
            minimapMarkerEntry: 0,
            textIdx: 0x24,
        },
	{
	    slotindex: 22,		
            name: "Blast Hornet Chimera Ride Armour",
            stageIdx: STAGE_BLAST_HORNET,
	    itemName: "Chimera Armour",
	    itemType: "Armour",
            entityEntry: findStageEntityData(rom, STAGE_BLAST_HORNET, ...ENT_RIDE_ARMOUR_ITEM),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLAST_HORNET, 6, 3),
            minimapMarkerEntry: 2,
            textIdx: 0x28,
        },
	{
	    slotindex: 23,
            name: "Blizzard Buffalo Capsule",
            stageIdx: STAGE_BLIZZARD_BUFFALO,
            itemName: "Leg Upgrade",
	    itemType: "Capsule",
            entityEntry: findStageEntityData(rom, STAGE_BLIZZARD_BUFFALO, ...ENT_CAPSULE),
            dynamicSpriteEntry: getDynamicSpriteData(rom, STAGE_BLIZZARD_BUFFALO, 6, 0),
            minimapMarkerEntry: 2,
            textIdx: 0x61,
        },
    ]

    // points to stage1 of this table, $13 bytes per stage, 6 bytes per entry
    let minimapMarkerTable = conv(6, 0xb01c);

    let items = [];
    for (let slot of slots) {
        let ramByteLowToCheck;
        let ramBitToCheck;
        if (slot.minimapMarkerEntry !== undefined) {
            let minimapMarkerEntry = minimapMarkerTable +
                0x13 * (slot.stageIdx-1) + 6 * slot.minimapMarkerEntry;
            ramByteLowToCheck = rom[minimapMarkerEntry+3];
            ramBitToCheck = rom[minimapMarkerEntry+5];
			 } else {
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
            majorType: rom[slot.entityEntry+0],
            type: rom[slot.entityEntry+3],
            subType: rom[slot.entityEntry+4],
            decompIdx: rom[slot.dynamicSpriteEntry+0],
            paletteId: readWord(rom, slot.dynamicSpriteEntry+3),
            ramByteLowToCheck: ramByteLowToCheck,
            ramBitToCheck: ramBitToCheck,
            textIdx: slot.textIdx,
        })
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
// find length, subtract 1 to have length match index spot
      let smax = available_slots.length - 1;
//insert itemcheck number vs chosen slot number for logic checks, increment item number slot if incorrect, checking for clear check. while statement to make sure it clears all checks.

	// if hornet capsule (slot 0) is either hawk armour (item 7) or leg upgrade (item 23), increment slot and pull index
	  if (slotcheck == 0 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
		  else {
			  s = 0;
			  slotcheck = available_slots[s].slotindex;
		  }
	  }
	  if (slotcheck == 0 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
		  else {
			  s = 0;
			  slotcheck = available_slots[s].slotindex;
		  }
	  }
	  if (slotcheck == 0 && itemcheck == 7){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
		  else {
			  s = 0;
			  slotcheck = available_slots[s].slotindex;
		  }
	  }
	  //Seahorse Capsule (slot 1) to make sure it's not Frog Armour (9)
	  if (slotcheck == 1 && itemcheck == 9){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
		  else {
			  s = 0;
			  slotcheck = available_slots[s].slotindex;
		  }
	  }
	  //Seahorse Kangaroo Armour (2) to make sure it's not frog armor (9) or leg upgrade (23) (also adding checks for all capsules. 0,1,6,8,10,11,13,23)
	  if (slotcheck == 2 && itemcheck == 9){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
  	  if (slotcheck == 2 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 2 && itemcheck == 13){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }			  
	  if (slotcheck == 2 && itemcheck == 11){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 2 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 2 && itemcheck == 8){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 2 && itemcheck == 6){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 2 && itemcheck == 1){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 2 && itemcheck == 0){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  // Hornet Heart Tank (3) cannot be leg upgrade (23)
	  if (slotcheck == 3 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  // Buffalo Heart Tank (4) cannot be either kangaroo armour (2) or chimera armour (22) if the other is already placed.
	  // all multi armour checks have Chimera Armor (23) in them, so I will exclude chimera armor from all these locations, 
	  // thus keeping a circular lock from happening at all locations. 
	  // (also adding checks for all capsules. 0,1,6,8,10,11,13,23)
	  if (slotcheck == 4 && itemcheck == 22){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 4 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 4 && itemcheck == 13){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }			  
	  if (slotcheck == 4 && itemcheck == 11){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 4 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 4 && itemcheck == 8){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 4 && itemcheck == 6){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 4 && itemcheck == 1){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 4 && itemcheck == 0){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  // Buffalo Subtank (5) cannot be leg upgrade (23)
	  // (also adding checks for all capsules. 0,1,6,8,10,11,13,23)
	  if (slotcheck == 5 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 5 && itemcheck == 13){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }			  
	  if (slotcheck == 5 && itemcheck == 11){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 5 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 5 && itemcheck == 8){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 5 && itemcheck == 6){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 5 && itemcheck == 1){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 5 && itemcheck == 0){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Crawfish Capsule (6) cannot be Kangaroo Armour (2), Hawk Armour (7) or Chimera Armour (22) if the other two are placed. 
	  //Excluding Chimera (22) as per previous multiarmour check above (4).
	  if (slotcheck == 6 && itemcheck == 22){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  // Crawfish Hawk Armour (7) cannot be Arm Upgrade (10)
	  if (slotcheck == 7 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Beetle Capsule (8) cannot be Kangaroo Armour (2), Hawk Armour (7), or Chimera Armour (22) if the other two are placed.
	  //Excluding Chimera (22) as per previous multiarmour check above (4).
	  if (slotcheck == 8 && itemcheck == 22){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Beetle Frog Armour (9) requires leg upgrade (23)
	  if (slotcheck == 9 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Tiger Capsule (10) requires leg upgrade (23)
	  if (slotcheck == 10 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	//Rhino Capsule (11) requires arm upgrade (10)
	if (slotcheck == 11 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Rhino Heart Tank (12) requires arm upgrade (10)
	  if (slotcheck == 12 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Catfish Capsule (13) requires arm upgrade (10)
	  if (slotcheck == 13 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Catfish SubTank (14) requires one armour (2,7,9,22), removing Chimera Armour (22) as per in check above (4)
	  if (slotcheck == 14 && itemcheck == 22){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  //Crawfish Heart Tank (15) cannot be Kangaroo Armour (2), Hawk Armour (7), or Chimera Armour (22) if the other two are placed.
	  //Excluding Chimera (22) as per previous multiarmour check above (4).
	  // (also adding checks for all capsules. 0,1,6,8,10,11,13,23)
	  	  if (slotcheck == 15 && itemcheck == 22){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 15 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 13){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }			  
	  if (slotcheck == 16 && itemcheck == 11){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 8){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 6){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 1){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 0){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  // Catfish Heart tank cannoth be a capsule (0,1,2,7,9,11,12,14,23)
	  if (slotcheck == 16 && itemcheck == 23){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 13){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }			  
	  if (slotcheck == 16 && itemcheck == 11){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 10){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 8){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 6){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 1){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
	  if (slotcheck == 16 && itemcheck == 0){
		  if (smax != s){
			  s++;
			  slotcheck = available_slots[s].slotindex;
		  }
			  else {
				  s = 0;
				  slotcheck = available_slots[s].slotindex;
			  }
	  }
//prelim (while loop, if incorrect, increment check available slots length, if < max, increment s by one and pull new slotindex, if = to max, reset s to 0 and pull index for check)
	    
//lock slot AFTER checks
    chosen_slot = 0;
	for (let z = 0; z < available_slots.length;){
		if (available_slots[z].slotindex = slotcheck){
			chosen_slot = z;
		}
		z++;
	}
// pushes the item and slot to locked array for building
     newSlots.push({
        item: available_items[chosen_item],
        slot: available_slots[chosen_slot],
      })
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
        rom[slot.entityEntry+0] = item.majorType;
        rom[slot.entityEntry+3] = item.type;
        rom[slot.entityEntry+4] = item.subType;
        rom[slot.dynamicSpriteEntry+0] = item.decompIdx;
        if (slot.tileDataOffset !== undefined) {
            writeWord(rom, slot.dynamicSpriteEntry+1, slot.tileDataOffset);
        }
        writeWord(rom, slot.dynamicSpriteEntry+3, item.paletteId);

        // Change minimap marker entry details
        let minimapMarkerEntry = minimapMarkerTable +
            0x13 * (slot.stageIdx-1) + 6 * slot.minimapMarkerEntry;
        rom[minimapMarkerEntry+3] = item.ramByteLowToCheck;
        rom[minimapMarkerEntry+5] = item.ramBitToCheck;

        if (slot.minimapMarkerEntry !== undefined) {
            let base = (slot.stageIdx-1) * 4*3 + slot.minimapMarkerEntry * 4;
            stageSelItemFlagAddrText[base] = item.ramBitToCheck;
            stageSelItemFlagAddrText[base+1] = item.ramByteLowToCheck;
            stageSelItemFlagAddrText[base+2] = 0x1f;
            stageSelItemFlagAddrText[base+3] = item.textIdx;
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
        0x5d, 0x61, 0x63, 0x65, 0x67]) {

        for (let textIdx of [_textIdx, _textIdx+1]) {
            let textAddrs = getTextAddrs(rom, textIdx, isNormal);

            for (let textAddr of textAddrs) {
                if (rom[textAddr] != 0x89) 
                    throw new Error(`Stage select text byte 0 not $89: ${hexc(textIdx)}`);
                let palByte = rom[textAddr+3];
                if ((palByte&0xf0) !== 0xc0) 
                    throw new Error(`Stage select text 4th byte not a palette: ${hexc(textIdx)}`);
                rom[textAddr] = palByte;
                rom[textAddr+1] = palByte;
                rom[textAddr+2] = palByte;
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
    } else {
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
    for (let i = 0; i < 15*4; i++) {
        rom[start+i] = 0;
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
    } else {
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
