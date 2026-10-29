set -e
node_modules/.bin/esbuild src/client.js --bundle --jsx=automatic --loader:.js=jsx --define:process.env.NODE_ENV='"production"' --outfile=dist/client.js --log-level=warning
node_modules/.bin/esbuild src/App.js --bundle --jsx=automatic --loader:.js=jsx --platform=node --format=esm --packages=external --outfile=dist/app-server.mjs --log-level=warning
