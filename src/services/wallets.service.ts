import { Injectable } from '@angular/core';
import { AssetList, Chain } from '@chain-registry/types';
import {
  ChainWalletBase,
  ChainWalletContext,
  DisconnectOptions,
  EndpointOptions,
  Logger,
  MainWalletBase,
  NameServiceName,
  SessionOptions,
  SignerOptions,
  WalletConnectOptions,
  WalletManager,
  WalletStatus,
} from '@cosmos-kit/core';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  walletManager: WalletManager | null = null;
  logger = new Logger('DEBUG');

  defaultNameService: NameServiceName = 'icns';
  constructor() {}

  init(
    chains: Chain[],
    assetLists: AssetList[],
    wallets: MainWalletBase[],
    throwErrors?: boolean,
    subscribeConnectEvents?: boolean,
    walletConnectOptions?: WalletConnectOptions, // SignClientOptions is required if using wallet connect v2
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
  }

  async connect(chainName: string, walletName: string) {
    const walletManager = this.walletManager;

    const chainWallet = walletManager.getChainWallet(chainName, walletName);

    chainWallet.activate();

    const ChainWalletContext = this.getChainWalletContext(
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

  getChainWalletContext(
    chainId: string,
    wallet?: ChainWalletBase,
    sync = true
  ): ChainWalletContext {
    function walletAssert(
      func: ((...params: any[]) => any | undefined) | undefined,
      params: any[] = [],
      name: string
    ) {
      if (!wallet) {
        throw new Error(
          `Wallet is undefined. Please choose a wallet to connect first.`
        );
      }

      if (!func) {
        throw new Error(
          `Function ${name} not implemented by ${wallet?.walletInfo.prettyName} yet.`
        );
      }

      return func(...params);
    }

    function clientMethodAssert(
      func: ((...params: any[]) => any | undefined) | undefined,
      params: any[] = [],
      name: string
    ) {
      if (!wallet) {
        throw new Error(
          `Wallet is undefined. Please choose a wallet to connect first.`
        );
      }

      if (!wallet?.client) {
        throw new Error(`Wallet Client is undefined.`);
      }

      if (!func) {
        throw new Error(
          `Function ${name} not implemented by ${wallet?.walletInfo.prettyName} Client yet.`
        );
      }

      return func(...params);
    }

    const status = wallet?.walletStatus || WalletStatus.Disconnected;

    return {
      chainWallet: wallet,

      chain: wallet?.chainRecord.chain,
      assets: wallet?.chainRecord.assetList,
      logoUrl: wallet?.chainLogoUrl,
      wallet: wallet?.walletInfo,
      address: wallet?.address,
      username: wallet?.username,
      message: wallet ? wallet.message : 'No wallet is connected walletly.',
      status,

      isWalletDisconnected: status === 'Disconnected',
      isWalletConnecting: status === 'Connecting',
      isWalletConnected: status === 'Connected',
      isWalletRejected: status === 'Rejected',
      isWalletNotExist: status === 'NotExist',
      isWalletError: status === 'Error',

      connect: () => walletAssert(wallet?.connect, [void 0, sync], 'connect'),
      disconnect: (options?: DisconnectOptions) =>
        walletAssert(wallet?.disconnect, [void 0, sync, options], 'disconnect'),
      getRpcEndpoint: (isLazy?: boolean) =>
        walletAssert(wallet?.getRpcEndpoint, [isLazy], 'getRpcEndpoint'),
      getRestEndpoint: (isLazy?: boolean) =>
        walletAssert(wallet?.getRestEndpoint, [isLazy], 'getRestEndpoint'),
      getStargateClient: () =>
        walletAssert(wallet?.getStargateClient, [], 'getStargateClient'),
      getCosmWasmClient: () =>
        walletAssert(wallet?.getCosmWasmClient, [], 'getCosmWasmClient'),
      getSigningStargateClient: () =>
        walletAssert(
          wallet?.getSigningStargateClient,
          [],
          'getSigningStargateClient'
        ),
      getSigningCosmWasmClient: () =>
        walletAssert(
          wallet?.getSigningCosmWasmClient,
          [],
          'getSigningCosmWasmClient'
        ),
      getNameService: () =>
        walletAssert(wallet?.getNameService, [], 'getNameService'),

      estimateFee: (...params: Parameters<ChainWalletContext['estimateFee']>) =>
        walletAssert(wallet?.estimateFee, params, 'estimateFee'),
      sign: (...params: Parameters<ChainWalletContext['sign']>) =>
        walletAssert(wallet?.sign, params, 'sign'),
      broadcast: (...params: Parameters<ChainWalletContext['broadcast']>) =>
        walletAssert(wallet?.broadcast, params, 'broadcast'),
      signAndBroadcast: (
        ...params: Parameters<ChainWalletContext['signAndBroadcast']>
      ) => walletAssert(wallet?.signAndBroadcast, params, 'signAndBroadcast'),

      qrUrl: wallet?.client?.qrUrl,
      appUrl: wallet?.client?.appUrl,

      defaultSignOptions: wallet?.client?.defaultSignOptions,
      setDefaultSignOptions: (
        ...params: Parameters<ChainWalletContext['setDefaultSignOptions']>
      ) =>
        clientMethodAssert(
          wallet?.client?.setDefaultSignOptions.bind(wallet.client),
          [...params],
          'setDefaultSignOptions'
        ),
      enable: () =>
        clientMethodAssert(
          wallet?.client?.enable.bind(wallet.client),
          [chainId],
          'enable'
        ),
      suggestToken: (
        ...params: Parameters<ChainWalletContext['suggestToken']>
      ) =>
        clientMethodAssert(
          wallet?.client?.suggestToken.bind(wallet.client),
          [...params],
          'suggestToken'
        ),
      getAccount: () =>
        clientMethodAssert(
          wallet?.client?.getAccount.bind(wallet.client),
          [chainId],
          'getAccount'
        ),
      getOfflineSigner: () =>
        clientMethodAssert(
          wallet?.client?.getOfflineSigner.bind(wallet.client),
          [chainId, wallet?.preferredSignType],
          'getOfflineSigner'
        ),
      getOfflineSignerAmino: () =>
        clientMethodAssert(
          wallet?.client?.getOfflineSignerAmino.bind(wallet.client),
          [chainId],
          'getOfflineSignerAmino'
        ),
      getOfflineSignerDirect: () =>
        clientMethodAssert(
          wallet?.client?.getOfflineSignerDirect.bind(wallet.client),
          [chainId],
          'getOfflineSignerDirect'
        ),
      signAmino: (...params: Parameters<ChainWalletContext['signAmino']>) =>
        clientMethodAssert(
          wallet?.client?.signAmino.bind(wallet.client),
          [chainId, ...params],
          'signAmino'
        ),
      signDirect: (...params: Parameters<ChainWalletContext['signDirect']>) =>
        clientMethodAssert(
          wallet?.client?.signDirect.bind(wallet.client),
          [chainId, ...params],
          'signDirect'
        ),
      signArbitrary: (
        ...params: Parameters<ChainWalletContext['signArbitrary']>
      ) =>
        clientMethodAssert(
          wallet?.client?.signArbitrary.bind(wallet.client),
          [chainId, ...params],
          'signArbitrary'
        ),
      sendTx: (...params: Parameters<ChainWalletContext['sendTx']>) =>
        clientMethodAssert(
          wallet?.client?.sendTx.bind(wallet.client),
          [chainId, ...params],
          'sendTx'
        ),
    };
  }
}
