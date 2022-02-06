const EnergyManager = require('energy-manager')
const util = require('util')

// Changing the order here will change the order in which jobs are checked
// i.e. this allows for job prioritazion changes easily.
// First entires are checked first.
const jobsToCheck [ 'Spawners', 'Repair', 
					'Extensions', 
					'Towers', 'Building', 
					'Cleaning', 'Upgrading', 
					'Filling', 'Waiting' ]

// Regardless of the task that shall be done, creeps must obtain energy first.
function harvestEnergy(creep) {
	
	const energyManager = new EnergyManager(creep.room);
	
	if (creep.memory.currentSpot != null) {
		// Have a harvesting spot - go harvest
		if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
			const target = creep.memory.currentSpot.position;
			creep.moveTo(new RoomPosition(target.x, target.y, target.roomName),{visualizePathStyle: {stroke: '#ffaa00'}})
		}
	} else if (creep.memory.containerHarvesting == true) {
		// Supposed to go and harvest energy from a container, go do that
		const err = creep.withdraw(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
		if (err == ERR_NOT_IN_RANGE) {
			creep.moveTo(Game.getObjectById(creep.memory.target));
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
					creep.moveTo(util.findFirstSpawn().pos);
				} else {
				creep.memory.containerHarvesting = true;
				}				
			} 
		}		
	}				
}


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
		const tombdistance = creep.findPathTo(tombstone).length;
		return (tombstone.store.getUsedCapacity(RESOURCE_ENERGY) != 0 &&
			tombdistance < util.calculateCreepSpeed(creep) * tombstone.ticksToDecay );
		}
	});	
	if (targets != null) {
		creep.memory.target = targets[0].id;
		return 1;		
	}
	return 0;
}


function findEnergyContainer(creep) {
	const targets = null;
	// TODO: Filter out whichever is closest, instead of grabbing index 0
	targets = creep.room.find(FIND_STRUCTURES, {
		filter: (structure) => {
		return ((structure.structureType == STRUCTURE_CONTAINER || 
				structure.structureType == STRUCTURE_STORAGE) &&
			structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
		}
	});
	
	if (targets != null)
	{
		creep.memory.containerHarvesting = true;
		creep.memory.target = targets[0].id;
		return 1;		
	} else {
		return 0;		
	}
}


function performWork(creep) {

		switch (creep.memory.jobtype) {
			// The following 4 share the same "action function"
			case 'Spawners':
			case 'Extensions':
			case 'Towers':
			case 'Filling':	
				const err = creep.transfer(Game.getObjectById(creep.memory.target), RESOURCE_ENERGY);
				if (err == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.target))					
				} else {
					console.error("Unexpected error in worker.js TRANSFER JOB:" + err);
				}
				break;
				
			case 'Repair':
				const err = creep.repair(Game.getObjectById(creep.memory.target));
				if (err == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.target))					
				} else {
					console.error("Unexpected error in worker.js REPAIR JOB:" + err);
				}
				break;	
				
			case 'Building':
				const err = creep.build(Game.getObjectById(creep.memory.target));
				if (err == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.target))					
				} else {
					console.error("Unexpected error in worker.js BUILD JOB:" + err);
				}
				break;
				
			case 'Cleaning':
				// never used.
				break;
				
			case 'Upgrading':
				const err = creep.upgradeController(Game.getObjectById(creep.memory.target));
				if (err == ERR_NOT_IN_RANGE) {
					creep.moveTo(Game.getObjectById(creep.memory.target))					
				} else {
					console.error("Unexpected error in worker.js UPGRADE JOB:" + err);
				}
				break;
				
			default:
				console.error("Error occured in worker.js performWork - switch/case went into default");
		}
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
	
	jobsToCheck.forEach((job, i) => {
		
		var targets = null;
		const jobType = job;
		
		switch (job) {
			case 'Spawners':
				// Check spawners for energy need
				for (const spawner in Game.spawns) {
					if (spawner.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
						targets.push(spawner);
					}
				}
				break;
			
			case 'Repair':
				targets = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
					return (structure.hits < structure.hitsMax);
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
				creep.moveTo(util.findFirstSpawn().pos);
				break;
				
			default:
				console.error("Error occured in worker.js findJob - switch/case went into default");
		}
		
		// Check if a suitable target has been found.
		if (targets != null) {
			if (!preliminary) {
				creep.memory.target = targets[0].id;
				creep.memory.jobtype = job;
			} else { 
				// creep.memory.prelimTarget = targets[0].id;
				// TODO: Implement this or take it out
			}
			
			return;
		}
	}
}


// TODO: go through this and think a bit about the various flags/states 
// There's definitely some "better safe than sorry" re-setting and if() here.
var roleWorker = {
	run: function(creep) {
		
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
			}
			
			findJob(creep);
		} else if (!creep.memory.harvesting && creep.memory.target != null && creep.memory.jobType != null) {
			performWork(creep);
		} else if (!creep.memory.harvesting) {
			console.error("Worker.js encountered unexpected combination of flags/states. No recovery...");
    }
};

module.exports = roleWorker;

