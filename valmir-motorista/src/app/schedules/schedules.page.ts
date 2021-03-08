import { Component } from '@angular/core';
import { FormatService } from '../services/format/format.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ToastController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.page.html',
  styleUrls: ['./schedules.page.scss'],
})
export class SchedulesPage {
  contacts: any = [
      {
        number: "87988457701",
        description: "Oi",
      },
      {
        number: "87981025566",
        description: "Vivo"
      }
  ];
  schedules: any = {
    listSelected: [],
    list: [
      {
        goingTo: "Palmeirina",
        goingOut: "Garanhuns",
        time: "05h50"
      },
      {
        goingTo: "Garanhuns",
        goingOut: "Palmeirina",
        time: "07h30"
      },
      {
        goingTo: "Palmeirina",
        goingOut: "Garanhuns",
        time: "10h00"
      },
      {
        goingTo: "Garanhuns",
        goingOut: "Palmeirina",
        time: "16h30"
      },
      {
        goingTo: "Palmeirina",
        goingOut: "Garanhuns",
        time: "05h00"
      },
      {
        goingTo: "Garanhuns",
        goingOut: "Palmeirina",
        time: "07h30"
      },
      {
        goingTo: "Palmeirina",
        goingOut: "Garanhuns",
        time: "10h00"
      },
      {
        goingTo: "Garanhuns",
        goingOut: "Palmeirina",
        time: "16h30"
      }]
  };
  segmentSelected: string = "SegSex";

  constructor(
    public format: FormatService,
    private clipboard: Clipboard,
    private toast: ToastController,
    private call: CallNumber
  ) { }

  /**Função que é disparada quando a tela está pronta para terminar a animação. */
  ionViewDidEnter(): void {
    this.segmentSelected = "SegSex";
    this.selectListSchedules();
  }

  /**Função que é utilizada para mudar visualização de lista de horários a partir do dia da semana. */
  selectListSchedules(): void {
    this.schedules.listSelected = [];
    if (this.segmentSelected == "SegSex") {
      this.schedules.listSelected = this.schedules.list.slice(0,4);
    }
    else {
      this.schedules.listSelected = this.schedules.list.slice(4,8);
    }
  }

  /**Função que é utilizada para copiar o contato do motorista. 
   * @param value contato selecionado.
  */
  async copyContact(value): Promise<any> {
    this.clipboard.copy(value);
    const toast = await this.toast.create({
      message: `Número ${value} copiado.`,
      duration: 2000
    });
    toast.present();    
  }

  /**Função que é utilizada para ligar para o motorista. 
   * @param value contato selecionado.
  */
  async callDriver(value): Promise<any> {
    this.call.callNumber(value, true);
  }
}
