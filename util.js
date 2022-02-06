module.exports.findFirstSpawn = () => {
    for (const i in Game.spawns)
        return Game.spawns[i];
}
