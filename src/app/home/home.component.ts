import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';

export interface ShootingRecord {
  position: number;
  saleDate: string;
  name: string;
  location: string;
  slugType: string;
  priceBought: number;
  priceSold: number;
  profit: number;
}

const ELEMENT_DATA: ShootingRecord[] = [
  {
    position: 1,
    saleDate: '05/02/2022',
    name: 'Γιάννης Στρατήρος',
    location: 'Ε\'ΜΚ',
    slugType: '9mm',
    priceBought: 10,
    priceSold: 15,
    profit: 5
  }, {
    position: 2,
    saleDate: '12/02/2022',
    name: 'Βαγγέλης Κατσαΐτης',
    location: 'Νάρρες',
    slugType: '9mm',
    priceBought: 11,
    priceSold: 15,
    profit: 5
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
  @ViewChild(MatTable) table: MatTable<ShootingRecord>;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public displayedColumns: string[] = ['select', 'saleDate', 'name', 'location', 'slugType', 'priceBought', 'priceSold', 'profit'];
  public dataSource = new MatTableDataSource<ShootingRecord>(ELEMENT_DATA);
  selection = new SelectionModel<ShootingRecord>(true, []);

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
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
  public checkboxLabel(row?: ShootingRecord): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }


  public addData() {
    let randomElement = { ...ELEMENT_DATA[Math.floor(Math.random() * ELEMENT_DATA.length)] };
    randomElement.position = ELEMENT_DATA[ELEMENT_DATA.length - 1].position + 1;
    ELEMENT_DATA.push(randomElement);
    this.refreshTableControls();
  }

  private refreshTableControls() {
    this.dataSource = new MatTableDataSource<ShootingRecord>(ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.table.renderRows();
  }

}
