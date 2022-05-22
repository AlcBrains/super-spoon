import { SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { take } from 'rxjs';
import { ElectronService } from '../../../core/services';
import { IShootingRecord } from '../../interfaces/IShootingRecord';
import { AddRecordComponent } from '../add-record/add-record.component';
import * as XLSX from 'xlsx';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<IShootingRecord>;
  @ViewChild('test') test: ElementRef;

  public totalProfit: number;
  public profitPerUnit: number;
  public slugTypeSearch: string;
  public searchText: any;
  public monthScope: any;
  public dataSource: MatTableDataSource<IShootingRecord>;
  public elementData: IShootingRecord[];
  public displayedColumns: string[] = ['saleDate', 'location', 'type', 'name', 'slugType', 'quantity', 'priceBought', 'priceSold', 'profitPerUnit', 'profit', 'actions'];

  constructor(public dialog: MatDialog, private electronService: ElectronService) { }

  ngOnInit(): void {
    this.monthScope = "month";
    this.setMonthScope();
  }


  public createShootingRecord(): void {
    this.openDialog({} as IShootingRecord);
  }

  /**
   * Opens a modal to edit a record
   * @param record the record to edit
   */
  public editShootingRecord(record: any) {

    this.openDialog({ ...record });
  }

  /**
   * Filters records based on a search string provided 
   * @param $event the js event
   */
  public filterRecords() {

    //filter Records by name :
    this.dataSource.filterPredicate = ((data, filter) => data.name.toLowerCase().includes(filter.toLowerCase()));
    this.dataSource.filter = this.searchText;
    this.calculateTotals();
    this.table.renderRows();
  }

  public setMonthScope() {
    this.searchText = '';
    this.slugTypeSearch = '';
    this.requestData(this.monthScope === 'month');
  }

  /**
   * Change filtering based on ammo type
   */
  public changeAmmoType() {
    this.dataSource.filterPredicate = ((data, filter) => data.slugType == filter);
    this.dataSource.filter = this.slugTypeSearch;
    this.calculateTotals();
  }

  public printContent() {
    const ws = XLSX.utils.table_to_sheet(this.test.nativeElement, { raw: true });
    //Removing "Edit" Column since it is not necessary
    for (var key in ws) {
      if (ws.hasOwnProperty(key)) {
        if (key.startsWith("L")) delete ws[key];
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'records.xlsx');
  }

  private calculateTotals() {
    const tmp = this.dataSource.filteredData;
    //Price sold - price bought, times the quantity.
    this.totalProfit = tmp.map((record) => record.profit)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    this.profitPerUnit = tmp.map((record) => record.profitPerUnit)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    this.setSortingDataAccessor();
  }

  private setSortingDataAccessor() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'saleDate': return moment(item.saleDate, 'DD/MM/YYYY');
        default: return item[property];
      }
    };
  }

  private openDialog(shootingRecord: IShootingRecord) {
    this.dialog.open(AddRecordComponent, {
      width: '550px ',
      data: shootingRecord
    }).afterClosed().subscribe((result) => {
      if (result != null && result.reason == 'success') {
        this.requestData(this.monthScope);
      }
    });
  }

  private requestData(monthlyScope: boolean) {
    this.dataSource = new MatTableDataSource<IShootingRecord>([]);
    this.electronService.getAllRecords(monthlyScope).pipe(take(1)).subscribe((elementData) => {
      const monthToCompare = monthlyScope ? moment().startOf('month') : moment().startOf('month').subtract(6, 'months');
      if (elementData == null || Object.keys(elementData).length === 0 || elementData.length == 0) {
        return;
      }
      this.elementData = elementData;
      this.dataSource = new MatTableDataSource<IShootingRecord>(this.elementData.filter((record) => moment(record.saleDate, 'DD/MM/YYYY').isSameOrAfter(monthToCompare, 'month')));
      this.calculateTotals();
    })

  }
}
