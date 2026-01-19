import { Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-attendance-qr-scan',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './attendance-qr-scan.page.html',
  styleUrls: ['./attendance-qr-scan.page.css']
})
export class AttendanceQrScanPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('video', { static: true }) video?: ElementRef<HTMLVideoElement>;

  private reader = new BrowserQRCodeReader();
  private controls?: IScannerControls;
  scanning = false;
  processing = false;
  private errorShown = false;
  lastError = '';

  constructor(
    private attendanceSvc: AttendanceService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const proPlan = !!this.auth.getUser()?.organizationProPlan;
    if (!proPlan) {
      Swal.fire('Plan PRO', 'Esta función está disponible solo para plan PRO.', 'info');
      this.router.navigate(['/dashboard/student']);
      return;
    }
  }

  ngAfterViewInit(): void {
    // Start scan only after user interaction to ensure camera permissions.
  }

  ngOnDestroy(): void {
    this.stopScan();
  }

  startScan(): void {
    if (!this.video || this.scanning) return;
    this.scanning = true;
    this.errorShown = false;
    this.lastError = '';

    if (!navigator.mediaDevices?.getUserMedia) {
      this.scanning = false;
      this.lastError = 'El navegador no soporta cámara.';
      Swal.fire('Cámara no disponible', this.lastError, 'error');
      return;
    }
    void this.startDecode();
  }

  private async startDecode(): Promise<void> {
    const videoEl = this.video?.nativeElement;
    if (!videoEl) {
      this.scanning = false;
      this.lastError = 'No se encontró el video para escanear.';
      Swal.fire('Cámara no disponible', this.lastError, 'error');
      return;
    }

    try {
      const devices = await BrowserQRCodeReader.listVideoInputDevices();
      if (!devices.length) {
        throw { name: 'NotFoundError' };
      }
      const preferred = devices.find((d) => /back|rear|environment/i.test(d.label)) ?? devices[0];
      const controls = await this.reader.decodeFromVideoDevice(
        preferred.deviceId,
        videoEl,
        (result: { getText: () => string } | undefined, _err: unknown, innerControls: IScannerControls | undefined) => {
          if (innerControls) {
            this.controls = innerControls;
          }
          if (result && !this.processing) {
            this.processing = true;
            this.handleResult(result.getText());
          }
          const err = _err as { name?: string } | null;
          if (err?.name && err.name !== 'NotFoundException' && !this.errorShown) {
            this.errorShown = true;
            this.stopScan();
            this.lastError = this.resolveCameraError(err.name);
            Swal.fire('Cámara no disponible', this.lastError, 'error');
          }
        }
      );
      this.controls = controls;
      try {
        await videoEl.play();
      } catch {
        // Ignore autoplay restrictions; scan still runs once the stream is active.
      }
    } catch (err) {
      const errName = (err as { name?: string } | null)?.name;
      this.scanning = false;
      this.lastError = this.resolveCameraError(errName);
      Swal.fire('Cámara no disponible', this.lastError, 'error');
    }
  }

  stopScan(): void {
    this.controls?.stop();
    this.controls = undefined;
    this.scanning = false;
    this.processing = false;
  }

  private handleResult(text: string): void {
    const match = text.match(/ATTENDANCE:CLASS:(\\d+):TOKEN:([A-Za-z0-9]+)/);
    if (!match) {
      this.processing = false;
      Swal.fire('QR inválido', 'No se reconoció el QR de asistencia.', 'error');
      return;
    }

    const classId = Number(match[1]);
    const token = match[2];

    this.attendanceSvc.registerAttendanceViaQr(classId, token).subscribe({
      next: () => {
        this.stopScan();
        Swal.fire('Asistencia registrada', 'Tu asistencia fue marcada con QR.', 'success')
          .then(() => this.router.navigate(['/dashboard/student']));
      },
      error: () => {
        this.processing = false;
        Swal.fire('Error', 'No se pudo registrar la asistencia.', 'error');
      }
    });
  }

  private resolveCameraError(name?: string): string {
    if (name === 'NotAllowedError') {
      return 'Debes permitir el acceso a la cámara.';
    }
    if (name === 'NotFoundError') {
      return 'No se encontró una cámara disponible.';
    }
    if (name === 'NotReadableError') {
      return 'La cámara está siendo usada por otra app.';
    }
    if (name === 'NotSupportedError') {
      return 'El navegador no soporta acceso a cámara.';
    }
    return 'Activa los permisos de cámara e intenta nuevamente.';
  }
}
