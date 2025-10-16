async function exportarParaPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "pt", "a4");
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
  const pageHeight = pdf.internal.pageSize.getHeight() - 2 * margin;

  // 📅 Obtém a data do input
  const inputData = document.getElementById("data-referencia");
  let dataFormatada = "Data não informada";
  let nomeArquivo = "meteorologia";
  if (inputData && inputData.value) {
    const [ano, mes, dia] = inputData.value.split("-");
    dataFormatada = `${dia}/${mes}/${ano}`;
    nomeArquivo = `meteorologia-${ano}${mes}${dia}`;
  }

  const grafico = document.getElementById("grafico");
  const tabela = document.getElementById("tabela-periodos");
  if (!grafico || !tabela) {
    alert("As divs 'grafico' e/ou 'tabela-periodos' não foram encontradas.");
    return;
  }

  // ✅ Cria container temporário invisível
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.background = "#ffffff";
  container.style.display = "inline-block";
  container.style.width = grafico.offsetWidth + "px";
  container.style.padding = "10px";
  container.style.boxSizing = "border-box";

  // Clona conteúdo
  const graficoClone = grafico.cloneNode(true);
  const tabelaClone = tabela.cloneNode(true);

  // Mantém fundo dos spans vazios
  [graficoClone, tabelaClone].forEach((div) => {
    div.querySelectorAll("span").forEach((span) => {
      if (!span.textContent.trim()) span.innerHTML = "&nbsp;";
    });
  });

  container.appendChild(graficoClone);
  const separador = document.createElement("div");
  separador.style.height = "20px";
  container.appendChild(separador);
  container.appendChild(tabelaClone);
  document.body.appendChild(container);

  // ✅ Captura imagem completa
  const canvas = await html2canvas(container, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });

  document.body.removeChild(container);

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Adiciona título no PDF
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `Reporte de Condições Meteorológicas - ${dataFormatada}`,
    margin,
    40
  );

  let currentY = 60; // posição inicial após o título

  if (imgHeight <= pageHeight - (currentY - margin)) {
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(imgData, "JPEG", margin, currentY, imgWidth, imgHeight);
  } else {
    // ✅ Paginação vertical
    let y = 0;
    let page = 0;
    const pageCanvas = document.createElement("canvas");
    const ctx = pageCanvas.getContext("2d");
    const pageHeightPx =
      ((pageHeight - (currentY - margin)) * canvas.width) / pageWidth;

    while (y < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - y);
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, -y);

      // eslint-disable-next-line no-await-in-loop
      const blob = await new Promise((res) =>
        pageCanvas.toBlob(res, "image/jpeg", 0.95)
      );
      const blobUrl = URL.createObjectURL(blob);

      if (page > 0) {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `Reporte de Condições Meteorológicas - ${dataFormatada}`,
          margin,
          40
        );
        currentY = 60;
      }

      pdf.addImage(
        blobUrl,
        "JPEG",
        margin,
        currentY,
        imgWidth,
        (sliceHeight / canvas.width) * imgWidth
      );
      URL.revokeObjectURL(blobUrl);

      y += sliceHeight;
      page++;
    }
  }

  pdf.save(`${nomeArquivo}.pdf`);
}
