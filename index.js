/* global Blob */
const RandomAccessStorage = require('random-access-storage')

/**
 * An `Error` thrown when an expected `Blob` instance is not
 * found on the `RandomAccessBlob` instance.
 * @private
 */
class BLOB_MISSING_ERR extends Error {
  get name() { return this.constructor.name }
  get code() { return this.constructor.name }
  get message() { return 'Missing blob in storage.' }
  set message(_) { }
}

/**
 * A `RangeError` thrown when an offset is out of range.
 * @private
 */
class OFFSET_RANGE_ERR extends RangeError {
  get name() { return this.constructor.name }
  get code() { return this.constructor.name }
  get message() { return 'Offset out of range.' }
  set message(_) { }
}

/**
 * The `RandomAccessBlob` class is a read only `RandomAccessStorage` interface
 * for reading bytes from a `Blob` instance.
 * @public
 * @class RandomAccessBlob
 * @extends RandomAccessStorage
 */
class RandomAccessBlob extends RandomAccessStorage {

  /**
   * `RandomAccessBlob` class constructor.
   * @constructor
   * @param {Blob} blob
   * @param {?(Object)} opts
   * @throws RangeError
   * @throws Error
   */
  constructor(blob, opts) {
    if (false === blob instanceof Blob) {
      throw new BLOB_MISSING_ERR()
    }

    if (!opts || 'object' !== typeof opts) {
      opts = {}
    }

    super()

    this.blob = blob
    this.offset = opts.offset || 0

    if (this.offset < 0) {
      throw new OFFSET_RANGE_ERR()
    }
  }

  /**
   * Implements a `stat()` function for a `RandomAccessStorage` instance
   * resolving the size of the `Blob`.
   * @protected
   */
  _stat(req) {
    const { offset = 0, blob } = this
    const size = blob ? blob.size - offset : 0
    req.callback(null, { size })
  }

  /**
   * Implements a `read()` function for a `RandomAccessStorage` instance
   * reading a slice of bytes from the `Blob`.
   * @protected
   * @throws RangeError
   * @throws Error
   */
  _read(req) {
    const { offset = 0, blob } = this
    const start = offset + req.offset
    const end = start + req.size

    if (!blob) {
      req.callback(new BLOB_MISSING_ERR())
      return
    }

    if (start + end < 0 || start < 0 || start > blob.size || end > blob.size) {
      req.callback(new OFFSET_RANGE_ERR())
      return
    }

    try {
      blob.slice(start, end).arrayBuffer()
        .then((arrayBuffer) => Buffer.from(arrayBuffer))
        .then((buffer) => req.callback(null, buffer))
        .catch((err) => req.callback(err))
    } catch (err) {
      req.callback(err)
    }
  }
}

/**
 * `RandomAccessBlob` factory constructor.
 * @public
 * @default
 * @param {Blob} blob
 * @param {?(Object)} opts
 * @return {RandomAccessBlob}
 */
function createRandomAccessBlob(blob, opts) {
  return new RandomAccessBlob(blob, opts)
}

/**
 * Module exports.
 */
module.exports = Object.assign(createRandomAccessBlob, {
  RandomAccessBlob
})
