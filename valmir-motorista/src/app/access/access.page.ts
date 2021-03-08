import { Component } from '@angular/core';
import { ValidationService } from '../services/validation/validation.service';
import { AlertService } from '../services/alert/alert.service';
import { ApiService } from '../services/api/api.service';
import { NavController, LoadingController } from '@ionic/angular';
import { Storage } from "@ionic/storage";

@Component({
  selector: 'app-access',
  templateUrl: './access.page.html',
  styleUrls: ['./access.page.scss'],
})
export class AccessPage {
  formAccess: any = {
    email: "",
    password: ""
  };
  private accessAttempts: number = 0;
  private minutesWaiting: number = 0;
  spinner: boolean = false;

  constructor(
    private validation: ValidationService,
    private customAlert: AlertService,
    private api: ApiService,
    private navigation: NavController,
    private storage: Storage,
    private loading: LoadingController
  ) { }

  /**Função que define se desabilita por um tempo ou prossegue a tentativa de acesso do motorista. */
  btnCheckIfUserForcedAccess(): void {
      if (this.accessAttempts == 5) {
        this.accessAttempts = 0;
        this.minutesWaiting += 1;
        this.disableAccessTemporarily(); 
      }
      else {
        this.validForm();
      }
  }

  /**Função que habilita loading por um determinado tempo para que usuário não force acesso indevido ao módulo do motorista. */
  async disableAccessTemporarily(): Promise<any> {
    let loading = await this.loading.create({
      message: `5 tentativas de acesso. Aguarde ${this.minutesWaiting} minuto(s) para tentar novamente...`,
      showBackdrop: false,
      spinner: "lines-small",
      duration: 60000 * this.minutesWaiting
    });
    loading.present();
  }

  /**Função que verifica os dados do motorista antes de tentar validar acesso. */
  validForm(): void {
    this.formAccess.email = this.formAccess.email.trim();
    this.formAccess.password = this.formAccess.password.trim();
    let customMessage: any = ["inválid", "Verifique o prenchimento d"];
    if (!this.validation.isSet(this.formAccess.email) || !this.validation.isSet(this.formAccess.password)) {
      this.customAlert.presentCustomAlert("Existe algum campo não prenchido", `${customMessage[1]}e todos os campos.`);
    }
    else if (!this.validation.validInput(this.formAccess.email, "email")) {
      this.customAlert.presentCustomAlert(`Email ${customMessage[0]}o`, `${customMessage[1]}o email.`);
    }
    else if (!this.validation.validInput(this.formAccess.password, "password")) {
      this.customAlert.presentCustomAlert(`Senha ${customMessage[0]}a`, `${customMessage[1]}a senha.`);
    }
    else {
      this.access();
    }
  }

  /**Função que tenta validar acesso do motorista. */
  access(): void {
    this.spinner = true;
    this.api.getDriverKeyAccess()
      .then((result) => {
        this.spinner = false;
        if (result.key == btoa(this.formAccess.email + this.formAccess.password)) {
          this.storage.set("access", "driver");
          this.navigation.navigateRoot("driver");
        }
        else {
          this.accessAttempts += 1;
          this.storage.remove("driverAccess");
          this.customAlert.presentCustomAlert("Acesso negado", "Caso não seja o motorista responsável pelo App, <strong>recomendamos não forçar o acesso</strong>.")
        }
      }).catch(() => {
        this.customAlert.presentToast("Erro inesperado. Verifique sua conexão com à internet");
      });
  }
}
