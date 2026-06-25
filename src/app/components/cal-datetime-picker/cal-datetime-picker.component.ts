import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CalService } from 'src/app/services/cal-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cal-datetime-picker',
  templateUrl: './cal-datetime-picker.component.html',
  styleUrls: ['./cal-datetime-picker.component.scss'],
  standalone: false
})
export class CalDatetimePickerComponent implements OnInit, OnChanges {
  @Input() selectedProductCalEventTypeId: number | null = null;
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<string | null>();

  currentDate = new Date();
  slots: string[] = [];
  loading = false;
  selectedSlot: string | null = null;
  private sub = new Subscription();

  constructor(private calService: CalService) {}

  ngOnInit(): void {
    this.fetchSlots();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedProductCalEventTypeId'] || changes['currentDate']) {
      this.fetchSlots();
    }
  }

  prev(): void {
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() - 1);
    this.slots = [];
    this.selectedSlot = null;
    this.fetchSlots();
  }

  next(): void {
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() + 1);
    this.slots = [];
    this.selectedSlot = null;
    this.fetchSlots();
  }

  changeDate(delta: number): void {
    this.currentDate = new Date(this.currentDate);
    this.currentDate.setDate(this.currentDate.getDate() + delta);
    this.slots = [];
    this.selectedSlot = null;
    this.fetchSlots();
  }

  get currentDateLabel(): string {
    return this.currentDate.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  get showSlots(): boolean {
    return this.slots.length > 0 || this.loading;
  }

  isSelected(slot: string): boolean {
    return this.selectedSlot === slot;
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
    const d = this.currentDate;
    const pad = (n: number) => String(n).padStart(2, '0');
    const timePart = slot.replace(/^(\d{2}:\d{2}:\d{2}).*$/, '$1');
    const iso = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${timePart}Z`;
    this.valueChange.emit(iso);
  }

  get selectedValue(): string | null {
    if (!this.selectedSlot) return null;
    const d = this.currentDate;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${this.selectedSlot}Z`;
  }

  private fetchSlots(): void {
    if (!this.selectedProductCalEventTypeId || this.disabled) {
      this.slots = [];
      this.loading = false;
      return;
    }

    const yyyy = this.currentDate.getFullYear();
    const mm = String(this.currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(this.currentDate.getDate()).padStart(2, '0');
    const dateOnly = `${yyyy}-${mm}-${dd}`;

    this.loading = true;
    this.slots = [];

    const id = this.selectedProductCalEventTypeId as number;
    const s = this.calService.getAvailableSlots({
      eventTypeId: id,
      startDate: dateOnly,
      endDate: dateOnly,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).subscribe({
      next: (data: any) => {
        const times: string[] = [];
        const raw = data?.slots?.[dateOnly] || [];
        for (const item of raw) {
          if (typeof item === 'string') times.push(item);
          else if (item?.time) times.push(item.time);
        }
        this.slots = times.sort();
        this.loading = false;
      },
      error: () => {
        this.slots = [];
        this.loading = false;
      }
    });

    this.sub.add(s);
  }
}