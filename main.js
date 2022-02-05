const builderRole = require('roles.builder.module')
const spawner = require('spawner')

var isInit = false;

module.exports.loop = () => {
    if (!isInit) {
        /* spawn initial units */
        // TODO: initial spawning
        /* update init flag */
        isInit = true;
    }

    // TODO: game logic
}
