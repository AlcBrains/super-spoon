import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { ElectronService } from '../../../core/services';
import { IShootingRecord } from '../../interfaces/IShootingRecord';
import { AddRecordComponent } from '../add-record/add-record.component';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) table: MatTable<IShootingRecord>;

  public totalProfit: number;
  public profitPerUnit: number;
  public slugTypeSearch: string;
  public searchText: any;
  public monthScope: any;
  public dataSource: MatTableDataSource<IShootingRecord>;
  public elementData: IShootingRecord[];
  public selection: SelectionModel<IShootingRecord>;
  public displayedColumns: string[] = ['select', 'saleDate', 'location', 'type', 'name', 'slugType', 'quantity', 'priceBought', 'priceSold', 'profitPerUnit', 'profit', 'actions'];

  constructor(public dialog: MatDialog, private electronService: ElectronService) { }

  ngOnInit(): void {


    this.electronService.getAllRecords(true).subscribe((elementData) => {
      elementData.forEach((record) => {
        record.profitPerUnit = (record.priceSold - record.priceBought);
        record.profit = record.profitPerUnit * record.quantity;
      });
      
      this.elementData = elementData;
      this.dataSource = new MatTableDataSource<IShootingRecord>(this.elementData);
    })

    this.selection = new SelectionModel<IShootingRecord>(true, []);


    this.monthScope = "month";
    this.setMonthScope();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'saleDate': return new Date(item.saleDate);
        default: return item[property];
      }
    };
  }

  /**
   *  Whether the number of selected elements matches the total number of rows. 
   * */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** 
   * Selects all rows if they are not all selected; otherwise clear selection. 
   * */
  public masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** 
   * The label for the checkbox on the passed row 
   * */
  public checkboxLabel(row?: IShootingRecord): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    this.calculateTotals();
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  public createShootingRecord(): void {
    this.openDialog({} as IShootingRecord);
  }


  /**
   * Opens a modal to edit a record
   * @param record the record to edit
   */
  public editShootingRecord(record: any) {
    //the following is a workaround, because Angular's datepicker needs dates get a preselected value.
    const tmpRecord = { ...record };
    tmpRecord.saleDate = moment(tmpRecord.saleDate, 'DD/MM/YYYY').toDate();
    this.openDialog(tmpRecord);
  }

  /**
   * Filters records based on a search string provided 
   * @param $event the js event
   */
  public filterRecords() {

    this.selection.clear();
    //filter Records by name :
    this.dataSource.filterPredicate = ((data, filter) => data.name.toLowerCase().includes(filter.toLowerCase()));
    this.dataSource.filter = this.searchText;
    this.calculateTotals();
    this.table.renderRows();
  }

  public setMonthScope() {
    const monthToCompare = this.monthScope === 'month' ? moment().startOf('month')
      : moment().startOf('month').subtract(6, 'months');
    this.dataSource = new MatTableDataSource<IShootingRecord>(this.elementData.filter((record) => moment(record.saleDate, 'DD/MM/YYYY').isSameOrAfter(monthToCompare, 'month')));
    this.searchText = '';
    this.slugTypeSearch = '';

    //recalculate totals
    this.calculateTotals();
  }

  /**
   * Change filtering based on ammo type
   */
  public changeAmmoType() {
    this.selection.clear();
    this.dataSource.filterPredicate = ((data, filter) => data.slugType == filter);
    this.dataSource.filter = this.slugTypeSearch;
  }

  public printContent() {
    //Do nothing yet, dunno if we want them to be printed or exported to excel. Or both :(
  }

  private calculateTotals() {
    const tmp = this.selection.selected.length > 0 ? this.selection.selected : this.dataSource.filteredData;
    //Price sold - price bought, times the quantity.
    this.totalProfit = tmp.map((record) => (record.priceSold - record.priceBought) * record.quantity)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);

    this.profitPerUnit = tmp.map((record) => (record.priceSold - record.priceBought))
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  }

  private openDialog(shootingRecord: IShootingRecord) {
    this.dialog.open(AddRecordComponent, {
      width: '550px ',
      data: shootingRecord
    });
  }
}
