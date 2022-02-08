class JobAtSite {
    constructor(target,spot,type,priority) {
        this.targetId = target
        this.spot = spot
        this.type = type
        this.prio = priority
    }
}

class JobQueue {
    constructor(room) {
        this.room = room
        this.room.memory.open_jobs = []
        this.room.memory.active_jobs = []
    }

     give_muh_a_job() {
        // TODO: implement, deletes job out of the queue and puts it into active jobs
        return job;
    }

    finish_job(job) {
        // removes a job from the active_jobs
    }
}

const priority_baseline = {
    CONSTRUCTION_SITE_EXTENSION: 2800,
    ...
}

// all constructions are between prio 2000-3000
// all upgrading is between 1000-2000
//

function give_me_priority(target, spot, room, open_jobs, active_jobs, ...) {
    return some_priority
}

function find_all_jobs_in_room(room) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            for(t of target) {
                var priorty = priority_baseline[t.type]
                priority += t.maxWorkers - t.actualWorkers

            }


    }

class JobCreator {
    constructor(room) {
        this.room = room
    }
    update() {
        // finds all available jobs
        const all_jobs = find_all_jobs_in_room(this.room) // creates job + target tuples
        this.room.memory.open_jobs = all_jobs.without(this.room.memory.get_active_jobs())
        for(job of new_jobs) {
            this.room.memory.open_jobs.push(job);
        }
    }
}


