import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Subscription } from 'rxjs';
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AlertService } from 'src/app/services/alert/alert.service';
import * as Leaflet from 'leaflet';
import { AlertController } from '@ionic/angular';
import { ForegroundService } from '@ionic-native/foreground-service/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  map: Leaflet.Map;
  private subscription: Subscription;
  markers: any;
  coords: any = [];
  message: string = "";
  spinner: any = {
    message: false,
    send: false,
    pause: false
  };
  private customMessageGPSError: string = "Ocorreu um erro inesperado ao tentar";

  constructor(
    private api: ApiService,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private customAlert: AlertService,
    private alert: AlertController,
    public foregroundService: ForegroundService) {
  }

  /**Função que é disparada quando a página já animou para a exibição de entrada. */
  ionViewDidEnter(): void {
    this.createMap();
  }

  /**Função que é disparada quando a página já terminou a animação de saída. */
  ionViewDidLeave(): void {
    this.map.remove();
  }

  /**Função que é utilizada para checar permissão do GPS ao usuário. */
  checkGPSPermission(): void {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
    .then((result) => {
        if (result.hasPermission) {
          this.askToTurnOnGPS();
        } else {
          this.requestGPSPermission();
        }
      }).catch(()=> {
        this.spinner.send = false;
        this.customAlert.presentCustomAlert("Tente novamente", `${this.customMessageGPSError} <strong>verificar</strong> permissão do GPS.`);
      })
  }

  /**Função que é utilizada para solicitar permissão do GPS ao usuário. */
  private requestGPSPermission(): void {
    this.locationAccuracy.canRequest()
      .then((canRequest: boolean) => {
        if (!canRequest) {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
            .then(() => {
              this.askToTurnOnGPS();
            }).catch(() => {
              this.spinner.send = false;
              this.customAlert.presentCustomAlert("Tente novamente", `${this.customMessageGPSError} <strong>pedir</strong> permissão do GPS.`);
            });
        }
      });
  }

  /**Função que é utilizada para pedir permissão do GPS ao usuário. */
  private askToTurnOnGPS(): void {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
    .then(() => {
        this.sendLocation();
      }).catch(() => {
        this.spinner.send = false;
        this.customAlert.presentCustomAlert("Tente novamente", `${this.customMessageGPSError} <strong>ativar</strong> o GPS.`);
      });
  }

  /**Função que é utilizada para criar o mapa. */
  private createMap(): void {
    this.map = Leaflet.map('mapId').setView([-9.002137, -36.325678], 15);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'App Valmir Motorista',
    }).addTo(this.map);
  }

  /**Função que é utilizada para mostrar alerta com corpo da mensagem para confirmação. */
  async btnSendMessage(): Promise<any> {
    this.message = this.message.trim();
    if (this.message.length >= 5){
      let alert = await this.alert.create({
        header: "Confirmação de mensagem",
        message: `"${this.message}"`,
        buttons: [
          {
            text: "Cancelar"
          },
          {
            text: "Confirmar", 
            handler: () => {
              this.sendMessage();
            }
          }
        ]
      });
      alert.present();
    }
    else{
      this.customAlert.presentCustomAlert("Mensagem curta", "Digite uma mensagem com pelo menos 5 caracteres.");
    }
  }

  /**Função que é utilizada para enviar mensagem do motorista para os clientes. */
  private sendMessage(): void {
    this.spinner.message = true;
    this.api.sendDriverMessage(this.message).then((result) => {
      this.spinner.message = false;
      if (result.message) {
        this.message = "";
        this.customAlert.presentCustomAlert("Sucesso", "Mensagem enviada.");
      }
    }).catch(() => {
      this.spinner.message = false;
      this.customAlert.presentToast("Erro inesperado. Verifique sua conexão com à internet.");
    });
  }

  /**Função que é utilizada para enviar localização do motorista para os clientes. */
  sendLocation(): void {
    this.spinner.send = true;
    //this.foregroundService.start('GPS ativo', 'Enviando localização aos clientes...');
    this.subscription = this.geolocation.watchPosition().subscribe(async (response) => {
      if (this.markers != null){
        this.map.removeLayer(this.markers);
      }
      this.coords = [response.coords.latitude, response.coords.longitude];
      let iconDriver = Leaflet.icon({
        iconUrl: 'assets/img/van.png',
        iconSize: [50,50]
      });
      this.markers = Leaflet.marker(this.coords , {icon: iconDriver}).addTo(this.map).bindPopup('Você está aqui.').openPopup();
      this.map.setView(this.coords, 17);
      this.api.updateDriverLocation(response.coords.latitude, response.coords.longitude, true)
      .then((result)=>{
        this.spinner.pause = false;
        if (!result.latitude) {
          this.customAlert.presentCustomAlert("Tente novamente", "Problema inesperado.");
          this.spinner.send = false;
        }
      }).catch(() => {
        this.customAlert.presentToast("Erro inesperado. Verifique sua conexão com à internet.");
        this.spinner.send = false;
      });
    });
  }

  /**Função que é utilizada para pausar envio de localização do motorista para os clientes. */
  btnPauseLocation(): void {
    this.spinner.send = false;
    this.spinner.pause = true;
    this.subscription.unsubscribe();
    //this.foregroundService.stop();
    this.api.updateDriverLocation(this.coords[0], this.coords[1], false)
      .then(() => {
        this.spinner.pause = false;
        this.customAlert.presentToast("Localização pausada.");
      }).catch(() => {
        this.spinner.pause = false;
        this.customAlert.presentToast("Erro inesperado. Verifique sua conexão com à internet.");
      });
  }
}
