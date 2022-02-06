const builderRole = require('builder')
const harvesterRole = require('harvester')
const spawner = require('spawner')
const util = require('util')

var isInit = false;

module.exports.loop = () => {
    if (!isInit) {
        const s = util.findFirstSpawn();
        /* spawn initial units */
        spawner.spawnHarvester(s);
        // TODO: initial spawning
        /* update init flag */
        isInit = true;
    }

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    for (creep in Game.creeps.values) {
        if(creep.memory.role == 'harvester') {
            harvesterRole.run(creep);
        } else if (creep.memory.role == 'upgrader') {
            // TODO:
        }

    }

}
