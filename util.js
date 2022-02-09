const _ = require('lodash')
const EnergyManager = require('energy-manager')

module.exports = {
	
	/**
	 * Returns the first (and most likely only) spawn object.
	 * Only expecting there to be more than one later down the line...
	 * First spawn should always be the first one that was ever created, i.e. the starting spawn
	 */	
	findFirstSpawn: () => {
		for (const i in Game.spawns)
			return Game.spawns[i];
	},
	
	/**
	 * Garbage collect. Checks all creep memory and compares to creeps
	 * that are currently alive. If they have since died, checks whether
	 * they are currently reserving a harvest spot and releases that spot.
	 */	
	collectGarbage: () => {
		for(var name in Memory.creeps) {
			if(!Game.creeps[name]) {
				// Check whether the dead creep has a harvesting spot reserved
				if (Memory.creeps[name].currentSpot != null){
					// Grab the corresponding room object and energy manager, release the spot
					const room = Game.rooms[Memory.creeps[name].roomName];
					if(room) {
					    console.log("cleaning up spot " + Memory.creeps[name].currentSpot + " in room " + room)
					    const manager = new EnergyManager(room)
					    manager.release(Memory.creeps[name].currentSpot)
					}
				}
				// Delete creep memory.
				delete Memory.creeps[name];
				console.log('Clearing non-existing creep memory:', name);
			}
		}
	},
	isTargetHealedEnough: (structure, isBuilder = false) => {
		// Apparently the naturally constructed walls have a defined hitsMax, 
		// are defined objects etc, but have undefined .hits wtf man
		const extraRoadHealth = isBuilder ? 1000 : 0;
		return structure.hits == undefined || 
			(structure.structureType != STRUCTURE_WALL && 
			structure.structureType != STRUCTURE_RAMPART && 
			structure.hits > (structure.hitsMax - 100)) || 
			((structure.structureType == STRUCTURE_WALL || 
			structure.structureType == STRUCTURE_RAMPART) && 
			structure.hits > Math.min((structure.hitsMax - 100),50000)) ||
			(structure.structureType == STRUCTURE_ROAD && structure.hits > (3000 + extraRoadHealth)) ||
			(structure.structureType == STRUCTURE_CONTAINER && structure.hits > 190000);     

	},
	getClosestTargetID: (creep, targetArray) => {
	
	var targetID = targetArray[0].id;
	var mindist = 999;
	var currentDist = 999;

	
	for (index in targetArray) {

		currentDist = creep.pos.getRangeTo(targetArray[index]);
		
		if (mindist > currentDist) {
			mindist = currentDist;
			targetID = targetArray[index].id;
		}
	}
	
	return targetID;
	},
	getBodyPartsEnergyCost: (bodyparts) => {
		var totalcost = 0;
		for (partIndex in bodyparts) {
			// See https://screeps.fandom.com/wiki/Creep
			switch(bodyparts[partIndex]) {
				case 'work':
					totalcost = totalcost + 100;
					break;
				
				case 'carry':
					totalcost = totalcost + 50;
					break;
				
				case 'move':
					totalcost = totalcost + 50;
					break;
					
				case 'attack':
					totalcost = totalcost + 80;
					break;
				
				case 'ranged_attack':
					totalcost = totalcost + 150;
					break;
					
				case 'heal':
					totalcost = totalcost + 250;
					break;
					
				case 'tough':
					totalcost = totalcost + 10;
					break;
					
				case 'claim':
					totalcost = totalcost + 600;
					break;
					
				default:
				    console.log("[ERROR] Incorrect bodypart given in util.js");
				    break;
			}
		}
		return totalcost;
	},
    freePositionsAroundObject: (object, offset=1) => {
       // console.log("find free pos around: " + object)
        const x = object.pos.x
        const y = object.pos.y
        const room = object.room
        const ent = room.lookAtArea(y-offset, x-offset, y+offset, x+offset, true);
        //console.log("entities around " + object + " are " + _.map(ent, (e) => e.type))
        const free_ent = _.filter(ent, (e) => (e.type == 'terrain' && e.terrain != 'wall') || (e.type == 'structure' && e.structure.structureType == 'road')) 
        //console.log("free entities around " + object + " are " + _.map(free_ent, e => e.type) + " (full: " + JSON.stringify(free_ent))
        return _.map(free_ent, (e) => new RoomPosition(e.x, e.y, room.name))
    },
	clamp: function(num, min, max) {
		return Math.min(Math.max(num, min), max)
	},
	calculateCreepSpeed: (creep) => {
		/**
         * Each body part has its own physical weight: the more parts a creep bears, 
		 * the more difficult it is for it to move. Each body part (except MOVE) 
		 * generates fatigue points when the creep moves: 1 point per body part on roads, 
		 * 2 on plain land, 10 on swamp. Each MOVE body part decreases fatigue points 
		 * by 2 per tick. The creep cannot move when its fatigue is greater than zero.
		 * See https://docs.screeps.com/creeps.html
		 */
		 
		// This function assumes movement on plain land
		 
		var speed = 0;
		for (var part in creep.body) {
			speed = part == MOVE ? speed + 2 : speed;
		}
		return speed/creep.body.length;
	}
	
}
