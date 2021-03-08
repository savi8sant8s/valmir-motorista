import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import { ModalController } from '@ionic/angular';
import { ClientInfoService } from '../client-info.service';
import { Subscription } from 'rxjs';
import { Geolocation }from "@ionic-native/geolocation/ngx";
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { AlertService } from 'src/app/services/alert/alert.service';

@Component({
  selector: 'app-client-location',
  templateUrl: './client-location.component.html',
  styleUrls: ['./client-location.component.scss'],
})
export class ClientLocationComponent {
  map: any;
  subscription: Subscription;
  coords: any = [];
  antPath: any;
  marker: any;
  private customMessageGPSError: string = "Ocorreu um erro inesperado ao tentar";

  constructor(
    private modal: ModalController,
    public clientInfo: ClientInfoService,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy,
    private customAlert: AlertService
  ) { }

  /**Função que é disparada quando a página já animou para a exibição de entrada. */
  ionViewDidEnter(): void {
    this.createMap(this.clientInfo.getClientInfo().name,
      this.clientInfo.getClientInfo().latitude,
      this.clientInfo.getClientInfo().longitude);
      this.checkGPSPermission();
  }

  /**Função que é utilizada para criar o mapa. */
  private createMap(name, latitude, longitude): void {
    this.map = Leaflet.map('mapId2').setView([latitude, longitude], 15);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'App Valmir Motorista',
    }).addTo(this.map);
    let iconClient = Leaflet.icon({
      iconUrl: 'assets/img/person.png',
      iconSize: [35, 35]
    });
    Leaflet.marker([latitude, longitude], { icon: iconClient }).addTo(this.map).bindPopup(`${name} está aqui.`).openPopup();
  }

  /**Função que é utilizada para pegar localização do motorista. */
  async getLocation(): Promise<any> {
    this.subscription = this.geolocation.watchPosition().subscribe(async (response) => {
      if (this.marker != null){
        this.map.removeLayer(this.marker);
      }
      if (this.antPath != null){
        this.map.removeLayer(this.antPath);
      }
      this.coords = [response.coords.latitude, response.coords.longitude];
      let iconDriver = Leaflet.icon({
        iconUrl: 'assets/img/van.png',
        iconSize: [50,50]
      });
      this.marker = Leaflet.marker(this.coords , {icon: iconDriver}).addTo(this.map).bindPopup('Você está aqui.');
      /**Função que é utilizada para calcular e mostrar a distância entre o cliente e o motorista. */
      this.map.fitBounds([this.coords, [this.clientInfo.getClientInfo().latitude,this.clientInfo.getClientInfo().longitude]]);
    });
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
        this.getLocation();
      }).catch(() => {
        this.customAlert.presentCustomAlert("Tente novamente", `${this.customMessageGPSError} <strong>ativar</strong> o GPS.`);
      });
  }

  /**Função utilizada para fechar o modal do mapa. */
  dismissMap(): void {
    if (this.subscription != null){
      this.subscription.unsubscribe();
    }
    this.map.remove();
    this.modal.dismiss();
  }
}
