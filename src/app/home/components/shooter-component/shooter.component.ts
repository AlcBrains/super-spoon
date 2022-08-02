import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs';
import * as XLSX from 'xlsx';
import { ElectronService } from '../../../core/services';
import { IShooter } from '../../interfaces/IShooter';
import { AddShooterComponent } from '../add-shooter/add-shooter.component';
import { DeleteRecordComponent } from '../delete-record/delete-record.component';



@Component({
  selector: 'app-shooter',
  templateUrl: './shooter.component.html',
  styleUrls: ['./shooter.component.scss']
})
export class ShooterComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<IShooter>;
  @ViewChild('shooter-table') shooterTable: ElementRef;

  public searchText: any;
  public dataSource: MatTableDataSource<IShooter>;
  public displayedColumns: string[] = ['name', 'dai', 'actions'];

  constructor(public dialog: MatDialog, private electronService: ElectronService) { }

  ngOnInit(): void {
    this.getShooters();
  }

  ngAfterViewInit(): void {
    this.setSortingDataAccessor();
  }


  public createShooter(): void {
    this.openDialog({} as IShooter);
  }

  /**
   * Opens a modal to edit a record
   * @param record the record to edit
   */
  public editShooter(record: any) {

    this.openDialog({ ...record });
  }

  public deleteShooter(record: any) {
    //sanity Check
    if (record == null || !record.hasOwnProperty('id')) {
      console.error('something has gone terribly wrong, record responsible: ', record);
    }
    this.dialog.open(DeleteRecordComponent, { data: { record: record, recordType: "IShooter" } }).afterClosed().subscribe((result) => {
      if (result != null && result.reason == 'success') {
        this.getShooters();
      }
    });
  }

  /**
   * Filters records based on a search string provided 
   * @param $event the js event
   */
  public filterRecords() {
    //filter Records by name or dai:
    this.dataSource.filterPredicate = ((data, filter) => data.name.toLowerCase().includes(filter.toLowerCase()) ||
      data.dai.toLowerCase().includes(filter.toLowerCase()));
    this.dataSource.filter = this.searchText;
    this.table.renderRows();
  }

  public printContent() {
    const ws = XLSX.utils.table_to_sheet(this.shooterTable.nativeElement, { raw: true });
    //Removing "Edit" Column since it is not necessary
    for (var key in ws) {
      if (ws.hasOwnProperty(key)) {
        if (key.startsWith("L")) delete ws[key];
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'shooters.xlsx');
  }


  private setSortingDataAccessor() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'dai': return Number(item['dai'])
        default: return item[property];
      }
    };
  }

  private openDialog(shootingRecord: IShooter) {
    this.dialog.open(AddShooterComponent, {
      width: '550px ',
      data: shootingRecord
    }).afterClosed().subscribe((result) => {
      if (result != null && result.reason == 'success') {
        this.getShooters();
        this.setSortingDataAccessor();
      }
    });
  }

  private getShooters() {
    this.dataSource = new MatTableDataSource<IShooter>([]);
    this.electronService.getAllRecords('shooters').pipe(take(1)).subscribe((elementData) => {
      if (elementData == null || Object.keys(elementData).length === 0 || elementData.length == 0) {
        return;
      }
      this.dataSource = new MatTableDataSource<IShooter>(elementData);
    })

  }
}
