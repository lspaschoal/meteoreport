function gerarTabelaPeriodos(icao, periodos) {
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

  // Tempo Presente
  let th_Tempo_Presente = document.createElement("th");
  th_Tempo_Presente.textContent = "Tempo Presente";
  tr_header.appendChild(th_Tempo_Presente);

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

    // Tempo presente
    let td_Tempo_Presente = document.createElement("td");
    td_Tempo_Presente.textContent = periodo.tempo_presente
      ? periodo.tempo_presente.join(" | ")
      : "NIL";
    tr.appendChild(td_Tempo_Presente);

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
