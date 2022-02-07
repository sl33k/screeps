const _ = require('lodash')
const util = require('util')

// TODO: Improve the routine that ensures enough max energy is available to spawn a unit, e.g. by taking out a duplicate WORK
//       or CARRY instead of defaulting to WORK, CARRY, MOVE?
// TODO: Furher improve the energy sanity check: what if there are no creeps alive that could fill extensions - then
//       online the spawners max energy (300) should be considered, as it is the only energy pool that fills up passively.
function spawnAny(spawn, prefix, bodyParts, memoryoverride = null) {
    const name = prefix + Game.time
	
	// note: energyCapacityAvailable checks the total max energy, not the current energy in all spawns/extensions.
	//       essentially this just returns whether the desired creep is theoretically possible at all, not if it is
	//       possible at this moment.
	const toUseBodyParts = spawn.room.energyCapacityAvailable < util.getBodyPartsEnergyCost(bodyParts) ? 
	[WORK, CARRY, MOVE] : bodyParts;

	const memorytouse = memoryoverride ? memoryoverride : {memory: {role: prefix, roomName: spawn.room.name, target: null}};
    if(spawn.spawnCreep(toUseBodyParts, name, memorytouse) == OK) {
        console.log("spawned creep of type " + prefix);   
        return true;
    }
    else {
        return false;
    }
}

function spawnHarvester (spawn, bodyParts = [WORK, WORK, CARRY, CARRY, MOVE]) {
    spawnAny(spawn, 'harvester', bodyParts);
}

function spawnUpgrader (spawn, bodyParts = [WORK, CARRY, CARRY, CARRY, MOVE, MOVE]) {
    spawnAny(spawn, 'upgrader', bodyParts);
}

function spawnBuilder (spawn, bodyParts = [WORK, CARRY, CARRY, MOVE]) {
    spawnAny(spawn, 'builder', bodyParts);
}

function spawnWorker (spawn, bodyParts = [WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE]) {
    spawnAny(spawn, 'worker', bodyParts, {memory: {
		role: 'worker', 
		roomName: spawn.room.name, 
		target: null, 
		harvesting: false, 
		jobType: null, 
		containerHarvesting: false,
		currentSpot: null
		}});
}


module.exports = {
    spawnHarvester: spawnHarvester,
    spawnUpgrader: spawnUpgrader,
	spawnBuilder: spawnBuilder,
    loop: (spawn) => {
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

        if(harvesters.length < 1) {
            if(!spawnHarvester(spawn))
                return;
        }
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if(upgraders.length < 2) {
            if(!spawnUpgrader(spawn))
                return;
        }
		
		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if(builders.length < 0) {
            if(!spawnBuilder(spawn))
                return;
        }
		
		var workers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');

        if(workers.length < 3) {
            if(!spawnWorker(spawn))
                return;
        }
    }
}