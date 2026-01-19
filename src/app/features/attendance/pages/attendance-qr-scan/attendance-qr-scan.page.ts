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
  private activeStream?: MediaStream;
  scanning = false;
  processing = false;
  private errorShown = false;
  lastError = '';
  lastScanText = '';
  readonly debugVersion = 'qr-debug-v1';

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
    this.stopScan();
    this.scanning = true;
    this.errorShown = false;
    this.lastError = '';
    this.lastScanText = '';

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

    const stream = await this.getCameraStream();
    if (!stream) {
      return;
    }

    this.activeStream = stream;
    videoEl.srcObject = stream;
    try {
      await videoEl.play();
    } catch {
      // Ignore autoplay restrictions; scan continues once video plays.
    }

    try {
      const controls = await this.reader.decodeFromStream(
        stream,
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
          if (err?.name && err.name !== 'NotFoundException' && this.isCameraError(err.name) && !this.errorShown) {
            this.errorShown = true;
            this.stopScan();
            this.lastError = this.resolveCameraError(err.name);
            Swal.fire('Cámara no disponible', this.lastError, 'error');
          }
        }
      );
      
      this.controls = controls;
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
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((t) => t.stop());
      this.activeStream = undefined;
    }
    this.scanning = false;
    this.processing = false;
    if (this.video?.nativeElement) {
      BrowserQRCodeReader.cleanVideoSource(this.video.nativeElement);
    }
    BrowserQRCodeReader.releaseAllStreams();
  }

  private handleResult(text: string): void {
    const cleaned = text.trim();
    this.lastScanText = cleaned;
    const parsed = this.parseQrText(cleaned);
    if (!parsed) {
      this.processing = false;
      const preview = cleaned.length > 140 ? `${cleaned.slice(0, 140)}…` : cleaned;
      Swal.fire('QR inválido', `No se reconoció el QR de asistencia.\n${preview}`, 'error');
      return;
    }

    const { classId, token } = parsed;

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

  private matchFromUrl(value: string): RegExpMatchArray | null {
    try {
      const parsed = new URL(value);
      const classId = parsed.searchParams.get('classId');
      const token = parsed.searchParams.get('token');
      if (classId && token) {
        return ['', classId, token] as RegExpMatchArray;
      }
    } catch {
      // Not a URL.
    }
    return null;
  }

  private parseQrText(value: string): { classId: number; token: string } | null {
    const fromUrl = this.matchFromUrl(value);
    if (fromUrl) {
      const classId = Number(fromUrl[1]);
      const token = fromUrl[2];
      if (!Number.isNaN(classId) && token) {
        return { classId, token };
      }
    }

    const compact = value.replace(/\s+/g, '');
    const lower = compact.toLowerCase();
    const classIdx = lower.indexOf('class');
    const tokenIdx = lower.indexOf('token');
    if (classIdx === -1 || tokenIdx === -1) {
      return null;
    }

    const classPart = compact.slice(classIdx + 5, tokenIdx);
    const tokenPart = compact.slice(tokenIdx + 5);
    const classMatch = classPart.match(/(\d+)/);
    const tokenMatch = tokenPart.match(/([A-Za-z0-9]+)/);
    if (!classMatch || !tokenMatch) {
      return null;
    }

    const classId = Number(classMatch[1]);
    const token = tokenMatch[1];
    if (Number.isNaN(classId) || !token) {
      return null;
    }

    return { classId, token };
  }

  private resolveCameraError(name?: string, message?: string): string {
    if (name === 'NotAllowedError') {
      return this.buildCameraError('Debes permitir el acceso a la cámara.', name, message);
    }
    if (name === 'NotFoundError') {
      return this.buildCameraError('No se encontró una cámara disponible.', name, message);
    }
    if (name === 'NotReadableError') {
      return this.buildCameraError('La cámara está siendo usada por otra app.', name, message);
    }
    if (name === 'NotSupportedError') {
      return this.buildCameraError('El navegador no soporta acceso a cámara.', name, message);
    }
    if (name === 'OverconstrainedError') {
      return this.buildCameraError('No se pudo seleccionar la cámara trasera.', name, message);
    }
    return this.buildCameraError('Activa los permisos de cámara e intenta nuevamente.', name, message);
  }

  private isCameraError(name: string): boolean {
    return [
      'NotAllowedError',
      'NotFoundError',
      'NotReadableError',
      'NotSupportedError',
      'OverconstrainedError',
      'SecurityError'
    ].includes(name);
  }

  private buildCameraError(base: string, name?: string, message?: string): string {
    const details = [name, message].filter(Boolean).join(' - ');
    return details ? `${base} (${details})` : base;
  }

  private async getCameraStream(): Promise<MediaStream | null> {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
    } catch (err) {
      const errName = (err as { name?: string; message?: string } | null)?.name;
      const errMessage = (err as { message?: string } | null)?.message;
      if (errName && errName !== 'NotFoundError' && errName !== 'OverconstrainedError') {
        this.scanning = false;
        this.lastError = this.resolveCameraError(errName, errMessage);
        console.error('Camera error (preferred):', err);
        Swal.fire('Cámara no disponible', this.lastError, 'error');
        return null;
      }
    }

    try {
      return await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      const errName = (err as { name?: string; message?: string } | null)?.name;
      const errMessage = (err as { message?: string } | null)?.message;
      this.scanning = false;
      this.lastError = this.resolveCameraError(errName, errMessage);
      console.error('Camera error (fallback):', err);
      Swal.fire('Cámara no disponible', this.lastError, 'error');
      return null;
    }
  }
}
