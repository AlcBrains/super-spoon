import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home-component/home.component';
import { ShooterComponent } from './components/shooter-component/shooter.component';
import { VaultComponent } from './components/vault-component/vault.component';

const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path:'shooters',
    component: ShooterComponent
  },
  {
    path:'vault',
    component: VaultComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
