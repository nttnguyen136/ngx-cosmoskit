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

  constructor(private wallet: WalletService) {
    this.initWallet();
  }

  connect() {
    this.wallet.connect();
  }

  initWallet() {
    try {
      const chain = chains.filter((item) => item.chain_name == 'aura');
      this.wallet.init(chain, assets, keplrWallets);
    } catch (error) {
      console.log(error);
    }
  }
}
