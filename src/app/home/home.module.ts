import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher, MatNativeDateModule, MAT_DATE_LOCALE, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { AddRecordComponent } from './components/add-record/add-record.component';
import { AddShooterComponent } from './components/add-shooter/add-shooter.component';
import { AddVaultRecordComponent } from './components/add-vault-record/add-vault-record.component';
import { DeleteRecordComponent } from './components/delete-record/delete-record.component';
import { HomeComponent } from './components/home-component/home.component';
import { ShooterComponent } from './components/shooter-component/shooter.component';
import { VaultComponent } from './components/vault-component/vault.component';
import { HomeRoutingModule } from './home-routing.module';


@NgModule({
  declarations: [
    HomeComponent,
    AddRecordComponent,
    DeleteRecordComponent,
    AddShooterComponent,
    VaultComponent,
    AddVaultRecordComponent,
    ShooterComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSortModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    TranslateModule,
    MatNativeDateModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'el-GR' },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }]
})
export class HomeModule { }
