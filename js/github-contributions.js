/*
  Grid de contribuciones de GitHub — 100% client-side, sin backend.
  Usa la API pública gratuita github-contributions-api.jogruber.de, que expone
  los mismos datos que el heatmap de GitHub (date, count, level 0-4) con CORS
  habilitado, algo que la API oficial de GitHub no permite sin autenticación.

  Para cambiar de usuario: reemplazá GITHUB_USERNAME más abajo.
*/

(function () {
  const GITHUB_USERNAME = "ignacioarchives";
  const API_URL = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

  const container = document.getElementById("github-contributions");
  if (!container) return;

  function buildWeeks(contributions) {
    const weeks = [];
    let currentWeek = [];

    const firstDate = new Date(contributions[0].date + "T00:00:00");
    const leadingEmptyDays = firstDate.getDay(); // 0 = domingo
    for (let i = 0; i < leadingEmptyDays; i++) {
      currentWeek.push(null);
    }

    contributions.forEach((day) => {
      currentWeek.push(day);
      const dayOfWeek = new Date(day.date + "T00:00:00").getDay();
      if (dayOfWeek === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }

    return weeks;
  }

  function renderGrid(contributions, total) {
    const weeks = buildWeeks(contributions);

    const gridEl = document.createElement("div");
    gridEl.className = "contrib-grid";

    weeks.forEach((week) => {
      const weekEl = document.createElement("div");
      weekEl.className = "contrib-grid__week";

      week.forEach((day) => {
        const cellEl = document.createElement("div");
        if (day) {
          cellEl.className = "contrib-grid__cell";
          cellEl.dataset.level = day.level;
          cellEl.title = `${day.count} contribuciones el ${day.date}`;
        } else {
          cellEl.className = "contrib-grid__cell is-empty";
        }
        weekEl.appendChild(cellEl);
      });

      gridEl.appendChild(weekEl);
    });

    const summaryEl = document.createElement("div");
    summaryEl.className = "contrib-card__summary";
    summaryEl.innerHTML = `<span>${total} contribuciones en el último año</span>`;

    container.innerHTML = "";
    container.appendChild(summaryEl);
    container.appendChild(gridEl);
  }

  function renderState(message) {
    container.innerHTML = `<p class="contrib-card__state">${message}</p>`;
  }

  renderState("Cargando contribuciones…");

  fetch(API_URL)
    .then((res) => {
      if (!res.ok) throw new Error("request failed");
      return res.json();
    })
    .then((data) => {
      if (!data.contributions || !data.contributions.length) {
        throw new Error("empty response");
      }
      const total = data.total?.lastYear ?? 0;
      renderGrid(data.contributions, total);
    })
    .catch(() => {
      renderState(
        `No se pudo cargar el grid de contribuciones. Vas a poder verlo directo en <a href="https://github.com/${GITHUB_USERNAME}" class="link">github.com/${GITHUB_USERNAME}</a>.`
      );
    });
})();
