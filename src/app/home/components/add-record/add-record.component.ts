import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'add-record',
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.scss']
})
export class AddRecordComponent implements OnInit {

  public record: any;

  constructor(
    public dialogRef: MatDialogRef<AddRecordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }


  public onSave() {
    console.log('hey')
    this.dialogRef.close();
  }

  public onNoClick() {
    this.dialogRef.close();
  }

}