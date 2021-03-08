import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class FormatService {

  constructor() {
    //Define horário brasileiro a se considerar.
    moment.locale("pt-br");
   }

  /**Função utiizada para formatar string aplicando uma máscara. 
   * @param value valor a ser formatado.
   * @param pattern padrão da formatação.
  */
  formatText(value: string, pattern: string): any {
    value = value.toString();
    if (value.length == pattern.split("#").length - 1){
      let i = 0;
      return pattern.replace(/#/g, _ => value[i++]);
    }
    else{
      return false;
    }
  }

  /**Função utiizada para formatar data da mensagem enviada pelo motorista.
   * @param date data da mensagem.
  */
  formatDateTimeMessage(date: any): string {
    return moment(date).startOf('hour').fromNow();
  }
}
