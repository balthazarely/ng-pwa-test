import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebNotificationService } from './core/services/web-notifications.service';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, JsonPipe, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'pwa-test';

  ngOnInit() {
    window.addEventListener('offline', () => {
      console.log('App is offline!');
      this.sendOfflineNotification();
    });
  }

  sendOfflineNotification() {}
}
