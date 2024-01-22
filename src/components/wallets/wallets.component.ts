import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Chain } from '@chain-registry/types';
import { Decimal } from '@cosmjs/math';
import { GasPrice } from '@cosmjs/stargate';
import {
  ChainContext,
  ChainWalletBase,
  MainWalletBase,
  SignerOptions,
  WalletBase,
  WalletConnectOptions,
} from '@cosmos-kit/core';
import { wallets as keplrWallets } from '@cosmos-kit/keplr';
import { wallets as leapWallets } from '@cosmos-kit/leap';
import { wallets as coin98Wallets } from '@cosmos-kit/coin98';
import { QRCodeModule } from 'angularx-qrcode';
import { chains } from 'chain-registry';
import { GenerateDelegateMessage } from 'src/helpers/message';
import { WalletService } from 'src/services/wallets.service';
import { wallets as coin98MobileWallets } from 'src/utils/wallets/coin98-mobile';

@Component({
  standalone: true,
  selector: 'app-wallets',
  styleUrls: ['./wallets.component.scss'],
  templateUrl: './wallets.component.html',
  imports: [CommonModule, QRCodeModule],
  providers: [WalletService],
})
export class WalletsComponent implements OnInit {
  CHAIN_NAME = 'sei';

  chain = chains.find((c) => c.chain_name == this.CHAIN_NAME);

  walletSupportedList = [
    ...keplrWallets,
    ...leapWallets,
    ...coin98Wallets,
    ...coin98MobileWallets,
  ] as MainWalletBase[];

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

  signerOptions: SignerOptions = {
    signingCosmwasm: (chain: Chain) => {
      const coin = chain.fees.fee_tokens[0];

      //convert gasPrice to Decimal
      let gasStep = coin.average_gas_price;
      let pow = 1;

      while (!Number.isInteger(gasStep)) {
        gasStep = gasStep * Math.pow(10, pow);
        pow++;
      }

      return {
        gasPrice: new GasPrice(
          Decimal.fromAtomics(gasStep.toString(), pow),
          chain.daemon_name
        ),
      };
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
    console.log(chains);

    try {
      this.walletService.initWalletManager({
        chain: this.chain,
        wallets: this.walletSupportedList,
        throwErrors: true,
        walletConnectOptions: this.walletConnectionOption,
        disableIframe: true,
        signerOptions: this.signerOptions,
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
    console.log(this.wallets);

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
        to: 'seivaloper1y82m5y3wevjneamzg0pmx87dzanyxzht0kepvn',
        amount: '51469',
      },
      this.chain.fees.fee_tokens[0].denom
    );

    signAndBroadcast([message], {
      gas: '99068',
      amount: [
        {
          amount: '19814',
          denom: this.chain.fees.fee_tokens[0].denom,
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
