fetch("games.json")
  .then(res => res.json())
  .then(games => {
    const container = document.getElementById("games");

    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";

      card.innerHTML = `
        <img src="${game.ImageURL}" alt="${game.Name}">
        <h2>${game.Name}</h2>
        <a href="${game.Link}" target="_blank">Jogar</a>
      `;

      container.appendChild(card);
    });
  })
  .catch(err => console.error("Erro ao carregar jogos:", err));
