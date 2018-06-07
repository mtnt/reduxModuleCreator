# Attention
The work is still in progress. Be careful to take it in your project - use exactly first downloaded version and store its documentation somewhere.

An interface and the docs can be changed without some notices until the lib will get a major version.

# Why?

Imagine that:
You have been making a project with redux. You already have many modules with reducers and selectors for it.
Suddenly, you decide extend the project and restructure the state. You will need a lot of refactor: reducers, selectors, connected components...
So, with this you don\`t have to - you\`ll need just replace `integrator` to a new place.

Redux state is a group of logically related data. It is a funnel with data, where each next level of depth store less knowledge relatively his parent. And when you need this data in a controller or a component or something else, you always need to know the path in the state to get this data... With this you don\`t. Redux-module linked with his "ownState" and has an API to subscribe to changes of it.

# How to use

## Create your module

It means you need to make a dependency between main reducer and main controller of a module:

```javascript
// SampleModule.js

import {createModule, RMCCtl} from "redux-module-creator";


class SampleCtl extends RMCCtl {
    // will be called only if the module relative part of state is changed
    _stateDidUpdate(prevOwnState) {
        // some reaction to state changes
        // use `this.ownState` to get access to current state
    }

    someSelector() {
        return this.ownState.some.path;
    }
}

function sampleReducer(state, action) {
    // some business logic
}

export default createModule(sampleReducer, SampleCtl);
```

## Integrate your module reducer into reducers tree wherever you want

```javascript
// Some reducer
import sampleModule from "SampleModule";


export default function reducerOfAnotherModule(state, action, outerPath) {
    return {
        sampleKey: sampleModule.integrator(outerPath + ".sampleKey")(state.sampleKey, action),
    };
};
```

`sampleModule.integrator(path)` returns the `sampleReducer`, you can call it like usually call a
reducer.
`sampleKey` is up to you, it can be simple or complex (at any depth in a reducers tree). But, it must be absolute (from a root of a state).

> NB: as you can see in the last example, it is possible to inject one module into another - you just need to keep a path valid.

## Link your store or create new one

Now you need to link a store with modules. You have two ways for it:

#### if you already have a store

And if you can\`t move this responsibility onto another side, you can just use

```javascript
import {linkStore} from "redux-module-creator"

linkStore(alreadyExistanceStore);
```

#### otherwise

If you do not want to do anything with the store before linking it. You can just do

```javascript
import {createStore} from "redux-module-creator"

const store = createStore(rootReducer, preloadedState, enhancer);
```

After linking the store all modules will see it and will be subscribed to changes of their part of state.

> NB: if you want to create new modules after having store linked, you need to unlink it with `unlinkStore()` and link it again.

## Get a module and use it

After that you can just call controller`s methods the module and use it.

```
import sampleModule from "SampleModule";

const someData = sampleModule.someSelector();
```

## That is it!

Now if you wanna change a place of the reducer in the reducers tree, you just move the `integrator` and change a path for it:

```
// Some reducer
import sampleModule from "SampleModule";


export default function reducer(state, action) {
    return {
        anotherKey: sampleModule.integrator("anotherKey")(state.anotherKey, action),
    };
};
```

Or, if you need some module\`s data, you don\`t need to use selectors:

```
// Some module
import sampleModule from "SampleModule";

sampleModule.getSomeOwnData();
```

# API reference

## createModule(reducer, CtlClass, actions) or createModule({reducer, actions, Ctl})
Create a module with the reducer and the controller
- `reducer` is a typically reducer, that will be injected into a store
- `actions` is optional map of modules own actions
  - key is an actionCreator name
  - value is a map `{creator: actionCreator, type: actionType}`
- `CtlClass` is a controller class for handling changed of the module`s own state. MUST be extended from RMCCtl.

Returns `module`:
#### integrator(path)
Integrate your module into reducers tree.
- `path` is a path to module\`s data in a state. It can be dot separated string like `some.module.path` or array of strings - `['some', 'module', 'path']`. It\`s important to pass full path (from a root).

#### actions
It\`s a map of actions.
You can dispatch an action by `module.actions.actionName(params)`.
And you can get the action type by `module.actions.actionName.type`.

>NB: Do not rely to equality of `module.actions.actionName.type` and the type you did pass into the actions map while creating a module. It can be different in module reusability purpose.

## RMCCtl
Base class for controller.

#### _stateDidUpdate(prevState)
Protected method of a controller for reactions to changes of the state.
Use `this.ownState` to get a current state.

#### _didLinkedWithStore()
Protected method that will be called after the controller get linked with a store (if exists).

#### _didUnlinkedWithStore()
Protected method that will be called after the controller get unlinked with a store (if exists).

#### subscribe(listener)
Subscribe to the own state changes.
- `listener` is a function that gets `prevState` and `currentState` parameters.

Returns `unsubscriber`. Call it when you no longer need to be subscribed for avoiding of memory leaks.

## combineReducers({path: Module, anotherPath: reducer})
Turns an object whose values are different reducing functions or modules into a single reducing function you can pass to createStore.

>For modules it will call the `module.integrator` function and pass the module `path` into the integrator result reducer as third param.

## createStore(reducer, preloadedState, enchancer)
Store creator. The arguments exactly as for redux.createStore.

## linkStore(store)
Links the store with created modules.
- `store` is result of `createStore` or `redux.createStore` call;


## unlinkStore() \[DEPRECATED\]
Breaks the links between a store and modules. Call it before `linkStore` when you need to create new module (you can\`t link a store twice in a line)

> Be careful - while a store is unlinked:
> * `ownState` is undefined
> * `module.actions.actionName()` cause an error
> * `_stateDidUpdate` and `listeners` doesn\`t reacts to a state changes

# Some subtleties
* you have access to a controller\`s methods on a module, but you can get access to the module\`s method from inside the controller\`s method
* you will get an error if you try to set whole `ownState` property, but you won\`t if you try to change a part of it: `ownState.foo = "bar"` (NB: you still can\`t change a part of `ownState` too, just without an error)
* when you get `ownState`, you always get a deep clone of it
