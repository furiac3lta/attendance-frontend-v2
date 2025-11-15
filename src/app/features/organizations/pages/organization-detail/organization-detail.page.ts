import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { OrganizationsService } from '../../../../core/services/organizations.service';
import { Organization } from '../../models/organization.model';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-organization-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './organization-detail.page.html',
  styleUrls: ['./organization-detail.page.css'],
})
export class OrganizationDetailPage implements OnInit {

  organization?: Organization;
  message = '';

  // ✅ Necesario para la tabla de info
  orgBasicData: { label: string; value: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private orgService: OrganizationsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.loadOrganization(id);
  }

  loadOrganization(id: number): void {
    this.orgService.findById(id).subscribe({
      next: (res) => {
        this.organization = res;

        // ✅ Ahora sí se arma la tabla *después* de tener los datos
        this.orgBasicData = [
          { label: 'Tipo', value: res.type },
          { label: 'Dirección', value: res.address || '—' },
          { label: 'Teléfono', value: res.phone || '—' },
          { label: 'Administrador', value: res.admin?.fullName || 'Sin asignar' }
        ];

       // console.log('🏢 Detalle organización:', res);
      },
      error: (err) => {
        console.error('❌ Error al cargar detalle:', err);
        this.message = '❌ No se pudo cargar la organización.';
      },
    });
  }
}
