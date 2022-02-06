const EnergyManager = require('energy-manager')
var roleUpgrader = {
    run: function(creep) {
        const energyManager = new EnergyManager(creep.room)
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
			if (creep.memory.currentSpot == null) {
			    const nextSpot = energyManager.get();
			    console.log("creep " + creep.name + " got spot " + JSON.stringify(nextSpot) + " from energy manager")
			    if(nextSpot == null) {
			        console.log("creep could not find free energy spot");
			    } else {
			        creep.memory.currentSpot = nextSpot;
			    }

			} else {
			    const source = Game.getObjectById(creep.memory.currentSpot.source);
			    const err = creep.harvest(source)
			    if(err == ERR_NOT_IN_RANGE) {
			        const target = creep.memory.currentSpot.position
			        console.log("failed harvest cause out-of-range, moving to " + JSON.stringify(target))
			        const err = creep.moveTo(new RoomPosition(target.x, target.y, target.roomName),{visualizePathStyle: {stroke: '#ffaa00'}})
			        if(err != OK) {
			            console.log("failed moveTo due to error " + err)
			        }
			    }
            }
        }
    }
};

module.exports = roleUpgrader;

