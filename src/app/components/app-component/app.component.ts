import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript/lib/tsserverlibrary';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private translate: TranslateService) {
    translate.addLangs(['el']);
    translate.setDefaultLang('el');
    translate.use('el');
  }
}
