import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ChainContext,
  ChainWalletBase,
  ChainWalletContext,
  MainWalletBase,
  WalletBase,
  WalletConnectOptions,
} from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { LeapMobileInfo } from '@cosmos-kit/leap-mobile';
import { IWCClient, WCClient, WCWallet } from '@cosmos-kit/walletconnect';
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
  account;
  chainWallet: ChainWalletBase;
  error;

  currentChain: ChainContext;

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    try {
      this.walletService.initWalletManager(
        this.chainList,
        assets,
        this.walletSupporteList,
        true,
        true,
        this.walletConnectionOption
      );
    } catch (error) {
      console.log(error);
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
    this.chainWallet = this.walletService.getChainWallet(
      this.CHAIN,
      wallet.walletName
    );

    this.chainWallet
      ?.connect()
      .then(() => {
        return this.chainWallet.client.getAccount(this.chainWallet.chainId);
      })
      .then((account) => {
        console.log(account);

        this.account = account;
      });

    if (wallet.isModeWalletConnect && wallet.isMobile) {
      const wcWalletClient = wallet as WCWallet;

      wcWalletClient
        .initClient({
          signClient: wallet.walletInfo?.walletconnect,
        })
        .then(() => {
          wcWalletClient.clientMutable?.data?.openApp();
        })
        .catch((error) => {
          this.error = { error: error };
        });
    }
  }

  sign() {}
}