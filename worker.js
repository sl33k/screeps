const EnergyManager = require('energy-manager')
const util = require('util')

// Changing the order here will change the order in which jobs are checked
// i.e. this allows for job prioritazion changes easily.
// First entires are checked first.
var jobsToCheck = new Array('Spawners', 
							'Extensions', 
							'Towers', 'Building', 
							'Repair', 'Cleaning', 'Upgrading', 
							'Filling', 'Waiting' );

// Regardless of the task that shall be done, creeps must obtain energy first.
function harvestEnergy(creep) {
	
	const energyManager = new EnergyManager(creep.room);
	
	if (creep.memory.currentSpot != null) {
		const target = creep.memory.currentSpot.position;
		// Have a harvesting spot - go harvest
		if(creep.pos.x != target.x || creep.pos.y != target.y) {
			creep.moveTo(new RoomPosition(target.x, target.y, target.roomName),{visualizePathStyle: {stroke: '#ffaa00'}})
		} else
		{
			creep.harvest(Game.getObjectById(creep.memory.currentSpot.source));
		}
	} else if (creep.memory.containerHarvesting == true) {
		// Supposed to go and harvest energy from a container, go do that
		const err = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
		if (err == ERR_NOT_IN_RANGE) {
			creep.moveTo(Game.getObjectById(creep.memory.target), {visualizePathStyle: {stroke: '#ffffff'}});
		} else if (err == ERR_NOT_ENOUGH_RESOURCES){
			// all resources have been consumed, but energy storage is not full yet
			// Otherwise the creep would have switched to finding a job.
			// Go find another energy source then..
			creep.memory.target = null;
			creep.memory.containerHarvesting = false;
		} else if (err == ERR_INVALID_TARGET) {
			// Most likely the respective container has been destroyed?
			creep.memory.target = null;
			creep.memory.containerHarvesting = false;			
		}

	} else if (creep.memory.target != null && creep.memory.jobType == null) {
		// Alreadys elected a tombstone to go and harvest, go do that
		cleanTombstone(creep);
	} else {
		// No energy source has been selected yet.
		// Check tombstones first, as they are time critical
		if (!checkForTombstones(creep)) {
			// No tombstones are available, check for energy sources next
			creep.memory.currentSpot = energyManager.get();
			
			if (creep.memory.currentSpot == null) {
				// No energy harvesting spot available, try to find an energy container
				if (!findEnergyContainer(creep)) {
					// No energy container available. Just move to spawn I guess
					creep.moveTo(util.findFirstSpawn().pos, {visualizePathStyle: {stroke: '#ffffff'}});
				} else {
				creep.memory.containerHarvesting = true;
				}				
			} 
		}		
	}				
}


// TODO: Confirm this actually works? 
// In live testing tombstones were gone but resources were still there. 
// How does that work?
function cleanTombstone(creep) {
	const err = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
	if (err == ERR_NOT_IN_RANGE) {
		creep.moveTo(Game.getObjectById(creep.memory.target));
	} else if (err == ERR_NOT_ENOUGH_RESOURCES) {
		// all resources have been consumed, but energy storage is not full yet
		// Otherwise the creep would have switched to finding a job.
		// Go find another energy source then...
		creep.memory.target = null;
	} else if (err == ERR_INVALID_TARGET) {
		// Most likely the tombstone has despawned.
		creep.memory.target = null;
	}
}


function checkForTombstones(creep) {
	const targets = creep.room.find(FIND_TOMBSTONES, {
		filter: (tombstone) => {
		const tombdistance = creep.pos.findPathTo(tombstone).length;
		return (tombstone.store.getUsedCapacity(RESOURCE_ENERGY) != 0 &&
			tombdistance < util.calculateCreepSpeed(creep) * tombstone.ticksToDecay );
		}
	});	
	if (targets.length) {
		console.log("Found suitable tombstone to clean");
		creep.memory.target = targets[0].id;
		return 1;		
	}
	return 0;
}


function findEnergyContainer(creep) {
	// TODO: Filter out whichever is closest, instead of grabbing index 0
	const targets = creep.room.find(FIND_STRUCTURES, {
		filter: (structure) => {
		return ((structure.structureType == STRUCTURE_CONTAINER || 
				structure.structureType == STRUCTURE_STORAGE) &&
			structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
		}
	});
	
	if (targets.length)
	{
		creep.memory.containerHarvesting = true;
		creep.memory.target = targets[0].id;
		return 1;		
	} else {
		return 0;		
	}
}


function performWork(creep) {

	const targetObject = Game.getObjectById(creep.memory.target);
	if (targetObject == null)
	{
		// Not sure what happened, construction finished, object got destroyed etc.
		// Just look for a new job I guess
		creep.memory.jobType = null;
		creep.memory.target = null;
	} else {
		switch (creep.memory.jobType) {
			
			// The following 4 share the same "action function"
			case 'Spawners':
			case 'Extensions':
			case 'Towers':
			case 'Filling':	
				const transferError = creep.transfer(targetObject, RESOURCE_ENERGY);
				if (transferError == ERR_NOT_IN_RANGE) {
					creep.moveTo(targetObject, {visualizePathStyle: {stroke: '#ffffff'}})					
				} else if (transferError == ERR_FULL) {
					// This job is done - target is full
					creep.memory.target = null;
					creep.memory.jobType = null;
				} else if (transferError != OK) {
					console.log("[ERROR] " +"Unexpected error in worker.js TRANSFER JOB:" + transferError);
				}
				break;
				
			case 'Repair':
				const repairError = creep.repair(targetObject);
				if (repairError == ERR_NOT_IN_RANGE) {
					creep.moveTo(targetObject, {visualizePathStyle: {stroke: '#ffffff'}})					
				} else if (repairError != OK) {
					console.log("[ERROR] " +"Unexpected error in worker.js REPAIR JOB:" + repairError);
				}
				if (isTargetHealedEnough(targetObject)) {
					// This job is done - target has max health
					creep.memory.target = null;
					creep.memory.jobType = null;				
				}
				break;	
				
			case 'Building':
				// Temporary fix to ensure creeps move closer to target
				// TODO: improve
				if (creep.pos.getRangeTo(targetObject) <= 2) {
					const buildError = creep.build(targetObject);
					if (buildError == ERR_NOT_IN_RANGE) {
						console.log("[ERROR] " +"Distance of building creep to site is too large, but why? Error:" + buildError);				
					} else if (buildError == ERR_INVALID_TARGET && targetObject != null && targetObject.progress < targetObject.progressTotal) {
						// This happens if another unit is on the constructionsite and is therefore preventing
						// This consutrction from finishing
						// Guess let's just wait?
					} else if (buildError != OK) {
						// TODO:
						console.log("[ERROR] " +"CRITICAL unexpected error in worker.js BUILD JOB:" + buildError);
						console.log("[ERROR] THIS MUST BE FIXED IN CODE ASAP.");
						console.log("[ERROR] TEMPORARY FIX: RESET JOB FOR CREEP " + creep.name);
						creep.memory.target = null;
						creep.memory.jobType = null;	
					} 
				} else {
					creep.moveTo(targetObject, {visualizePathStyle: {stroke: '#ffffff'}});	 
				}
				break;
				
			case 'Cleaning':
				// never used.
				break;
				
			case 'Upgrading':
				const upgradeError = creep.upgradeController(targetObject);
				if (upgradeError == ERR_NOT_IN_RANGE) {
					creep.moveTo(targetObject, {visualizePathStyle: {stroke: '#ffffff'}})					
				} else if (upgradeError != OK){
					console.log("[ERROR] " +"Unexpected error in worker.js UPGRADE JOB:" + upgradeError);
				}
				break;
				
			default:
				console.log("[ERROR] " +"Error occured in worker.js performWork - switch/case went into default");
		}
	}
}

function isTargetHealedEnough(structure) {
    return (structure.structureType != STRUCTURE_WALL && 
    			            structure.structureType != STRUCTURE_RAMPART && 
    			            structure.hits < (structure.hitsMax - 100)) ||
    			        ((  structure.structureType == STRUCTURE_WALL || 
    			            structure.structureType == STRUCTURE_RAMPART) && 
                            structure.hits < Math.max((structure.hitsMax - 100),50000));    

}


/**
 * Runs on a creep that already has energy
 * Depending on a configured priority, the creep will
 * Pick a job to do and save the target.
 * TODO:
 * preliminary could be used to check for a job before energy is harvested
 * then, depending on the job location, it may be possible to find an energy
 * source closer towards the destination to improve pathing. 
 * Alternatively, if there is no job then e.g. we could also refrain from
 * plundering energy storages - as apparently there is no urgend need.
 */
function findJob(creep, preliminary = false) {
	// TODO: add memory at target capturing that a worker is already servicing it?
	// otherwise, everyone will try to do the same job, no?
	// E.g., keep track of "currentBuilders", "currentHarvesters", "currentUpgraders" etc.
	// in memory - reset at every loop in main.js? 
	// Then read it here and make sure stuff is balanced a little

	for (jobIndex in jobsToCheck) {
		
		var job = jobsToCheck[jobIndex];
		
		var targets = [];
		
		switch (job) {
			case 'Spawners':
				// Check spawners for energy need
				for (var spawnerid in Game.spawns) {
					if (Game.spawns[spawnerid].store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
						targets.push(Game.spawns[spawnerid]);
					}
				}
				break;
			
			case 'Repair':
			    targets = creep.room.find(FIND_STRUCTURES, {
				    filter: (structure) => { 
        				// Limits the health of structures and ramparts to 50k for now...
        				return (structure.structureType != STRUCTURE_WALL && 
        			            structure.structureType != STRUCTURE_RAMPART && 
        			            structure.hits < (structure.hitsMax - 100)) ||
                            ((  structure.structureType == STRUCTURE_WALL || 
        			            structure.structureType == STRUCTURE_RAMPART) && 
                                structure.hits < Math.min((structure.hitsMax - 100),50000));
				    }
			    });				
				break;			
				
			case 'Extensions':
				targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
					return (structure.structureType == STRUCTURE_EXTENSION) && 
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
				break;
				
			case 'Towers':
				targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
					return (structure.structureType == STRUCTURE_TOWER) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});	
				break;
				
			case 'Building':
				targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				break;
				
			case 'Cleaning':
					// Actually this is a means of obtaining energy, not a job to do once
					// energy has been collected.
				break;
				
			case 'Upgrading':
				// There is only ever 1 controller per room - just write it to index 1
				targets[0] = creep.room.controller;
				break;
				
			case 'Filling':
				targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER ||
							structure.structureType == STRUCTURE_STORAGE) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});					
			
				break;
				
			case 'Waiting':
				// Walk towards spawn while checking for something to do
				creep.moveTo(util.findFirstSpawn().pos, {visualizePathStyle: {stroke: '#ffffff'}});
				break;
				
			default:
				console.log("[ERROR] " +"Error occured in worker.js findJob - switch/case went into default");
		}
		// Check if a suitable target has been found.
		if (targets.length) {
			if (!preliminary) {
				if (targets.length > 1) {
					creep.memory.target = getClosestTargetID(creep, targets);
				} else {
					creep.memory.target = targets[0].id;					
				}

				creep.memory.jobType = job;
			} else { 
				// creep.memory.prelimTarget = targets[0].id;
				// TODO: Implement this or take it out
			}

			break;
		}

	}

}

function getClosestTargetID(creep, targetArray) {
	
	var targetID = targetArray[0].id;
	var mindist = 999;
	var currentDist = 999;

	
	for (index in targetArray) {

		currentDist = creep.pos.getRangeTo(targetArray[index]);
		
		if (mindist > currentDist) {
			mindist = currentDist;
			targetID = targetArray[index].id;
		}
	}
	
	return targetID;
}


// TODO: go through this and think a bit about the various flags/states 
// There's definitely some "better safe than sorry" re-setting and if() here.
var roleWorker = {
	run: function(creep) {
		
		const energyManager = new EnergyManager(creep.room);
		
		if (!creep.memory.harvesting && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			// Starting energy harvesting. Reset job vars and set harvesting flag:
			creep.memory.harvesting = true;
			creep.memory.jobType = null;
			creep.memory.target = null;
		}
		
		if (creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
			// Done harvesting, reset all flags and vars
			creep.memory.harvesting = false;
			creep.memory.target = null;
			creep.memory.jobType = null;
			creep.memory.containerHarvesting = null;
		} else if (creep.memory.harvesting && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
			// Ensure this stays at null while we are trying to harvest energy
			creep.memory.jobType == null;
			harvestEnergy(creep);
		}
		
		if (!creep.memory.harvesting && (creep.memory.target == null || creep.memory.jobType == null)) {
			
			if (creep.memory.target != null) {
				// Energy of this creep was obtained via cleaning or energy storage. Have to reset target.
				creep.memory.target = null;
			}
			// Reset this flag
			creep.memory.containerHarvesting = false;
			// Release harvesting spot if one was reserved
			if (creep.memory.currentSpot != null) { 
				energyManager.release(creep.memory.currentSpot);
				creep.memory.currentSpot = null;
			}
			
			findJob(creep);
		} else if (!creep.memory.harvesting && creep.memory.target != null && creep.memory.jobType != null) {
			performWork(creep);
		} else if (!creep.memory.harvesting) {
			console.log("[ERROR] " +"Worker.js encountered unexpected combination of flags/states. No recovery...");
		}
    }
};

module.exports = roleWorker;

