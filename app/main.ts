import { app, BrowserWindow, ipcMain, Menu, screen } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import * as url from 'url';

let win: BrowserWindow = null;


const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

let db: sqlite3.Database;

const create_sql = 'INSERT INTO shootingRecords (saleDate, location, type, shooter_id, caliber, quantityType, quantity, priceBought, priceSold, profitPerUnit, profit) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
const update_sql = 'UPDATE shootingRecords set saleDate=?, location=?, type=?, shooter_id=?, caliber=?, quantityType=?, quantity=?, priceBought=?, priceSold=?, profitPerUnit=?, profit=? WHERE id=?'
const delete_sql = 'DELETE from shootingRecords where id=?'

const create_vault_record_sql = 'Insert into vaultRecords (supplierName, caliber, quantityType, quantity, licenceNo, purchaseDate) VALUES(?,?,?,?,?,?)'
const update_vault_record_sql = 'UPDATE vaultRecords set supplierName=?, caliber=?, quantityType=?, quantity=?, licenceNo=?, purchaseDate=? where id=?'
const delete_vault_record_sql = 'DELETE from vaultRecords where id=?'

const create_shooter_sql = 'INSERT INTO shooters (name, dai) VALUES (?, ?) '
const update_shooter_sql = 'UPDATE shooters set name=?, dai=? WHERE id=?'
const delete_shooter_sql = 'DELETE from shooters where id=?'


function createWindow(): BrowserWindow {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 100,
    y: 100,
    width: 1500,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run e2e test with Spectron
    },
  });

  win.webContents.on('did-start-loading', () => {
    win.setProgressBar(2, { mode: 'indeterminate' }) // second parameter optional
  });

  win.webContents.on('did-stop-loading', () => {
    win.setProgressBar(-1);
  });

  Menu.setApplicationMenu(null);

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
    db.all('select * from ' + data + ' v_sr ', (err, data) => {
      event.returnValue = data
    });
  });

  ipcMain.on('add-shooter', async (event: any, data: any) => {
    let arrayToInsert = [data.name, data.dai];
    let sql = create_shooter_sql;

    if (data.hasOwnProperty('id')) {
      arrayToInsert.push(data.id);
      sql = update_shooter_sql;
    }
    db.run(sql, ...arrayToInsert, (result: any, error: any) => {
      event.returnValue = 'ok';
    })
  })

  ipcMain.on('add-item', async (event: any, records: any) => {
    for (let data of records.shooterId) {
      let arrayToInsert = [records.saleDate, records.location, records.type, data, records.caliber, records.quantityType, records.quantity, records.priceBought, records.priceSold, records.profitPerUnit, records.profit]
      let sql = create_sql;
      if (records.hasOwnProperty('id')) {
        arrayToInsert.push(records.id);
        sql = update_sql;
      }
      db.run(sql, ...arrayToInsert, (result: any, error: any) => { })
    }
    event.returnValue = 'ok';
  });

  ipcMain.on('add-vault-item', async (event: any, records: any) => {
    let sql = create_vault_record_sql;

    for (let caliber of records.caliber) {
      let arrayToInsert = [records.supplierName, caliber, records.quantityType, records.quantity, records.licenceNo, records.purchaseDate];

      if (records.hasOwnProperty('id')) {
        arrayToInsert.push(records.id);
        sql = update_vault_record_sql;
      }

      db.run(sql, ...arrayToInsert, (result: any, error: any) => { })
    }

    event.returnValue = 'ok';
  });

  ipcMain.on('delete-item', async (event: any, data: any) => {

    let sql;

    switch (data.recordType) {
      case 'IShooter':
        sql = delete_shooter_sql;
        break;
      case 'IShootingRecord':
        sql = delete_sql;
        break;
      case 'IVaultRecord':
        sql = delete_vault_record_sql;
        break;
    }

    db.run(sql, data.id, (result: any, error: any) => {
      if (result != null && result.hasOwnProperty('errno')) {
        event.returnValue = 'constraint';
      } else {
        event.returnValue = 'ok';
      }
    })
  })
}

function connectToDatabase() {
  try {
    const dbLocation = path.join(app.getAppPath(), 'shootingRecorder.sqlite3')
    db = new sqlite3.Database(dbLocation, (err) => {
      db.get("PRAGMA foreign_keys = ON");
      createShooterTable();
      createRecordsTable();
      createVaultRecordsTable();
      dropExistingView();
    })

  } catch (_) {
  }
}


function dropExistingView() {
  const sql = `DROP VIEW IF EXISTS v_all_shooterRecords;`
  return db.run(sql, createView)
}

function createView() {
  const sql = `CREATE VIEW v_all_shooterRecords AS select sr.*, s.id as shooterId, s.name as shooterName from shootingRecords sr join shooters s on s.id = sr.shooter_id;`
  return db.run(sql);
}

function createRecordsTable() {

  //create tables if they don't exist, otherwise keep going
  const sql = `
    CREATE TABLE IF NOT EXISTS shootingRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saleDate TEXT,
      location TEXT, 
      type TEXT, 
      shooter_id INTEGER,
      caliber TEXT, 
      quantityType TEXT,
      quantity INTEGER, 
      priceBought REAL, 
      priceSold REAL, 
      profitPerUnit REAL, 
      profit REAL,
      FOREIGN KEY(shooter_id) REFERENCES shooters(id) ON DELETE RESTRICT)`
  return db.run(sql)
}

function createVaultRecordsTable() {
  //create tables if they don't exist, otherwise keep going
  const sql = `
    CREATE TABLE IF NOT EXISTS vaultRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplierName TEXT,
      caliber TEXT, 
      quantityType TEXT, 
      quantity INTEGER,
      licenceNo TEXT, 
      purchaseDate TEXT)`
  return db.run(sql)
}


function createShooterTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS shooters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      dai TEXT)`
  return db.run(sql)
}



try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => {
    createListeners();
    createWindow();
    connectToDatabase();
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
  throw e;
}
