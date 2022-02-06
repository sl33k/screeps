const EnergyManager = require('energy-manager')
var roleHarvester = {
    run: function(creep) {
       const energyManager = new EnergyManager(creep.room)
		/** 
		 * harvester "state machine"
		 * harvesting == true: The harvester is currently 
		 * trying to gather resources from an energy source.
		 * harvesting == false: The harvester is done
		 * collecting energy and is trying to deposit it somewhere.
		 
		*/
		if(!creep.memory.harvesting && creep.store.getFreeCapacity() > 0) {
            creep.memory.harvesting = true;
	    } else if(creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
	        creep.memory.harvesting = false;
            energyManager.release(creep.memory.currentSpot);
			creep.memory.currentSpot = null;
	    }
		
		if (creep.memory.harvesting){
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
		
		if(!creep.memory.harvesting) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
		
    }
}

module.exports = roleHarvester
