const _ = require('lodash')
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
					Memory.creeps[name].roomRef.memory.energyManager.release(Memory.creeps[name].currentSpot);
				}
				
				// Delete creep memory.
				delete Memory.creeps[name];
				console.log('Clearing non-existing creep memory:', name);
			}
		}
	},
    freePositionsAroundObject: (object, offset=1) => {
        const x = object.pos.x
        const y = object.pos.y
        const room = object.room
        const ent = room.lookAtArea(y-offset, x-offset, y+offset, x+offset, true);
        const free_ent = _.filter(ent, (e) => e.type == 'terrain' && e.terrain != 'wall')
        return _.map(free_ent, (e) => RoomPosition(e.x, e.y, room))
    }
}
