function gerarTabelasMetars() {
  // Lê a data selecionada pelo usuário
  let data_referencia = document.getElementById("data-referencia").value;
  // Se não for definida nenhuma data, é exibida uma mensagem de erro
  if (!data_referencia) {
    alert("É necessário definir uma data de referencia!");
    return;
  }
  // Se for o dia atual ou uma data no futuro, é exibido o erro "A data não pode ser uma data futura"
  if (isDataFutura(data_referencia)) {
    alert("A data não pode ser uma data futura");
    return;
  }
  // Cria as datas de referência da busca
  let { data_ini, data_fim } = gerarIntervaloUTC(data_referencia);
  // Lê as bases monitoradas em MINIMOS, cria o objeto metars e depois converte bases em string para a pesquisa
  let bases = Object.keys(MINIMOS);
  const metars = Object.fromEntries(bases.map((base) => [base, []]));
  bases = bases.join(",");
  // Busca os Metars na API
  fetch(
    "https://api-redemet.decea.mil.br/mensagens/metar/" +
      bases +
      "?api_key=6vmvTQDP1t8thEEAUkCCj4z4TRjrJLcb561p1SRi&data_ini=" +
      data_ini +
      "&data_fim=" +
      data_fim
  )
    // Recebe os dados e extrai a parte dos Metars
    .then((res) => res.json())
    .then((data) => data.data.data)
    // Processa os dados de Metar
    .then((metars_redemet) => {
      // Transforma cada mesagem recebida em um objeto Metar e armazena o objeto metars
      metars_redemet.forEach((metar_redemet) => {
        metars[metar_redemet.id_localidade].push(new Metar(metar_redemet));
      });
      // Apaga a div 'tabela-periodos'
      document.getElementById("tabela-periodos").innerHTML = "";
      // Cria os títulos e as tabelas
      Object.entries(metars).forEach(([icao, array_metars]) => {
        let titulo = document.createElement("h2");
        titulo.textContent = icao;
        document.getElementById("tabela-periodos").appendChild(titulo);
        // Cria a tabela de períodos lendo os dados dos metars, criando os períodos, e usando esse array de períodos para criar a tabela
        document
          .getElementById("tabela-periodos")
          .appendChild(gerarTabelaPeriodos(icao, gerarPeriodos(array_metars)));
      });
      // Ativa o botão de exportar para excel
      document.getElementById("btn-excel").style.display = "block";
    });
}

function gerarIntervaloUTC(dataStr) {
  // dataStr está no formato yyyy-mm-dd
  const [ano, mes, dia] = dataStr.split("-").map(Number);

  // Criar objeto Date no UTC para a data de referência
  const dataRef = new Date(Date.UTC(ano, mes - 1, dia));

  // Data seguinte (um dia depois)
  const dataSeguinte = new Date(dataRef);
  dataSeguinte.setUTCDate(dataSeguinte.getUTCDate() + 1);

  // Função auxiliar para formatar no padrão yyyymmddhh
  const formatar = (date, hora) => {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}${m}${d}${hora}`;
  };

  return {
    data_ini: formatar(dataRef, "03"),
    data_fim: formatar(dataSeguinte, "02"),
  };
}

function calcularDuracao(inicio, fim) {
  // diferença em milissegundos
  let diffMs = fim.getTime() - inicio.getTime();

  // converter para minutos
  let diffMin = Math.floor(diffMs / (1000 * 60));

  // horas e minutos
  let horas = Math.floor(diffMin / 60);
  let minutos = diffMin % 60;

  return { horas, minutos };
}

function calculaCondicao(metar, minimos) {
  let condicao = null;
  if (metar.visibilidade >= 5000 && (!metar.teto || metar.teto >= 1500)) {
    condicao = "VMC";
  } else if (
    metar.visibilidade >= minimos.visibilidade &&
    (!metar.teto || metar.teto >= minimos.teto)
  ) {
    condicao = "IMC";
  } else {
    condicao = "QGO";
  }

  if (
    metar.visibilidade <=
    minimos.visibilidade + PARAMETROS_DEGRADACAO.variacao_visibilidade
  ) {
    condicao = "DEGRADADO";
  }

  if (
    metar.teto &&
    metar.teto <= minimos.teto + PARAMETROS_DEGRADACAO.variacao_teto
  ) {
    condicao = "DEGRADADO";
  }
  return condicao;
}

function gerarPeriodos(array_metars) {
  let periodos = [];
  array_metars.forEach((metar, indice, arr) => {
    // Criando o objeto período e inicializando as variáveis
    let periodo = {
      inicio: metar.data_hora_utc,
      fim: null,
      visibilidade: metar.visibilidade,
      teto: metar.teto,
      tempo_presente: metar.tempo_presente,
      duracao: null,
      condicao: null,
    };
    // Definindo o fim do período se for o último elemento
    if (indice === arr.length - 1) {
      periodo.fim = new Date(metar.data_hora_utc); // cria cópia
      periodo.fim.setUTCMinutes(0);
      periodo.fim.setUTCHours(periodo.fim.getUTCHours() + 1);
    } else {
      // Definindo o fim do período se não for o último elemento
      periodo.fim = new Date(arr[indice + 1].data_hora_utc); // cria cópia
    }
    let { horas, minutos } = calcularDuracao(periodo.inicio, periodo.fim);
    periodo.duracao = `${String(horas).padStart(2, 0)}:${String(
      minutos
    ).padStart(2, 0)}`;
    // Definindo a condição operacional
    periodo.condicao = calculaCondicao(metar, MINIMOS[metar.icao]);
    periodos.push(periodo);
  });
  return periodos;
}

function gerarTabelaPeriodos(icao, periodos) {
  console.log(periodos);
  // Tabela
  let tabela = document.createElement("table");
  tabela.id = "tabela-" + icao;

  // ========================================================Cabeçalho
  let thead = document.createElement("thead");
  let tr_header = document.createElement("tr");

  // Data/hora início
  let th_Inicio = document.createElement("th");
  th_Inicio.textContent = "Data/hora início";
  tr_header.appendChild(th_Inicio);

  // Data/hora fim
  let th_Fim = document.createElement("th");
  th_Fim.textContent = "Data/hora fim";
  tr_header.appendChild(th_Fim);

  // Duração
  let th_Duracao = document.createElement("th");
  th_Duracao.textContent = "Duração";
  tr_header.appendChild(th_Duracao);

  // Visibilidade
  let th_Visibilidade = document.createElement("th");
  th_Visibilidade.textContent = "Visibilidade";
  tr_header.appendChild(th_Visibilidade);

  // Teto
  let th_Teto = document.createElement("th");
  th_Teto.textContent = "Teto";
  tr_header.appendChild(th_Teto);

  // Condição
  let th_Condicao = document.createElement("th");
  th_Condicao.textContent = "Condição";
  tr_header.appendChild(th_Condicao);

  thead.appendChild(tr_header);
  tabela.appendChild(thead);
  // ========================================================Cabeçalho FIM

  // ========================================================Corpo
  let tbody = document.createElement("tbody");

  periodos.forEach((periodo) => {
    let tr = document.createElement("tr");
    tr.classList.add(periodo.condicao);

    // Data/hora início
    let td_Inicio = document.createElement("td");
    td_Inicio.textContent =
      String(periodo.inicio.getDate()).padStart(2, 0) +
      "/" +
      String(periodo.inicio.getMonth() + 1).padStart(2, 0) +
      "/" +
      String(periodo.inicio.getFullYear()) +
      " " +
      String(periodo.inicio.getHours()).padStart(2, 0) +
      ":" +
      String(periodo.inicio.getMinutes()).padStart(2, 0);
    tr.appendChild(td_Inicio);

    // Data/hora fim
    let td_Fim = document.createElement("td");
    td_Fim.textContent =
      String(periodo.fim.getDate()).padStart(2, 0) +
      "/" +
      String(periodo.fim.getMonth() + 1).padStart(2, 0) +
      "/" +
      String(periodo.fim.getFullYear()) +
      " " +
      String(periodo.fim.getHours()).padStart(2, 0) +
      ":" +
      String(periodo.fim.getMinutes()).padStart(2, 0);
    tr.appendChild(td_Fim);

    // Duração
    let td_Duracao = document.createElement("td");
    td_Duracao.textContent = periodo.duracao;
    tr.appendChild(td_Duracao);

    // Visibilidade
    let td_Visibilidade = document.createElement("td");
    td_Visibilidade.textContent = periodo.visibilidade;
    tr.appendChild(td_Visibilidade);

    // Teto
    let td_Teto = document.createElement("td");
    td_Teto.textContent = periodo.teto ?? "UNL";
    tr.appendChild(td_Teto);

    // Condição
    let td_Condicao = document.createElement("td");
    let select_condicao = document.createElement("select");
    select_condicao.addEventListener("change", function () {
      let tr = this.closest("tr");
      // limpa classes antigas da linha
      tr.className = "";
      // adiciona a nova classe com base no valor
      if (this.value) {
        tr.classList.add(this.value);
      }
    });

    let option_vmc = document.createElement("option");
    option_vmc.textContent = "VMC";
    option_vmc.setAttribute("value", "VMC");
    if (periodo.condicao === "VMC") {
      option_vmc.selected = true;
      select_condicao.appendChild(option_vmc);
    }

    let option_imc = document.createElement("option");
    option_imc.textContent = "IMC";
    option_imc.setAttribute("value", "IMC");
    if (periodo.condicao === "IMC") option_imc.selected = true;
    select_condicao.appendChild(option_imc);

    let option_degradado = document.createElement("option");
    option_degradado.textContent = "DEGRADADO";
    option_degradado.setAttribute("value", "DEGRADADO");
    if (periodo.condicao === "DEGRADADO") option_degradado.selected = true;
    select_condicao.appendChild(option_degradado);

    let option_qgo = document.createElement("option");
    option_qgo.textContent = "QGO";
    option_qgo.setAttribute("value", "QGO");
    if (periodo.condicao === "QGO") option_qgo.selected = true;
    select_condicao.appendChild(option_qgo);

    td_Condicao.appendChild(select_condicao);

    tr.appendChild(td_Condicao);

    tbody.appendChild(tr);
  });
  tabela.appendChild(tbody);
  // ========================================================Corpo FIM

  return tabela;
}

function isDataFuturaold(dataString) {
  // Converte a string yyyy-mm-dd em um objeto Date no fuso UTC
  const [ano, mes, dia] = dataString.split("-").map(Number);
  const dataInformada = new Date(Date.UTC(ano, mes - 1, dia));

  // Pega a data atual em UTC, zerando horas, minutos, segundos e ms
  const agoraUTC = new Date();
  const dataAtualUTC = new Date(
    Date.UTC(
      agoraUTC.getUTCFullYear(),
      agoraUTC.getUTCMonth(),
      agoraUTC.getUTCDate()
    )
  );

  // Retorna true se a data informada for posterior ao dia atual (UTC)
  return dataInformada.getTime() > dataAtualUTC.getTime();
}

function isDataFutura(dataString) {
  // Converte a string yyyy-mm-dd em Date no fuso UTC
  const [ano, mes, dia] = dataString.split("-").map(Number);
  const dataUTC = new Date(Date.UTC(ano, mes - 1, dia));

  // Pega a data atual no horário de Brasília
  const agora = new Date();
  // Ajusta para UTC-3
  const offsetBrasil = -3 * 60; // minutos
  const agoraBrasil = new Date(agora.getTime() + offsetBrasil * 60000);

  // Extrai só ano, mês e dia da data atual em Brasília
  const dataAtualBrasil = new Date(
    agoraBrasil.getFullYear(),
    agoraBrasil.getMonth(),
    agoraBrasil.getDate()
  );

  // Compara a data informada (UTC) com a data atual em Brasília
  return dataUTC > dataAtualBrasil;
}

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
            // números
            const n = parseNumberFlexible(valor);
            if (!isNaN(n)) valor = n;
          }
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

    // Se quiser centralizar também as colunas de dados, pode fazer:
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
    }

    XLSX.utils.book_append_sheet(wb, ws, base);
  });

  XLSX.writeFile(wb, "metars.xlsx");
}
