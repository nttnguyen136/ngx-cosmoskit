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
import { MsgDelegate } from 'cosmjs-types/cosmos/staking/v1beta1/tx';
import { GenerateDelegateMessage } from 'src/helpers/message';

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
        chain: this.chainList.find((item) => item.chain_name == this.CHAIN),
        wallets: this.walletSupporteList,
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
    this.chainWallet = this.walletService.getChainWallet(wallet.walletName);

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
  }

  sign() {
    if (this.chainWallet.isModeWalletConnect) {
      this.signWithWC();
    } else {
      this.signWithContext();
    }
  }

  signWithWC() {
    this.walletService
      .signWithWC('Test message')
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async broadcast() {
    const { address, signAndBroadcast } =
      this.walletService.getChainWalletContext(this.chainWallet);

    const message = GenerateDelegateMessage(
      address,
      {
        to: 'aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx',
        amount: '51469',
      },
      'uaura'
    );

    signAndBroadcast([message], {
      gas: '99068',
      amount: [
        {
          amount: '19814',
          denom: 'uaura',
        },
      ],
    })
      .then((r) => {
        console.log(r);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  signWithContext() {
    const chainContext = this.walletService.getChainWalletContext(
      this.chainWallet
    );

    if (chainContext) {
      chainContext
        .signArbitrary(chainContext.address, 'Test message')
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
}
