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