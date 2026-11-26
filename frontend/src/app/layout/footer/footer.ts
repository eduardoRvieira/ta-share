import { Component, inject } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html'
})
export class Footer {
  readonly layout = inject(LayoutService);
}