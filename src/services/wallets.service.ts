import { Injectable, OnDestroy } from '@angular/core';
import { AssetList, Chain } from '@chain-registry/types';
import {
  ChainWalletBase,
  ChainWalletContext,
  EndpointOptions,
  Logger,
  MainWalletBase,
  NameServiceName,
  SessionOptions,
  SignerOptions,
  WalletConnectOptions,
  WalletManager,
} from '@cosmos-kit/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WalletService implements OnDestroy {
  logger = new Logger('DEBUG');
  defaultNameService: NameServiceName = 'icns';

  walletManager: WalletManager | null = null;
  chainWallet: ChainWalletBase;

  wc$ = new BehaviorSubject<any>(null);

  get wallets() {
    return this.walletManager?.mainWallets || [];
  }

  constructor() {}

  ngOnDestroy(): void {
    this.walletManager?.onUnmounted();
  }

  initWalletManager({
    chains,
    assetLists,
    wallets,
    throwErrors,
    subscribeConnectEvents,
    walletConnectOptions,
    signerOptions,
    endpointOptions,
    sessionOptions,
    disableIframe,
  }: {
    chains: Chain[];
    assetLists: AssetList[];
    wallets: MainWalletBase[];
    throwErrors?: boolean;
    subscribeConnectEvents?: boolean;
    walletConnectOptions?: WalletConnectOptions;
    signerOptions?: SignerOptions;
    endpointOptions?: EndpointOptions;
    sessionOptions?: SessionOptions;
    disableIframe?: boolean;
  }) {
    this.walletManager = new WalletManager(
      chains,
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

    this.walletManager
      .onMounted()
      .then(() => {
        console.log('Mounted');
      })
      .catch((e) => {
        console.log('Mount Error', e);
      });
  }

  getChainWallet(chainName: string, walletName: string): ChainWalletBase {
    const walletManager = this.walletManager;

    const wallet = walletManager.getChainWallet(chainName, walletName);

    wallet.activate();

    return wallet;
  }
}
