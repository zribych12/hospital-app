import { Component, OnInit, signal } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { RdvStatusBadgeComponent } from '../../../shared/components/rdv-status-badge/rdv-status-badge.component';
import { StatsService, MedecinStats } from '../../../core/services/stats.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-medecin-dashboard',
  standalone: true,
  imports: [SidebarComponent, StatCardComponent, RdvStatusBadgeComponent, NgChartsModule, DatePipe],
  templateUrl: './medecin-dashboard.component.html',
})
export class MedecinDashboardComponent implements OnInit {
  stats = signal<MedecinStats | null>(null);
  loading = signal(true);

  donutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  lineData: ChartData<'line'> = { labels: [], datasets: [] };

  donutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: { legend: { position: 'right' } },
  };

  lineOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    plugins: { legend: { display: false } },
  };

  constructor(private statsService: StatsService, public auth: AuthService) {}

  ngOnInit(): void {
    this.statsService.getMedecinStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.buildCharts(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildCharts(data: MedecinStats): void {
    this.donutData = {
      labels: data.pathologies.map((p) => p._id),
      datasets: [
        {
          data: data.pathologies.map((p) => p.count),
          backgroundColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
            '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
          ],
        },
      ],
    };

    this.lineData = {
      labels: data.consultEvolution.map((c) => c._id),
      datasets: [
        {
          data: data.consultEvolution.map((c) => c.count),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }

  getPatientName(rdv: MedecinStats['prochainRdv'][0]): string {
    if (rdv.patient) return `${rdv.patient.prenom} ${rdv.patient.nom}`;
    if (rdv.patientPublic) return `${rdv.patientPublic.prenom} ${rdv.patientPublic.nom}`;
    return 'Patient inconnu';
  }
}
