import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type Sample } from "@shared/schema";
import { calculateHEI, calculateOverallCF, getHEIInterpretation, getCFInterpretation } from "./pollution-calculations";

export function exportToExcel(samples: Sample[], filename = "groundwater_samples") {
  const worksheet = XLSX.utils.json_to_sheet(
    samples.map(sample => {
      const heiValue = calculateHEI(sample);
      const cfValue = calculateOverallCF(sample);
      const heiInterpretation = getHEIInterpretation(heiValue);
      const cfInterpretation = getCFInterpretation(cfValue);
      
      return {
        "Sample ID": sample.sampleId,
        "Latitude": sample.latitude,
        "Longitude": sample.longitude,
        "HPI": sample.hpi,
        "HEI": heiValue.toFixed(2),
        "HEI Level": heiInterpretation.level,
        "CF": cfValue.toFixed(2),
        "CF Level": cfInterpretation.level,
        "Category": sample.category,
        "Upload Date": sample.uploadedAt ? new Date(sample.uploadedAt).toLocaleDateString() : "",
      };
    })
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Samples");

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPDF(samples: Sample[], filename = "groundwater_report") {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text("Groundwater Heavy Metal Pollution Report", 20, 20);

  // Add summary
  doc.setFontSize(12);
  const totalSamples = samples.length;
  const safeSamples = samples.filter(s => s.category === "Safe").length;
  const moderateSamples = samples.filter(s => s.category === "Moderate").length;
  const criticalSamples = samples.filter(s => s.category === "Critical").length;

  doc.text(`Total Samples: ${totalSamples}`, 20, 40);
  doc.text(`Safe: ${safeSamples} (${Math.round((safeSamples / totalSamples) * 100)}%)`, 20, 50);
  doc.text(`Moderate: ${moderateSamples} (${Math.round((moderateSamples / totalSamples) * 100)}%)`, 20, 60);
  doc.text(`Critical: ${criticalSamples} (${Math.round((criticalSamples / totalSamples) * 100)}%)`, 20, 70);

  // Add table
  const tableData = samples.map(sample => {
    const heiValue = calculateHEI(sample);
    const cfValue = calculateOverallCF(sample);
    const heiInterpretation = getHEIInterpretation(heiValue);
    const cfInterpretation = getCFInterpretation(cfValue);
    
    return [
      sample.sampleId,
      sample.latitude.toString(),
      sample.longitude.toString(),
      sample.hpi.toString(),
      heiValue.toFixed(2),
      heiInterpretation.level,
      cfValue.toFixed(2),
      cfInterpretation.level,
      sample.category,
    ];
  });

  autoTable(doc, {
    startY: 90,
    head: [["Sample ID", "Latitude", "Longitude", "HPI", "HEI", "HEI Level", "CF", "CF Level", "Category"]],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 7 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
}
