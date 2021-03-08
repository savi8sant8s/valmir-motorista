import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private alert: AlertController,
    private toast: ToastController
  ) { }

  /**Função que dispara alerta customizado.
   * @param title título do alerta.
   * @param message mensagem do alerta.
   */
  async presentCustomAlert(title, message): Promise<any>{
    let alert = await this.alert.create({
      header: title,
      message: message,
      buttons: ["Entendi"]
    });
    alert.present();
  }

  /**Função que dispara toast customizado.
   * @param message mensagem do toast.
   */
  async presentToast(message): Promise<any> {
    const toast = await this.toast.create({
      message: message,
      duration: 2000
    });
    toast.present();    
  }
}
