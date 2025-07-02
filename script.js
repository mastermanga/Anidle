let animeData = [];
let targetAnime = null;
let attemptCount = 0;
let gameOver = false;
let indiceStep = 0;

fetch('animes.json')
  .then(response => response.json())
  .then(data => {
    animeData = data;
    targetAnime = animeData[Math.floor(Math.random() * animeData.length)];
    console.log("Réponse secrète:", targetAnime);
  });

document.getElementById("animeInput").addEventListener("input", function() {
  const input = this.value.toLowerCase();
  const matches = animeData.filter(a => a.title.toLowerCase().includes(input)).slice(0, 5);
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";
  matches.forEach(anime => {
    const div = document.createElement("div");
    div.textContent = anime.title;
    div.onclick = () => {
      document.getElementById("animeInput").value = anime.title;
      suggestions.innerHTML = "";
      guessAnime();
    };
    suggestions.appendChild(div);
  });
});

document.getElementById("indiceBtn").addEventListener("click", () => {
  if (!targetAnime) return;
  indiceStep++;
  if (indiceStep > 5) indiceStep = 5;

  document.getElementById("indicesContainer").style.display = "block";

  if (indiceStep >= 1) {
    document.getElementById("indice1").textContent = targetAnime.genres[0] || "N/A";
  }
  if (indiceStep >= 2) {
    document.getElementById("indice2").textContent = targetAnime.studio || "N/A";
  }
  if (indiceStep >= 3) {
    document.getElementById("indice3").textContent = targetAnime.season || "N/A";
  }
  if (indiceStep >= 4) {
    document.getElementById("indice4").textContent = targetAnime.title.charAt(0) || "N/A";
  }
  if (indiceStep >= 5) {
    const img = document.getElementById("indice5");
    img.src = targetAnime.image;
    img.style.filter = "blur(8px)";
  }
});

function guessAnime() {
  if (gameOver) return;
  const input = document.getElementById("animeInput").value.trim();
  const guessedAnime = animeData.find(a => a.title.toLowerCase() === input.toLowerCase());

  if (!guessedAnime) {
    alert("Anime non trouvé !");
    return;
  }

  attemptCount++;
  document.getElementById("counter").textContent = "Tentatives : " + attemptCount;

  updateAidPanel(); // 👈 Met à jour les suggestions

  const results = document.getElementById("results");

  const keyToClass = {
    image: "cell-image",
    title: "cell-title",
    season: "cell-season",
    studio: "cell-studio",
    genresThemes: "cell-genre",
    score: "cell-score"
  };

  if (attemptCount === 1) {
    const header = document.createElement("div");
    header.classList.add("row");
    ["Image", "Titre", "Saison", "Studio", "Genres / Thèmes", "Score"].forEach((label, i) => {
      const cell = document.createElement("div");
      cell.classList.add("cell", Object.values(keyToClass)[i]);
      cell.style.fontWeight = "bold";
      cell.textContent = label;
      header.appendChild(cell);
    });
    results.insertBefore(header, results.firstChild);
  }

  const row = document.createElement("div");
  row.classList.add("row");

  // Image
  const cellImage = document.createElement("div");
  cellImage.classList.add("cell", keyToClass.image);
  const img = document.createElement("img");
  img.src = guessedAnime.image;
  img.alt = guessedAnime.title;
  img.style.width = "100px";
  cellImage.appendChild(img);
  row.appendChild(cellImage);

  // Title
  const cellTitle = document.createElement("div");
  cellTitle.classList.add("cell", keyToClass.title);
  const isTitleMatch = guessedAnime.title === targetAnime.title;
  cellTitle.classList.add(isTitleMatch ? "green" : "red");
  cellTitle.textContent = guessedAnime.title;
  row.appendChild(cellTitle);

  // Season
  const cellSeason = document.createElement("div");
  cellSeason.classList.add("cell", keyToClass.season);
  const [gs, gy] = guessedAnime.season.split(" ");
  const [ts, ty] = targetAnime.season.split(" ");
  const guessYear = parseInt(gy);
  const targetYear = parseInt(ty);
  if (gs === ts && gy === ty) {
    cellSeason.classList.add("green");
    cellSeason.textContent = `✅ ${guessedAnime.season}`;
  } else if (gy === ty) {
    cellSeason.classList.add("orange");
    cellSeason.textContent = `🟧 ${guessedAnime.season}`;
  } else {
    cellSeason.classList.add("red");
    cellSeason.textContent = guessYear < targetYear
      ? `🔼 ${guessedAnime.season}`
      : `${guessedAnime.season} 🔽`;
  }
  row.appendChild(cellSeason);

  // Studio
  const cellStudio = document.createElement("div");
  cellStudio.classList.add("cell", keyToClass.studio);
  const isStudioMatch = guessedAnime.studio === targetAnime.studio;
  cellStudio.classList.add(isStudioMatch ? "green" : "red");
  cellStudio.textContent = guessedAnime.studio;
  row.appendChild(cellStudio);

  // Genres / Themes
  const cellGenresThemes = document.createElement("div");
  cellGenresThemes.classList.add("cell", keyToClass.genresThemes);
  const allGuessed = [...guessedAnime.genres, ...guessedAnime.themes];
  const allTarget = [...targetAnime.genres, ...targetAnime.themes];
  const matches = allGuessed.filter(x => allTarget.includes(x));
  if (matches.length === allGuessed.length && matches.length === allTarget.length) {
    cellGenresThemes.classList.add("green");
  } else if (matches.length > 0) {
    cellGenresThemes.classList.add("orange");
  } else {
    cellGenresThemes.classList.add("red");
  }
  cellGenresThemes.innerHTML = allGuessed.join("<br>");
  row.appendChild(cellGenresThemes);

  // Score
  const cellScore = document.createElement("div");
  cellScore.classList.add("cell", keyToClass.score);
  const g = parseFloat(guessedAnime.score);
  const t = parseFloat(targetAnime.score);
  if (g === t) {
    cellScore.classList.add("green");
    cellScore.textContent = `✅ ${g}`;
  } else {
    cellScore.classList.add("red");
    cellScore.textContent = g < t ? `🔼 ${g}` : `${g} 🔽`;
  }
  row.appendChild(cellScore);

  const header = results.querySelector(".row");
  results.insertBefore(row, header.nextSibling);

  document.getElementById("animeInput").value = "";
  document.getElementById("suggestions").innerHTML = "";

  if (guessedAnime.title === targetAnime.title) {
    gameOver = true;
    document.getElementById("animeInput").disabled = true;
    document.getElementById("indiceBtn").disabled = true;
    const message = document.createElement("div");
    message.id = "winMessage";
    message.innerHTML = `🎆 <span style="font-size:2rem;">🥳</span> Bravo ! C'était <u>${targetAnime.title}</u> en ${attemptCount} tentative${attemptCount > 1 ? 's' : ''}. <span style="font-size:2rem;">🎉</span>`;
    results.appendChild(message);
    launchFireworks();
  }
}

function updateAidPanel() {
  const helpList = document.getElementById("aideListe");
  helpList.innerHTML = "";

  let filtered = [];

  if (attemptCount >= 25) {
    filtered = animeData.filter(a => a.season === targetAnime.season);
  } else if (attemptCount >= 20) {
    filtered = animeData.filter(a => a.season.split(" ")[1] === targetAnime.season.split(" ")[1]);
  } else if (attemptCount >= 15) {
    filtered = animeData.filter(a => {
      const year = parseInt(a.season.split(" ")[1]);
      const tYear = parseInt(targetAnime.season.split(" ")[1]);
      return Math.abs(year - tYear) <= 2;
    });
  } else if (attemptCount >= 10) {
    filtered = animeData.filter(a => {
      const year = parseInt(a.season.split(" ")[1]);
      const tYear = parseInt(targetAnime.season.split(" ")[1]);
      return Math.abs(year - tYear) <= 5;
    });
  } else if (attemptCount >= 5) {
    filtered = animeData;
  }

  if (filtered.length > 0) {
    const ul = document.createElement("ul");
    ul.style.listStyle = "none";
    ul.style.padding = "0";
    filtered.forEach(a => {
      const li = document.createElement("li");
      li.textContent = a.title;
      ul.appendChild(li);
    });
    helpList.appendChild(ul);
  }
}

function resetGame() {
  location.reload();
}

function launchFireworks() {
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = [];

  function createParticle(x, y) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 5 + 2;
    return {
      x,
      y,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed,
      life: 60
    };
  }

  for (let i = 0; i < 100; i++) {
    particles.push(createParticle(canvas.width / 2, canvas.height / 2));
  }

  function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      p.dy += 0.05;
      p.life--;
    });
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }
    if (particles.length > 0) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  animate();
}
