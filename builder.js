module.exports = {
    run: (creep) => {
		
		const energyManager = new EnergyManager(creep.room);
				
		if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
			energyManager.release(creep.memory.currentSpot);
			creep.memory.currentSpot = null;
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.moveTo(util.findFirstSpawn().pos)
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
}
