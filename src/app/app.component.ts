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

  qrCode = '';

  chain = chains.find((item) => item.chain_name == 'aura');

  constructor(private wallet: WalletService) {
    this.initWallet();
  }

  mobileConnect() {
    // 'keplr-mobile'
    try {
      this.wallet
        .connectMobile(this.chain.chain_name, 'keplr-mobile')
        .then((data) => {
          console.log(data);

          // if (data) {
          //   this.qrCode = data.data;
          // }
        });
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
      this.wallet.init([this.chain], assets, keplrWallets, true, true, {
        signClient: {
          projectId: '3fb0dea35ab62bfa3116cc507c0b3d89',
          relayUrl: 'wss://relay.walletconnect.org',
          metadata: {
            name: 'HaloTrade',
            description: 'Your Trusted DeFi Hub on Aura Network',
            url: 'https://euphoria.halotrade.zone',
            icons: ['https://euphoria.halotrade.zone/favicon-16x16.png'],
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
}
