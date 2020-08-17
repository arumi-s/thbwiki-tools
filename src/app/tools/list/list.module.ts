import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { ListComponent } from './list.component';
import { ListRoutingModule } from './list-routing.module';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

@NgModule({
	declarations: [ListComponent],
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, ClipboardModule, ListRoutingModule]
})
export class ListModule {}
