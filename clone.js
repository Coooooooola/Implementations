function clone(target) {
	const map = new Map()
	const objPrototype = Object.getPrototypeOf({})
	const arrPrototype = Object.getPrototypeOf([])
	const funcPrototype = Object.getPrototypeOf(function () {})
	map.set(objPrototype, objPrototype)
	map.set(arrPrototype, arrPrototype)
	map.set(funcPrototype, funcPrototype)

	function _clone(target, map) {
		if (target == null || typeof target !== 'object' && typeof target !== 'function') {
			return target
		}
		if (map.has(target)) {
			return map.get(target)
		}
		const ret = Array.isArray(target)
			? []
			: typeof target === 'function'
				? function () {target.apply(this, arguments)}
				: {}
		map.set(target, ret)

		Object.setPrototypeOf(ret, _clone(Object.getPrototypeOf(target), map))
		Object.keys(target).forEach(key => {
			ret[key] = _clone(target[key], map)
		})
		return ret
	}
	return _clone(target, map)
}


var pa = {parent: 'i am parent'}
var a = {hi: 23333, arr: [2,4,5], func: function (...args) {console.log(args)}, oh: null, un: undefined}
var b = {val: 'abc'}
a.b = b
b.a = a
a.arr.push(b)
a.func.oooops = 'oooops!!!'
Object.setPrototypeOf(a, pa)
Object.setPrototypeOf(a.arr, {})

var c = clone(a)
console.log(c.b === b, c.b.a === a)
