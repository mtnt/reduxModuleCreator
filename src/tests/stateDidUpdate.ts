import { RMCCtl } from '../';

type State = {
  prop: string;
};

class TestOk0 extends RMCCtl<State, {}> {
  // it`s ok
  protected stateDidUpdate = (prevState: State) => {};
}
class TestOk1 extends RMCCtl<State, {}> {
  // it`s ok
  protected stateDidUpdate = () => {};
}

class TestFail0 extends RMCCtl<State, {}> {
  // @ts-expect-error function with wrong type
  protected stateDidUpdate = (prevState: string) => {};
}
class TestFail1 extends RMCCtl<State, {}> {
  // @ts-expect-error function with wrong type
  protected stateDidUpdate = (prevState: State, some: string) => {};
}
class TestFail2 extends RMCCtl<State, {}> {
  // @ts-expect-error not function
  protected stateDidUpdate = false;
}
class TestFail3 extends RMCCtl<State, {}> {
  // @ts-expect-error not function
  protected stateDidUpdate = {};
}
