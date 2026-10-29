# Transition stuck after a throttled hydration retry

Minimal repro for [react/react#38029](https://github.com/react/react/issues/38029). Fix: [react/react#38030](https://github.com/react/react/pull/38030).

The server renders the app with `renderToString`. The client hydrates it, then:

1. Starts a transition that changes a context value read inside a dehydrated Suspense boundary. The boundary can't hydrate yet (its lazy child is pending), so the transition gives up hydrating it.
2. Re-renders the boundary's parent with an unrelated update.
3. Resolves the lazy child. The boundary hydrates in a retry, whose commit is throttled.
4. Before the throttle ends, resolves data the transition was waiting on.

Expected: the page shows `Hi` and `Sibling`. Actual: the transition never commits, and the page stays on `Hello` with no `Sibling`.

The steps need to land within React's 300ms retry throttle, so they run 2ms apart. With larger gaps (around 10ms or more) the bug usually doesn't show up.

## Run

```sh
npm install
npx playwright install chromium
npm start            # http://localhost:3200, in one terminal
npm run check        # in another: loads the page 10 times and counts stuck loads
```

The page title is `PASS` or `STUCK` once it settles, and the console logs the final HTML.

To try the fix, `npm run fix` applies the change from #38030 to the installed `react-dom` production build and rebuilds. `npm run unfix` reverts it. The server doesn't need a restart.

On `react-dom@19.3.0-canary-dc9aed36-20261027`, most runs had 9 or 10 of 10 loads stuck without the fix, and 0 of 10 with it. It's timing-sensitive, so an occasional run (often the first one after starting) has few or no stuck loads; run `npm run check` again. `node check.mjs 10 <ms>` changes the gap between steps.
