import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { ElectronService } from '../../core/services';
import { SharedService } from '../../core/services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public remaining: any;
  private totalVaultRecords = [];
  private totalShootingrecords = [];


  constructor(private translate: TranslateService, private electronService: ElectronService, private sharedService: SharedService) {
    translate.addLangs(['el']);
    translate.setDefaultLang('el');
    translate.use('el');
  }


  ngOnInit() {
    this.sharedService.refreshRemainingAmmoObservable.subscribe((val) => {
      this.getShootingRecords();
      this.getTotalVaultRecords();
      this.calculateRemainingBulletsPerCaliber();
    });

    this.sharedService.refreshTotalShootersObservable.subscribe(() => {
      this.getShooters();
    })
  }


  public getShootingRecords() {
    this.electronService.getAllRecords('v_all_shooterRecords').pipe(take(1)).subscribe((elementData) => {
      this.sharedService.updateGetShootingRecordsFromDatabase(elementData);
      //Transforming shooting records here to compare with vault records and get all data.
      this.totalShootingrecords = elementData.map((element) => {
        return { caliber: element.caliber, quantity: element.quantityType != 'box' ? element.quantity : element.quantity * 50 }
      })
    })
  }

  private getTotalVaultRecords() {
    this.electronService.getAllRecords('vaultRecords').pipe(take(1)).subscribe((vaultRecords) => {
      this.sharedService.updateGetVaultRecordsFromDatabase(vaultRecords);
      this.totalVaultRecords = vaultRecords.map((record) => { return { caliber: record.caliber, quantity: record.quantityType != 'box' ? record.quantity : record.quantity * 50 } });
    })
  }

  private getShooters() {
    this.electronService.getAllRecords('shooters').pipe(take(1)).subscribe((elementData) => {
      this.sharedService.updateGetShootersFromDatabase(elementData);
    })
  }

  private calculateRemainingBulletsPerCaliber() {
    this.remaining = [
      { name: '9mm', quantity: 0 },
      { name: '22mm', quantity: 0 },
      { name: '40mm', quantity: 0 },
      { name: '45mm', quantity: 0 },
      { name: '308mm', quantity: 0 }];

    this.totalVaultRecords.forEach(vaultRecord => {
      this.remaining.find((record) => record.name == vaultRecord.caliber).quantity += vaultRecord.quantity;
    });

    this.totalShootingrecords.forEach(shootingRecord => {
      this.remaining.find((record) => record.name == shootingRecord.caliber).quantity -= shootingRecord.quantity;
    })

    this.sharedService.updateRemaining(this.remaining);

  }
}
