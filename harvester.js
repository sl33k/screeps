
var roleHarvester = {
    run: function(creep) {
        
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
			creep.room.memory.energyManager.release(creep.memory.currentSpot);
			creep.memory.currentSpot = null;
	    }
		
		if (creep.memory.harvesting){
			if (creep.memory.currentSpot == null){
				creep.memory.currentSpot = creep.room.memory.energyManager.get();				
			} else if(creep.harvest(creep.memory.currentSource.source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.memory.currentSource.harvest_position, {visualizePathStyle: {stroke: '#ffaa00'}});
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
