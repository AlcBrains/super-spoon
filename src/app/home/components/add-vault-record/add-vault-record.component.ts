import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { IVaultRecord } from '../../interfaces/IVaultRecord';

@Component({
  selector: 'add-record',
  templateUrl: './add-vault-record.component.html',
  styleUrls: ['./add-vault-record.component.scss']
})
export class AddVaultRecordComponent implements OnInit {

  public vaultRecordFormControl = new FormGroup({
    name: new FormControl('', [Validators.required]),
    dai: new FormControl('', [Validators.required])
  })

  constructor(
    private electronService: ElectronService,
    public dialogRef: MatDialogRef<AddVaultRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public vaultRecord: IVaultRecord) { }


  ngOnInit(): void {
  }

  public onSave() {
    const { value, valid } = this.vaultRecordFormControl;
    if (!valid) {
      return;
    }
    this.createOrUpdateRecord();
  }

  private createOrUpdateRecord() {
    this.electronService.addRecord(this.vaultRecord).pipe(take(1)).subscribe(() => {
      this.dialogRef.close({ reason: 'success' })
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}