import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { TextcolorComponent } from './textcolor.component';
import { TextcolorRoutingModule } from './textcolor-routing.module';
import { PickrDirective } from '../../directives/pickr.directive';
import { SafehtmlPipe } from '../../pipes/safehtml.pipe';
import { NgxGoogleAnalyticsModule } from 'ngx-google-analytics';

@NgModule({
	declarations: [TextcolorComponent, PickrDirective, SafehtmlPipe],
	imports: [CommonModule, FormsModule, NgxGoogleAnalyticsModule, ReactiveFormsModule, ClipboardModule, TextcolorRoutingModule]
})
export class TextcolorModule {}
