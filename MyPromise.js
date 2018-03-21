const MyPromise = (function () {
    const MyPromise = function (resolver) {
        if (typeof resolver !== 'function') {
            throw new Error('resolver must be a function.')
        }

        const handlers = []
        let state = 'pending'
        const promise = this
        Object.defineProperty(promise, 'state', { get: () => state })

        let empty = true
        promise.then = function (onResolve, onReject) {
            empty = false
            return new MyPromise((res, rej) => {
                const handler = () => {
                    setTimeout(() => {
                        if (state === 'fulfilled') {
                            res(typeof onResolve === 'function' ? onResolve(promise.value) : promise.value)
                        } else {
                            if (typeof onReject === 'function') {
                                res(onReject(promise.reason))
                            } else {
                                rej(promise.reason)
                            }
                        }
                    })
                }
                if (state === 'pending') {
                    handlers.push(handler)
                } else {
                    handler()
                }
            })
        }
        promise.catch = function (onReject) {
            empty = false
            return new MyPromise((res, rej) => {
                const handler = () => {
                    setTimeout(() => {
                        if (state === 'fulfilled') {
                            res(promise.value)
                        } else {
                            if (typeof onReject === 'function') {
                                res(onReject(promise.reason))
                            } else {
                                rej(promise.reason)
                            }
                        }
                    })
                }
                if (state === 'pending') {
                    handlers.push(handler)
                } else {
                    handler()
                }
            })
        }

        let confirm = false
        const resolve = function (value) {
            if (!confirm) {
                confirm = true
                const trigger = val => {
                    state = 'fulfilled'
                    Object.defineProperty(promise, 'value', { get: () => val })
                    handlers.forEach(handler => { handler() })
                }
                if (value instanceof MyPromise) {
                    value.then(val => { trigger(val) })
                } else {
                    trigger(value)
                }
            }
        }
        const reject = function (reason) {
            if (!confirm) {
                confirm = true
                const trigger = rea => {
                    state = 'rejected'
                    Object.defineProperty(promise, 'reason', { get: () => rea })
                    if (handlers.length === 0) {
                        setTimeout(() => {
                            if (empty) {
                                throw new Error('Uncaught (in promise)')
                            }
                        })
                    }
                    handlers.forEach(handler => { handler() })
                }
                if (reason instanceof MyPromise) {
                    reason.then(rea => { trigger(rea) })
                } else {
                    trigger(reason)
                }
            }
        }
        resolver(resolve, reject)
    }
    MyPromise.resolve = function (value) {
        if (value instanceof MyPromise) {
            return value
        } else {
            return new MyPromise(res => { res(value) })
        }
    }
    MyPromise.reject = function (reason) {
        return new MyPromise((res, rej) => { rej(reason) })
    }
    MyPromise.all = function (iterable) {
        return new MyPromise((res, rej) => {
            if (!(iterable instanceof Array)) {
                rej()
                throw new Error("TypeError: Cannot read property 'Symbol(Symbol.iterator)' of undefined")
            }
            const results = new Array(iterable.length)
            let calculated = 0
            const pushResult = (index, value) => {
                calculated++
                results[index] = value
                if (calculated === iterable.length) {
                    res(results)
                }
            }
            iterable.forEach((value, index) => {
                if (value instanceof MyPromise) {
                    value.then(val => {
                        pushResult(index, val)
                    })
                } else {
                    pushResult(index, value)
                }
            })
            if (iterable.length === 0) {
                pushResult()
            }
        })

    }
    MyPromise.race = function (iterable) {
        return new MyPromise((res, rej) => {
            if (!(iterable instanceof Array)) {
                rej()
                throw new Error("TypeError: Cannot read property 'Symbol(Symbol.iterator)' of undefined")
            }
            for (let i = 0; i < iterable.length; i++) {
                if (iterable[i] instanceof MyPromise) {
                    iterable[i].then(value => res(value))
                } else {
                    setTimeout(() => {
                        res(iterable[i])
                    })
                    break
                }
            }
        })
    }

    return MyPromise
})()

// MyPromise.reject(MyPromise.resolve(3333)).catch(() => {})

new MyPromise(resolve => {
    resolve(1)
    MyPromise.resolve().then(() => console.log(2))
    console.log(4)
}).then(t => console.log(t))
console.log(3)



// MyPromise.all([new MyPromise(res => setTimeout(() => {res(11111)}, 1000)), MyPromise.resolve(299), MyPromise.resolve(424), 3, 1, 4]).then(x => console.log(x))
// MyPromise.race([new MyPromise(res => setTimeout(() => res(434), 100)), MyPromise.resolve(29), 2, 4, 1]).then(x => console.log(x))


// const p = new MyPromise((resolve, reject) => {
//     console.log('inside MyPromise')
//     // reject('.....meow')
//     resolve(
//         new MyPromise(
//             res => res(
//                 MyPromise.resolve(
//                     MyPromise.resolve(777)
//                 )
//             )
//         )
//     )
// })
// .then(value => {
//     console.log('then', value)
//     return 'yeah'
// })
// .catch(reason => {
//     console.log('catch', reason)
//     return '23333 haha'
// })
// .then(val => {
//     console.log('after catch', val)
// })

// MyPromise.resolve(MyPromise.reject(241)).then(v => {console.log(v)}).catch(r => console.log('r', r))





