import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import * as moment from "moment";
import { ModalController } from '@ionic/angular';
import { ClientInfoService } from '../client-info.service';
import { ClientLocationComponent } from '../client-location/client-location.component';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage {
  clientsTotal: any = [];
  clients: any = [];
  status: string = "";
  pauseScroll: boolean = false;

  constructor(
    private api: ApiService,
    private customAlert: AlertService,
    private modal: ModalController,
    private clientInfo: ClientInfoService
  ) { }

  /**Função que é disparada quando a página já animou para a exibição de entrada. */
  ionViewDidEnter() {
    this.getClientsInfoLocation();
  }

  /**Função que pega a lista de clientes que vão querer viajar com Valmir. */
  getClientsInfoLocation() {
    this.clientsTotal = [];
    this.clients = [];
    this.status = "loading";
    this.api.getClientsInfoLocation().then((result) => {
      let filterResult = result.results.filter((value) => {
        if (value.date == moment(new Date()).format("L")) {
          return true;
        } else {
          return false;
        }
      });
      if (filterResult.length > 0) {
        this.status = "success";
        this.clientsTotal = filterResult.reverse();
        this.clients = this.clientsTotal.slice(0,10);
      }
      else {
        this.status = "empty";
      }
    }).catch(() => {
      this.status = "failed";
      this.customAlert.presentToast("Verifique sua conexão com à internet.");
    });
  }

  /**Função que redireciona motorista para modal onde mostra a localização do cliente.
   * @param dados do cliente.
  */
  async goMap(client): Promise<any> {
    this.clientInfo.setClientInfo(client);
    let modal = await this.modal.create({
      component: ClientLocationComponent,
      cssClass: 'modalMap',
    });
    modal.present();
  }

  /**Função que adiciona 10 itens (ou os restantes) a visualização da lista de transações.*/
  private addMoreItems(): void {
    for (let x = 0; x < 10; x++) {
      if (this.clients.length == this.clientsTotal.length) {
        this.pauseScroll = true;
        break;
      }
      else {
        this.clients.push(this.clientsTotal[this.clients.length]);
      }
    }
  }

  /**Função que adiciona mais itens a lista mostrada quando o usuário desliza a tela de baixa para cima.
  *@param event evento de clique.
  */
  loadData(event): void {
    setTimeout(() => {
      this.addMoreItems();
      event.target.complete();
    }, 500);
  }
}
