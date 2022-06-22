RMC is a tool for creating **not coupled**, **reusable** and **testable modules** based on Redux.  
Each module:
- is **linked with** its own part of **the store** and has an API to interact with it;
- encapsulates all **data logic inside**;
- can be fabricated into several **independent instances** with same but not equal actions;

It means that you:
- **no longer** need to **know a path** of data in the store - it is a module`s responsibility;
- **no longer** need to **mess around place for reducers, actions and selectors** - all of it inside a module;
- can use a **same module in different projects or platforms** - all logic inside;
- **can change the store data hierarchy** without troubles with refactoring each view that use it.

Removing path dependency:  
<img src="https://api.monosnap.com/file/download?id=zWmxHR7xat8rpuSS30Zi7k57nxxXy0" width="800" />
  
Yes, you still need to know where **data is**, but at only single place - **in the module** because it is its own responsibility.  
If you\`ll ever wish to **change** `me` or `users` **data structure** (see example above), you will need to change it **only in the module** because it is its own responsibility.

## Contents
- [FAQ](#faq)
    - [Could I use RMC modules with my existent code?](#could-i-use-rmc-modules-with-my-existent-code)
    - [Can I use one RMC module inside another one?](#can-i-use-one-rmc-module-inside-another-one)
- [Usage](#usage)
    - [Link your store or create new one](#link-your-store-or-create-new-one)
    - [Create a module](#create-a-module)
    - [Integrate your module reducer into reducers tree](#integrate-your-module-reducer-into-reducers-tree)
    - [Get the module and use it](#get-the-module-and-use-it)
- [Cook book](#cook-book)
    - [Using module action inside an own reducer](#using-module-action-inside-an-own-reducer)
    - [Using RMC on a server](#using-rmc-on-a-server)
    - [Using a cascade of modules](#using-a-cascade-of-modules)
- [API reference](#api-reference)
    - [createStore()](#createstorereducer-preloadedstate-enchancer)
    - [linkStore()](#linkstorestore)
    - [createModule()](#createmodule)
        - [integrator()](#integratorpath)
        - [actions](#actions)
    - [RMCCtl](#rmcctl)
        - [stateDidUpdate()](#statedidupdateprevstate)
        - [didLinkedWithStore()](#didlinkedwithstore)
        - [didUnlinkedWithStore()](#didunlinkedwithstore)
        - [subscribe()](#subscribelistener)
    - [combineReducers()](#combinereducerspath-module-anotherpath-reducer--rootpath)

## FAQ

### Could I use RMC modules with my existent code?

Sure! You can start to use RMC in your project at all or change it piece by piece or turn on RMC for some part of your project and do not for another at all.

### Can I use one RMC module inside another one?

Yes it`s possible. Since a redux data tree is a composition of logical dependent data, each level of depth could and probably should be represented as a separate module. So, you can combine that modules as you want, but be careful with making hard coupling - use dependency design patterns.  

## Usage

### Link your store or create new one

For making a reference between future modules and a store you need to link it. There are two ways for it:

#### if you already have a store...

...and if you can\`t move this responsibility onto another side, you can just use

```javascript
import { linkStore } from "redux-module-creator";

linkStore(alreadyExistanceStore);
```

#### otherwise

If you do not want to do anything with the store before linking it. You can just do

```javascript
import { createStore } from "redux-module-creator";

const store = createStore(rootReducer, preloadedState, enhancer);
```
> syntax the same with [https://redux.js.org/api/createstore] 

After linking the store all modules will see it and will be subscribed to changes of their own part of state.

> NB: you __MUST NOT__ call `createStore` or `linkStore` twice, the store can be linked only once

### Create a module

It means you need to make a dependency between main reducer and main controller of a module:

```javascript
// SampleModule.js

import {createModule, RMCCtl} from "redux-module-creator";

class MeCtl extends RMCCtl {
    // will be called only if the module relative part of state is changed
    stateDidUpdate(prevOwnState) {
        // some reaction to state changes
        // use `this.ownState` to get access to current state
    }

    getId = () => this.ownState.id;
    getName = () => this.ownState.data.name;
    getEmail = () => this.ownState.data.email;
}

const actions = {
  addFriend: {
    creator: userId => ({ payload: userId }),
    type: 'request to add a friend',
  },
  removeFriend: {
    creator: userId => ({ payload: userId }),
    type: 'request to remove a friend',
  },
};

function meReducer(state, action) {
    // you can use `this.actions` here because `this` refer to the module instance
    switch (action.type) {
      case this.addFriend.actionType:
        return {
          ...state,
          friends: [
            ...state.friends,
            action.payload,
          ],
        };
        
      case this.removeFriend.actionType:
        return {
          ...state,
          friends: without(state.friends, action.payload),
        }; 
      
      default:
        return state;
    }
}

export default createModule({ Ctl: MeCtl, reducer: meReducer, actions });
```

### Integrate your module`s reducer into reducers tree

```javascript
// Some reducer
import meModule from "meModule";
import usersModule from "usersModule";

export default function reducerOfAnotherModule(state, action, outerPath) {
    const meKey = 'meKey';
    const meFullPath = `${outerPath}.${meKey}`;
    
    const usersKey = 'usersKey';
    const usersFullPath = `${outerPath}.${usersKey}`;
  
    return {
        [meKey]: meModule.integrator(meFullPath)(state[meKey], action, meFullPath),
        [usersKey]: usersModule.integrator(usersFullPath)(state[usersKey], action, usersFullPath),
    };
};
```

`meModule.integrator(path)` returns the `meReducer`, you can call it like used to call a
reducer.  
`meKey` is up to you, it can be simple or complex (at any depth in a reducers tree). But, it must be absolute (from a root of the state).

> NB: as you can see in the last example, it is possible to inject one module into another - you just need to keep a path valid.

### Get the module and use it

After that you can just call controller`s methods the module and use it.

```
import meModule from "meModule";
import usersModule from "usersModule";

const myId = meModule.getId();
const myFriends = usersModule.getUserFriends(myId);

const meModule.addFriend(friendUserId);
```

## Cook Book

### Using module`s action inside an own reducer

It is used to use module\`s actions inside its own reducers. But in a module instance (module.actions) action has different types with origin:
```javascript
const addFriend = {
    type: "request to add a friend",
    payload: userId,
};

function reducer(state, action) {
    switch (action.type) {
        case addFriend.type:
            ...
    }
}

const actions = {
  addFriend: {
    creator: () => addFriend,
    type: addFriend.type
  }
};

const module = createModule({Ctl: CtlClass, reducer, actions});

// module.actions.addFriend.actionType !== "request to add a friend", it is something like "request to add a friend_module_instance_key"
```

So, for using module\`s actions you should get it directly from the module via `this`:
```
function reducer(state, action) {
    switch (action.type) {
        case this.addFriend.actionType:
        case this.actions.addFriend.actionType: // the both options is correct
            ...
    }
}
```

### Using RMC on a server

We used to recreate a store for each request at server side js. It is for preventing state sharing between separate requests.  
But RMC can not be linked twice, so what should we do? Just clear the store:
- make a unique action
- add to a root reducer handling that action
- reset state to initial values at the point

> NB: Make sure your server side code did not trying to create a store for each request. It frequently happens while developing in progress and hot module reload is active.

### Using a cascade of modules

Since an RMC module is a blackbox, you may want to use one module with it\`s own logic inside another one. In this case you\`ll still need to have access to actions of the top level module.  
For this purposes you should use `action proxy`:

```javascript

const storageActions = {
  // ...
    
  setItem: {
    creator: (key, value) => ({
      payload: {key, value},
    }),
    type: 'set item into a storage',
  },
    
  // ...
};
const options = {Ctl: StorageCtl, reducer, actions: storageActions};
const dataStorage = createModule(options);
const statusStorage = createModule(options);

class StorageWithStatusCtl extends RMCCtl {
  waitItem(key) {
    statusStorage.setItem(key, true);
  }
  
  setItem(key, value) {
    dataStorage.setItem(key, value);
  }
}

const storageWithStatus = createModule({
  Ctl: StorageWithStatusCtl,
  reducer: storageWithStatusReducer,
  actions: {
      itemIsWaiting: {proxy: statusStorage.removeItem},
      itemIsReady: {proxy: dataStorage.setItem},
  }
});
```
After that you can use actions of the `storageWithStatus` wherever you want as `storageWithStatus.itemIsWaiting`. But it still will be the `statusStorage.setItem` behind the curtain.    

This trick will help you hide an implementation and avoid redundant dependencies.

> NB: it is not a typo proxing `itemIsWaiting` to `removeItem`. It`s an abstraction - when an item is removed it is get waited.

## API reference

### createModule({ Ctl, ctlParams, reducer, actions })

Creates a module with the reducer and the controller
- `reducer` is a typically reducer, that will be injected into a store. If a reducer is typically function (not an arrow), it will be bind by the module.
- `actions` is a map of modules own actions
  - key is an actionCreator name
  - value is a map `{ type?: actionType, creator?: actionCreator }` or `{proxy: existingActionCreator (typically an action of another module)}`
- `Ctl` is a controller class for handling changed of the module`s own state. MUST be extended from RMCCtl.
- `ctlParams` is an array of the controller params

>NB: If a controller class has an own constructor, it`s your responsibility to pass basic ctl params through
> ```javascript
> // ...
> constructor(param0, param1, ...rest) {
>   super(...rest);
> }
> // ...
> ``` 

Returns `module`:
#### integrator(path)
Integrate your module into reducers tree.
- `path` is a path to module\`s data in a state. It can be dot separated string like `some.module.path` or array of strings - `['some', 'module', 'path']`. It\`s important to pass full path (from a root).  

>NB: In spite of a path may be a deeply nested array of strings like `[[[[['foo', 'bar'], 'baz']]]]` it\`s strongly recommended to keep it a string for performance purpose.  

#### actions
It\`s a map of actions.  
You can dispatch an action by `module.actionName(params)`.  
And you can get the action type by `module.actionName.actionType`.

As you can see, **it is possible to call actions as the module\`s methods**, however the actions still accessible at the `actions` path.  
If your controller has it`s own method or property with the same with an action name, it WILL NOT be overwritten.

>NB: DO NOT RELY to equality of `module.actionName.actionType` and the type you did pass into the actions map while creating a module. It is different in a module reusability purpose.

### RMCCtl
Base class for controller.

#### stateDidUpdate(prevState)
Protected method of a controller for reactions to changes of the state.
Use `this.ownState` to get a current state.

#### didLinkedWithStore()
Protected method that will be called after the controller get linked with a store (if exists).

#### didUnlinkedWithStore()
Protected method that will be called after the controller get unlinked with a store (if exists).

#### subscribe(listener)
Subscribe to the own state changes.
- `listener` is a function that gets `prevState` and `currentState` parameters.

Returns `unsubscriber`. Call it when you no longer need to be subscribed for avoiding of memory leaks.

### combineReducers({ path: Module, anotherPath: reducer } [, rootPath])
Turns an object whose values are different reducing functions or modules into a single reducing function you can pass to createStore.

>For modules it will call the `module.integrator` function and pass the module `path` into the integrator result reducer as third param.

### createStore(reducer, preloadedState, enchancer)
Store creator. The arguments exactly as for redux.createStore.

### linkStore(store)
Links the store with created modules.
- `store` is result of `createStore` or `redux.createStore` call;

## Some caveats
* you must be MUCH CAREFUL with operating `ownState` - it is a ref to a part of the state and changing it you change the state
* you will get an error if you try to set whole `ownState` property, but you have an ability to change a part of it: `ownState.foo = "bar"`
