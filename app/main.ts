import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as url from 'url';
import { IShootingRecord } from '../src/app/home/interfaces/IShootingRecord';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');


const ELEMENT_DATA: IShootingRecord[] = [
  {
    id: 1,
    saleDate: '05/02/2022',
    name: 'Γιάννης Στρατήρος',
    location: 'Ε\'ΜΚ',
    type: 'training',
    slugType: '9mm',
    quantity: 2,
    priceBought: 10,
    priceSold: 15,
    profitPerUnit: 0,
    profit: 0
  }, {
    id: 2,
    saleDate: '12/02/2022',
    name: 'Βαγγέλης Κατσαΐτης',
    location: 'Νάρρες',
    type: 'championship',
    slugType: '9mm',
    quantity: 3,
    priceBought: 11,
    priceSold: 15,
    profitPerUnit: 0,
    profit: 0
  }
];

function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
      // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    win.loadURL(url.format({
      pathname: path.join(__dirname, pathIndex),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

function createListeners() {
  ipcMain.on('get-items', async (event: any, data: any) => {
    event.returnValue = ELEMENT_DATA;
  });

  ipcMain.on('add-item', async (event: any, data: any) => {
    console.log(data)
    event.returnValue = 'ok';
  })
}


try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    createListeners();
    setTimeout(createWindow, 400);
  });


  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
