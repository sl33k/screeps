const _ = require('lodash')

function spawnAny(spawn, prefix, bodyParts) {
    const name = prefix + Game.time
    if(spawn.spawnCreep(bodyParts, name, {memory: {role: prefix, roomName: spawn.room.name}}) == OK) {
        console.log("spawned creep of type " + prefix);   
        return true;
    }
    else {
        return false;
    }
}

function spawnHarvester (spawn, bodyParts = [WORK, CARRY, MOVE]) {
    spawnAny(spawn, 'harvester', bodyParts);
}

function spawnUpgrader (spawn, bodyParts = [WORK, CARRY, MOVE]) {
    spawnAny(spawn, 'upgrader', bodyParts);
}

function spawnBuilder (spawn, bodyParts = [WORK, CARRY, MOVE]) {
    spawnAny(spawn, 'builder', bodyParts);
}

module.exports = {
    spawnHarvester: spawnHarvester,
    spawnUpgrader: spawnUpgrader,
	spawnBuilder: spawnBuilder,
    loop: (spawn) => {
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

        if(harvesters.length < 2) {
            if(!spawnHarvester(spawn))
                return;
        }
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if(upgraders.length < 5) {
            if(!spawnUpgrader(spawn))
                return;
        }
		
		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if(builders.length < 1) {
            if(!spawnBuilder(spawn))
                return;
        }
    }
}