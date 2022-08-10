import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { SharedService } from '../../../core/services/shared.service';
import { IShooter } from '../../interfaces/IShooter';
import { IShootingRecord } from '../../interfaces/IShootingRecord';
import { AddRecordComponent } from '../add-record/add-record.component';
import { DeleteRecordComponent } from '../delete-record/delete-record.component';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<IShootingRecord>;
  @ViewChild('recordsTable') recordsTable: ElementRef;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;


  public totalProfit: number;
  public profitPerUnit: number;
  public caliberSearch: string;
  private shooters: IShooter[];
  private subscription: Subscription;
  private shooterSubscription: Subscription;
  public searchText: any;
  public monthScope: any;
  public dataSource: MatTableDataSource<IShootingRecord>;
  public elementData: IShootingRecord[];
  public displayedColumns: string[] = ['saleDate', 'location', 'type', 'shooterName', 'caliber', 'quantityType', 'quantity', 'priceBought', 'priceSold', 'profitPerUnit', 'profit', 'actions'];

  constructor(public dialog: MatDialog, private sharedService: SharedService) { }

  ngOnInit(): void {
    this.monthScope = "month";
    this.dataSource = new MatTableDataSource<IShootingRecord>([]);
    this.subscription = new Subscription();
    this.setFilters();
    this.getShootingRecords();
    this.getShooters();
  }

  // Necessary, otherwise sorting does not work on the initial loading of the table
  ngAfterViewInit():void {
    this.setSortingDataAccessor();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.shooterSubscription.unsubscribe();
  }


  public createShootingRecord(): void {
    let tmpRecord = {} as IShootingRecord;
    if (this.elementData != null && this.elementData.length > 0) {
      tmpRecord = { ...this.elementData[this.elementData.length - 1] };
      delete tmpRecord["id"];
      delete tmpRecord["name"];
    }
    this.openDialog(tmpRecord as IShootingRecord);
  }

  /**
   * Opens a modal to edit a record
   * @param record the record to edit
   */
  public editShootingRecord(record: any) {
    let tmpRecord = { ...record };
    tmpRecord.shooterId = [tmpRecord.shooterId]
    this.openDialog(tmpRecord);
  }

  public deleteShootingRecord(record: any) {
    //sanity Check
    if (record == null || !record.hasOwnProperty('id')) {
      console.error('something has gone terribly wrong, record responsible: ', record);
    }
    this.dialog.open(DeleteRecordComponent, { data: { record: record, recordType: "IShootingRecord" } }).afterClosed().subscribe((result) => {
      if (result != null && result.reason == 'success') {
        this.setFilters();
        this.getShootingRecords();
        this.sharedService.updateTotalRecords();
      }
    });
  }

  /**
   * Filters records based on a search string provided 
   * @param $event the js event
   */
  public filterRecords() {

    //filter Records by name :
    this.dataSource.filterPredicate = ((data, filter) => data.shooterName.toLowerCase().includes(filter.toLowerCase()));
    this.dataSource.filter = this.searchText;
    this.calculateShootingRecordTotals();
    this.table.renderRows();
  }

  public setFilters() {
    this.searchText = '';
    this.caliberSearch = '';
  }

  /**
   * Change filtering based on ammo type
   */
  public changeAmmoType() {
    this.dataSource.filterPredicate = ((data, filter) => data.caliber == filter);
    this.dataSource.filter = this.caliberSearch;
    this.calculateShootingRecordTotals();
    this.setSortingDataAccessor();
  }

  public printContent() {
    const ws = XLSX.utils.table_to_sheet(this.recordsTable.nativeElement, { raw: true });
    //Removing "Edit" Column since it is not necessary
    for (var key in ws) {
      if (ws.hasOwnProperty(key)) {
        if (key.startsWith("L")) delete ws[key];
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'shootingRecords.xlsx');
  }

  private calculateShootingRecordTotals() {
    const tmp = this.dataSource.filteredData;
    //Price sold - price bought, times the quantity.
    this.totalProfit = +(tmp.map((record) => record.profit)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)).toFixed(2);
    this.profitPerUnit = +(tmp.map((record) => record.profitPerUnit)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)).toFixed(2);
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

  private openDialog(shootingRecord: any) {
    shootingRecord.shooterId = [shootingRecord.shooterId]
    this.dialog.open(AddRecordComponent, {
      width: '550px ',
      data: { record: shootingRecord, shooters: this.shooters, disabled: shootingRecord.id != null }
    }).afterClosed().subscribe((result) => {
      if (result != null && result.reason == 'success') {
        this.setFilters();
        this.getShootingRecords();
        this.sharedService.updateTotalRecords();
      }
    });
  }

  public getShootingRecords() {
    this.subscription = this.sharedService.shootingRecordsObservable.subscribe((elementData) => {
      const monthToCompare = this.monthScope === 'month' ? moment().startOf('month') : moment().startOf('month').subtract(6, 'months');
      if (elementData == null || Object.keys(elementData).length === 0 || elementData.length == 0) {
        elementData = [];
      }
      this.elementData = elementData;
      this.dataSource = new MatTableDataSource<IShootingRecord>(this.elementData.filter((record) => moment(record.saleDate, 'DD/MM/YYYY').isSameOrAfter(monthToCompare, 'month')));
      this.calculateShootingRecordTotals();
    });
  }

  private getShooters() {
    this.shooterSubscription = this.sharedService.shooterObservable.subscribe((shooters) => {
      this.shooters = shooters;
    });
  }
} 
