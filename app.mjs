/*
  It is convenient to use ECMAScript Modules in the browser so that we can easily
  refactor Javascript without rebuilding/repackaging, nor changing the .html.

  Alas, we need a server to do that, even if the server doesn't do anything active:
  1. CORS won't allow the browser to load paths (including module paths) though file: urls (only http(s): urls).
  2. The browser may require the source for a <script type="module"> to have a specific mime type 
     (such as text/javascript;goal=Module, but still under development...). Express static does the right
     thing for .mjs files.
 */
import express from 'express';
import path from 'path';
const app = express();
const port = 3001;

app.locals.rootDirectory = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(app.locals.rootDirectory, 'public')));
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
