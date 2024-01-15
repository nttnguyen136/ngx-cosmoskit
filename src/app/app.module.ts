import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [AppComponent],
  imports: [QRCodeModule, BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
