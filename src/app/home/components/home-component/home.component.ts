import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IShootingRecord } from '../../interfaces/IShootingRecord';
import { AddRecordComponent } from '../add-record/add-record.component';
import * as moment from 'moment';

const ELEMENT_DATA: IShootingRecord[] = [
  {
    id: 1,
    saleDate: '05/02/2022',
    name: 'Γιάννης Στρατήρος',
    location: 'Ε\'ΜΚ',
    type: 'training',
    slugType: '9mm',
    quantity: 2,
    priceBought: 10,
    priceSold: 15,
    profitPerUnit: 0,
    profit: 0
  }, {
    id: 2,
    saleDate: '12/02/2022',
    name: 'Βαγγέλης Κατσαΐτης',
    location: 'Νάρρες',
    type: 'championship',
    slugType: '9mm',
    quantity: 3,
    priceBought: 11,
    priceSold: 15,
    profitPerUnit: 0,
    profit: 0
  }
];


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
  public dataSource: MatTableDataSource<IShootingRecord>;
  public selection: SelectionModel<IShootingRecord>;
  public displayedColumns: string[] = ['select', 'saleDate', 'location', 'type', 'name', 'slugType', 'quantity', 'priceBought', 'priceSold', 'profitPerUnit', 'profit', 'actions'];

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    ELEMENT_DATA.forEach((record) => {
      record.profitPerUnit = (record.priceSold - record.priceBought);
      record.profit = record.profitPerUnit * record.quantity;
    });
    this.selection = new SelectionModel<IShootingRecord>(true, []);
    this.dataSource = new MatTableDataSource<IShootingRecord>(ELEMENT_DATA);
    this.calculateTotals();
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

  /** Whether the number of selected elements matches the total number of rows. */
  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
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

  public editShootingRecord(record: any) {
    //the following is a workaround, because Angular's datepicker needs dates get a preselected value.
    const tmpRecord = { ...record };
    tmpRecord.saleDate = moment(tmpRecord.saleDate, 'DD/MM/YYYY').toDate();
    this.openDialog(tmpRecord);
  }

  private calculateTotals() {
    const tmp = this.selection.selected.length > 0 ? this.selection.selected : ELEMENT_DATA
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
