const builderRole = require('builder')
const harvesterRole = require('harvester')
const upgraderRole = require('upgrader');
const spawner = require('spawner')
const util = require('util')

var isInit = false;

module.exports.loop = () => {
    const s = util.findFirstSpawn();
    if (!isInit) {
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

    // spawner loop
    spawner.loop(s);

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        console.log(creep);
        if(creep.memory.role == 'harvester') {
            harvesterRole.run(creep);
        } else if (creep.memory.role == 'upgrader') {
            upgraderRole.run(creep);
        }
    }
}
