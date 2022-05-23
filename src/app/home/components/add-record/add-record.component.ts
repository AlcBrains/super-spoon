import { Component, Inject, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { IShootingRecord } from '../../interfaces/IShootingRecord';

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

  public shootingRecordFormControl = new FormGroup({
    saleDate: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    slugType: new FormControl('', [Validators.required]),
    priceSold: new FormControl('', [Validators.required, Validators.pattern('[0-9]+(.*)[0-9]*')]),
    priceBought: new FormControl('', [Validators.required, Validators.pattern('[0-9]+(.*)[0-9]*')]),
    quantity: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')])
  })

  constructor(
    private electronService: ElectronService,
    public dialogRef: MatDialogRef<AddRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public record: IShootingRecord) { }


  ngOnInit(): void {
    this.record.saleDate = moment(this.record.saleDate, 'DD/MM/YYYY').toDate();
  }

  public onSave() {
    const { value, valid } = this.shootingRecordFormControl;
    if (!valid) {
      return;
    }
    this.createOrUpdateRecord();
  }

  private createOrUpdateRecord() {
    this.record.saleDate = moment(this.record.saleDate).format('DD/MM/YYYY');
    //Always update record profit and profit per unit
    //Workaround to ensure that float values are properly 
    this.record.profitPerUnit = +(this.record.priceSold - this.record.priceBought).toFixed(2);
    this.record.profit = +((this.record.priceSold - this.record.priceBought) * this.record.quantity).toFixed(2);
    this.electronService.addRecord(this.record).pipe(take(1)).subscribe(() => {
      this.dialogRef.close({ reason: 'success' })
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}