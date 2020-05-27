import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { EventComponent } from './event.component';
import { EventRoutingModule } from './event-routing.module';
import { EventPreviewComponent } from './event-preview/event-preview.component';

@NgModule({
	declarations: [EventComponent, EventPreviewComponent],
	imports: [CommonModule, FormsModule, ClipboardModule, EventRoutingModule]
})
export class EventModule {}
