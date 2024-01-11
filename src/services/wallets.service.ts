import { Injectable } from '@angular/core';
import { AssetList, Chain } from '@chain-registry/types';
import {
  Data,
  EndpointOptions,
  Logger,
  LogLevel,
  MainWalletBase,
  NameServiceName,
  SessionOptions,
  SignerOptions,
  State,
  WalletConnectOptions,
  WalletManager,
  WalletModalProps,
  WalletRepo,
} from '@cosmos-kit/core';
import { wallets } from '@cosmos-kit/keplr';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  wallet: WalletManager | null = null;
  logger = new Logger('DEBUG');
  constructor() {}

  init(
    chains: Chain[],
    assetLists: AssetList[],
    wallets: MainWalletBase[],
    throwErrors?: boolean,
    subscribeConnectEvents?: boolean,
    defaultNameService?: NameServiceName,
    walletConnectOptions?: WalletConnectOptions, // SignClientOptions is required if using wallet connect v2
    signerOptions?: SignerOptions,
    endpointOptions?: EndpointOptions,
    sessionOptions?: SessionOptions,
    disableIframe?: boolean
  ) {
    this.wallet = new WalletManager(
      chains,
      assetLists,
      wallets,
      this.logger,
      throwErrors,
      subscribeConnectEvents,
      false,
      defaultNameService,
      walletConnectOptions,
      signerOptions,
      endpointOptions,
      sessionOptions
    );

    this.wallet.setActions({
      viewOpen: () => {
        console.log('openView');
      },
    });
  }

  async connect() {
    const repo = this.wallet.walletRepos[0];
    await repo.connect();

    const w = repo.wallets[0];

    const data = await w.initClient();

    console.log(data);

    // this.wallet.getMainWallet(wallets.find(i => i.walletName == ''))
  }
}
