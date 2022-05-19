import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
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
export class AddRecordComponent {

  public shootingRecordFormControl = new FormGroup({
    saleDate: new FormControl('', [Validators.required]),
    name: new FormControl('', [Validators.required]),
    type: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    slugType: new FormControl('', [Validators.required]),
    priceSold: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
    priceBought: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
    quantity: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')])
  })

  constructor(
    public dialogRef: MatDialogRef<AddRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public record: IShootingRecord) { }

  public onSave() {
    const { value, valid } = this.shootingRecordFormControl;
    if (!valid) {
      return;
    }

    this.createOrUpdateRecord();
    this.dialogRef.close();
  }

  private createOrUpdateRecord() {
    this.record.saleDate = moment(this.record.saleDate).format('DD/MM/YYYY');

    if (this.record.id == null) {
      console.log('new Record!')
    } else {
      console.log('old Record!')
    }
    console.log(this.record)
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}