random-access-blob
==================

> A [random access storage][ras] interface for [Blob][blob] instances (like [File][file]).

## Installation

```sh
$ npm install random-access-blob
```

## Usage

```js
const rab = require('random-access-blob')
const blob = new Blob([ someTypedArray ])
const storage = rab(blob)

storage.read(0, 4, (err, buf) => {
  // handle 4 byte buffer
})
```

## API

### `storage = require('random-access-blob')(blob[, options])`

Create a `RandomAccessBlob` instance from a `blob` that is "readable"
and "statable". `options` can be:

```js
{
  offset: 0, // An optional offset to start reading from in the Blob
}
```

#### `storage.read(offset, length, callback)`

Read a buffer from the storage.

#### `storage.stat(callback)`

Stat the storage to get the blob size.

## License

MIT

[blob]: https://developer.mozilla.org/en-US/docs/Web/API/Blob
[file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[ras]: https://github.com/random-access-storage/random-access-storage
