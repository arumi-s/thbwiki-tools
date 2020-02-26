import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { SortComponent } from './sort.component';
import { SortRoutingModule } from './sort-routing.module';

@NgModule({
	declarations: [SortComponent],
	imports: [CommonModule, FormsModule, ClipboardModule, SortRoutingModule]
})
export class SortModule {}
