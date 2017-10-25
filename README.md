# Introduction

If you don`t want to change a path to a reducer and path of data in a controller subscriber.  
If you want to reuse you business logic several times without any troubles.

You need this =)

# How to use

## Link your store or create new one

First of all you need to link a store with future controllers. You have two ways for it:

#### if you already have a store

And if you can\`t move this responsibility onto another side, you can just use
  
```
import {linkStore} from 'redux-module-creator`
 
 
// create a store and make something with it
 
linkStore(store);
```

#### otherwise

If you do not want to do anything with the store before linking it. You can just do  

```
import {createStore} from 'redux-module-creator`
 
 
const store = createStore();
```

After linking the store all newly created controllers will see it and will be subscribed to 
changes of their part of state.
 
## Create you module

It means you need to make a dependency between main reducer and main controller of a module:

```
// SampleModule.js
 
import {createModule, Ctl} from 'redux-module-creator';
 
 
class SampleCtl extends Ctl {
    // will be called only if the module relative part of state is changed 
    stateDidUpdate(prevState) {
        // some reaction to state changes
    }
}
 
function SampleReducer(state, action) {
    // some business logic
}
 
export default createModule(SampleReducer, SampleCtl);
```  
 
## Integrate your module reducer into reducers tree wherever you want

```
// Some reducer
import SampleModule from 'SampleModule';
 
 
export default function reducer(state, action) {
    return {
        sampleKey: SampleModule.integrator('sampleKey')(state.sampleKey, action),
    };
};
```

`SampleModule.integrator(path)` returns the `sampleReducer`, you can call it like usually call a 
reducer.  
`sampleKey` is up to you, it can be simple or complex (at any depth in a reducers tree);

## Get a controller and use it

After that you can just get a controller from the module and use it.

```
import SampleModule from 'SampleModule';
 
 
const sampleCtl = SampleModule.getController(); // return instance of SampleModule
 
sampleCtl.callSomeMethod();
```

## That is it!

Now if you wanna change a place of the reducer in the reducers tree, you just move the 
`integrator` and change a path for it:

```
// Some reducer
import SampleModule from 'SampleModule';
 
 
export default function reducer(state, action) {
    return {
        anotherKey: SampleModule.integrator('anotherKey')(state.anotherKey, action),
    };
};
```
