// Exportar para EXCEL
function parseTimeToExcelFraction(str) {
  const m = String(str)
    .trim()
    .match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return NaN;
  const h = +m[1],
    min = +m[2];
  return (h * 60 + min) / (24 * 60);
}

function parseNumberFlexible(str) {
  if (str === null || str === undefined) return NaN;
  const s = String(str).trim();
  if (s === "") return NaN;
  if (s.includes(",") && s.includes(".")) {
    return parseFloat(s.replace(/\./g, "").replace(",", "."));
  } else if (s.includes(",")) {
    return parseFloat(s.replace(",", "."));
  } else {
    return parseFloat(s);
  }
}

function exportarParaExcel() {
  const wb = XLSX.utils.book_new();

  const bases = Object.keys(MINIMOS);
  bases.forEach((base) => {
    const tabela = document.getElementById("tabela-" + base);
    if (!tabela) return;

    const aoa = [];
    const linhas = tabela.querySelectorAll("tr");

    linhas.forEach((linha, rowIndex) => {
      const row = [];
      const celulas = linha.querySelectorAll("th, td");
      celulas.forEach((cel, colIndex) => {
        const select = cel.querySelector("select");
        let valor = select ? select.value : cel.innerText.trim();

        if (rowIndex > 0) {
          if (colIndex === 2) {
            // Duração -> hora:min
            const frac = parseTimeToExcelFraction(valor);
            if (!isNaN(frac)) valor = frac;
          } else if (colIndex === 3 || colIndex === 4) {
            // Números
            const n = parseNumberFlexible(valor);
            if (!isNaN(n)) valor = n;
          } 
          // 👉 A nova coluna "Tempo Presente" é penúltima,
          // não precisa de conversão especial, vai como texto
        }

        row.push(valor);
      });
      aoa.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // aplica formatação
    const range = XLSX.utils.decode_range(ws["!ref"]);

    // Estiliza o cabeçalho (linha 0)
    for (let C = 0; C <= range.e.c; C++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
      const cell = ws[cellRef];
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "DDDDDD" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    // Centraliza também as colunas de dados
    for (let R = 1; R <= range.e.r; R++) {
      for (let C = 0; C <= range.e.c; C++) {
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellRef];
        if (cell) {
          if (!cell.s) cell.s = {};
          cell.s.alignment = { horizontal: "center", vertical: "center" };
        }
      }
    }

    // Ajusta os tipos e formatos específicos
    for (let R = 1; R <= range.e.r; R++) {
      // Duração -> coluna 3
      const cellRef3 = XLSX.utils.encode_cell({ r: R, c: 2 });
      if (ws[cellRef3] && typeof ws[cellRef3].v === "number") {
        ws[cellRef3].t = "n";
        ws[cellRef3].z = "hh:mm";
      }

      // Números -> colunas 4 e 5
      [3, 4].forEach((c) => {
        const cellRef = XLSX.utils.encode_cell({ r: R, c });
        if (ws[cellRef] && typeof ws[cellRef].v === "number") {
          ws[cellRef].t = "n";
        }
      });

      // 👉 "Tempo Presente" (penúltima coluna) não precisa ajuste:
      // já está indo como texto e centralizado
    }

    XLSX.utils.book_append_sheet(wb, ws, base);
  });

  XLSX.writeFile(wb, "metars.xlsx");
}

