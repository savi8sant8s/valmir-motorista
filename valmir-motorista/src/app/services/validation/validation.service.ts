import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() { }

  isSet(value: any): boolean{
    return !(value == null || value == undefined || value == "")
  }

  /**Função utilizada para validar valores. 
   * @param value valor a ser validado.
   * @param regexName nome da regex.
  */
  validInput(value: string, regexName: string): boolean{
    return {
      "email": new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/),
      "password": new RegExp(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{8,}$/)
    }[regexName].test(value);
  }
}
