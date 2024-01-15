import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MainWalletBase, WalletBase } from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { assets, chains } from 'chain-registry';
import { WalletService } from 'src/services/wallets.service';

@Component({
  standalone: true,
  selector: 'app-wallets',
  styleUrls: ['./wallets.component.scss'],
  templateUrl: './wallets.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [WalletService],
})
export class WalletsComponent implements OnInit {
  get wallets() {
    return this.walletService.wallets;
  }

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
    console.log(wallet?.state);

    console.log(wallet.walletInfo);
  }
}
