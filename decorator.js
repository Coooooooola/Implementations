function compose(...args) {
    return function (obj, name, descriptor) {
        return args.map(arg => arg.bind(this, obj, name)).reduce((a, b) => desc => {
            const descB = b(desc) || desc
            if (descB !== desc) {
                Object.defineProperty(obj, name, descB)
            }
            const descA = a(descB) || descB
            if (descA !== descB) {
                Object.defineProperty(obj, name, descA)
            }
            return descA
        }, arg => arg)(descriptor)
    }
}

class A {
    @compose()
    hi() {

    }
}