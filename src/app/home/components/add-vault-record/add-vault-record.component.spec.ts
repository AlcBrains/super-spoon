import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddVaultRecordComponent } from './add-vault-record.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('AddShooterComponent', () => {
  let component: AddVaultRecordComponent;
  let fixture: ComponentFixture<AddVaultRecordComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddVaultRecordComponent],
      imports: [TranslateModule.forRoot(), RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVaultRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
