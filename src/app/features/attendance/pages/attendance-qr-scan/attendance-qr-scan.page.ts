import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class AttendanceQrScanPage implements OnInit, OnDestroy {
  @ViewChild('video', { static: true }) video?: ElementRef<HTMLVideoElement>;

  private reader = new BrowserQRCodeReader();
  private controls?: IScannerControls;
  scanning = false;
  processing = false;

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
    this.startScan();
  }

  ngOnDestroy(): void {
    this.stopScan();
  }

  startScan(): void {
    if (!this.video || this.scanning) return;
    this.scanning = true;

    this.reader.decodeFromVideoDevice(
      undefined,
      this.video.nativeElement,
      (result: { getText: () => string } | undefined, _err: unknown, controls: IScannerControls | undefined) => {
      if (controls) {
        this.controls = controls;
      }
      if (result && !this.processing) {
        this.processing = true;
        this.handleResult(result.getText());
      }
      }
    );
  }

  stopScan(): void {
    this.controls?.stop();
    this.controls = undefined;
    this.scanning = false;
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
}
