const builderRole = require('builder')
const harvesterRole = require('harvester')
const upgraderRole = require('upgrader');
const cleanerRole = require('cleaner');
const defenderRole = require('defender');
const transporterRole = require('transporter');
const spawner = require('spawner')
const util = require('util')
const EnergyManager = require('energy-manager')

module.exports.loop = () => {
	const s = util.findFirstSpawn();
	// Collect garbage first to ensure rest of code executes as expected
	util.collectGarbage();

    // spawner loop
    spawner.loop(s);

    // energy manager loop
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        manager = new EnergyManager(room);
        manager.update();
    }

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];

        if(creep.memory.role == 'harvester') {
            harvesterRole.run(creep);
        } else if (creep.memory.role == 'upgrader') {
            upgraderRole.run(creep);
        } else if (creep.memory.role == 'builder') {
			builderRole.run(creep);
		} else if (creep.memory.role == 'defender') {
			defenderRole.run(creep);
		} else if (creep.memory.role == 'transporter') {
			transporterRole.run(creep);
		} else if (creep.memory.role == 'cleaner') {
			cleanerRole.run(creep);
		} 
    }
    
    if(Game.cpu.bucket >= 10000) {
        Game.cpu.generatePixel();
    }
}
