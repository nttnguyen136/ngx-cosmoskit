import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MainWalletBase, Mutable, State, WalletBase } from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
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
  chainId = 'aura';

  chainList = chains;

  walletSupporteList = [...keplrWallets, ...leapWallets] as MainWalletBase[];

  walletConnectionOption = {
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
  };

  get wallets() {
    return this.walletService.wallets;
  }

  isModeWalletConnect: boolean;
  account;
  chainWallet;
  error;

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    try {
      this.walletService.init(
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

  connect(wallet: WalletBase) {
    const { walletName, isModeWalletConnect } = wallet ?? {};

    const chainWallet = this.walletService.walletManager.getChainWallet(
      this.chainId,
      walletName
    );

    chainWallet.callbacks = {
      beforeConnect: () => {
        console.log('beforeConnect');

        console.log(chainWallet.qrUrl);
      },

      afterConnect: () => {
        console.log('afterConnect');

        console.log(chainWallet.qrUrl);
      },
    };

    this.isModeWalletConnect = isModeWalletConnect;

    this.chainWallet = chainWallet;

    chainWallet
      .connect(true)
      .then(() => {
        console.log(chainWallet.state, chainWallet.data);

        this.account = chainWallet.data;
      })
      .catch((e) => {
        this.error = e;
      });
  }

  sign() {}
}
