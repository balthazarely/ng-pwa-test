import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class WebNotificationService {
  #swPush = inject(SwPush);

  messages = toSignal(this.#swPush.messages);

  get isEnabled() {
    return this.#swPush.isEnabled;
  }
}
