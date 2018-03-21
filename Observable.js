function Observable(subscribe) {
    this.subscribe = function (observer) {
        ['next', 'error', 'complete']
        .filter(key => !observer[key])
            .forEach(key => observer[key] = () => {})
        subscribe(observer)
    }
}
Observable.create = function (subscribe) {
    return new Observable(subscribe)
}


Observable.prototype.filter = function (project) {
    const $subscribe = this.subscribe
    return Observable.create(observer => {
        $subscribe({
            next: value => {
                if (project(value)) {
                    observer.next(value)
                }
            }
        })
    })
}

Observable.prototype.map = function (project) {
    const $subscribe = this.subscribe
    return Observable.create(observer => {
        $subscribe({
            next: value => observer.next(project(value))
        })
    })
}

Observable.prototype.delay = function (project) {
    const $subscribe = this.subscribe
    return Observable.create(observer => {
        $subscribe({
            next: value => {
                setTimeout(() => {
                    observer.next(value)
                }, project);
            }
        })
    })
}

// Observable.prototype.do = function (project) {
//     const $subscribe = this.subscribe
//     return Observable.create(observer => {
//         $subscribe({
//             next: value => {
//                 project(value)
//                 observer.next(value)
//             }
//         })
//     })
// }

function createOperator(name, createObserver) {
    Observable.prototype[name] = function (...params) {
        const $subscribe = this.subscribe
        return Observable.create(observer => {
            $subscribe(createObserver(observer, ...params))
        })
    }
}

createOperator('do', function (observer, cb) {
    return {
        next: value => {
            cb(value)
            observer.next(value)
        }
    }
})

Observable.create(observer => {
        new Array(20).fill(undefined).map((v, i) => i).forEach(observer.next)
    })
    .filter(x => x % 3 === 0)
    .do(console.log)
    .delay(2000)
    .do(console.log)
    .filter(x => x % 6 === 0)
    .map(x => x * 10)
    .subscribe({
        next: x => console.log('next', x)
    })
