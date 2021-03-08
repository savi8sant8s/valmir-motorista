import { Component } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Storage } from "@ionic/storage";
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private navigation: NavController,
    private router: Router
  ) {
    this.platform.backButton.subscribe(()=>{
      if (this.router.url === '/home' ||
          this.router.url === '/driver/home' || 
          this.router.url === '/client/home'){
            navigator['app'].exitApp();
      }
      else{
        this.navigation.pop();
      } 
    });       
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#3c2255');
      this.storage.get("access").then((result) => {
        if(result != undefined || result != null){
          this.navigation.navigateRoot(result);
        }
      });
      setTimeout(()=>{
        this.splashScreen.hide();  
      },1000);
    });
  }
}
