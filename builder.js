const EnergyManager = require('energy-manager')
const util = require('util')
var roleBuilder = {
	run: function(creep) {
		
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
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
				return (!util.isTargetHealedEnough(structure, true));
				}
			});

			if (targets.length) {
				var repairObj = Game.getObjectById(util.getClosestTargetID(creep,targets));
				if(creep.repair(repairObj) == ERR_NOT_IN_RANGE) {
					creep.moveTo(repairObj, {visualizePathStyle: {stroke: '#ffffff'}});
				} 
			} else { 
				targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				if(targets.length) {
					var buildObj = Game.getObjectById(util.getClosestTargetID(creep,targets));
					if(creep.build(buildObj) == ERR_NOT_IN_RANGE) {
						creep.moveTo(buildObj, {visualizePathStyle: {stroke: '#ffffff'}});
					}
				} else {
					creep.moveTo(util.findFirstSpawn().pos, {visualizePathStyle: {stroke: '#ffffff'}})
				}
			}
			
			 
        
	    }
	    else {
			
			if (creep.memory.currentSpot == null) {
			    const nextSpot = energyManager.get();
			    //console.log("creep " + creep.name + " got spot " + JSON.stringify(nextSpot) + " from energy manager")
			    if(nextSpot == null) {
			        //console.log("creep could not find free energy spot");
			        creep.moveTo(util.findFirstSpawn().pos, {visualizePathStyle: {stroke: '#ffffff'}});
			    } else {
			        creep.memory.currentSpot = nextSpot;
					creep.moveTo(util.findFirstSpawn().pos, {visualizePathStyle: {stroke: '#ffffff'}});
			    }

			} else {
			    const source = Game.getObjectById(creep.memory.currentSpot.source);
			    const err = creep.harvest(source)
			    if(err == ERR_NOT_IN_RANGE) {
			        const target = creep.memory.currentSpot.position
			        //console.log("failed harvest cause out-of-range, moving to " + JSON.stringify(target))
			        const err = creep.moveTo(new RoomPosition(target.x, target.y, target.roomName),{visualizePathStyle: {stroke: '#ffaa00'}})
			        if(err != OK) {
			            //console.log("failed moveTo due to error " + err)
			        }
			    }
            }			
	    }
    }
}

module.exports = roleBuilder;
