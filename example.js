const rab = require('./')

document.body.innerHTML = `
  <input type="file" onchange="onfile(event)" />
`

Object.assign(global, {
  onfile(event) {
    const [ file ] = event.target.files
    const storage = rab(file)
    global.storage = storage

    storage.read(0, 4, console.log)
  }
})
