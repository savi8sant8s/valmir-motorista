import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClientsPageRoutingModule } from './clients-routing.module';

import { ClientsPage } from './clients.page';
import { ClientLocationComponent } from '../client-location/client-location.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClientsPageRoutingModule
  ],
  declarations: [ClientsPage, ClientLocationComponent],
  entryComponents: [ClientLocationComponent]
})
export class ClientsPageModule {}
