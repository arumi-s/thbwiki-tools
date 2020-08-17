import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { SortComponent } from './sort.component';
import { SortRoutingModule } from './sort-routing.module';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

@NgModule({
	declarations: [SortComponent],
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, ClipboardModule, SortRoutingModule]
})
export class SortModule {}
