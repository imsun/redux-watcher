import isEqual from 'lodash/isEqual'
import isString from 'lodash/isString'

const select = (state, selector) => isString(selector) ? state[selector] : selector.reduce((prev, current) => prev[current], state)
export default class ReduxWatcher {
	constructor(store) {
		const watchList = this.__watchList = {}
		this.__prevState = store.getState()
		store.subscribe(() => {
			const currentState = store.getState()
			const prevState = this.__prevState
			Object.keys(watchList).forEach(key => {
				const listeners = watchList[key]
				if (!listeners) {
					return
				}
				const selector = JSON.parse(key)
				const prevValue = select(prevState, selector)
				const currentValue = select(currentState, selector)
				const isEqualFn = listeners.isEqual || isEqual

				if (!isEqualFn(prevValue, currentValue)) {
					listeners.forEach(listener => listener({
						store,
						selector,
						prevState,
						currentState,
						prevValue,
						currentValue
					}))
				}
			})
			this.__prevState = currentState
		})
		this.watch = this.watch.bind(this)
		this.off = this.off.bind(this)
	}
	watch(selector, listener) {
		const watchList = this.__watchList
		const selectorStr = JSON.stringify(selector)
		watchList[selectorStr] = watchList[selectorStr] || []
		watchList[selectorStr].push(listener)
	}
	off(selector, listener) {
		const watchList = this.__watchList
		const selectorStr = JSON.stringify(selector)
		if (!watchList[selectorStr]) {
			throw new Error(`No listener for ${selectorStr}`)
		}
		const listeners = watchList[selectorStr]
		const listenerIndex = listeners.indexOf(listener)
		if (listenerIndex >= 0) {
			listeners.splice(listeners.indexOf(listener), 1)
		} else {
			throw new Error(`No such listener for ${selectorStr}`)
		}
		if (listeners.length === 0) {
			delete watchList[selectorStr]
		}
	}
	setCompareFunction(selector, isEqual) {
		const selectorStr = JSON.stringify(selector)
		this.__watchList[selectorStr].isEqual = isEqual
	}
	clearCompareFunction(selector) {
		this.setCompareFunction(selector)
	}
}

ReduxWatcher.select = select
