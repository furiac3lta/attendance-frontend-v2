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
    MatCard
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

  ngOnInit() {
    this.loadOrganizations();
    this.loadAdmins();
  }

  // 📌 Cargar organizaciones
  loadOrganizations() {
    this.orgService.findAll().subscribe({
      next: (res) => {
        this.organizations = res || [];
      },
      error: (err) => {
        console.error('❌ Error al cargar organizaciones:', err);
        Swal.fire('Error', '❌ No se pudieron cargar las organizaciones', 'error');
      },
    });
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

  // 📌 Eliminar organización
  deleteOrganization(id: number) {
    Swal.fire({
      title: '¿Eliminar organización?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.orgService.delete(id).subscribe({
        next: () => {
          Swal.fire('Eliminado', 'Organización eliminada', 'success');
          this.loadOrganizations();
        },
        error: (err) => {
          console.error('❌ Error al eliminar organización:', err);
          Swal.fire('Error', 'No se pudo eliminar la organización', 'error');
        },
      });
    });
  }

  // 📌 Columnas de la tabla
  displayedColumns =
    this.userRole === 'SUPER_ADMIN'
      ? ['name', 'type', 'phone', 'address', 'admin', 'selectAdmin', 'actions']
      : ['name', 'type', 'phone', 'address', 'admin'];
}
