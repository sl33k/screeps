const _ = require('lodash')

function listSubtract(source, subtract, comp) {
        var diff = []
        for (const a of source) {
            var hasMatch = false
            for (const b of subtract) {
               if(comp(a,b)) {
                 hasMatch = true
                 break;
               }
            }
            if(!hasMatch)
                diff.push(a)
        }
        return diff;
}

function equalSpot(a, b) {
    return a.source == b.source && 
    a.position.x == b.position.x && 
    a.position.y == b.position.y && 
    a.position.roomName == b.position.roomName;
}

class EnergySourceManager {
    /**
     * @param {Room} room The room for which it manages the energy
     */
    constructor(room) {
        this.room = room;


    }

    /**
     * Updates the available harvest spots in the room
     */
    update() {
        const sources = this.room.find(FIND_SOURCES);
        var acc = [];
        for(const s of sources) {
            // console.log("updating for source " + s)
            const util = require('util')
            const harvest_positions = util.freePositionsAroundObject(s);
            // console.log("positions around: " + s + " are " + harvest_positions)
            const harvest_spots = _.map(harvest_positions, (p) => { return { source: s.id, position: p}})
            acc.push(...harvest_spots);
        }
        this.room.memory.free_harvest_spots = acc;
    }

    /**
     * @returns {EnergyHarvestSpot} The next free spot to harvest
     */
    get() {
        const free = this.room.memory.free_harvest_spots;
        if(free == null) {
            console.warning("can't get free harvest spot, update() has not been run yet")
            return;
        }
        if(this.room.memory.used_harvest_spots == null) {
            this.room.memory.used_harvest_spots = [];
        }
        const used = this.room.memory.used_harvest_spots;
        console.log("get(): free " + JSON.stringify(free))
        console.log("get(): used " + JSON.stringify(used))
        const actually_free = listSubtract(free, used, (a,b) => equalSpot(a,b) );
        console.log("get(): actually free: " + JSON.stringify(actually_free))
        if(actually_free.length == 0)
            return null;
        const pick = actually_free[0];
        console.log("get(): pick " + JSON.stringify(pick))
        this.room.memory.used_harvest_spots.push(pick)
        console.log("get(): updated used " + JSON.stringify(this.room.memory.used_harvest_spots))
        return pick
    }

    /**
     * @param {EnergyHarvestSpot} spot The spot to be released
     */
    release(spot) {
        _.remove(this.room.memory.used_harvest_spots, (s) => equalSpot(s, spot))
    }
}

module.exports = EnergySourceManager
