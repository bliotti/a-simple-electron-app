const electron = require('electron')
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron

// SET ENV
process.env.NODE_ENV = 'prod'

let mainWindow
let addWindow

// Listen for app to be ready
app.on('ready', () => {
  mainWindow = new BrowserWindow({})
  //Load HTML into the window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  //Quit app when closed
  mainWindow.on('closed', () => {
    app.quit()
  })

  //build menu from temolate
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  // Insert Menu
  Menu.setApplicationMenu(mainMenu)
})

// Handle create add window
const createAddWindow = () => {
  addWindow = new BrowserWindow({
    width: 500,
    height: 400,
    title: 'Add Shopping List Item'
  })
  //Load HTML into the window
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  )
  //garbage collection handle
  addWindow.on('close', () => {
    addWindow = null
  })
}

//catch item:add
ipcMain.on('item:add', (e, item) => {
  mainWindow.webContents.send('item:add', item)
  addWindow.close()
})

// menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        accelerator: process.platform == 'darwin' ? 'Command+A' : 'Ctrl+A',
        click() {
          createAddWindow()
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  }
]

// If mac add empty {} to Menu

if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({ label: 'Empty' })
}

// add dev tools if in dev env
if (process.env.NODE_ENV !== 'prod') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
