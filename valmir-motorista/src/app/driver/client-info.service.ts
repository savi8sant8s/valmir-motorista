import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientInfoService {
  private clientInfo: any;

  constructor() { }

  /**Função que pega os dados do cliente. */
  getClientInfo(): any {
    return this.clientInfo;
  }

  /**Função que define os dados do cliente. */
  setClientInfo(clientInfo): void {
    this.clientInfo = clientInfo;
  }
}
