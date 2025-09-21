// Classe que instancia um METAR e extrai os principais campos usados pelo app.
// Robusto para evitar erros de parsing que travem a página.

class Metar {
  constructor(metar_api_redemet) {
    // icao
    this.icao = metar_api_redemet.id_localidade;
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
    this.tempo_presente = metar_api_redemet.mens.match(/(\+|\-)?(TS|SH|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PO|SQ|FC|SS|DS)\b/g);
  }

}

const METARS_REDEMET = [
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 00:00:00",
        "mens": "METAR SBGL 170000Z 15003KT 8000 BKN046 OVC100 22/19 Q1014=",
        "recebimento": "2025-09-16 23:58:17"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 01:00:00",
        "mens": "METAR SBGL 170100Z 12003KT 8000 SCT009 OVC100 21/19 Q1014=",
        "recebimento": "2025-09-17 00:58:44"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 02:00:00",
        "mens": "METAR SBGL 170200Z 32003KT 8000 SCT011 BKN080 21/19 Q1014=",
        "recebimento": "2025-09-17 02:03:13"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 03:00:00",
        "mens": "METAR SBGL 170300Z 25002KT 7000 SCT017 BKN080 21/19 Q1014=",
        "recebimento": "2025-09-17 02:59:52"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 04:00:00",
        "mens": "METAR SBGL 170400Z 23007KT 7000 SCT017 BKN083 21/19 Q1013=",
        "recebimento": "2025-09-17 03:55:48"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 05:00:00",
        "mens": "METAR SBGL 170500Z 27006KT 7000 SCT017 BKN083 21/19 Q1013=",
        "recebimento": "2025-09-17 04:55:40"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 06:00:00",
        "mens": "METAR SBGL 170600Z 31006KT 7000 SCT017 BKN083 21/19 Q1013=",
        "recebimento": "2025-09-17 05:55:44"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 07:00:00",
        "mens": "METAR SBGL 170700Z 28005KT 7000 SCT017 BKN083 20/18 Q1012=",
        "recebimento": "2025-09-17 06:55:42"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 08:00:00",
        "mens": "METAR SBGL 170800Z 26008KT 8000 FEW017 BKN080 21/18 Q1013=",
        "recebimento": "2025-09-17 08:02:18"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 09:00:00",
        "mens": "METAR SBGL 170900Z 24007KT 7000 FEW023 BKN080 21/18 Q1015=",
        "recebimento": "2025-09-17 08:56:31"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 10:00:00",
        "mens": "METAR SBGL 171000Z 28004KT 8000 FEW023 BKN083 22/18 Q1016=",
        "recebimento": "2025-09-17 09:59:47"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 11:00:00",
        "mens": "METAR SBGL 171100Z 27006KT 8000 SCT020 BKN080 23/18 Q1016=",
        "recebimento": "2025-09-17 10:57:24"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 12:00:00",
        "mens": "METAR SBGL 171200Z 28004KT 9999 SCT020 BKN070 24/18 Q1017=",
        "recebimento": "2025-09-17 11:53:37"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 13:00:00",
        "mens": "METAR SBGL 171300Z 30005KT 9999 SCT025 BKN050 25/16 Q1017=",
        "recebimento": "2025-09-17 12:56:27"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 14:00:00",
        "mens": "METAR SBGL 171400Z 26006KT 9999 SCT025 BKN045 26/16 Q1017=",
        "recebimento": "2025-09-17 13:57:36"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 15:00:00",
        "mens": "METAR SBGL 171500Z 28003KT 9999 FEW025 SCT045 27/15 Q1016=",
        "recebimento": "2025-09-17 14:53:20"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 16:00:00",
        "mens": "METAR SBGL 171600Z 14007KT 9999 SCT040 27/16 Q1015=",
        "recebimento": "2025-09-17 15:57:06"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 17:00:00",
        "mens": "METAR SBGL 171700Z 12010KT 9999 SCT035 26/17 Q1014=",
        "recebimento": "2025-09-17 16:57:14"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 18:00:00",
        "mens": "METAR SBGL 171800Z 13005KT 9999 FEW040 28/15 Q1013=",
        "recebimento": "2025-09-17 17:58:39"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 19:00:00",
        "mens": "METAR SBGL 171900Z 21016KT 9999 FEW040 25/17 Q1014=",
        "recebimento": "2025-09-17 18:57:36"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 20:00:00",
        "mens": "METAR SBGL 172000Z 21015KT 9999 FEW040 25/16 Q1015=",
        "recebimento": "2025-09-17 19:55:41"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 21:00:00",
        "mens": "METAR SBGL 172100Z 23010KT 9999 SCT040 24/16 Q1016=",
        "recebimento": "2025-09-17 20:57:16"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 22:00:00",
        "mens": "METAR SBGL 172200Z 23013KT 9999 FEW030 23/16 Q1016=",
        "recebimento": "2025-09-17 21:53:47"
      },
      {
        "id_localidade": "SBGL",
        "validade_inicial": "2025-09-17 23:00:00",
        "mens": "METAR SBGL 172300Z 27014KT 9999 BKN025 23/18 Q1017=",
        "recebimento": "2025-09-17 22:55:02"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 00:00:00",
        "mens": "METAR SBGR 170000Z 15003KT 7000 NSC 19/17 Q1018=",
        "recebimento": "2025-09-16 23:58:37"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 01:00:00",
        "mens": "METAR SBGR 170100Z 15002KT 6000 NSC 18/16 Q1018=",
        "recebimento": "2025-09-17 00:56:06"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 02:00:00",
        "mens": "METAR SBGR 170200Z 16004KT 6000 NSC 18/16 Q1019=",
        "recebimento": "2025-09-17 01:55:51"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 03:00:00",
        "mens": "METAR SBGR 170300Z 12002KT 7000 NSC 17/15 Q1019=",
        "recebimento": "2025-09-17 02:57:26"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 04:00:00",
        "mens": "METAR SBGR 170400Z 09002KT 6000 SCT043 16/15 Q1019=",
        "recebimento": "2025-09-17 03:55:20"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 05:00:00",
        "mens": "METAR SBGR 170500Z 15002KT 5000 BR BKN010 15/14 Q1018=",
        "recebimento": "2025-09-17 04:56:42"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 06:00:00",
        "mens": "METAR SBGR 170600Z 16003KT 7000 BKN010 16/14 Q1018=",
        "recebimento": "2025-09-17 05:55:57"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 07:00:00",
        "mens": "METAR SBGR 170700Z 00000KT 9999 BKN019 15/13 Q1018=",
        "recebimento": "2025-09-17 06:56:26"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 08:00:00",
        "mens": "METAR SBGR 170800Z 00000KT 9999 BKN017 15/14 Q1018=",
        "recebimento": "2025-09-17 07:55:28"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 09:00:00",
        "mens": "METAR SBGR 170900Z 16003KT 9999 BKN015 16/14 Q1019=",
        "recebimento": "2025-09-17 08:56:02"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 10:00:00",
        "mens": "METAR SBGR 171000Z 16005KT 9999 OVC020 17/13 Q1020=",
        "recebimento": "2025-09-17 10:00:20"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 11:00:00",
        "mens": "METAR SBGR 171100Z 16004KT 9999 SCT020 OVC030 18/13 Q1021=",
        "recebimento": "2025-09-17 11:01:38"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 12:00:00",
        "mens": "METAR SBGR 171200Z 17006KT 9999 SCT025 BKN035 19/13 Q1021=",
        "recebimento": "2025-09-17 11:58:12"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 13:00:00",
        "mens": "METAR SBGR 171300Z 17007KT 9999 BKN025 19/12 Q1022=",
        "recebimento": "2025-09-17 12:58:21"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 14:00:00",
        "mens": "METAR SBGR 171400Z 18005KT 9999 BKN035 21/12 Q1022=",
        "recebimento": "2025-09-17 14:00:59"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 15:00:00",
        "mens": "METAR SBGR 171500Z 16005KT 9999 BKN040 22/12 Q1021=",
        "recebimento": "2025-09-17 14:58:10"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 16:00:00",
        "mens": "METAR SBGR 171600Z 14006KT 9999 SCT045 24/11 Q1020=",
        "recebimento": "2025-09-17 15:58:43"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 17:00:00",
        "mens": "METAR SBGR 171700Z 14006KT 9999 SCT045 23/11 Q1019=",
        "recebimento": "2025-09-17 16:55:53"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 18:00:00",
        "mens": "METAR SBGR 171800Z 15012KT 9999 SCT045 24/13 Q1019=",
        "recebimento": "2025-09-17 17:57:58"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 19:00:00",
        "mens": "METAR SBGR 171900Z 15011KT 9999 FEW035 22/13 Q1019=",
        "recebimento": "2025-09-17 18:58:32"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 20:00:00",
        "mens": "METAR SBGR 172000Z 16011KT 9999 FEW035 20/13 Q1020=",
        "recebimento": "2025-09-17 19:55:49"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 21:00:00",
        "mens": "METAR SBGR 172100Z 15009KT 9999 FEW015 SCT030 18/14 Q1020=",
        "recebimento": "2025-09-17 20:55:19"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 22:00:00",
        "mens": "METAR SBGR 172200Z 16007KT 9999 FEW015 SCT020 17/14 Q1021=",
        "recebimento": "2025-09-17 21:56:31"
      },
      {
        "id_localidade": "SBGR",
        "validade_inicial": "2025-09-17 23:00:00",
        "mens": "METAR SBGR 172300Z 16007KT 9999 FEW015 BKN020 17/14 Q1021=",
        "recebimento": "2025-09-17 23:01:32"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 00:00:00",
        "mens": "METAR SBRJ 170000Z 32005KT 270V350 7000 FEW010 BKN018 OVC090 22/20 Q1014=",
        "recebimento": "2025-09-16 23:58:30"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 01:00:00",
        "mens": "METAR SBRJ 170100Z 33005KT 9000 FEW010 BKN018 OVC100 22/20 Q1014=",
        "recebimento": "2025-09-17 00:55:53"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 02:00:00",
        "mens": "METAR SBRJ 170200Z 33007KT 9999 FEW013 SCT025 BKN100 22/20 Q1014=",
        "recebimento": "2025-09-17 01:58:18"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 03:00:00",
        "mens": "METAR SBRJ 170300Z 01004KT 9999 FEW017 SCT100 21/20 Q1013=",
        "recebimento": "2025-09-17 02:59:01"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 04:00:00",
        "mens": "METAR SBRJ 170400Z VRB02KT 9999 FEW017 SCT100 21/20 Q1013=",
        "recebimento": "2025-09-17 03:55:32"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 05:00:00",
        "mens": "METAR SBRJ 170500Z 16005KT 9999 FEW017 21/20 Q1012=",
        "recebimento": "2025-09-17 04:57:16"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 06:00:00",
        "mens": "METAR SBRJ 170600Z 21004KT 9999 FEW020 SCT090 21/20 Q1012=",
        "recebimento": "2025-09-17 05:56:41"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 07:00:00",
        "mens": "METAR SBRJ 170700Z 36005KT 9999 FEW020 SCT085 22/20 Q1012=",
        "recebimento": "2025-09-17 06:55:15"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 08:00:00",
        "mens": "METAR SBRJ 170800Z 06005KT 9999 SCT015 SCT085 22/20 Q1013=",
        "recebimento": "2025-09-17 07:57:04"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 09:00:00",
        "mens": "METAR SBRJ 170900Z 17005KT 140V200 9999 SCT015 SCT020 21/19 Q1014=",
        "recebimento": "2025-09-17 08:57:20"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 10:00:00",
        "mens": "METAR SBRJ 171000Z 35004KT 290V020 8000 FEW018 SCT023 22/20 Q1015=",
        "recebimento": "2025-09-17 09:56:00"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 11:00:00",
        "mens": "METAR SBRJ 171100Z 04006KT 8000 SCT023 SCT040 23/20 Q1016=",
        "recebimento": "2025-09-17 10:55:11"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 12:00:00",
        "mens": "METAR SBRJ 171200Z 03007KT 9000 SCT023 SCT040 23/20 Q1016=",
        "recebimento": "2025-09-17 11:55:09"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 13:00:00",
        "mens": "METAR SBRJ 171300Z 03004KT 9999 FEW025 SCT035 25/21 Q1016=",
        "recebimento": "2025-09-17 12:55:04"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 14:00:00",
        "mens": "METAR SBRJ 171400Z 09006KT 9999 FEW025 SCT035 25/19 Q1016=",
        "recebimento": "2025-09-17 13:55:35"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 15:00:00",
        "mens": "METAR SBRJ 171500Z 14008KT 9999 FEW025 SCT040 26/18 Q1016=",
        "recebimento": "2025-09-17 14:56:53"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 16:00:00",
        "mens": "METAR SBRJ 171600Z 12007KT 9999 SCT035 26/19 Q1015=",
        "recebimento": "2025-09-17 15:55:14"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 17:00:00",
        "mens": "METAR SBRJ 171700Z 19014KT 9999 SCT035 27/18 Q1014=",
        "recebimento": "2025-09-17 16:55:12"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 18:00:00",
        "mens": "METAR SBRJ 171800Z 19015KT 9999 SCT035 27/16 Q1013=",
        "recebimento": "2025-09-17 17:55:12"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 19:00:00",
        "mens": "METAR SBRJ 171900Z 20016KT 9999 SCT035 25/18 Q1014=",
        "recebimento": "2025-09-17 18:55:34"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 20:00:00",
        "mens": "METAR SBRJ 172000Z 20009KT 170V230 9999 FEW045 BKN060 BKN090 25/17 Q1014=",
        "recebimento": "2025-09-17 19:57:47"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 21:00:00",
        "mens": "METAR SBRJ 172100Z 22005KT 180V260 9999 FEW040 BKN070 24/17 Q1015=",
        "recebimento": "2025-09-17 20:55:07"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 22:00:00",
        "mens": "METAR SBRJ 172200Z 24011KT 210V280 9999 SCT030 24/18 Q1016=",
        "recebimento": "2025-09-17 21:55:03"
      },
      {
        "id_localidade": "SBRJ",
        "validade_inicial": "2025-09-17 23:00:00",
        "mens": "METAR SBRJ 172300Z 25009KT 200V290 9999 FEW020 BKN025 23/18 Q1016=",
        "recebimento": "2025-09-17 22:55:19"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 00:00:00",
        "mens": "METAR SBSP 170000Z 19008KT CAVOK 20/15 Q1019=",
        "recebimento": "2025-09-16 23:52:13"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 01:00:00",
        "mens": "METAR SBSP 170100Z 16008KT CAVOK 17/15 Q1020=",
        "recebimento": "2025-09-17 00:59:24"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 02:00:00",
        "mens": "METAR SBSP 170200Z 17005KT 9999 SCT008 BKN011 17/15 Q1020=",
        "recebimento": "2025-09-17 01:55:26"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 02:05:00",
        "mens": "SPECI SBSP 170205Z 17004KT 9999 SCT008 BKN010 17/15 Q1019=",
        "recebimento": "2025-09-17 02:07:07"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 02:20:00",
        "mens": "SPECI SBSP 170220Z AUTO 18003KT 160V220 9999 FEW009 17/15 Q1020=",
        "recebimento": "2025-09-17 02:21:53"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 03:00:00",
        "mens": "METAR SBSP 170300Z AUTO 19003KT 9999 FEW008 16/15 Q1019=",
        "recebimento": "2025-09-17 03:01:31"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 04:00:00",
        "mens": "METAR SBSP 170400Z AUTO 17004KT 9999 FEW043 16/14 Q1019=",
        "recebimento": "2025-09-17 04:01:32"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 04:32:00",
        "mens": "SPECI SBSP 170432Z AUTO 16008KT 9999 FEW006 BKN008 16/15 Q1019=",
        "recebimento": "2025-09-17 04:33:38"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 05:00:00",
        "mens": "METAR SBSP 170500Z AUTO 17007KT 140V200 9999 BKN008 BKN010 16/14 Q1019=",
        "recebimento": "2025-09-17 05:01:33"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 05:10:00",
        "mens": "SPECI SBSP 170510Z AUTO 17007KT 140V200 9999 BKN010 16/14 Q1019=",
        "recebimento": "2025-09-17 05:12:22"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 05:30:00",
        "mens": "SPECI SBSP 170530Z AUTO 16003KT 130V190 9999 SCT010 16/13 Q1018=",
        "recebimento": "2025-09-17 05:32:24"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 06:00:00",
        "mens": "METAR SBSP 170600Z AUTO VRB02KT 9999 BKN017 16/14 Q1018=",
        "recebimento": "2025-09-17 06:01:32"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 06:39:00",
        "mens": "SPECI SBSP 170639Z AUTO 16005KT 9999 FEW010 OVC014 16/14 Q1018=",
        "recebimento": "2025-09-17 06:41:24"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 07:00:00",
        "mens": "METAR SBSP 170700Z AUTO 17006KT 9999 FEW010 BKN013 OVC015 16/14 Q1018=",
        "recebimento": "2025-09-17 07:01:32"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 07:05:00",
        "mens": "SPECI SBSP 170705Z AUTO 18007KT 150V210 9999 FEW009 SCT012 OVC016 16/14 Q1018=",
        "recebimento": "2025-09-17 07:07:24"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 07:12:00",
        "mens": "SPECI SBSP 170712Z AUTO 18007KT 9999 SCT009 BKN012 OVC016 16/15 Q1018=",
        "recebimento": "2025-09-17 07:14:09"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 07:36:00",
        "mens": "SPECI SBSP 170736Z AUTO 17007KT 9999 FEW008 BKN011 BKN013 16/14 Q1018=",
        "recebimento": "2025-09-17 07:38:08"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 07:49:00",
        "mens": "SPECI SBSP 170749Z AUTO 19006KT 9999 FEW008 SCT010 BKN013 16/14 Q1019=",
        "recebimento": "2025-09-17 07:51:09"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 08:00:00",
        "mens": "METAR SBSP 170800Z AUTO 18006KT 9999 FEW008 SCT010 BKN015 16/14 Q1019=",
        "recebimento": "2025-09-17 08:01:34"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 08:07:00",
        "mens": "SPECI SBSP 170807Z AUTO 19006KT 9999 FEW010 SCT012 BKN014 16/13 Q1019=",
        "recebimento": "2025-09-17 08:09:09"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 08:42:00",
        "mens": "SPECI SBSP 170842Z AUTO 19006KT 150V220 9999 FEW012 OVC015 16/13 Q1019=",
        "recebimento": "2025-09-17 08:44:10"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 09:00:00",
        "mens": "METAR SBSP 170900Z 17004KT 9999 SCT015 BKN017 16/13 Q1020=",
        "recebimento": "2025-09-17 09:02:22"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 10:00:00",
        "mens": "METAR SBSP 171000Z 18006KT 9999 SCT013 BKN017 16/13 Q1021=",
        "recebimento": "2025-09-17 10:03:29"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 11:00:00",
        "mens": "METAR SBSP 171100Z 16007KT 9999 SCT009 BKN011 17/14 Q1022=",
        "recebimento": "2025-09-17 10:59:20"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 12:00:00",
        "mens": "METAR SBSP 171200Z 16009KT 9999 SCT013 BKN017 17/13 Q1022=",
        "recebimento": "2025-09-17 11:57:14"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 13:00:00",
        "mens": "METAR SBSP 171300Z 15011KT 9999 SCT016 BKN023 19/13 Q1023=",
        "recebimento": "2025-09-17 13:02:57"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 14:00:00",
        "mens": "METAR SBSP 171400Z 18009KT 9999 BKN023 21/13 Q1022=",
        "recebimento": "2025-09-17 13:55:45"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 15:00:00",
        "mens": "METAR SBSP 171500Z 16011KT 9999 SCT033 22/12 Q1021=",
        "recebimento": "2025-09-17 15:01:39"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 16:00:00",
        "mens": "METAR SBSP 171600Z 17012KT 9999 FEW040 22/12 Q1021=",
        "recebimento": "2025-09-17 16:04:01"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 16:45:00",
        "mens": "SPECI SBSP 171645Z 16010G20KT 9999 SCT040 23/13 Q1020=",
        "recebimento": "2025-09-17 16:47:27"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 17:00:00",
        "mens": "METAR SBSP 171700Z 17012KT 9999 SCT040 23/13 Q1020=",
        "recebimento": "2025-09-17 16:55:39"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 18:00:00",
        "mens": "METAR SBSP 171800Z 17013KT 9999 BKN030 23/14 Q1019=",
        "recebimento": "2025-09-17 17:55:01"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 19:00:00",
        "mens": "METAR SBSP 171900Z 15012KT 9999 BKN023 20/14 Q1020=",
        "recebimento": "2025-09-17 18:55:07"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 20:00:00",
        "mens": "METAR SBSP 172000Z 15010KT 9999 BKN023 BKN026 19/13 Q1021=",
        "recebimento": "2025-09-17 19:59:20"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 21:00:00",
        "mens": "METAR COR SBSP 172100Z 15010KT 9999 SCT015 BKN017 17/14 Q1021=",
        "recebimento": "2025-09-17 20:59:38"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 21:18:00",
        "mens": "SPECI SBSP 172118Z 16010KT 9999 BKN014 17/14 Q1021=",
        "recebimento": "2025-09-17 21:23:50"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 22:00:00",
        "mens": "METAR SBSP 172200Z 15010KT 9999 FEW011 BKN015 16/14 Q1021=",
        "recebimento": "2025-09-17 21:56:19"
      },
      {
        "id_localidade": "SBSP",
        "validade_inicial": "2025-09-17 23:00:00",
        "mens": "METAR SBSP 172300Z 15011KT 9999 FEW011 BKN013 16/14 Q1022=",
        "recebimento": "2025-09-17 22:56:13"
      }
    ];