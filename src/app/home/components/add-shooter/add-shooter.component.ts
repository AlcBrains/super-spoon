import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { IShooter } from '../../interfaces/IShooter';

@Component({
  selector: 'add-shooter',
  templateUrl: './add-shooter.component.html',
  styleUrls: ['./add-shooter.component.scss']
})
export class AddShooterComponent implements OnInit {

  public shooterFormControl = new FormGroup({
    name: new FormControl('', [Validators.required]),
    dai: new FormControl('', [Validators.required])
  })

  constructor(
    private electronService: ElectronService,
    public dialogRef: MatDialogRef<AddShooterComponent>,
    @Inject(MAT_DIALOG_DATA) public shooter: IShooter) { }


  ngOnInit(): void {
  }

  public onSave() {
    const { value, valid } = this.shooterFormControl;
    if (!valid) {
      return;
    }
    this.createOrUpdateRecord();
  }

  private createOrUpdateRecord() {
    this.electronService.addShooter(this.shooter).pipe(take(1)).subscribe(() => {
      this.dialogRef.close({ reason: 'success' })
    })
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}