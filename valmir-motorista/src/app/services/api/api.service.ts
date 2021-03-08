import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as moment from "moment";

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private url: string = "https://api.sheetson.com/v2/sheets";
  private headers: HttpHeaders = new HttpHeaders({
    "X-Spreadsheet-Id": "1G3h1cmWfICSJqAPmpdlVM5fnNWABiwTVvbAQBtBYsZ4",
    "Authorization": "Bearer " + "Cc2n24hhOAr-PActbVaOm0BpiHNPNRfQViq-QcvjF_XuLV4ymYfe9SLBYaI"
  });

  constructor(
    private http: HttpClient
  ) {
    moment.locale("pt-br");
  }

  /**Função que envia atualização de localização do motorista para os clientes. 
   * @param latitude latitude do motorista.
   * @param longitude logitude do motorista.
   * @param tracking status de envio de localização.
  */
  async updateDriverLocation(latitude: number, longitude: number, tracking: boolean): Promise<any> {
    let body: any = {
      timestamp: new Date(),
      latitude: latitude,
      longitude: longitude,
      tracking: tracking,
    };
    return this.http.patch(`${this.url}/Location/2`, body, { headers: this.headers }).toPromise();
  }

  /**Função que envia mensagem do motorista. 
   * @param message mensagem do motorista.
  */
  async sendDriverMessage(message): Promise<any> {
    let body: any = {
      timestamp: new Date(),
      message: message
    };
    return this.http.patch(`${this.url}/Message/2`,
      body, { headers: this.headers }).toPromise();
  }

  /**Função que pega mensagem do motorista para os clientes. 
   * @template resposta Objeto {rowIndex, timestamp, status, message}
  */
  async getDriverMessage(): Promise<any> {
    return this.http.get(`${this.url}/Message/2`,
      { headers: this.headers }).toPromise();
  }

  /**Função que pega chave de acesso do motorista para validar com a chave fornecida no App.
   * @template resposta Objeto {rowIndex, key}
  */
  async getDriverKeyAccess(): Promise<any> {
    return this.http.get(`${this.url}/Access/2`,
      { headers: this.headers }).toPromise();
  }

  /**Função que pega atualização de localização do motorista para os clientes. 
  * @template resposta Objeto {rowIndex, timestamp, status, latitude, longitude, tracking}
 */
  async getDriverLocation(): Promise<any> {
    return this.http.get(`${this.url}/Location/2`, { headers: this.headers }).toPromise();
  }

  /**Função para cliente informar ao motorista onde ele está.
  * @param name nome do cliente.
  * @param message mensagem do cliente.
  * @param latitude latitude do cliente.
  * @param longitude longitude do cliente.
 */
  async sayDriverWhereIam(name, message, latitude, longitude): Promise<any> {
    let body: any = {
      date: moment(new Date()).format('L'),
      time: moment(new Date()).format('LTS'),
      name: name,
      message: message,
      latitude: latitude,
      longitude: longitude
    };
    return this.http.post(`${this.url}/ClientMessages`, body, 
    { headers: this.headers }).toPromise();
  }

 /**Função para motorista pegar a lista de usuários que informaram onde estão.
 * @template resposta Objeto {rowIndex, date, time, name, message, latitude, longitude}
 */
async getClientsInfoLocation(): Promise<any> {
  return this.http.get(`${this.url}/ClientMessages?`, { headers: this.headers }).toPromise();
}
}
