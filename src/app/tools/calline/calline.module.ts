import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CallineComponent } from './calline.component';
import { CallineRoutingModule } from './calline-routing.module';
import { DropfileModule } from '../../directives/dropfile.module';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

@NgModule({
	declarations: [CallineComponent],
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, CallineRoutingModule, DropfileModule]
})
export class CallineModule {}
