import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CropComponent } from './crop.component';
import { CropRoutingModule } from './crop-routing.module';
import { DropfileModule } from '../../directives/dropfile.module';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';
import { SafeurlPipe } from '../../pipes/safeurl.pipe';

@NgModule({
	declarations: [CropComponent, SafeurlPipe],
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, CropRoutingModule, DropfileModule]
})
export class CropModule {}
