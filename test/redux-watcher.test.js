const chai = require('chai')
const should = require('chai').should()
const { createStore } = require('redux')
const ReduxWatcher = require('../dist/redux-watcher')
const { select } = require('../dist/redux-watcher')

const initialState = {
	name: {
		first: 'Initial',
		last: 'Name'
	},
	followees: []
}

const nameSelector = ['name']
const firstNameSelector = ['name', 'first']
const followeesSelector = ['followees']

function user(state = initialState, action) {
	switch (action.type) {
		case 'SET_NAME':
			const [first, last] = action.name.split(' ')
			return Object.assign({}, state, {
				name: { first, last }
			})
		case 'FOLLOW':
			return Object.assign({}, state, {
				followees: state.followees.concat([action.user])
			})
		default:
			return state
	}
}

const store = createStore(user)
const watcher = new ReduxWatcher(store)
let prevState = store.getState()
let nameListenerCounter = 3
let uncalledNameListenerCounter = nameListenerCounter
let nameListenerResolve
let followeesListenerResolve
let deeplyEqualTest = false
let isWatchingName = true
let isWatchingAnotherName = true
let isWatchingFirstName = true
let isWatchingFollowees = true

function checkData(selector, data) {
	data.store.should.equal(store)
	data.selector.should.deep.equal(selector)
	data.prevState.should.equal(prevState)
	data.currentState.should.equal(store.getState())
	data.prevValue.should.equal(select(prevState, selector))
	data.currentValue.should.equal(select(store.getState(), selector))
}

function checkName(selector, data) {
	checkData(selector, data)
	
	uncalledNameListenerCounter--
	if (uncalledNameListenerCounter === 0) {
		uncalledNameListenerCounter = nameListenerCounter
		nameListenerResolve && nameListenerResolve()
	}
}

function nameListener(data) {
	isWatchingName.should.be.true
	deeplyEqualTest.should.be.false
	checkName(nameSelector, data)
}

function anotherNameListener(data) {
	isWatchingAnotherName.should.be.true
	deeplyEqualTest.should.be.false
	checkName(nameSelector, data)
}

function firstNameListener(data) {
	isWatchingFirstName.should.be.true
	deeplyEqualTest.should.be.false
	checkName(firstNameSelector, data)
}

function followeesListener(data) {
	isWatchingFollowees.should.be.true
	checkData(followeesSelector, data)
	followeesListenerResolve()
}

watcher.watch(nameSelector, nameListener)
watcher.watch(nameSelector, anotherNameListener)
watcher.watch(firstNameSelector, firstNameListener)
watcher.watch(followeesSelector, followeesListener)

describe('ReduxWatcher.select', () => {
	it('should select matching value with a selector', () => {
		select(initialState, ['name', 'first']).should.equal('Initial')
	})
})

new Promise(resolve => {
	nameListenerResolve = resolve
	describe('ReduxWatcher.prototype.watch', () => {
		it('should watch changes of an Object / String', () => {
			store.dispatch({
				type: 'SET_NAME',
				name: 'Foo Bar'
			})
		})
	})
})
	.then(() => new Promise(resolve => {
		prevState = store.getState()
		followeesListenerResolve = resolve
		describe('ReduxWatcher.prototype.watch', () => {
			it('should watch changes of an Array', () => {
				store.dispatch({
					type: 'FOLLOW',
					user: {
						name: {
							first: '',
							last: ''
						},
						followees: []
					}
				})
			})
		})
	}))
	.then(() => new Promise(resolve => {
		deeplyEqualTest = true
		describe('ReduxWatcher.prototype.watch', () => {
			it('shouldn\'t call listeners when value of state is not change', () => {
				store.dispatch({
					type: 'SET_NAME',
					name: 'Foo Bar'
				})
				resolve()
			})
		})
	}))
	.then(() => new Promise(resolve => {
		nameListenerResolve = resolve
		deeplyEqualTest = false
		isWatchingName = false
		nameListenerCounter = uncalledNameListenerCounter = 2
		watcher.off(nameSelector, nameListener)
		prevState = store.getState()
		describe('ReduxWatcher.prototype.off', () => {
			it('shouldn\'t call the removed listener', () => {
				store.dispatch({
					type: 'SET_NAME',
					name: 'foo bar'
				})
			})
		})
	}))
	.then(() => new Promise(resolve => {
		describe('ReduxWatcher.prototype.off', () => {
			it('should throw an Error when listener was removed', () => {
				(() => watcher.off(nameSelector, nameListener))
					.should.throw(/No such listener/)
				resolve()
			})
		})
	}))
	.then(() => new Promise(resolve => {
		isWatchingAnotherName = false
		watcher.off(nameSelector, anotherNameListener)
		nameListenerCounter = uncalledNameListenerCounter = 1
		describe('ReduxWatcher.prototype.off', () => {
			it('should throw an Error when no listener exists', () => {
				(() => watcher.off(nameSelector, nameListener))
					.should.throw(/No listener/)
			})
		})
	}))