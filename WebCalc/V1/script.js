let selectedCampaignTypes = [];  // Tipos de campañas seleccionadas

// Festivos de Madrid
const holidays = [
  "2024-01-01", "2024-01-31", "2024-01-06",
  "2024-04-17", "2024-04-18", "2024-05-01",
  "2024-05-02", "2024-07-25", "2024-08-15",
  "2024-12-08", "2024-12-25"
].map(date => new Date(date));

// Alternar tipo de campaña
function toggleCampaignType(type) {
  const button = document.getElementById(`${type}Button`);
  const index = selectedCampaignTypes.indexOf(type);

  if (index > -1) {
    selectedCampaignTypes.splice(index, 1);
    button.classList.remove("selected");
  } else {
    selectedCampaignTypes.push(type);
    button.classList.add("selected");
  }
}

// Calcular días hábiles excluyendo fines de semana y festivos
function calculateWorkdays(startDate, endDate) {
  let workdays = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const isHoliday = holidays.some(holiday =>
      holiday.getDate() === currentDate.getDate() &&
      holiday.getMonth() === currentDate.getMonth() &&
      holiday.getFullYear() === currentDate.getFullYear()
    );

    if (!isWeekend && !isHoliday) {
      workdays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workdays;
}

// Calcular costos y aplicar descuentos
function calculateCost() {
  if (selectedCampaignTypes.length === 0) {
    alert("Por favor selecciona al menos un tipo de campaña.");
    return;
  }

  const budgetName = document.getElementById("budgetName").value.trim();
  const numCities = parseInt(document.getElementById("numCities").value);
  const briefingDate = new Date(document.getElementById("briefingDate").value);
  const activationDate = new Date(document.getElementById("activationDate").value);
  const creativeSet = document.getElementById("creativeSet").value;

  // Costos base
  const displayCosts = { master: 300, adaptation: 125, change: 50, sizes: 6 };
  const socialCosts = { master: 180, adaptation: 70, change: 30, sizes: 3 };

  let totalCost = 0;
  let discount = 0;
  let discountDetails = "";

  // Calcular días hábiles
  const workdays = calculateWorkdays(briefingDate, activationDate);

  // Cálculo de costos para Display
  if (selectedCampaignTypes.includes("display")) {
    const displayMaster = displayCosts.master;
    const displayAdaptations = displayCosts.adaptation * displayCosts.sizes;
    const displayChanges = displayCosts.change * displayCosts.sizes * (numCities - 1);

    const displayTotal = displayMaster + displayAdaptations + displayChanges;
    totalCost += displayTotal;
    discountDetails += `Display: €${displayTotal}\n`;
  }

  // Cálculo de costos para Social Paid
  if (selectedCampaignTypes.includes("social")) {
    const socialMaster = socialCosts.master;
    const socialAdaptations = socialCosts.adaptation * socialCosts.sizes;
    const socialChanges = socialCosts.change * socialCosts.sizes * (numCities - 1);

    const socialTotal = socialMaster + socialAdaptations + socialChanges;
    totalCost += socialTotal;
    discountDetails += `Social Paid: €${socialTotal}\n`;
  }

  // Aplicar descuentos
  if (workdays >= 10) {
    discount += 0.2;
    discountDetails += "20% descuento por briefing temprano\n";
  } else if (workdays >= 5) {
    discount += 0.1;
    discountDetails += "10% descuento por briefing anticipado\n";
  }

  if (creativeSet !== "new") {
    discount += 0.05;
    discountDetails += "5% descuento por usar creatividades previas\n";
  }

  if (numCities > 10) {
    discount += 0.1;
    discountDetails += "10% descuento por más de 10 ciudades\n";
  }

  const totalAfterDiscount = totalCost * (1 - discount);

  // Mostrar resultados
  document.getElementById("costDetails").innerHTML = `
    <strong>Nombre del pedido:</strong> ${budgetName || "Sin nombre"}<br>
    <strong>Número de ciudades:</strong> ${numCities}<br>
    <strong>Días hábiles:</strong> ${workdays}<br>
    <strong>Detalles:</strong><br>${discountDetails.replace(/\n/g, "<br>")}
  `;
  document.getElementById("totalCost").textContent = `€${totalAfterDiscount.toFixed(2)}`;
  document.getElementById("discountDetails").innerHTML = discountDetails.replace(/\n/g, "<br>");
  document.getElementById("output").style.display = "block";
}

// Generar PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const budgetName = document.getElementById("budgetName").value.trim() || "Sin nombre";
  const numCities = document.getElementById("numCities").value;
  const briefingDate = document.getElementById("briefingDate").value;
  const activationDate = document.getElementById("activationDate").value;
  const discountDetails = document.getElementById("discountDetails").innerHTML.replace(/<br>/g, "\n");
  const totalCost = document.getElementById("totalCost").textContent;

  const logoURL = "https://pablombdig.github.io/Banners_DG/logoDG.png";
  const img = new Image();
  img.src = logoURL;

  img.onload = () => {
// 1. Logo
    pdf.addImage(img, "PNG", 10, 10, 50, 15);
    // Título
    pdf.setFontSize(16);
    pdf.setFont("Helvetica", "bold");
    pdf.text(`Presupuesto: ${budgetName}`, 70, 20);

    // Información general
    pdf.setFontSize(12);
    pdf.setFont("Helvetica", "normal");
    pdf.text(`Número de ciudades: ${numCities}`, 10, 40);
    pdf.text(`Fecha de briefing: ${briefingDate}`, 10, 50);
    pdf.text(`Fecha de activación: ${activationDate}`, 10, 60);

    // Detalles
    pdf.setFont("Helvetica", "bold");
    pdf.text("Descuentos aplicados:", 10, 80);
    pdf.setFont("Helvetica", "normal");
    discountDetails.split("\n").forEach((line, i) => {
      pdf.text(`- ${line}`, 10, 90 + (i * 10));
    });

    // Total destacado
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(34, 139, 34);
    pdf.text(`TOTAL: ${totalCost}`, 150, 280, { align: "right" });

    pdf.save(`Presupuesto_${budgetName.replace(/\s/g, "_")}.pdf`);
  };
}
