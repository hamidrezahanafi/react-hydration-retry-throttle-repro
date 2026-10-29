import React, {lazy, startTransition} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {App, Child, controls, slots} from './App';

const deferred = () => {
  let resolve;
  const promise = new Promise(r => (resolve = r));
  return {promise, resolve};
};
const child = deferred();
const sibling = deferred();
slots.LazyChild = lazy(() => child.promise.then(() => ({default: Child})));
slots.LazySibling = lazy(() =>
  sibling.promise.then(() => ({default: () => <p>Sibling</p>})),
);

const STEP = Number(new URLSearchParams(location.search).get('step') ?? 2);
const wait = ms => new Promise(r => setTimeout(r, ms));
const container = document.getElementById('root');
const span = container.querySelector('span');

const run = async () => {
  const root = hydrateRoot(container, <App text="Hello" />);
  await wait(STEP);

  // The context change reaches the dehydrated boundary, which can't hydrate
  // yet, so the transition gives up hydrating it.
  startTransition(() => root.render(<App text="Hi" />));
  await wait(STEP);

  // An unrelated update re-renders the boundary's parent.
  controls.setCount(1);
  await wait(STEP);

  // The boundary hydrates in a retry, and React throttles its commit (300ms).
  child.resolve();
  await wait(STEP);

  // Within the throttle window, the transition is pinged by other data.
  sibling.resolve();
  await wait(2000);

  const ok =
    container.querySelector('span') === span &&
    span.textContent === 'Hi' &&
    container.querySelector('p')?.textContent === 'Sibling';
  document.title = ok ? 'PASS' : 'STUCK';
  console.log(document.title, container.innerHTML);
};
run();
