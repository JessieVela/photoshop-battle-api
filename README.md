# photoshop-battle-api

| Npm Script | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `start`                   | Does the same as 'npm run serve'. Can be invoked with `npm start`                                 |
| `build`                   | Full build. Runs ALL build tasks (`build-sass`, `build-ts`, `lint`)       |
| `serve`                   | Runs node on `dist/server.js` which is the apps entry point                                       |
| `watch-node`              | Runs node with nodemon so the process restarts if it crashes. Used in the main watch task         |
| `watch`                   | Runs all watch tasks (TypeScript, Sass, Node). Use this if you're not touching static assets.     |                                                                        |
| `build-ts`                | Compiles all source `.ts` files to `.js` files in the `dist` folder                                 |
| `watch-ts`                | Same as `build-ts` but continuously watches `.ts` files and re-compiles when needed                |
| `lint`                    | Runs ESLint on project files                                                                       |                       |
| `debug`                   | Performs a full build and then serves the app in watch mode                                       |
| `serve-debug`             | Runs the app with the --inspect flag                                                               |
| `watch-debug`             | The same as `watch` but includes the --inspect flag so you can attach a debugger                   |
