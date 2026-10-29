import {readFileSync, writeFileSync, existsSync, copyFileSync} from 'node:fs';

const file = 'node_modules/react-dom/cjs/react-dom-client.production.js';
const backup = file + '.orig';
if (!existsSync(backup)) copyFileSync(file, backup);
if (process.argv[2] === 'revert') {
  copyFileSync(backup, file);
  console.log('reverted');
  process.exit(0);
}

let src = readFileSync(backup, 'utf8');
const replace = (from, to) => {
  if (src.split(from).length !== 2) throw new Error('expected one match: ' + from);
  src = src.replace(from, to);
};
replace(
  `            SelectiveHydrationException)
          );
        renderDidSuspendDelayIfPossible();`,
  `            SelectiveHydrationException)
          );
        pingSuspendedRetryLanes(current.lanes);
        renderDidSuspendDelayIfPossible();`,
);
replace(
  `    isSuspenseInstancePending(suspenseInstance) ||
      renderDidSuspendDelayIfPossible();`,
  `    isSuspenseInstancePending(suspenseInstance) ||
      (pingSuspendedRetryLanes(current.lanes),
      renderDidSuspendDelayIfPossible());`,
);
replace(
  `function renderDidSuspendDelayIfPossible() {`,
  `function pingSuspendedRetryLanes(lanes) {
  var root = workInProgressRoot;
  null !== root &&
    ((lanes = lanes & 62914560 & root.suspendedLanes),
    0 !== lanes &&
      ((root.pingedLanes |= root.suspendedLanes & lanes),
      (root.warmLanes &= ~lanes)));
}
function renderDidSuspendDelayIfPossible() {`,
);
writeFileSync(file, src);
console.log('patched');
