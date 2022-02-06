const _ = require('lodash')

function find_all_free_sources() {
    return []
}

class EnergySourceManager {
    constructor(room) {
        this.room = room
        this.free = []
        this.used = []
    }

    update() {
        this.free = find_all_free_sources(room)
    }

    get_next() {
        const actually_free = this.free - this.used;
        return actually_free[0];
    }

    reserve(source) {
        this.used.push(source);
    }

    release(source) {
        const idx = this.used.findIndex(source)
        this.used.splice(idx, 1)
    }
}

module.exports = EnergySourceManager
