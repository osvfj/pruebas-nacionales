export async function getPeriodosEscolares() {
  const REQUEST_OPTIONS = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; rv:125.0) Gecko/20100101 Firefox/125.0",
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/json charset=utf-8",
      "X-Requested-With": "XMLHttpRequest",
      "Sec-GPC": "1",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      Pragma: "no-cache",
      "Cache-Control": "no-cache",
    },
    referrer: "https://certificado.ministeriodeeducacion.gob.do/",
    body: "null",
    method: "POST",
    mode: "cors",
  };
  try {
    const res = await fetch(
      "https://certificado.ministeriodeeducacion.gob.do/JsonCalls/getPeriodosEscolares",
      REQUEST_OPTIONS
    );
    return await res.json();
  } catch (e) {
    throw new Error("Error al pedir la API");
  }
}

export async function isCurrentYearOut() {
  const periodos = await getPeriodosEscolares();
  const currentYear = new Date().getFullYear();
  return { isOut: periodos.at(-1)?.Codigo === currentYear, year: currentYear };
}
