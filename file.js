/* global Blob, FileReader */
const { BLOB_MISSING_ERR, OFFSET_RANGE_ERR, RandomAccessBlob } = require('./')

/**
 * An `Error` thrown when an error occurs during a `FileReader` operation.
 * @protected
 */
class FILE_READER_ERR extends Error {
  constructor(event) {
    super()
    this.event = event
  }

  get name() { return this.constructor.name }
  get code() { return this.constructor.name }
  get message() { return 'An error occured during a FileReader operation.' }
  set message(_) { }
}

/**
 * The `RandomAccessBlobFile` class extends the `RandomAccessBlob` to use the
 * `FileReader` API to read bytes from a `File` blob.
 * @public
 * @class RandomAccessBlobFile
 * @extends RandomAccessBlob
 */
class RandomAccessBlobFile extends RandomAccessBlob {

  /**
   * Overloads `_read()` for `RandomAccessBlob` by using a `FileReader`
   * to read bytes instead of a blob's array buffer.
   * @protected
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

    const reader = new FileReader()

    Object.assign(reader, {
      onload() {
        req.callback(null, Buffer.from(reader.result))
      },

      onerror(event) {
        reader.abort()
        req.callback(new FILE_READER_ERR(event))
      }
    })

    reader.readAsArrayBuffer(blob.slice(start, end))
  }
}

/**
 * `RandomAccessBlobFile` factory constructor.
 * @public
 * @default
 * @param {File}
 * @param {?(Object)} opts
 * @return {RandomAccessBlobFile}
 * @throws RangeError
 * @throws Error
 */
function createRandomAccessBlobFile(file, opts) {
  return new RandomAccessBlobFile(file, opts)
}

/**
 * Module exports.
 */
module.exports = Object.assign(createRandomAccessBlobFile, {
  FILE_READER_ERR,
  RandomAccessBlobFile
})
