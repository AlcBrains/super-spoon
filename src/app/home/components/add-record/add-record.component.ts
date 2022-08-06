import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { SharedService } from '../../../core/services/shared.service';
import { IShooter } from '../../interfaces/IShooter';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

export class DateStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: 'add-record',
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.scss']
})
export class AddRecordComponent implements OnInit {

  public shooters: IShooter[];
  public remaining: any[]

  public shootingRecordFormControl = new FormGroup({
    saleDate: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    caliber: new FormControl('', [Validators.required]),
    priceSold: new FormControl('', [Validators.required, Validators.pattern('[0-9]+(.*)[0-9]*')]),
    priceBought: new FormControl('', [Validators.required, Validators.pattern('[0-9]+(.*)[0-9]*')]),
    quantityType: new FormControl('', [Validators.required]),
    quantity: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')])
  })

  constructor(
    private electronService: ElectronService,
    private sharedService: SharedService,
    public dialogRef: MatDialogRef<AddRecordComponent>,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.shooters = this.data.shooters;
    this.remaining = [];
  }


  ngOnInit(): void {
    this.data.record.saleDate = moment(this.data.record.saleDate, 'DD/MM/YYYY').toDate();
    this.sharedService.rem$.pipe(take(1)).subscribe((rem) => { this.remaining = rem });
  }

  public onSave() {
    const { value, valid } = this.shootingRecordFormControl;
    if (!valid) {
      return;
    }

    const remainingBulletsOfCaliber = this.remaining.find((el) => el.name == this.data.record.caliber).quantity;

    if (this.data.record.quantity > remainingBulletsOfCaliber) {
      const msg = this.translateService.instant('insufficient').replace("<av>", remainingBulletsOfCaliber);
      this.snackBar.open( msg, this.translateService.instant('close'));

      return;
    }

    this.createOrUpdateRecord();
  }

  private createOrUpdateRecord() {
    this.data.record.saleDate = moment(this.data.record.saleDate).format('DD/MM/YYYY');
    //Always update record profit and profit per unit
    //Workaround to ensure that float values are properly 
    this.data.record.profitPerUnit = +(this.data.record.priceSold - this.data.record.priceBought).toFixed(2);
    this.data.record.profit = +((this.data.record.priceSold - this.data.record.priceBought) * this.data.record.quantity).toFixed(2);

    this.electronService.addRecord(this.data.record).pipe(take(1)).subscribe(() => {
      this.dialogRef.close({ reason: 'success' })
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}