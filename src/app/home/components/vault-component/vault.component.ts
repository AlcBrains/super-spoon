import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { take } from 'rxjs';
import * as XLSX from 'xlsx';
import { ElectronService } from '../../../core/services';
import { SharedService } from '../../../core/services/shared.service';
import { IVaultRecord } from '../../interfaces/IVaultRecord';
import { AddVaultRecordComponent } from '../add-vault-record/add-vault-record.component';
import { DeleteRecordComponent } from '../delete-record/delete-record.component';



@Component({
  selector: 'app-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss']
})
export class VaultComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<IVaultRecord>;
  @ViewChild('test') test: ElementRef;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;


  public totalProfit: number;
  public profitPerUnit: number;
  public caliberSearch: string;
  public searchText: any;
  public monthScope: any;
  public dataSource: MatTableDataSource<IVaultRecord>;
  public elementData: IVaultRecord[];
  public displayedColumns: string[] = ['supplierName', 'caliber', 'quantityType', 'quantity', 'licenceNo', 'purchaseDate', 'actions'];
  /**
   * 
   * supplierName: string;
   * caliber: string;
   * quantityType: string;
   * quantity: number;
   * licenceNo: string;
   * purchaseDate: any;
   */

  constructor(public dialog: MatDialog, private electronService: ElectronService, private sharedService: SharedService) { }

  ngOnInit(): void {
    this.monthScope = "month";
    this.setFilters(true);
  }

  ngAfterViewInit(): void {
    this.setSortingDataAccessor();
  }


  public createVaultRecord(): void {
    let tmpRecord = {} as IVaultRecord;
    if (this.elementData != null && this.elementData.length > 0) {
      tmpRecord = { ...this.elementData[this.elementData.length - 1] };
      delete tmpRecord["id"];
      delete tmpRecord["name"];
    }
    this.openDialog(tmpRecord as IVaultRecord);
  }

  /**
   * Opens a modal to edit a record
   * @param record the record to edit
   */
  public editVaultRecord(record: any) {
    let tmpRecord = { ...record };
    tmpRecord.shooterId = [tmpRecord.shooterId]
    this.openDialog(tmpRecord);
  }

  public deleteVaultRecord(record: any) {
    //sanity Check
    if (record == null || !record.hasOwnProperty('id')) {
      console.error('something has gone terribly wrong, record responsible: ', record);
    }
    this.dialog.open(DeleteRecordComponent, { data: { record: record, recordType: 'IVaultRecord' } }).afterClosed().subscribe((result) => {
      if (result != null && result.reason == 'success') {
        this.setFilters(false);
        this.sharedService.updateTotalRecords();
      }
    });
  }

  /**
   * Filters records based on a search string provided 
   * @param $event the js event
   */
  public filterRecords() {

    //filter Records by caliber, or supplierName, or licence No :
    this.dataSource.filterPredicate = ((data, filter) => data.supplierName.toLowerCase().includes(filter.toLowerCase())
      || data.licenceNo.toLowerCase().includes(filter.toLowerCase())
      || data.purchaseDate.includes(filter.toLowerCase()));

    this.dataSource.filter = this.searchText;
    this.table.renderRows();
  }

  public setFilters(init: boolean) {
    this.searchText = '';
    this.caliberSearch = '';
    this.requestData(this.monthScope === 'month');

    if (!init) {
      this.setSortingDataAccessor()
    }
  }

  /**
   * Change filtering based on ammo type
   */
  public changeAmmoType() {
    this.dataSource.filterPredicate = ((data, filter) => data.caliber == filter);
    this.dataSource.filter = this.caliberSearch;
    this.setSortingDataAccessor();
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



  private setSortingDataAccessor() {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'purchaseDate': return moment(item.purchaseDate, 'DD/MM/YYYY');
        default: return item[property];
      }
    };
  }

  private openDialog(shootingRecord: IVaultRecord) {
    this.dialog.open(AddVaultRecordComponent, {
      width: '550px ',
      data: { record: shootingRecord }
    }).afterClosed().subscribe((result) => {
      if (result != null && result.reason == 'success') {
        this.setFilters(false);
        this.sharedService.updateTotalRecords();
      }
    });
  }

  private requestData(monthlyScope: boolean) {
    this.dataSource = new MatTableDataSource<IVaultRecord>([]);
    this.electronService.getAllRecords('vaultRecords').pipe(take(1)).subscribe((elementData) => {
      const monthToCompare = monthlyScope ? moment().startOf('month') : moment().startOf('month').subtract(6, 'months');
      this.elementData = elementData;
      if (elementData == null || Object.keys(elementData).length === 0 || elementData.length == 0) {
        return;
      }
      this.dataSource = new MatTableDataSource<IVaultRecord>(this.elementData.filter((record) => moment(record.purchaseDate, 'DD/MM/YYYY').isSameOrAfter(monthToCompare, 'month')));
    })
  }

}
