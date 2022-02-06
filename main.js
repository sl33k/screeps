const builderRole = require('builder')
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

    // TODO: game logic
}
