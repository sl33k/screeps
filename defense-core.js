
var defenseCore = {
	run: function(room) {

		const towers = room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				return (structure.structureType == STRUCTURE_TOWER);
			}
		});	
		
		for (const i in towers) {
			const tower = towers[i];
			
			const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if(closestHostile) {
				tower.attack(closestHostile);
			}	
		}
	}
}
module.exports = defenseCore;