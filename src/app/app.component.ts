import { Component } from '@angular/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { assets, chains } from 'chain-registry';
import { WalletService } from 'src/services/wallets.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ngx-cosmoskit';

  chain = chains.find((item) => item.chain_name == 'aura');

  constructor(private wallet: WalletService) {
    this.initWallet();
  }

  mobileConnect() {
    // 'keplr-mobile'
    try {
      this.wallet.connect(this.chain.chain_name, 'keplr-mobile');
    } catch (error) {
      console.log(error);
    }
  }

  connect() {
    try {
      this.wallet.connect(this.chain.chain_name, 'keplr-extension');
    } catch (error) {
      console.log(error);
    }
  }

  initWallet() {
    try {
      this.wallet.init([this.chain], assets, keplrWallets);
    } catch (error) {
      console.log(error);
    }
  }
}
