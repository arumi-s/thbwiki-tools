import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { LrctowikiComponent } from './lrctowiki.component';
import { LrctowikiRoutingModule } from './lrctowiki-routing.module';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

@NgModule({
	declarations: [LrctowikiComponent],
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, ClipboardModule, LrctowikiRoutingModule]
})
export class LrctowikiModule {}
