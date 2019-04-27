# medoc

A JavaScript library that can simply detect, clean up and transfert tv show episodes from `a/` to `b/`.

You can add subtitles download with [Yquem](https://github.com/Wifsimster/yquem).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Wifsimster/medoc/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/medoc.svg)](https://www.npmjs.com/package/medoc)

**Core Features**

- Detect episode directories from a source directory
- Episode directories must start with `{show}[ .?]S{season}E{episode}/`;
- Clean up to : `{show}/Season {season}/{show} {season}x{episode}.{format}`;
- Move clean up episode directories to a destination directory.

**Quick start**

```javascript
npm install medoc
```

```javascript
const Medoc = require("medoc")

const PATH_TO_SCAN = `w:`
const PATH_TO_PUSH = `z:`

Medoc.run(PATH_TO_SCAN, PATH_TO_PUSH)
```

That's all :)
