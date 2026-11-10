document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const startButton = document.getElementById("startButton");
  const startHint = document.getElementById("startHint");
  const content = document.getElementById("content");
  const song = document.getElementById("song");
  const musicButton = document.getElementById("musicButton");
  const musicLabel = document.getElementById("musicLabel");

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCount = document.getElementById("lightboxCount");
  const photoCards = [...document.querySelectorAll(".photo-card")];

  const photoSources = photoCards.map((card) =>
    card.querySelector("img").getAttribute("src"),
  );

  let activePhoto = 0;
  let started = false;

  const updateMusicState = () => {
    const playing = !song.paused;
    musicButton.classList.toggle("playing", playing);
    musicLabel.textContent = playing ? "Pause music" : "Play music";
  };

  async function playMusic() {
    try {
      song.volume = 0.72;
      await song.play();
      updateMusicState();
      return true;
    } catch (error) {
      console.error("Musik tidak dapat diputar:", error);
      startHint.textContent =
        "Musik belum bisa diputar. Periksa file assets/audio/keepme.mp3.";
      return false;
    }
  }

  startButton.addEventListener("click", async () => {
    if (started) return;
    startButton.disabled = true;
    startHint.textContent = "Sebentar, kita buka pelan-pelan...";
    await playMusic();
    started = true;
    content.classList.remove("hidden");
    document.body.classList.remove("locked");
    intro.classList.add("closing");

    window.setTimeout(() => {
      intro.remove();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 850);

    revealObserver.observe(document.body);
  });

  musicButton.addEventListener("click", async () => {
    if (song.paused) await playMusic();
    else song.pause();
  });

  song.addEventListener("play", updateMusicState);
  song.addEventListener("pause", updateMusicState);
  song.addEventListener("ended", updateMusicState);

  song.addEventListener("error", () => {
    startHint.textContent =
      "File musik tidak ditemukan. Pastikan assets/audio/keepme.mp3 sudah ada.";
    console.error("Audio source error:", song.error);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(".reveal, .photo-card").forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });

  function showPhoto(index) {
    activePhoto = (index + photoSources.length) % photoSources.length;
    lightboxImage.src = photoSources[activePhoto];
    lightboxCount.textContent = `${String(activePhoto + 1).padStart(2, "0")} / ${String(photoSources.length).padStart(2, "0")}`;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePhoto() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  photoCards.forEach((card) => {
    card.addEventListener("click", () => {
      showPhoto(Number(card.dataset.photo));
    });
  });

  document
    .getElementById("lightboxClose")
    .addEventListener("click", closePhoto);
  document.getElementById("lightboxPrev").addEventListener("click", () => {
    showPhoto(activePhoto - 1);
  });
  document.getElementById("lightboxNext").addEventListener("click", () => {
    showPhoto(activePhoto + 1);
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closePhoto();
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closePhoto();
    if (event.key === "ArrowLeft") showPhoto(activePhoto - 1);
    if (event.key === "ArrowRight") showPhoto(activePhoto + 1);
  });
});
