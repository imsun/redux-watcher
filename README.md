# redux-watcher

[![NPM version][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/redux-watcher.svg
[npm-url]: https://www.npmjs.com/package/redux-watcher
[travis-image]: https://img.shields.io/travis/imsun/redux-watcher/master.svg
[travis-url]: https://travis-ci.org/imsun/redux-watcher

redux-watcher is a small library that allows you to use Observer design pattern and watch the state changes of a [Redux](http://redux.js.org/) object. The lightweight library can be ported to most projects with minimum modification. Fllowing exmaples tell you how to use redux-watcher.

## Example

```js
import store from './store'
import ReduxWatcher from 'redux-watcher'

const watcher = new ReduxWatcher(store)
watcher.watch('user', logChange) // watch `store.getState().user`
watcher.watch(['user', 'name'], logChange) // watch `store.getState().user.name`

watcher.setCompareFunction('user', (a, b) => a === b) // use custom compare function

setTimeout(() => {
	watcher.off('user', logChange)
	watcher.off(['user', 'name'], logChange)
}, 5000)

function logChange({ store, selector, prevState, currentState, prevValue, currentValue }) {
	console.log(`${selector.join('.')} changed from ${prevValue} to ${currentValue}.`)
}

store.dispatch({
  type: 'SET_USER_NAME',
  name: 'Jack'
})
```

## Installation

```sh
npm i --save redux-watcher
```

You can include the script directly. (not recommended)

 ```html
 <script src="node_modules/redux-watcher/dist/redux-watcher.browser.min.js"></script>
 ```

Or import as a module:

```js
import ReduxWatcher from 'redux-watcher'
```

```js
const ReduxWatcher = require('redux-watcher')
```

## Usage

### ReduxWatcher(store)

Create a new watcher.

- `store`: [Redux Store](http://redux.js.org/docs/api/Store.html)

### ReduxWatcher.prototype.watch(selector, listener)

Watch the value of matching state.

- `selector`: An `Array` or `String` of the path to target state. e.g. `user` or `['user']` for `store.getState().user`; `['user', 'name']` for `store.getState().user.name`
- `listener`: A `Function` called when target state changes. An `Object` contains following properties will be passed as the parameter:
  - `store`: Redux Store which the watcher bound to.
  - `selector`: Same as the selector above.
  - `prevState`: Previous state before store updating.
  - `currentState`: Current state of store.
  - `prevValue`: Previous value of the target state before store updating.
  - `currentValue`: Current value of the target state.

**Note**: Value of state will be compared deeply.

### ReduxWatcher.prototype.off(selector, listener)

Stop watching the matching state.

- `selector`: The selector you watched before.
- `listener`: Listener for the selector.

### ReduxWatcher.select(state, selector) -> value

Return value of the state according to the selector.

- `state`: A state object.
- `selector`: Selector for the target.
- `value`: Value of the state.

### ReduxWatcher.prototype.setCompareFunction(selector, isEqual)

Use custom compare function.

- `selector`: The selector to use custom compare function.
- `isEqual`: A `Function` to determine if previous value equals to current value. Previous value and current value will be passed as the parameter.

### ReduxWatcher.prototype.clearCompareFunction(selector)

Remove custom compare function and use the default one(deep equal).

- `selector`: The selector to use default compare function.

## License

MIT
