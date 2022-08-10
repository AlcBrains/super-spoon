import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';


@Component({
  selector: 'delete-record',
  templateUrl: './delete-record.component.html',
  styleUrls: ['./delete-record.component.scss']
})
export class DeleteRecordComponent implements OnInit {

  
  constructor(
    private electronService: ElectronService,
    public dialogRef: MatDialogRef<DeleteRecordComponent>,
    private snackBar: MatSnackBar,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit(): void {

  }

  public onDelete() {
    this.electronService.deleteRecord({recordType: this.data.recordType , id: this.data.record.id}).pipe(take(1)).subscribe((res) => {
      if (res == 'constraint') { 
        this.snackBar.open(this.translateService.instant('constraint'), this.translateService.instant('close'));
        this.dialogRef.close({reason : 'failure due to constraints'});
      } else {
        this.dialogRef.close({ reason: 'success' })
      }
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}