// Classe que instancia um METAR e extrai os principais campos usados pelo app.
class Metar {
  constructor(metar_api_redemet) {
    // Data e Hora
    const data_hora_utc =
      metar_api_redemet.validade_inicial.replace(" ", "T") + "Z";
    this.data_hora_utc = new Date(data_hora_utc);

    // Tipo da mensagem (METAR|SPECI)
    this.tipo_mensagem = /\bSPECI\b/.test(metar_api_redemet.mens)
      ? "SPECI"
      : "METAR";

    // Visibilidade
    if (/\bCAVOK\b/.test(metar_api_redemet.mens)) {
      this.visibilidade = 9999;
    } else {
      const visMatch = metar_api_redemet.mens.match(/(\s\d{4})\s/);
      this.visibilidade = visMatch ? parseInt(visMatch[1], 10) : null;
    }

    // Teto
    const camadas = metar_api_redemet.mens.match(/(BKN|OVC|VV)\d{3}/g) || [];
    this.teto =
      camadas.length > 0
        ? Math.min(...camadas.map((camada) => parseInt(camada.slice(-3))))*100
        : null;

    // Tempo Presente
    this.tempo_presente = metar_api_redemet.mens.match(/(?<=^|\s)([+\-]?(?:TS|SH|FZ)?(?:DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PO|SQ|FC|SS|DS))(?=\s|$)/g);
  }

}