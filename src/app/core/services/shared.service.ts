import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private refreshRemainingAmmoBehaviorSubject = new BehaviorSubject('');
  private remainingAmmoBehaviorSubject = new BehaviorSubject([]);
  private refreshTotalShootersBehaviorSubject = new BehaviorSubject('');
  private shootingRecordsBehaviorSubject = new BehaviorSubject([]);
  private vaultRecordsBehaviorSubject = new BehaviorSubject([]);
  private shooterBehaviorSubject = new BehaviorSubject([]);

  public refreshRemainingAmmoObservable = this.refreshRemainingAmmoBehaviorSubject.asObservable();
  public refreshTotalShootersObservable = this.refreshTotalShootersBehaviorSubject.asObservable();
  public remainingAmmoObservable = this.remainingAmmoBehaviorSubject.asObservable();
  public shootingRecordsObservable = this.shootingRecordsBehaviorSubject.asObservable();
  public vaultrecordsObservable = this.vaultRecordsBehaviorSubject.asObservable();
  public shooterObservable = this.shooterBehaviorSubject.asObservable();

  public updateTotalRecords() {
    this.refreshRemainingAmmoBehaviorSubject.next('next!');
  }

  public updateTotalShooters() {
    this.refreshTotalShootersBehaviorSubject.next('next!');
  }

  public updateRemaining(data: any[]) {
    this.remainingAmmoBehaviorSubject.next(data);
  }

  public updateGetShootingRecordsFromDatabase(data: any[]) {
    this.shootingRecordsBehaviorSubject.next(data);
  }

  public updateGetVaultRecordsFromDatabase(data: any[]) {
    this.vaultRecordsBehaviorSubject.next(data);
  }

  public updateGetShootersFromDatabase(data: any[]) {
    this.shooterBehaviorSubject.next(data);
  }


}