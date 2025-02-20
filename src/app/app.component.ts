import { JsonPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { HeaderComponent } from './shared/components/header/header.component';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    JsonPipe,
    HeaderComponent,
    MatSidenavModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatRippleModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isAppOnline: boolean | null = null;

  @ViewChild('drawer') drawer: any;

  constructor(
    private swPush: SwPush,
    private swUpdate: SwUpdate,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    // Checking SW based updates
    if (this.swUpdate.isEnabled) {
      // This doesnt work but it should
      // this.swUpdate.checkForUpdate();
      // this.swUpdate.versionUpdates.subscribe((uptate) => {
      //   if (uptate.type === 'VERSION_READY') {
      //     const message = 'New version available. Load New Version?!';
      //     this._snackBar
      //       .open(message, 'Install Now!', {
      //         horizontalPosition: 'center',
      //         verticalPosition: 'top',
      //       })
      //       .onAction()
      //       .subscribe(() => {
      //         console.log('reloading app!');
      //         location.reload();
      //       });
      //   }
      // });
    }

    // IU updats on Network changes
    this.updateNetworkStatusUI();
    window.addEventListener('offline', () => {
      this.updateNetworkStatusUI(true);
    });
    window.addEventListener('online', () => {
      this.updateNetworkStatusUI(true);
    });
  }

  registerForPush() {
    if (this.swPush.isEnabled) {
      console.log('Requesting Subscription enabled');

      Notification.requestPermission((permission) => {
        if (permission === 'granted') {
          this.swPush
            .requestSubscription({
              serverPublicKey:
                'BFyC3F13uWHDwrELaCbEu988Li_s2JpRiQIPsw42aj_eawQXTTLok7j4P6MHQAMPAEN31eU_EFa1OiNx9RVFpxg',
              //6s-e-kPjsYz2vnrlevyqARiMiZGGZHjxRIHUqISysic
            })
            .then((registration) => {
              console.log('Subscription', registration);
            });
        }
      });
    }
  }

  updateNetworkStatusUI(showToast: boolean = false) {
    this.isAppOnline = navigator.onLine;
    if (showToast) {
      const message = this.isAppOnline ? 'You are online' : 'You are offline';
      this.openSnackBar(message);
    }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, 'Close', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  toggleDrawer = () => {
    this.drawer.toggle();
  };
}
