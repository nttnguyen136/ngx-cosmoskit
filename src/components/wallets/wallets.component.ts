import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  ChainContext,
  ChainWalletBase,
  MainWalletBase,
  WalletBase,
  WalletConnectOptions,
} from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { WCWallet } from '@cosmos-kit/walletconnect';
import { QRCodeModule } from 'angularx-qrcode';
import { assets, chains } from 'chain-registry';
import { WalletService } from 'src/services/wallets.service';

@Component({
  standalone: true,
  selector: 'app-wallets',
  styleUrls: ['./wallets.component.scss'],
  templateUrl: './wallets.component.html',
  imports: [CommonModule, QRCodeModule],
  providers: [WalletService],
})
export class WalletsComponent implements OnInit {
  CHAIN = 'aura';
  CHAINS = [this.CHAIN];

  chainList = chains;

  walletSupporteList = [...keplrWallets, ...leapWallets] as MainWalletBase[];

  walletConnectionOption: WalletConnectOptions = {
    signClient: {
      projectId: 'f371e1f6882d401122d20c719baf663a',
      relayUrl: 'wss://relay.walletconnect.org',
      metadata: {
        name: 'Aurascan',
        description: 'Aura Network Explorer',
        url: 'https://ngx-cosmoskit.vercel.app/',
        icons: [
          'https://images.aura.network/aurascan/xstaxy-assets/images/logo/aura-explorer-logo.png',
        ],
      },
    },
  };

  get wallets() {
    return this.walletService.wallets;
  }

  isModeWalletConnect: boolean;
  chainWallet: ChainWalletBase;
  account;
  error;

  currentChain: ChainContext;

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    try {
      this.walletService.initWalletManager({
        chains: this.chainList.filter((item) => item.chain_name == this.CHAIN),
        assetLists: assets,
        wallets: this.walletSupporteList.filter((x) => x.isModeWalletConnect),
        throwErrors: true,
        walletConnectOptions: this.walletConnectionOption,
        disableIframe: true,
      });

      console.log(this.walletService.walletManager.isMobile);
    } catch (error) {
      console.log('initWalletManager error', error);
    }
  }

  getLogoOfWallet(walletInfo: WalletBase['walletInfo']) {
    return typeof walletInfo?.logo == 'string'
      ? walletInfo?.logo
      : walletInfo?.logo?.major;
  }

  disconnect() {
    this.chainWallet.disconnect();

    this.account = null;
  }

  connect(wallet: WalletBase) {
    const { isModeWalletConnect, isMobile, walletName } = wallet;

    this.chainWallet = this.walletService.getChainWallet(
      this.CHAIN,
      walletName
    );

    this.chainWallet
      ?.connect()
      .then(() => {
        return this.chainWallet.client.getAccount(this.chainWallet.chainId);
      })
      .then((account) => {
        console.log(account);

        this.account = account;
      })
      .catch((e) => {
        console.log('Eeee', e);
      });

    if (isModeWalletConnect) {
      const wcWalletClient = wallet as WCWallet;

      wcWalletClient
        .initClient({
          signClient: wallet.walletInfo?.walletconnect,
        })
        .then(() => {
          console.log('Open app...');

          wcWalletClient.clientMutable?.data?.openApp();
        })
        .catch((error) => {
          console.log('Errorr....', error);

          this.error = { error: error };
        });
    }
  }

  sign() {}
}
