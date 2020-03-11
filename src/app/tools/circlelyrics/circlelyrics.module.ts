import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CirclelyricsComponent } from './circlelyrics.component';
import { CirclelyricsRoutingModule } from './circlelyrics-routing.module';
import { WikiApiService } from 'src/app/services/wiki-api.service';

@NgModule({
	imports: [CommonModule, FormsModule, CirclelyricsRoutingModule],
	declarations: [CirclelyricsComponent],
	providers: [WikiApiService]
})
export class CirclelyricsModule {}
