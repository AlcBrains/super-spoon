import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame } from 'electron';
import * as fs from 'fs';
import { catchError, Observable, of, throwError } from 'rxjs';
import { IShooter } from '../../../home/interfaces/IShooter';
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

  public getAllRecords(recordType: any): Observable<any[]> {
    return of(this.ipcRenderer.sendSync('get-items', [recordType]))
      .pipe(catchError((error: any) => throwError(() => new Error(error))));
  }

  public addRecord(item: any): Observable<void> {
    return of(this.ipcRenderer.sendSync('add-item', item))
      .pipe(catchError((error: any) => throwError(() => new Error(error))))
  }

  public addVaultRecord(item: any): Observable<void> {
    return of(this.ipcRenderer.sendSync('add-vault-item', item))
      .pipe(catchError((error: any) => throwError(() => new Error(error))))
  }

  public addShooter(shooter: IShooter): Observable<void> {
    return of(this.ipcRenderer.sendSync('add-shooter', shooter))
      .pipe(catchError((error: any) => throwError(() => new Error(error))))
  }

  public deleteRecord(recordObject): Observable<void> {
    return of(this.ipcRenderer.sendSync('delete-item', recordObject))
      .pipe(catchError((error: any) => throwError(() => new Error(error))))
  }


}
