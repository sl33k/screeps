const _ = require('lodash')
const util = require('util')

class EnergyHarvestSpot {
    constructor(source, harvest_position) {
        this.source = source
        this.harvest_position = harvest_position
    }
    /**
     * Test equality
     * @returns {boolean} Whether or not its equal.
     */
    is_equal(other) {
        return this.source == other.source && this.harvest_position == other.harvest_position;
    }
}


class EnergySourceManager {
    /**
     * @param {Room} room The room for which it manages the energy
     */
    constructor(room) {
        this.room = room
        this.free = []
        this.used = []
    }

    /**
     * Updates the available harvest spots in the room
     */
    update() {
        const sources = this.room.find(FIND_SOURCES);
        var acc = [];
        for(const s in sources) {
            const harvest_positions = _.map(s, util.freePositionsAroundObject)
            const harvest_spots = _.map(harvest_positions, (p) => new EnergyHarvestSpot(s, p))
            acc.push(...harvest_spots);
        }
        this.free = acc;
    }

    /**
     * @returns {EnergyHarvestSpot} The next free spot to harvest
     */
    get() {
        const actually_free = _.differenceWith(this.free, this.used, (a, b) => a.is_equal(b))
        if(actually_free.length == 0)
            return null;
        const pick = actually_free[0];
        this.used.push(pick)
        return pick
    }

    /**
     * @param {EnergyHarvestSpot} spot The spot to be released
     */
    release(spot) {
        _.pullAllWith(this.used, spot, (a, b) => a.is_equal(b))
    }
}

module.exports = EnergySourceManager
