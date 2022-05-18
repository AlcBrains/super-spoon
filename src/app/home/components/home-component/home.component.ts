import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { IShootingRecord } from '../../interfaces/IShootingRecord';

const ELEMENT_DATA: IShootingRecord[] = [
  {
    position: 1,
    saleDate: '05/02/2022',
    name: 'Γιάννης Στρατήρος',
    location: 'Ε\'ΜΚ',
    slugType: '9mm',
    quantity: 2,
    priceBought: 10,
    priceSold: 15,
    profit: 0
  }, {
    position: 2,
    saleDate: '12/02/2022',
    name: 'Βαγγέλης Κατσαΐτης',
    location: 'Νάρρες',
    slugType: '9mm',
    quantity: 3,
    priceBought: 11,
    priceSold: 15,
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
  public dataSource: MatTableDataSource<IShootingRecord>;
  public selection: SelectionModel<IShootingRecord>;

  public displayedColumns: string[] = ['select', 'saleDate', 'name', 'location', 'slugType', 'quantity', 'priceBought', 'priceSold', 'profit'];

  constructor() { }

  ngOnInit(): void {
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
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }


  public addData() {
    let randomElement = { ...ELEMENT_DATA[Math.floor(Math.random() * ELEMENT_DATA.length)] };
    randomElement.position = ELEMENT_DATA[ELEMENT_DATA.length - 1].position + 1;
    ELEMENT_DATA.push(randomElement);
    this.refreshTableControls();
  }

  private refreshTableControls() {
    this.dataSource = new MatTableDataSource<IShootingRecord>(ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.table.renderRows();
  }


  private calculateTotals() {
    const tmp = this.selection.selected.length > 0 ? this.selection.selected : ELEMENT_DATA
    //Price sold - price bought, times the quantity.
    this.totalProfit = tmp.map((record) => (record.priceSold - record.priceBought) * record.quantity)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  }

}
