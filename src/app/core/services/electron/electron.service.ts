import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as fs from 'fs';
import { catchError, Observable, of, throwError } from 'rxjs';
import { IShootingRecord } from '../../../home/interfaces/IShootingRecord';


@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;
  fs: typeof fs;

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  public getAllRecords(monthly: boolean): Observable<IShootingRecord[]> {
    return of(this.ipcRenderer.sendSync('get-items', [monthly]))
    .pipe(catchError((error: any) => throwError(() => new Error(error))));
  }

  public addRecord(item: IShootingRecord): Observable<void> {
    return item.id != null ? of(this.ipcRenderer.sendSync('add-item', item))
      .pipe(catchError((error: any) => throwError(() => new Error(error)))) :
      of(this.ipcRenderer.send('add-item', item))
        .pipe(catchError((error: any) => throwError(() => new Error(error))))
  }

}
