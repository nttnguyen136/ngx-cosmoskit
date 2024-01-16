import { Component, OnInit } from '@angular/core';
import eruda from 'eruda';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ngx-cosmoskit';
  constructor() {}
  ngOnInit(): void {
    let el = document.createElement('div');
    document.body.appendChild(el);

    eruda.init({
      container: el,
      tool: ['console', 'elements', 'resources', 'network'],
    });
  }
}
