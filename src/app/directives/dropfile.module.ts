import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropfileDirective } from './dropfile.directive';

@NgModule({
	declarations: [DropfileDirective],
	imports: [CommonModule, FormsModule],
	exports: [DropfileDirective]
})
export class DropfileModule {}
