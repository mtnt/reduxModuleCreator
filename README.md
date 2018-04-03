# Why?

Imagine that:
You have been making a project with redux. You already have many modules with reducers and selectors for it.
Suddenly, you decide extend the project and restructure the state. You will need a lot of refactor: reducers, selectors, connected components...
So, with this you don\`t have to - you\`ll need just replace `integrator` to a new place.

Another problem:
You have a module and you want to reuse it in another project or maybe in a same project one more time (like an instance).
But, if you create the module with this, you woudn`t have the problem. (TBD)

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
