import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { QRCodeModule } from 'angularx-qrcode';
import { WalletsComponent } from 'src/components/wallets/wallets.component';

@NgModule({
  declarations: [AppComponent],
  imports: [QRCodeModule, BrowserModule, WalletsComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
