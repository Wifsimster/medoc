# medoc

A JavaScript library that can simply detect, clean up and transfert tv show episodes from `a/` to `b/`.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Wifsimster/medoc/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/medoc.svg)](https://www.npmjs.com/package/medoc)

**Core Features**

- Detect episode directories from a source directory, episode directories must respect this regex `/([sS]\d{2}[eE]\d{2})/g`;
- Clean up the valid episode directories to this format : `[tv-show]\Season [seasonNumber]\[tv-show] [seasonNumber]x[episodeNumber].[format]`;
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
