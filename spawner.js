const _ = require('lodash')

function spawnAny(spawn, prefix, bodyParts) {
    const name = prefix + Game.time
    spawn.spawnCreep(bodyParts, name, {memory: {role: prefix}});
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
            spawnHarvester(spawn);
        }
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if(upgraders.length < 5) {
            spawnUpgrader(spawn);
        }
		
		var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

        if(builders.length < 1) {
            spawnBuilder(spawn);
        }
    }
}
