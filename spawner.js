const _ = require('lodash')

// TODO: add capability of specifying custom memory for this function spawnAny(spawn, prefix, bodyparts, memory = null)
// TODO: compare energy cost of unit based on bodyparts to the max available enegy in spawner and extensions.
// 		 Either fail with warning, or default to a simple creep instead automatically
// 		 This should be done in case an extension gets destroyed e.g. during an attack
function spawnAny(spawn, prefix, bodyParts, memoryoverride = null) {
    const name = prefix + Game.time
	const memorytouse = memoryoverride ? memoryoverride : {memory: {role: prefix, roomName: spawn.room.name, target: null}};
    if(spawn.spawnCreep(bodyParts, name, memorytouse) == OK) {
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

function spawnUpgrader (spawn, bodyParts = [WORK, CARRY, CARRY, MOVE, MOVE]) {
    spawnAny(spawn, 'upgrader', bodyParts);
}

function spawnBuilder (spawn, bodyParts = [WORK, CARRY, CARRY, MOVE]) {
    spawnAny(spawn, 'builder', bodyParts);
}

function spawnWorker (spawn, bodyParts = [WORK, CARRY, MOVE]) {
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

        if(upgraders.length < 1) {
            if(!spawnUpgrader(spawn))
                return;
        }
		
		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if(builders.length < 1) {
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