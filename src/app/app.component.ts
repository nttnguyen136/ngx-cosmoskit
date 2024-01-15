import { Component } from '@angular/core';
import { ChainWalletBase, MainWalletBase } from '@cosmos-kit/core';
import { assets, chains } from 'chain-registry';
import { lastValueFrom, take } from 'rxjs';
import { getChainWalletContext } from 'src/helpers/wallet';
import { WalletService } from 'src/services/wallets.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ngx-cosmoskit';
  constructor() {}
}
