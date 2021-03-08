import { Component } from '@angular/core';
import { AlertService } from '../services/alert/alert.service';
import { NavController } from '@ionic/angular';
import { Storage } from "@ionic/storage";

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  terms: boolean = true;

  constructor(
    private customAlert: AlertService,
    private navigation: NavController,
    private storage: Storage
  ){ } 

  /**Função que é utilizada para direcionar cliente a página principal caso ele aceite os termos de uso. */
  goClientPage(): void {
    if (this.terms){
      this.storage.set("access", "client");
      this.navigation.navigateRoot("client");
    }
    else{
      this.customAlert.presentCustomAlert("Termos não aceitos", "É necessário aceitar os termos para acessar o aplicativo.");
    }
  }

  /**Função que é utilizada para direcionar motorista a página de acesso caso ele aceite os termos de uso. */
  goDriverAccess(): void {
    if (this.terms){
      this.navigation.navigateRoot("access");
    }
    else{
      this.customAlert.presentCustomAlert("Termos não aceitos", "É necessário aceitar os termos para acessar o aplicativo.");
    }
  }
 }
