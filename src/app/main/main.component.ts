import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip
} from "ng-apexcharts";
import { GlobalCrudService } from '../service/global.service';
import { MatIcon } from "@angular/material/icon";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend?: ApexLegend; // facultatif si non utilisé
};

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    ChartComponent,
    MatIcon
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'] // Corrigé ici
})
export class MainComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  chartOptions: Partial<ChartOptions> = {}; // Utilisation de Partial pour éviter les erreurs de type
  nombreGenre: any[] = []; // Initialisé comme tableau vide


  constructor(
    private globalService: GlobalCrudService,
  ) {}

  ngOnInit(): void {
    this.getNombreUitlisateur();
    this.getNombreActivite();
    this.getNombreActiviteEncours();
    this.getNombreActiviteEnAttente();
    this.getNombreActiviteTerminer();
    this.fetchGenreData();
  }

  nombreUtilisateurs: number | undefined;
  nombreActivite: number = 0;
  nombreActiviteEncours: number = 0;
  nombreActiviteEnAttente: number = 0;
  nombreActiviteTerminer: number = 0;

  getNombreUitlisateur() {
    this.globalService.get("utilisateur/nombre").subscribe({
      next: (count) => {
        this.nombreUtilisateurs = count;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  getNombreActivite() {
    this.globalService.get("activite/nombre").subscribe({
      next: (count) => {
        this.nombreActivite = count;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  getNombreActiviteEncours() {
    this.globalService.get("activite/nombreActivitesEncours").subscribe({
      next: (count) => {
        this.nombreActiviteEncours = count;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  getNombreActiviteEnAttente() {
    this.globalService.get("activite/nombreActivitesEnAttente").subscribe({
      next: (count) => {
        this.nombreActiviteEnAttente = count;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  getNombreActiviteTerminer() {
    this.globalService.get("activite/nombreActivitesTerminer").subscribe({
      next: (count) => {
        this.nombreActiviteTerminer = count;
      },
      error: err => {
        console.log(err);
      }
    });
  }

  initializeChart() {
    const hommeData = this.nombreGenre.find(g => g.genre === "homme")?.count || 0;
    const femmeData = this.nombreGenre.find(g => g.genre === "femme")?.count || 0;

    // Vérifiez si les données sont valides
    console.log('Homme Data:', hommeData, 'Femme Data:', femmeData);

    this.chartOptions = {
      series: [
        {
          name: "Homme",
          data: [hommeData]
        },
        {
          name: "Femme",
          data: [femmeData]
        },
      ],
      chart: {
        type: "bar",
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: [
          "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"
        ]
      },
      yaxis: {
        title: {
          text: "$ (thousands)"
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function(val: number) {
            return "$ " + val + " thousands";
          }
        }
      }
    };
  }

  fetchGenreData() {
    this.globalService.get("reporting/participants-par-genre").subscribe({
      next: (data) => {
        this.nombreGenre = data;
        console.log("Données de genre récupérées :", this.nombreGenre); // Vérifiez ici
        this.initializeChart();
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des données de genre :", err);
      }
    });
  }
}
