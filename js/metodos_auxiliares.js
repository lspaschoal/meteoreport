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
