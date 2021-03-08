import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import { ApiService } from 'src/app/services/api/api.service';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { AlertService } from 'src/app/services/alert/alert.service';
import { FormatService } from 'src/app/services/format/format.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  map: Leaflet.Map;
  spinner: any = {
    client: false,
    driver: false
  };
  driver: any = {
    markers: null,
    coords: [],
    info: null
  }
  private customMessageGPSError: string = "Ocorreu um erro inesperado ao tentar";

  constructor(
    private api: ApiService,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private customAlert: AlertService,
    public format: FormatService,
    private alert: AlertController
  ) { }

  /**Função que é disparada quando a página já animou para a exibição de entrada. */
  ionViewDidEnter(): void {
    this.createMap();
    this.getDriverMessage();
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
      }).catch(() => {
        this.customAlert.presentCustomAlert("Tente novamente", `${this.customMessageGPSError} <strong>verificar</strong> permissão do GPS.`);
      })
  }

  /**Função que é utilizada para solicitar permissão do GPS ao usuário. */
  private requestGPSPermission() {
    this.locationAccuracy.canRequest()
      .then((canRequest: boolean) => {
        if (!canRequest) {
          this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
            .then(() => {
              this.askToTurnOnGPS();
            }).catch(() => {
              this.customAlert.presentCustomAlert("Tente novamente", `${this.customMessageGPSError} <strong>pedir</strong> permissão do GPS.`);
            });
        }
      });
  }

  /**Função que é utilizada para pedir permissão do GPS ao usuário. */
  private askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(() => {
        this.sayDriverWhereIam();
      }).catch(() => {
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

  /**Função que é utilizada para pegar a localização do motorista. */
  getDriverLocation(): void {
    this.spinner.driver = true;
    this.api.getDriverLocation()
      .then((result) => {
        this.spinner.driver = false;
        if (result.tracking == "TRUE") {
          if (this.driver.markers != null) {
            //Remove o último ponto do cliente marcado no mapa caso ele exista.
            this.map.removeLayer(this.driver.markers);
          }
          this.driver.coords = [result.latitude, result.longitude];
          let iconDriver = Leaflet.icon({
            iconUrl: 'assets/img/van.png',
            iconSize: [35, 35]
          });
          this.driver.markers = Leaflet.marker(this.driver.coords, { icon: iconDriver }).addTo(this.map).bindPopup('Valmir está aqui.');
          this.map.setView(this.driver.coords, 17);
        }
        else if (result.tracking == "FALSE") {
          this.customAlert.presentToast("No momento, Valmir parou de mandar a localização.");
        }
      }).catch(() => {
        this.spinner.driver = false;
        this.customAlert.presentToast("Verifique sua conexão com à internet.");
      });
  }

  /**Função que é utilizada para pegar a última mensagem do motorista. */
  private getDriverMessage(): void {
    this.api.getDriverMessage().then((result) => {
      if (result.message) {
        this.driver.info = result;
      }
      else {
        this.driver.info.message = "Sem mensagens no momento.";
      }
    }).catch(() => {
      this.customAlert.presentToast("Erro inesperado. Verifique sua conexão com à internet.");
    });
  }

  /**Função que é utilizada para cliente dizer ao motorista onde ele está.*/
  async sayDriverWhereIam(): Promise<any> {
    let alert = await this.alert.create({
      header: 'Viajem com Valmir',
      message: 'Informe seu nome e onde você está para Valmir.',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nome'
        },
        {
          name: 'message',
          type: 'text',
          placeholder: 'Onde está'
        }],
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Confirmar',
          handler: (data) => {
            if (data.name.length >= 3 && data.message.length >= 3) {
              this.spinner.client = true;
              this.geolocation.getCurrentPosition({ timeout: 3000, enableHighAccuracy: true }).then(async (response) => {
                this.spinner.client = false;
                this.api.sayDriverWhereIam(data.name, data.message, response.coords.latitude, response.coords.longitude).then(() => {
                  this.customAlert.presentCustomAlert("Sucesso", "Mensagem enviada");
                }).catch(() => {
                  this.customAlert.presentToast("Erro inesperado. Verifique sua conexão com à internet");
                });
              });
            } else {
              this.alert.dismiss();
              this.customAlert.presentCustomAlert("Campos incorretos", "Preencha os campos.");
            }
          }
        }
      ]
    });
    await alert.present();
  }
}