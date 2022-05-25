import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { IShootingRecord } from '../../interfaces/IShootingRecord';


@Component({
  selector: 'delete-record',
  templateUrl: './delete-record.component.html',
  styleUrls: ['./delete-record.component.scss']
})
export class DeleteRecordComponent implements OnInit {

  
  constructor(
    private electronService: ElectronService,
    public dialogRef: MatDialogRef<DeleteRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public record: IShootingRecord) { }


  ngOnInit(): void {
  }

  public onDelete() {
    this.electronService.deleteRecord(this.record.id).pipe(take(1)).subscribe(() => {
      this.dialogRef.close({ reason: 'success' })
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}