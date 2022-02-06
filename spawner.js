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

module.exports = {
    spawnHarvester: spawnHarvester,
    spawnUpgrader: spawnUpgrader,
    loop: (spawn) => {
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

        if(harvesters.length < 2) {
            spawnHarvester(spawn)
        }
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

        if(upgraders.length < 2) {
            spawnUpgrader(spawn)
        }
    }
}
