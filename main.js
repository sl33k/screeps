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

    for (creep in Game.creeps.values) {
        if(creep.memory.role == 'harvester') {
            harvesterRole.run(creep);
        } else if (creep.memory.role == 'upgrader') {
            // TODO:
        }

    }

}
