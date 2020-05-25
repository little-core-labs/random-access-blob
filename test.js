const crypto = require('crypto')
const Batch = require('batch')
const test = require('tape')
const rab = require('./')

test('RandomAccessBlob(blob[, opts])', (t) => {
  const bytes = crypto.randomBytes(32)
  const blob = new Blob([bytes])
  const storage = rab(blob)
  const batch = new Batch()

  for (let i = 0; i < bytes.length; ++i) {
    batch.push((next) => {
      storage.read(i, 1, (err, buf) => {
        t.error(err)
        t.ok(0 === Buffer.compare(bytes.slice(i, i + 1), buf))
        next(null)
      })
    })
  }

  batch.end(() => {
    t.end()
  })
})

test('RandomAccessBlob(blob[, opts]) - at offset', (t) => {
  const offset = 32
  const bytes = crypto.randomBytes(64)
  const blob = new Blob([bytes])
  const storage = rab(blob, { offset })
  const batch = new Batch()

  storage.stat((err, stats) => {
    t.error(err)

    for (let i = 0; i < stats.size; ++i) {
      batch.push((next) => {
        storage.read(i, 1, (err, buf) => {
          t.error(err)
          t.ok(0 === Buffer.compare(bytes.slice(i + offset, i + offset + 1), buf))
          next(null)
        })
      })
    }

    batch.end(() => {
      t.end()
    })
  })
})

test('RandomAccessBlob(blob[, opts]) - bad input', (t) => {
  const bytes = crypto.randomBytes(32)
  const blob = new Blob([bytes])

  t.throws(() => rab())
  t.throws(() => rab(null))
  t.throws(() => rab({}))
  t.throws(() => rab([]))
  t.throws(() => rab(blob, { offset: -1 }))

  t.end()
})

test('RandomAccessBlob(blob[, opts]) - out of range', (t) => {
  const bytes = crypto.randomBytes(32)
  const blob = new Blob([bytes])
  const storage = rab(blob)

  storage.read(bytes.length, 1, (err) => {
    t.ok(err)

    storage.read(-1, 1, (err) => {
      t.ok(err)
      storage.read(0, -1, (err) => {
        t.ok(err)
        t.end()
      })
    })
  })
})
