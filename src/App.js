import React, {Suspense, createContext, lazy, memo, useContext, useState} from 'react';

export const Context = createContext('Hello');

function Child() {
  return 'World';
}

// The server renders Child directly. The client swaps in a lazy version so the
// dehydrated boundary suspends when the client tries to hydrate it.
export const slots = {LazyChild: Child, LazySibling: () => <p>Sibling</p>};

function Text() {
  return <span>{useContext(Context)}</span>;
}

function ChildSlot() {
  const LazyChild = slots.LazyChild;
  return <LazyChild />;
}

const boundary = (
  <Suspense fallback="Loading...">
    <Text />
    <ChildSlot />
  </Suspense>
);

export const controls = {};

const Parent = memo(function Parent() {
  const [count, setCount] = useState(0);
  controls.setCount = setCount;
  return (
    <div id="parent">
      {count}
      {boundary}
    </div>
  );
});

export function App({text}) {
  const LazySibling = slots.LazySibling;
  return (
    <Context.Provider value={text}>
      <Parent />
      {text === 'Hello' ? null : (
        <Suspense fallback={null}>
          <LazySibling />
        </Suspense>
      )}
    </Context.Provider>
  );
}

export {Child};
