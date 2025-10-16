const DADOS = {};
Object.keys(MINIMOS).forEach((cod_icao) => {
  DADOS[cod_icao] = {
    metars: [],
    periodos: null,
  };
});
// DADOS_TESTE.data.data.forEach(mensagem => {
//     const metar = new Metar(mensagem);
//     DADOS[mensagem.id_localidade].metars.push(metar);
// });

function gerarTabelasMetars() {
  // Lê a data selecionada pelo usuário
  let data_referencia = document.getElementById("data-referencia").value;
  // Se não for definida nenhuma data, é exibida uma mensagem de erro
  if (!data_referencia) {
    alert("É necessário definir uma data de referencia!");
    return;
  }
  // Se for o dia atual ou uma data no futuro, é exibido o erro "A data não pode ser uma data futura"
  // if (isDataFutura(data_referencia)) {
  //   alert("A data não pode ser uma data futura");
  //   return;
  // }
  // Cria as datas de referência da busca
  let { data_ini, data_fim } = gerarIntervaloUTC(data_referencia);
  // Lê as bases monitoradas em MINIMOS, cria o objeto metars e depois converte bases em string para a pesquisa
  let bases = Object.keys(DADOS).join(",");
  // Busca os Metars na API
  fetch(
    "https://api-redemet.decea.mil.br/mensagens/metar/" +
      bases +
      "?api_key=6vmvTQDP1t8thEEAUkCCj4z4TRjrJLcb561p1SRi&data_ini=" +
      data_ini +
      "&data_fim=" +
      data_fim
  )
    .then((res) => res.json())
    .then((data) => data.data.data)
    .then((metars) => {
      // cria os objetos Metar e associa em DADOS à base
      metars.forEach((metar) => {
        DADOS[metar.id_localidade].metars.push(new Metar(metar));
      });
      // gera os períodos a partir dos metars das bases
      gerarPeriodos();

      // gera o gráfico
      gerarGrafico();

      // imprime as tabelas
      imprimeTabelas();
    });
}

function gerarPeriodos() {
  Object.entries(DADOS).forEach(([icao, item]) => {
    item.periodos = periodos(icao, item.metars);
  });
}

function periodos(icao, array_metars) {
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
    periodo.condicao = calculaCondicao(metar, MINIMOS[icao]);
    periodos.push(periodo);
  });
  return periodos;
}

function gerarLinhaGrafico(icao) {
  let linha_grafico = document.createElement("div");
  let span_icao = document.createElement("span");
  span_icao.classList.add("grafico-icao");
  span_icao.textContent = icao;
  linha_grafico.appendChild(span_icao);
  DADOS[icao].periodos.forEach((periodo) => {
    let span_periodo = document.createElement("span");
    let duracao = periodo.duracao.split(":");
    let minutos = Number(duracao[0]) * 60 + Number(duracao[1]);
    span_periodo.style.width = minutos + "px";
    span_periodo.classList.add(periodo.condicao);
    linha_grafico.appendChild(span_periodo);
  });
  return linha_grafico;
}

function gerarGrafico() {
  document.getElementById("grafico").innerHTML = "";
  Object.keys(DADOS).forEach((icao) => {
    document.getElementById("grafico").appendChild(gerarLinhaGrafico(icao));
  });
  eixoHorarios();
}

function eixoHorarios(){
  let div_horarios = document.createElement('div');
  div_horarios.classList.add('linha-horario');
  for(let i = 0; i <= 23; i++){
    let span_hora = document.createElement('span');
    span_hora.textContent = String(i).padStart(2, "0") + ':00';
    div_horarios.appendChild(span_hora);
  }
  document.getElementById('grafico').appendChild(div_horarios);
}

function gerarTabelaPeriodos() {}

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

gerarPeriodos();
// console.log(DADOS);

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

  periodos.forEach((periodo,index) => {
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
        DADOS[icao].periodos[index].condicao = this.value;
        gerarGrafico();
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

function imprimeTabelas() {
  const div_tabelas = document.getElementById("tabela-periodos");
  div_tabelas.innerHTML = "";
  Object.keys(DADOS).forEach((icao) => {
    let titulo = document.createElement("h2");
    titulo.textContent = icao;
    div_tabelas.appendChild(titulo);
    div_tabelas.appendChild(gerarTabelaPeriodos(icao, DADOS[icao].periodos));
  });
}
