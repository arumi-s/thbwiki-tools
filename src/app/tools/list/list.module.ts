import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { ListComponent } from './list.component';
import { ListRoutingModule } from './list-routing.module';

@NgModule({
	declarations: [ListComponent],
	imports: [CommonModule, FormsModule, ClipboardModule, ListRoutingModule]
})
export class ListModule {}
