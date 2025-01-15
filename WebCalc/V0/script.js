// Variables globales
let currentLanguage = "es"; // Idioma predeterminado
let selectedCampaignTypes = []; // Tipos de campaña seleccionados

// Festivos de Madrid
const holidays = [
  "2024-01-01", // Año Nuevo
  "2024-01-31", // San Publicito
  "2024-01-06", // Epifanía del Señor
  "2024-04-17", // Jueves Santo
  "2024-04-18", // Viernes Santo
  "2024-05-01", // Fiesta del Trabajo
  "2024-05-02", // Comunidad de Madrid
  "2024-07-25", // Santiago Apóstol
  "2024-08-15", // Asunción de la Virgen
  "2024-12-08", // Día de la Inmaculada Concepción
  "2024-12-25", // Navidad
].map((date) => new Date(date));

// Traducciones
const translations = {
  es: {
    title: "Calculadora de Costos de Campañas",
    labelCampaignType: "Seleccione el tipo de campaña",
    labelNumCities: "Número de ciudades",
    labelBriefingDate: "Fecha de recepción del briefing",
    labelActivationDate: "Fecha de activación de la campaña",
    labelCreativeSet: "¿Es parte de una campaña anterior?",
    calculateButton: "Calcular Costos",
    outputTitle: "Resumen de Costos",
    totalTitle: "Costo Total después de Descuentos",
    discountTitle: "Descuentos Aplicados",
    discountNone: "Ninguno",
    downloadButton: "Descargar PDF",
    selectCampaignType: "Por favor seleccione un tipo de campaña.",
    numCities: "Número de ciudades",
    workdaysAvailable: "Días hábiles disponibles",
  },
  en: {
    title: "Campaign Cost Calculator",
    labelCampaignType: "Select Campaign Type",
    labelNumCities: "Number of Cities",
    labelBriefingDate: "Briefing Reception Date",
    labelActivationDate: "Campaign Activation Date",
    labelCreativeSet: "Is this part of a previous campaign?",
    calculateButton: "Calculate Costs",
    outputTitle: "Cost Breakdown",
    totalTitle: "Total Cost After Discounts",
    discountTitle: "Discounts Applied",
    discountNone: "None",
    downloadButton: "Download PDF",
    selectCampaignType: "Please select a campaign type.",
    numCities: "Number of cities",
    workdaysAvailable: "Workdays available",
  },
};

// Cambiar idioma
function switchLanguage(lang) {
  currentLanguage = lang; // Actualizar el idioma seleccionado
  const elements = Object.keys(translations[lang]);

  elements.forEach((key) => {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = translations[lang][key];
    }
  });
}

// Alternar selección de tipo de campaña
function toggleCampaignType(type) {
  const index = selectedCampaignTypes.indexOf(type);
  const button = document.getElementById(`${type}Button`);

  if (index > -1) {
    selectedCampaignTypes.splice(index, 1);
    button.classList.remove("selected");
  } else {
    selectedCampaignTypes.push(type);
    button.classList.add("selected");
  }
}

// Calcular días hábiles
function calculateWorkdays(startDate, endDate) {
  let workdays = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    const isHoliday = holidays.some(
      (holiday) =>
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

// Calcular costos
async function calculateCost() {
  if (selectedCampaignTypes.length === 0) {
    alert(translations[currentLanguage].selectCampaignType);
    return;
  }

  const numCities = parseInt(document.getElementById("numCities").value);
  const briefingDate = new Date(document.getElementById("briefingDate").value);
  const activationDate = new Date(document.getElementById("activationDate").value);
  const creativeSet = document.getElementById("creativeSet").value;

  // Calcular días hábiles disponibles
  const workdays = calculateWorkdays(briefingDate, activationDate);

  // Costos base
  const displayCosts = { master: 300, adaptation: 125, change: 50, sizes: 6 };
  const socialCosts = { master: 180, adaptation: 70, change: 30, sizes: 3 };

  let totalCost = 0;
  let discount = 0;
  let discountDetails = "";

  // Campaña de Display
  if (selectedCampaignTypes.includes("display")) {
    const displayMaster = displayCosts.master;
    const displayAdaptations = displayCosts.adaptation * displayCosts.sizes;
    const displayChanges = displayCosts.change * displayCosts.sizes * (numCities - 1);

    const displayTotal = displayMaster + displayAdaptations + displayChanges;
    totalCost += displayTotal;

    discountDetails += `Display: €${displayTotal}\n`;
  }

  // Campaña de Social Paid
  if (selectedCampaignTypes.includes("social")) {
    const socialMaster = socialCosts.master;
    const socialAdaptations = socialCosts.adaptation * socialCosts.sizes;
    const socialChanges = socialCosts.change * socialCosts.sizes * (numCities - 1);

    const socialTotal = socialMaster + socialAdaptations + socialChanges;
    totalCost += socialTotal;

    discountDetails += `Social Paid: €${socialTotal}\n`;
  }

  // Descuentos
  if (workdays >= 10) {
    discount += 0.2;
    discountDetails += "20% descuento por briefing temprano\n";
  } else if (workdays >= 5) {
    discount += 0.1;
    discountDetails += "10% descuento por briefing anticipado\n";
  }

  if (creativeSet !== "new") {
    discount += 0.05;
    discountDetails += "5% descuento por campaña previa\n";
  }

  if (numCities > 10) {
    discount += 0.1;
    discountDetails += "10% descuento por más de 10 ciudades\n";
  }

  const totalAfterDiscount = totalCost * (1 - discount);

  // Mostrar resultados
  const numCitiesLabel = translations[currentLanguage].numCities;
  const workdaysLabel = translations[currentLanguage].workdaysAvailable;
  document.getElementById("costDetails").innerHTML = `
    ${discountDetails.replace(/\n/g, "<br>")}
    <strong>${numCitiesLabel}:</strong> ${numCities}<br>
    <strong>${workdaysLabel}:</strong> ${workdays}
  `;
  document.getElementById("totalCost").textContent = `€${totalAfterDiscount.toFixed(2)}`;
  document.getElementById("discountDetails").innerHTML = discountDetails.replace(/\n/g, "<br>") || translations[currentLanguage].discountNone;
  document.getElementById("output").style.display = "block";
}

// Descargar PDF
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const texts = translations[currentLanguage];
  const budgetName = document.getElementById("budgetName").value.trim() || "Sin nombre";
  const numCities = document.getElementById("numCities").value;
  const briefingDate = document.getElementById("briefingDate").value;
  const activationDate = document.getElementById("activationDate").value;
  const discountDetails = document.getElementById("discountDetails").innerHTML.replace(/<br>/g, "\n");
  const totalCost = document.getElementById("totalCost").textContent;

  const createdOnDate = new Date().toLocaleDateString(currentLanguage);
  const logoURL = "https://pablombdig.github.io/Banners_DG/logoDG.png";

  const img = new Image();
  img.src = logoURL;

  img.onload = () => {
    // 1. Logo
    pdf.addImage(img, "PNG", 10, 10, 50, 15);

    // 2. Título del presupuesto
    pdf.setFontSize(16);
    pdf.setFont("Helvetica", "bold");
    pdf.text(`📄 ${budgetName}`, 70, 20);

    // 3. Información general
    pdf.setFontSize(12);
    pdf.setFont("Helvetica", "normal");
    pdf.text(`🗓️  ${texts.createdOn}: ${createdOnDate}`, 10, 40);
    pdf.text(`🏙️  ${texts.numCities}: ${numCities}`, 10, 50);
    pdf.text(`📅 ${texts.labelBriefingDate}: ${briefingDate}`, 10, 60);
    pdf.text(`🚀 ${texts.labelActivationDate}: ${activationDate}`, 10, 70);

    // 4. Desglose de costos
    pdf.setFont("Helvetica", "bold");
    pdf.text("💼 Detalles de la Campaña:", 10, 90);
    pdf.setFont("Helvetica", "normal");
    pdf.text(document.getElementById("costDetails").innerText.split("\n"), 10, 100);

    // 5. Descuentos aplicados
    pdf.setFont("Helvetica", "bold");
    pdf.text("🎯 Descuentos Aplicados:", 10, 150);
    pdf.setFont("Helvetica", "normal");
    const discountLines = discountDetails ? discountDetails.split("\n") : [texts.discountNone];

    discountLines.forEach((line, index) => {
      pdf.text(`- ${line}`, 10, 160 + (index * 10));
    });

    // 6. Precio final destacado
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(34, 139, 34); // Verde para destacar
    pdf.text(`TOTAL: ${totalCost}`, 140, 280, { align: "right" });

    // 7. Guardar PDF
    pdf.save(`Presupuesto_${budgetName.replace(/\s/g, "_")}.pdf`);
  };
}
