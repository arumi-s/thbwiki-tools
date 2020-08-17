import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { TracksComponent } from './tracks.component';
import { TracksRoutingModule } from './tracks-routing.module';
import { DropfileModule } from '../../directives/dropfile.module';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

@NgModule({
	declarations: [TracksComponent],
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, ClipboardModule, TracksRoutingModule, DropfileModule]
})
export class TracksModule {}
