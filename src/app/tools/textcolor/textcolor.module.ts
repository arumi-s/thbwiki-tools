import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { TextcolorComponent } from './textcolor.component';
import { TextcolorRoutingModule } from './textcolor-routing.module';
import { PickrDirective } from 'src/app/directive/pickr.directive';
import { SafehtmlPipe } from 'src/app/pipes/safehtml.pipe';

@NgModule({
	declarations: [TextcolorComponent, PickrDirective, SafehtmlPipe],
	imports: [CommonModule, FormsModule, ReactiveFormsModule, ClipboardModule, TextcolorRoutingModule]
})
export class TextcolorModule {}
