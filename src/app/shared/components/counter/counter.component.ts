import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { interval, Observable } from 'rxjs';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counter.component.html',
  styleUrl: './counter.component.scss',
})
export class CounterComponent {
  count$: Observable<number> = interval(2000);

  ngOnInit() {
    this.count$.subscribe((int) => console.log('count is counting...', int));
  }
}
