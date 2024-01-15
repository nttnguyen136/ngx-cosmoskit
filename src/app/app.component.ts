import { Component } from '@angular/core';
import { ChainWalletBase } from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { assets, chains } from 'chain-registry';

import { firstValueFrom, lastValueFrom, take } from 'rxjs';
import { getChainWalletContext } from 'src/helpers/wallet';
import { WalletService } from 'src/services/wallets.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ngx-cosmoskit';
  dataResponse = null;

  qrCode = '';

  chain = chains.find((item) => item.chain_name == 'aura');

  chainWallet: ChainWalletBase;

  constructor(private wallet: WalletService) {
    this.initWallet();
  }

  signMessage() {
    const chainContext = getChainWalletContext('aura', this.chainWallet, true);
    const address = this.dataResponse.address;
    console.log('Address', address);

    chainContext.signArbitrary(address, 'From N with Love').then((data) => {
      console.log(data);
    });
  }

  mobileConnect2() {
    this.chainWallet = this.wallet.getChainWallet(
      this.chain.chain_name,
      'keplr-mobile'
    );

    this.chainWallet
      .connect(true)
      .then((data) => {
        console.log(data);

        this.dataResponse = this.chainWallet.data;
      })
      .catch((e) => {
        console.log(e);

        this.dataResponse = e;
      });
  }

  mobileConnect() {
    try {
      this.wallet
        .connectMobile(this.chain.chain_name, 'keplr-mobile')
        .then((data) => {
          if (data) {
            this.qrCode = data;

            return lastValueFrom(this.wallet.wc$.pipe(take(2)));
          }

          return null;
        })
        .then((data) => {
          this.qrCode = null;
          this.dataResponse = data;

          if (data?.error) {
            console.error(data.error);
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  disconnect() {
    this.wallet.disconnect();
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
      this.wallet.init([this.chain], assets, [...keplrWallets], true, true, {
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
