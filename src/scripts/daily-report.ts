import { ReportManager } from "made-report-lib";

export function generateReport(): void {
  const report = new ReportManager();
  const dbpath = "./example";
  report.createReport(dbpath);
}

// Executar a função
generateReport();
