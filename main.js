const builderRole = require('builder')
const harvesterRole = require('harvester')
const upgraderRole = require('upgrader');
const cleanerRole = require('cleaner');
const defenderRole = require('defender');
const transporterRole = require('transporter');
const spawner = require('spawner')
const util = require('util')
const EnergyManager = require('energy-manager')

var isInit = false;

module.exports.loop = () => {
    const s = util.findFirstSpawn();
    if (!isInit) {
        for (const room in Game.rooms) {
            room.memory['energyManager'] = new EnergyManager(room)
        }
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

    // energy manager loop
    for (const room in Game.rooms) {
        room.memory.energyManager.update();
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
