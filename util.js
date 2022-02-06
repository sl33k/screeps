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
    freePositionsAroundObject: (object, offset=1) => {
       // console.log("find free pos around: " + object)
        const x = object.pos.x
        const y = object.pos.y
        const room = object.room
        const ent = room.lookAtArea(y-offset, x-offset, y+offset, x+offset, true);
       //  console.log("entities around " + object + " are " + _.map(ent, (e) => e.type))
        const free_ent = _.filter(ent, (e) => e.type == 'terrain' && e.terrain != 'wall')
        // console.log("free entities around " + object + " are " + _.map(free_ent, e => e.type) + " (full: " + JSON.stringify(free_ent))
        return _.map(free_ent, (e) => new RoomPosition(e.x, e.y, room.name))
    }
}
