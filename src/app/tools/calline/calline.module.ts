import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CallineComponent } from './calline.component';
import { CallineRoutingModule } from './calline-routing.module';

@NgModule({
	declarations: [CallineComponent],
	imports: [CommonModule, FormsModule, CallineRoutingModule]
})
export class CallineModule {}
