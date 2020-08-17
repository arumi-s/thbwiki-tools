import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CirclelyricsComponent } from './circlelyrics.component';
import { CirclelyricsRoutingModule } from './circlelyrics-routing.module';
import { WikiApiService } from '../../services/wiki-api.service';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

@NgModule({
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, CirclelyricsRoutingModule],
	declarations: [CirclelyricsComponent],
	providers: [WikiApiService]
})
export class CirclelyricsModule {}
