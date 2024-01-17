import { Injectable, OnDestroy } from '@angular/core';
import { AssetList, Chain } from '@chain-registry/types';
import {
  ChainName,
  ChainWalletBase,
  EndpointOptions,
  Logger,
  MainWalletBase,
  NameServiceName,
  SessionOptions,
  SignerOptions,
  WalletConnectOptions,
  WalletManager,
  WalletName,
} from '@cosmos-kit/core';
import { assets } from 'chain-registry';
import { getChainWalletContext } from 'src/helpers/wallet';

@Injectable({
  providedIn: 'root',
})
export class WalletService implements OnDestroy {
  logger = new Logger('DEBUG');
  defaultNameService: NameServiceName = 'icns';
  walletManager: WalletManager | null = null;

  chain: Chain;

  get wallets() {
    return this.walletManager?.mainWallets || [];
  }

  constructor() {}

  ngOnDestroy(): void {
    this.walletManager?.onUnmounted();
  }

  async initWalletManager({
    chain,
    wallets,
    throwErrors,
    subscribeConnectEvents,
    walletConnectOptions,
    signerOptions,
    endpointOptions,
    sessionOptions,
    disableIframe,
  }: {
    chain: Chain;
    wallets: MainWalletBase[];
    throwErrors?: boolean;
    subscribeConnectEvents?: boolean;
    walletConnectOptions?: WalletConnectOptions;
    signerOptions?: SignerOptions;
    endpointOptions?: EndpointOptions;
    sessionOptions?: SessionOptions;
    disableIframe?: boolean;
  }) {
    if (!chain) {
      throw new Error('Chain is required');
    }

    this.chain = chain;

    const assetLists = assets.filter(
      (asset) => (asset.chain_name = chain.chain_name)
    );

    this.walletManager = new WalletManager(
      [chain],
      assetLists,
      wallets,
      this.logger,
      throwErrors,
      subscribeConnectEvents,
      disableIframe,
      this.defaultNameService,
      walletConnectOptions,
      signerOptions,
      endpointOptions,
      sessionOptions
    );

    await this.walletManager.onMounted();
  }

  get state() {
    return this.walletManager.state;
  }

  getChainWallet(walletName: WalletName): ChainWalletBase {
    const wallet = this.walletManager.getChainWallet(
      this.chain.chain_name,
      walletName
    );

    wallet.activate();

    return wallet;
  }

  getMainWallet() {
    return this.walletManager.getMainWallet(this.chain.chain_name);
  }

  getWalletRepo() {
    return this.walletManager.getWalletRepo(this.chain.chain_name);
  }

  getChainRecord() {
    return this.walletManager.getChainRecord(this.chain.chain_name);
  }

  getChainLogo() {
    return this.walletManager.getChainLogo(this.chain.chain_name);
  }

  getChainWalletContext(chainWallet: ChainWalletBase) {
    if (!this.chain) {
      return undefined;
    }

    return getChainWalletContext(this.chain.chain_id, chainWallet, true);
  }

  signWithWC(chainWallet) {
    return chainWallet.client.signArbitrary(
      this.chain.chain_id,
      chainWallet.address,
      'Test message'
    );
  }
}
