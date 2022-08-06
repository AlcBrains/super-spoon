import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';

@Component({
  selector: 'add-vault-record',
  templateUrl: './add-vault-record.component.html',
  styleUrls: ['./add-vault-record.component.scss']
})
export class AddVaultRecordComponent implements OnInit {

  public vaultRecordFormControl = new FormGroup({
    supplierName: new FormControl('', [Validators.required]),
    caliber: new FormControl('', [Validators.required]),
    quantityType: new FormControl('', [Validators.required]),
    quantity: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
    licenceNo: new FormControl('', [Validators.required]),
    purchaseDate: new FormControl('', [Validators.required])
  })

  constructor(
    private electronService: ElectronService,
    public dialogRef: MatDialogRef<AddVaultRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit(): void {
    this.data.record.purchaseDate = moment(this.data.record.purchaseDate, 'DD/MM/YYYY').toDate();
  }

  public onSave() {
    const { value, valid } = this.vaultRecordFormControl;
    if (!valid) {
      return;
    }
    this.createOrUpdateRecord();
  }

  private createOrUpdateRecord() {
    this.data.record.purchaseDate = moment(this.data.record.purchaseDate).format('DD/MM/YYYY');

    this.electronService.addVaultRecord(this.data.record).pipe(take(1)).subscribe((res) => {
      this.dialogRef.close({ reason: 'success' })
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}