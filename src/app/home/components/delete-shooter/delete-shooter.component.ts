import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { IShooter } from '../../interfaces/IShooter';


@Component({
  selector: 'delete-shooter',
  templateUrl: './delete-shooter.component.html',
  styleUrls: ['./delete-shooter.component.scss']
})
export class DeleteShooterComponent implements OnInit {

  
  constructor(
    private electronService: ElectronService,
    public dialogRef: MatDialogRef<DeleteShooterComponent>,
    @Inject(MAT_DIALOG_DATA) public record: IShooter) { }


  ngOnInit(): void {
  }

  public onDelete() {
    this.electronService.deleteShooter(this.record.id).pipe(take(1)).subscribe(() => {
      this.dialogRef.close({ reason: 'success' })
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}