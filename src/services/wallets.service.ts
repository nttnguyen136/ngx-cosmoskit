import { Injectable } from '@angular/core';
import { AssetList, Chain } from '@chain-registry/types';
import {
  ChainWalletBase,
  EndpointOptions,
  Logger,
  MainWalletBase,
  NameServiceName,
  SessionOptions,
  SignerOptions,
  WalletConnectOptions,
  WalletManager,
} from '@cosmos-kit/core';
import { BehaviorSubject, delay, lastValueFrom, of } from 'rxjs';
import { getChainWalletContext } from 'src/helpers/wallet';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  logger = new Logger('DEBUG');
  defaultNameService: NameServiceName = 'icns';

  walletManager: WalletManager | null = null;
  chainWallet: ChainWalletBase;

  wc$ = new BehaviorSubject<any>(null);

  get wallets() {
    return this.walletManager?.mainWallets || [];
  }

  constructor() {}

  init(
    chains: Chain[],
    assetLists: AssetList[],
    wallets: MainWalletBase[],
    throwErrors?: boolean,
    subscribeConnectEvents?: boolean,
    walletConnectOptions?: WalletConnectOptions,
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,
    sessionOptions?: SessionOptions,
    disableIframe?: boolean
  ) {
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

    this.walletManager.walletStatus;
  }

  getChainWallet(chainName: string, walletName: string) {
    const walletManager = this.walletManager;

    return walletManager.getChainWallet(chainName, walletName);
  }

  async connectMobile(chainName: string, walletName: string) {
    const walletManager = this.walletManager;

    this.chainWallet = walletManager.getChainWallet(chainName, walletName);

    this.chainWallet.activate();

    this.chainWallet
      .connect()
      .then((data) => {
        this.wc$.next({
          data: {
            res: data,
            walletData: this.chainWallet.data,
            address: this.chainWallet.address,
          },
        });
      })
      .catch((error) => {
        this.wc$.next({
          error: error,
        });
        console.log(error);
      });

    await lastValueFrom(of(null).pipe(delay(500)));

    const { state, data } = this.chainWallet.qrUrl;

    return data;
  }

  disconnect() {
    this.chainWallet?.disconnect().then((value) => {
      console.log(value);

      this.wc$.next(null);
    });
  }

  async connect(chainName: string, walletName: string) {
    const walletManager = this.walletManager;

    const chainWallet = walletManager.getChainWallet(chainName, walletName);

    chainWallet.activate();

    const ChainWalletContext = getChainWalletContext(
      chainWallet.chainId,
      chainWallet,
      true
    );

    if (chainWallet.isMobile) {
      console.log(ChainWalletContext.qrUrl);

      return;
    }

    await ChainWalletContext.connect();
  }
}
