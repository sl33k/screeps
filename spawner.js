module.exports = {
    spawnHarvester: (spawn, name = null, bodyParts = [WORK, CARRY, MOVE]) => {
        if (!name) {
            name = "harvester" + Game.time;
        }
        spawn.spawnCreep(bodyParts, name, {memory: {role: 'harvester'}});
    }
}
