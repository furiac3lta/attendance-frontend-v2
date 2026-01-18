import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationsService } from '../../../../core/services/organizations.service';
import { UsersService } from '../../../../core/services/users.service';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCard,
    MatSlideToggleModule
  ],
  templateUrl: './organization-list.page.html',
  styleUrls: ['./organization-list.page.css'],
})
export class OrganizationListPage {

  private orgService = inject(OrganizationsService);
  private usersService = inject(UsersService);

  organizations: any[] = [];
  admins: any[] = [];
  selectedAdmin: Record<number, number | null> = {};
  userRole: string | null = sessionStorage.getItem('role');
  showInactive = false;

  ngOnInit() {
    this.loadOrganizations();
    this.loadAdmins();
  }

  // 📌 Cargar organizaciones
  loadOrganizations() {
    this.orgService.findAll(!this.showInactive).subscribe({
      next: (res) => {
        this.organizations = res || [];
      },
      error: (err) => {
        console.error('❌ Error al cargar organizaciones:', err);
        Swal.fire('Error', '❌ No se pudieron cargar las organizaciones', 'error');
      },
    });
  }

  toggleInactiveView() {
    this.loadOrganizations();
  }

  // 📌 Cargar admins
  loadAdmins() {
    this.usersService.getUsersByRole('ADMIN').subscribe({
      next: (admins) => {
        this.admins = admins;
      },
      error: () => Swal.fire('Error', '❌ Error al cargar usuarios administradores', 'error'),
    });
  }

  // 📌 Asignar admin
  assignAdmin(orgId: number) {
    const adminId = this.selectedAdmin[orgId];

    if (!adminId) {
      Swal.fire('Atención', '⚠️ Seleccioná un administrador', 'warning');
      return;
    }

    this.orgService.assignAdmin(orgId, adminId).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Administrador asignado correctamente', 'success');
        this.loadOrganizations();
      },
      error: (err) => {
        console.error('❌ Error al asignar admin:', err);
        Swal.fire('Error', '❌ No se pudo asignar el administrador', 'error');
      },
    });
  }

  // 📌 EDITAR ORGANIZACIÓN (SweetAlert2)
  editOrganization(org: any) {
    Swal.fire({
      title: 'Editar organización',
      html: `
        <input id="org-name" class="swal2-input" placeholder="Nombre" value="${org.name}">
        <input id="org-type" class="swal2-input" placeholder="Tipo" value="${org.type}">
        <input id="org-phone" class="swal2-input" placeholder="Teléfono" value="${org.phone}">
        <input id="org-address" class="swal2-input" placeholder="Dirección" value="${org.address}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        return {
          name: (document.getElementById('org-name') as HTMLInputElement).value,
          type: (document.getElementById('org-type') as HTMLInputElement).value,
          phone: (document.getElementById('org-phone') as HTMLInputElement).value,
          address: (document.getElementById('org-address') as HTMLInputElement).value,
          logoUrl: org.logoUrl ?? null,
          proPlan: !!org.proPlan
        };
      }
    }).then(result => {
      if (!result.isConfirmed) return;

      this.orgService.update(org.id, result.value).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'La organización fue editada correctamente', 'success');
          this.loadOrganizations();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo actualizar la organización', 'error');
        }
      });
    });
  }

  toggleProPlan(org: any) {
    const nextPlan = !org.proPlan;

    this.orgService.update(org.id, {
      name: org.name,
      type: org.type,
      phone: org.phone,
      address: org.address,
      logoUrl: org.logoUrl ?? null,
      proPlan: nextPlan
    }).subscribe({
      next: () => {
        org.proPlan = nextPlan;
        Swal.fire('Actualizado', 'Plan actualizado correctamente', 'success');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el plan', 'error');
      }
    });
  }

  // 📌 Activar / Desactivar organización
  toggleOrganizationActive(org: any) {
    const nextActive = !org.active;
    const action$ = nextActive
      ? this.orgService.activate(org.id)
      : this.orgService.deactivate(org.id);

    action$.subscribe({
      next: () => {
        org.active = nextActive;
        const shouldRemove =
          (!this.showInactive && !nextActive) || (this.showInactive && nextActive);
        if (shouldRemove) {
          this.organizations = this.organizations.filter(o => o.id !== org.id);
        }
      },
      error: (err) => {
        console.error('❌ Error al actualizar estado:', err);
        Swal.fire('Error', 'No se pudo actualizar la organización', 'error');
      }
    });
  }

  // 📌 Columnas de la tabla
  displayedColumns =
    this.userRole === 'SUPER_ADMIN'
      ? ['name', 'type', 'phone', 'address', 'plan', 'admin', 'selectAdmin', 'status', 'actions']
      : ['name', 'type', 'phone', 'address', 'admin', 'status'];


    }
