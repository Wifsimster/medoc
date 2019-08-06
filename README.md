# medoc

A JavaScript library that can simply detect, clean up and transfert tv show episodes from `a/` to `b/`.

You can add subtitles download with [Yquem](https://github.com/Wifsimster/yquem).

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Wifsimster/medoc/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/medoc.svg)](https://www.npmjs.com/package/medoc)
[![Install size](https://packagephobia.now.sh/badge?p=medoc)](https://packagephobia.now.sh/result?p=medoc)

## Features

- Detect episodes from a source directory;
- Episode file or directory must start with `{show}[ .?]S{season}E{episode}/`;
- Clean up to : `{show}/Season {season}/{show} {season}x{episode}.{format}`;
- Move clean up episode to a destination directory.

## Install

```
$ npm install medoc
```

## Usage

```js
const Medoc = require('medoc')

const PATH_TO_SCAN = `w:`
const PATH_TO_PUSH = `z:`

const medoc = new Medoc(PATH_TO_SCAN, PATH_TO_PUSH)

medoc
  .run()
  .then(results => {
    console.log(results)
  })
  .catch(err => {
    console.error(err)
  })
```

## Documentation

### Instance methods

#### run()

Detect tv show files from a specified directory, clean the filename, and transfert the file to a specified directory.

### Static methods

#### search([from], [to])

Search video files from a specified directory, get information from theirs filenames and return a list of `episode`.

- `from` `<string>` Path to scan for video files.
- `to` `<string>` Path where the video files will be transfered.

#### move([episode])

- `episode` `<object>` Object build from the filename of the file.

Transfert a video file.

#### createDirectory([path])

Create directory and subdirectories if necessary.

- `path` `<string>` Directory to create.

#### removePath([path])

Destroy directory or file.

- `path` `<string>` Directory or file to destroy.

#### isEpisode([filename])

Check if a filename is well formated, format : `/([sS]\d{2}[eE]\d{2})/`.

- `filename` `<string>` Filename, ie: `S01E01`.

#### hasFile([path])

Check if a directory contains video files.

- `path` `<string>` Directory to check.

#### getYear([filename])

Extract release year from the filename, format : `/([sS]\d{2}[eE]\d{2})/`.

- `filename` `<string>` Filename, ie: `Final.Space(2019).S01E01`.

#### getShowName([filename])

Extract show name from the filename.

- `filename` `<string>` Filename.

#### getEpisodeSeason([filename])

Extract season number from the filename.

- `filename` `<string>` Filename.

#### getEpisodeNumber([filename])

Extract episode number from the filename.

- `filename` `<string>` Filename.

#### getFile([path])

Return the path of a video file.

- `filename` `<string>` Filename.

#### getOriginDirectory([episode])

Return the origin directory for an episode.

- `episode` `<object>`.

#### getOriginPath([episode])

Return the complete origin path for an episode.

- `episode` `<object>`.

#### getODestinationDirectory([episode])

Return the destination directory for an episode.

- `episode` `<object>`.

#### getDestinationPath([episode])

Return the complete destination path for an episode.

- `episode` `<object>`.
