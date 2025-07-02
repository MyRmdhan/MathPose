const URL = "model/"; // folder model kamu (ganti sesuai tempat file TM)
let model, webcam, ctx, labelContainer, maxPredictions;

let currentPose = "normal";
let lockedPose = "";
let poseStartTime = null;
let currentIndex = 0;
let skor = 0;
let isWaiting = false;
let waktuTersisa = 120;
let timerInterval = null;
let gameBerakhir = false;
let animationFrameId;
let selectedCategory = "sd"; // default
let shuffledQuestions = [];

function pilihKategori(kategori) {
  selectedCategory = kategori;

  if (kategori === "sd") {
    shuffledQuestions = [...questionsSD];
  } else if (kategori === "smp") {
    shuffledQuestions = [...questionsSMP];
  } else if (kategori === "sma") {
    shuffledQuestions = [...questionsSMA];
  }

  shuffleArray(shuffledQuestions);

  // ❌ Hapus background kosong → munculkan game-box normal
  document.querySelector(".game-box").classList.remove("no-bg");

  tampilkanRiwayat(kategori);

  document.getElementById("kategori-screen").style.display = "none";
  document.getElementById("intro-screen").style.display = "block";
}

function mulaiTimer() {
  waktuTersisa = 120;
  gameBerakhir = false;
  updateTimerUI();

  timerInterval = setInterval(() => {
    waktuTersisa--;
    updateTimerUI();

    if (waktuTersisa <= 0) {
      clearInterval(timerInterval);
      akhiriPermainan();
    }
  }, 1000);
}

function updateTimerUI() {
  const menit = Math.floor(waktuTersisa / 60);
  const detik = waktuTersisa % 60;
  document.getElementById("timer").textContent = `🕒 Waktu: ${String(
    menit
  ).padStart(2, "0")}:${String(detik).padStart(2, "0")}`;
}

function akhiriPermainan() {
  gameBerakhir = true;

  // Hentikan loop
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Matikan semua track webcam secara paksa
  if (webcam && webcam.webcam && webcam.webcam.srcObject) {
    webcam.webcam.srcObject.getTracks().forEach((track) => track.stop());
  }

  // Kosongkan container webcam
  document.getElementById("webcam-container").innerHTML = "";

  // Sembunyikan elemen UI
  document.getElementById("question").style.display = "none";
  document.getElementById("choices").style.display = "none";
  document.getElementById("status").style.display = "none";
  document.getElementById("timer").style.display = "none";
  document.getElementById("skor").style.display = "none";
  simpanRiwayat(selectedCategory, skor);

  // Tampilkan skor akhir dan tombol restart
  document.getElementById(
    "final-score"
  ).textContent = `SKOR akhir kamu: ${skor}`;
  document.getElementById("game-over").style.display = "block";
}

document
  .getElementById("restart-button")
  .addEventListener("click", async () => {
    // Reset state
    currentIndex = 0;
    skor = 0;
    waktuTersisa = 120;
    gameBerakhir = false;
    isWaiting = false;
    lockedPose = "";
    poseStartTime = null;

    // Stop game music
    const gameMusic = document.getElementById("game-backsound");
    gameMusic.pause();
    gameMusic.currentTime = 0;

    // Tampilkan kembali pilihan kategori
    document.getElementById("game-content").style.display = "none";
    document.getElementById("game-over").style.display = "none";
    document.getElementById("kategori-screen").style.display = "block";
    tampilkanRiwayat(selectedCategory);

    // Tampilkan kembali backsound awal
    const backsound = document.getElementById("backsound");
    backsound.currentTime = 0;
    backsound.play();

    // Matikan webcam jika aktif
    if (webcam && webcam.webcam && webcam.webcam.srcObject) {
      webcam.webcam.srcObject.getTracks().forEach((track) => track.stop());
      document.getElementById("webcam-container").innerHTML = "";
    }

    // Reset tampilan UI lainnya
    document.getElementById("question").style.display = "block";
    document.getElementById("choices").style.display = "block";
    document.getElementById("status").style.display = "block";
    document.getElementById("timer").style.display = "block";
    document.getElementById("skor").style.display = "block";
    document.getElementById("score").textContent = skor;
    document.getElementById("status").textContent = "";
  });

const questionsSD = [
  {
    soal: "KPK dari 4 dan 6 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "10", kanan: "8", kiri: "12" },
  },
  {
    soal: "FPB dari 12 dan 16 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "4", kanan: "2", kiri: "6" },
  },
  {
    soal: "Akar kuadrat dari 81 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "7", kanan: "9", kiri: "8" },
  },
  {
    soal: "3² = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6", kanan: "9", kiri: "12" },
  },
  {
    soal: "Jumlah sisi segi lima adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "4", kanan: "6", kiri: "5" },
  },
  {
    soal: "KPK dari 5 dan 10 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "20", kanan: "10", kiri: "30" },
  },
  {
    soal: "FPB dari 18 dan 24 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "8", kanan: "6", kiri: "12" },
  },
  {
    soal: "√100 = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "10", kanan: "11", kiri: "9" },
  },
  {
    soal: "4³ = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "12", kanan: "64", kiri: "16" },
  },
  {
    soal: "Berapakah luas persegi dengan sisi 8 cm?",
    jawabanBenar: "kiri",
    pilihan: { atas: "16", kanan: "64", kiri: "64" },
  },
  {
    soal: "Sisi segitiga berjumlah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "3", kanan: "4", kiri: "5" },
  },
  {
    soal: "√49 = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6", kanan: "7", kiri: "8" },
  },
  {
    soal: "FPB dari 15 dan 25 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "10", kanan: "5", kiri: "3" },
  },
  {
    soal: "KPK dari 3 dan 7 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "21", kanan: "14", kiri: "35" },
  },
  {
    soal: "5² = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "20", kanan: "15", kiri: "25" },
  },
  {
    soal: "Berapa jumlah sudut pada persegi panjang?",
    jawabanBenar: "kanan",
    pilihan: { atas: "180°", kanan: "360°", kiri: "90°" },
  },
  {
    soal: "Luas segitiga = ½ × alas × ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "sisi", kanan: "sudut", kiri: "tinggi" },
  },
  {
    soal: "√36 = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "5", kanan: "6", kiri: "7" },
  },
  {
    soal: "Jumlah sisi pada segi enam adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "5", kanan: "7", kiri: "6" },
  },
  {
    soal: "7² = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "49", kanan: "42", kiri: "56" },
  },
  {
    soal: "KPK dari 6 dan 8 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "48", kanan: "24", kiri: "12" },
  },
  {
    soal: "FPB dari 20 dan 30 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "10", kanan: "5", kiri: "15" },
  },
  {
    soal: "Akar dari 16 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "3", kanan: "4", kiri: "5" },
  },
  {
    soal: "Volume kubus dengan sisi 3 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "6", kanan: "9", kiri: "27" },
  },
  {
    soal: "8² = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "64", kanan: "64", kiri: "48" },
  },
  {
    soal: "Jumlah sisi kubus adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "6", kanan: "8", kiri: "4" },
  },
  {
    soal: "Berapa sisi pada balok?",
    jawabanBenar: "kiri",
    pilihan: { atas: "5", kanan: "8", kiri: "6" },
  },
  {
    soal: "3³ = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "9", kanan: "27", kiri: "18" },
  },
  {
    soal: "Luas lingkaran: π × r². Jika r = 7, maka ...",
    jawabanBenar: "atas",
    pilihan: { atas: "154", kanan: "44", kiri: "77" },
  },
  {
    soal: "Keliling persegi, jika sisi 5 cm?",
    jawabanBenar: "kanan",
    pilihan: { atas: "20", kanan: "20", kiri: "25" },
  },
  {
    soal: "KPK dari 3 dan 5 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "15", kanan: "15", kiri: "30" },
  },
  {
    soal: "FPB dari 16 dan 20 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "6", kanan: "8", kiri: "4" },
  },
  {
    soal: "Akar kuadrat dari 144 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "12", kanan: "11", kiri: "13" },
  },
  {
    soal: "6² = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "36", kanan: "30", kiri: "36" },
  },
  {
    soal: "Jumlah sisi pada segi tujuh adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6", kanan: "7", kiri: "8" },
  },
  {
    soal: "Luas persegi dengan sisi 5 cm = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "10", kanan: "15", kiri: "25" },
  },
  {
    soal: "FPB dari 9 dan 12 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "2", kanan: "3", kiri: "6" },
  },
  {
    soal: "√25 = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "5", kanan: "6", kiri: "4" },
  },
  {
    soal: "Berapa hasil dari 2 × 3 × 2?",
    jawabanBenar: "kanan",
    pilihan: { atas: "10", kanan: "12", kiri: "8" },
  },
  {
    soal: "Sisi pada bangun trapesium ada ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "3", kanan: "5", kiri: "4" },
  },
  {
    soal: "Berapa hasil 10 ÷ 2?",
    jawabanBenar: "kanan",
    pilihan: { atas: "4", kanan: "5", kiri: "3" },
  },
  {
    soal: "3 × 5 = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "15", kanan: "12", kiri: "10" },
  },
  {
    soal: "KPK dari 9 dan 12 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "18", kanan: "36", kiri: "27" },
  },
  {
    soal: "FPB dari 10 dan 15 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "10", kanan: "2", kiri: "5" },
  },
  {
    soal: "Berapa 7 × 0?",
    jawabanBenar: "atas",
    pilihan: { atas: "0", kanan: "7", kiri: "1" },
  },
  {
    soal: "Akar dari 9 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "2", kanan: "3", kiri: "4" },
  },
  {
    soal: "Jumlah sisi pada lingkaran adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "1", kanan: "4", kiri: "tidak ada" },
  },
  {
    soal: "Volume kubus dengan sisi 2 cm = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "4", kanan: "8", kiri: "6" },
  },
  {
    soal: "4 × 3 = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "12", kanan: "16", kiri: "8" },
  },
  {
    soal: "Keliling persegi sisi 3 cm adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6", kanan: "12", kiri: "9" },
  },
];

const questionsSMP = [
  {
    soal: "Sederhanakan: 3x + 2x - 5",
    jawabanBenar: "atas",
    pilihan: { atas: "5x - 5", kanan: "6x - 5", kiri: "5x + 5" },
  },
  {
    soal: "Hasil dari (2a)(3a²) adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6a²", kanan: "6a³", kiri: "5a³" },
  },
  {
    soal: "Jika 4x - 3 = 13, maka x = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "2", kanan: "3", kiri: "4" },
  },
  {
    soal: "Volume kubus dengan panjang sisi 5 cm adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "25 cm³", kanan: "125 cm³", kiri: "75 cm³" },
  },
  {
    soal: "Persentase dari 3 per 5 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "60%", kanan: "50%", kiri: "80%" },
  },
  {
    soal: "Hasil dari 2⁴ adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6", kanan: "16", kiri: "8" },
  },
  {
    soal: "Luas segitiga dengan alas 10 cm dan tinggi 6 cm adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "30 cm²", kanan: "50 cm²", kiri: "60 cm²" },
  },
  {
    soal: "Jika a = 3 dan b = 4, maka a² + b² = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "25", kanan: "12", kiri: "49" },
  },
  {
    soal: "Hasil dari √81 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "8", kanan: "9", kiri: "7" },
  },
  {
    soal: "Jumlah sudut segitiga adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "360°", kanan: "90°", kiri: "180°" },
  },
  {
    soal: "Jika 2x = 18, maka x = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "9", kanan: "10", kiri: "8" },
  },
  {
    soal: "Rumus luas lingkaran adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "2πr", kanan: "πr²", kiri: "πd" },
  },
  {
    soal: "Hasil dari -3 × 4 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "7", kanan: "-7", kiri: "-12" },
  },
  {
    soal: "Bentuk sederhana dari 2x + 3x adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "5x", kanan: "6x", kiri: "x²" },
  },
  {
    soal: "Keliling persegi dengan sisi 7 cm adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "28 cm", kanan: "21 cm", kiri: "49 cm" },
  },
  {
    soal: "Jika 3x + 5 = 14, maka x = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "4", kanan: "5", kiri: "3" },
  },
  {
    soal: "Peluang muncul angka genap pada dadu adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "1/2", kanan: "1/6", kiri: "2/3" },
  },
  {
    soal: "Konversi 0,75 ke bentuk pecahan adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "1/4", kanan: "3/4", kiri: "2/5" },
  },
  {
    soal: "Jika tabungan awal Rp100.000 dan ditambah Rp20.000 tiap bulan, maka tabungan setelah 4 bulan adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "Rp180.000", kanan: "Rp160.000", kiri: "Rp180.000" },
  },
  {
    soal: "Jika kecepatan 60 km/jam, maka dalam 2 jam menempuh ... km",
    jawabanBenar: "atas",
    pilihan: { atas: "120", kanan: "60", kiri: "100" },
  },
  {
    soal: "Keliling lingkaran: 2πr. Jika r = 7, maka keliling = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "22", kanan: "44", kiri: "49" },
  },
  {
    soal: "Jika 12x = 48, maka x = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "6", kanan: "3", kiri: "4" },
  },
  {
    soal: "Hasil dari 2x - 5 jika x = 4 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "3", kanan: "5", kiri: "4" },
  },
  {
    soal: "Volume balok: 5×3×2 = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "30", kanan: "60", kiri: "40" },
  },
  {
    soal: "Sudut siku-siku besarnya ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "180°", kanan: "45°", kiri: "90°" },
  },
  {
    soal: "Hasil dari 2³ × 2² adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "32", kanan: "16", kiri: "8" },
  },
  {
    soal: "Jika berat 5 buku adalah 4 kg, maka 1 buku adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "1 kg", kanan: "0.8 kg", kiri: "1.5 kg" },
  },
  {
    soal: "Luas persegi panjang 8×5 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "30", kanan: "45", kiri: "40" },
  },
  {
    soal: "1 liter = ... ml",
    jawabanBenar: "atas",
    pilihan: { atas: "1000", kanan: "100", kiri: "10" },
  },
  {
    soal: "Akar dari 121 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "10", kanan: "11", kiri: "12" },
  },
];

const questionsSMA = [
  {
    soal: "Jika f(x) = 2x + 3, maka f(4) = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "9", kanan: "11", kiri: "10" },
  },
  {
    soal: "Turunan dari x² adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "2x", kanan: "x", kiri: "x²" },
  },
  {
    soal: "sin(30°) = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "1", kanan: "0.5", kiri: "0.25" },
  },
  {
    soal: "Limit x→2 dari x² - 4 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "0", kanan: "2", kiri: "0" },
  },
  {
    soal: "Hasil dari log₁₀(100) adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "1", kanan: "2", kiri: "10" },
  },
  {
    soal: "Modus dari 2, 3, 3, 4, 5 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "3", kanan: "2", kiri: "4" },
  },
  {
    soal: "Jika x + 2 = 5, maka x = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "1", kanan: "4", kiri: "3" },
  },
  {
    soal: "Deret aritmetika: 3, 6, 9, ..., suku ke-5?",
    jawabanBenar: "kanan",
    pilihan: { atas: "15", kanan: "15", kiri: "18" },
  },
  {
    soal: "cos(0°) = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "1", kanan: "0", kiri: "-1" },
  },
  {
    soal: "Persamaan kuadrat x² - 5x + 6 = 0, akar-akarnya?",
    jawabanBenar: "kanan",
    pilihan: { atas: "1 dan 5", kanan: "2 dan 3", kiri: "3 dan 4" },
  },
  {
    soal: "Hasil dari 3³ adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "27", kanan: "9", kiri: "18" },
  },
  {
    soal: "Gradien garis y = 2x - 3 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "3", kanan: "-3", kiri: "2" },
  },
  {
    soal: "Nilai tan(45°) adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "1", kanan: "√2", kiri: "0" },
  },
  {
    soal: "Volume bola: (4/3)πr³. Jika r = 3, maka ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "113", kanan: "113", kiri: "36" },
  },
  {
    soal: "Rumus luas permukaan kubus adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "s²", kanan: "4s²", kiri: "6s²" },
  },
  {
    soal: "Jika a² = 49, maka a = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6", kanan: "7", kiri: "8" },
  },
  {
    soal: "Jumlah sudut segienam adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "540°", kanan: "360°", kiri: "720°" },
  },
  {
    soal: "Rumus keliling lingkaran adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "2πr", kanan: "πr²", kiri: "πd²" },
  },
  {
    soal: "Jika logₐ(b) = c, maka b = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "a × c", kanan: "a^c", kiri: "c^a" },
  },
  {
    soal: "Fungsi invers dari f(x) = x + 5 adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "x - 1", kanan: "x + 5", kiri: "x - 5" },
  },
  {
    soal: "Bentuk sederhana dari (x + 2)(x - 2) adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "x² - 4", kanan: "x² + 4", kiri: "x² - 2x" },
  },
  {
    soal: "Jika sin²θ + cos²θ = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "2", kanan: "1", kiri: "0" },
  },
  {
    soal: "Barisan geometri: 2, 4, 8, ..., suku ke-4?",
    jawabanBenar: "kanan",
    pilihan: { atas: "14", kanan: "16", kiri: "18" },
  },
  {
    soal: "Peluang muncul angka 5 pada dadu adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "1/6", kanan: "1/5", kiri: "1/4" },
  },
  {
    soal: "Turunan dari sin(x) adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "cos(x)", kanan: "-cos(x)", kiri: "cos(x)" },
  },
  {
    soal: "Bentuk sederhana dari √(49) adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6", kanan: "7", kiri: "8" },
  },
  {
    soal: "Statistik: nilai tengah dari 5, 7, 8, 9, 10 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "8", kanan: "9", kiri: "7" },
  },
  {
    soal: "Nilai cos(60°) adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "1", kanan: "0.5", kiri: "0.25" },
  },
  {
    soal: "Jika f(x) = x², maka f(-2) = ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "-2", kanan: "4", kiri: "4" },
  },
  {
    soal: "Jika x² = 16, maka x = ...",
    jawabanBenar: "atas",
    pilihan: { atas: "4", kanan: "-4", kiri: "8" },
  },
  {
    soal: "Jika a + b = 7 dan a - b = 3, maka a = ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "2", kanan: "5", kiri: "4" },
  },
  {
    soal: "Deret aritmatika: 2, 5, 8, ..., suku ke-6 adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "17", kanan: "15", kiri: "14" },
  },
  {
    soal: "Suku pertama deret: 4, 7, 10, ..., adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "7", kanan: "10", kiri: "4" },
  },
  {
    soal: "Jumlah 5 suku pertama dari deret 3, 6, 9, ... adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "60", kanan: "75", kiri: "45" },
  },
  {
    soal: "Beda (selisih) dari deret: 12, 17, 22, ... adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "5", kanan: "10", kiri: "7" },
  },
  {
    soal: "Jika a = 5 dan beda = 3, maka suku ke-4 adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "12", kanan: "14", kiri: "15" },
  },
  {
    soal: "Peluang muncul angka genap dari dadu adalah ...",
    jawabanBenar: "kiri",
    pilihan: { atas: "1/3", kanan: "1/6", kiri: "1/2" },
  },
  {
    soal: "Peluang muncul kepala saat melempar koin adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "1/2", kanan: "1/4", kiri: "2/3" },
  },
  {
    soal: "Dari angka 1-10, peluang terpilih angka ganjil adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "6/10", kanan: "5/10", kiri: "4/10" },
  },
  {
    soal: "Peluang muncul huruf vokal dari A-Z adalah ...",
    jawabanBenar: "atas",
    pilihan: { atas: "5/26", kanan: "4/26", kiri: "6/26" },
  },
  {
    soal: "Dua koin dilempar, peluang muncul dua gambar adalah ...",
    jawabanBenar: "kanan",
    pilihan: { atas: "1/3", kanan: "1/4", kiri: "1/2" },
  },
]; // soal-soal SMA

// Paste di sini soal 20 yang udah kita buat sebelumnya

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmPose.Webcam(300, 225, flip);
  await webcam.setup();
  await webcam.play();

  // 🚨 Set ukuran canvas agar tidak 0
  webcam.canvas.width = webcam.width;
  webcam.canvas.height = webcam.height;

  animationFrameId = window.requestAnimationFrame(loop);

  if (document.body.querySelector("video")) {
    document.body.querySelector("video").remove();
  }
  document.getElementById("webcam-container").innerHTML = "";
  document.getElementById("webcam-container").appendChild(webcam.canvas);
  webcam.canvas.id = "webcam";
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function loop(timestamp) {
  if (gameBerakhir || !webcam || !webcam.canvas) return;
  if (!webcam.canvas.width || !webcam.canvas.height) return; // ⛔ STOP jika game sudah selesai

  webcam.update();
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);

  // Cari prediksi dengan probabilitas tertinggi
  let topPrediction = prediction[0];
  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > topPrediction.probability) {
      topPrediction = prediction[i];
    }
  }

  // Tampilkan ke UI
  const labelElem = document.getElementById("pose");
  const confElem = document.getElementById("conf");

  if (labelElem) labelElem.textContent = topPrediction.className;
  if (confElem)
    confElem.textContent = (topPrediction.probability * 100).toFixed(1) + "%";

  // Ambil label & confidence
  const label = topPrediction.className;
  const confidence = topPrediction.probability;

  // Terapkan logika sesuai permintaan:
  const poseClasses = ["atas", "kanan", "kiri"];

  if (poseClasses.includes(label) && confidence >= 0.75) {
    handlePoseInput(label);
  } else if (label === "normal" && confidence >= 0.95) {
    handlePoseInput("normal");
  } else {
    // Tidak ada pose yang valid → anggap masih normal
    handlePoseInput("normal");
  }

  window.requestAnimationFrame(loop);
}

function handlePoseInput(pose) {
  if (isWaiting || gameBerakhir) return;

  if (pose === "normal") {
    lockedPose = "";
    poseStartTime = null;
    return;
  }

  const now = Date.now();

  if (pose === lockedPose) {
    if (now - poseStartTime >= 500) {
      isWaiting = true;
      cekJawaban(pose);

      setTimeout(() => {
        currentIndex++;
        tampilkanSoal();

        // ⛔ Reset validasi pose agar tidak langsung jawab lagi
        lockedPose = "";
        poseStartTime = null;

        isWaiting = false;
      }, 1500);
    }
  } else {
    lockedPose = pose;
    poseStartTime = now;
  }
}

function tampilkanSoal() {
  if (currentIndex >= shuffledQuestions.length) {
    akhiriPermainan();
    return;
  }

  const soal = shuffledQuestions[currentIndex];
  document.getElementById("question").textContent = soal.soal;
  document.getElementById("choices").innerHTML = `
    <li>(⬆)  A. ${soal.pilihan.atas}</li>
    <li>(➡) B. ${soal.pilihan.kanan}</li>
    <li>(⬅) C. ${soal.pilihan.kiri}</li>
  `;
  document.getElementById("status").textContent = "";
}

function cekJawaban(pose) {
  const soal = shuffledQuestions[currentIndex];
  if (!soal) return; // ⛔ Hindari error jika soal undefined

  const soundBenar = document.getElementById("benar-sound");
  const soundSalah = document.getElementById("salah-sound");

  if (pose === soal.jawabanBenar) {
    skor++;
    document.getElementById("status").textContent = "✅ Benar!";
    soundBenar.play(); // 🔊 efek benar
  } else {
    document.getElementById("status").textContent = "❌ Salah!";
    soundSalah.play(); // 🔊 efek salah
  }

  document.getElementById("score").textContent = skor;
}

function simpanRiwayat(kategori, skor) {
  const sekarang = new Date();
  const tanggal = sekarang.toLocaleString("id-ID", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const data = {
    tanggal: tanggal,
    skor: skor,
  };

  const riwayat = JSON.parse(localStorage.getItem(`riwayat_${kategori}`)) || [];
  riwayat.push(data);

  localStorage.setItem(`riwayat_${kategori}`, JSON.stringify(riwayat));
}

function tampilkanRiwayat(kategori) {
  const semuaKategori = ["sd", "smp", "sma"];

  // Sembunyikan semua log riwayat dulu
  semuaKategori.forEach((k) => {
    document.getElementById(`riwayat-${k}`).style.display = "none";
  });

  // Ambil dan tampilkan log hanya untuk kategori yang dipilih
  const log = JSON.parse(localStorage.getItem(`riwayat_${kategori}`)) || [];
  const ul = document.getElementById(`log-${kategori}`);
  if (!ul) return; // ⛔ keluar jika ul-nya tidak ditemukan
  ul.innerHTML = "";

  if (log.length === 0) {
    ul.innerHTML = "<li><em>Belum ada data</em></li>";
  } else {
    log.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.tanggal} - Skor: ${item.skor}`;
      ul.appendChild(li);
    });
  }

  // Tampilkan hanya log untuk kategori yang dipilih
  document.getElementById(`riwayat-${kategori}`).style.display = "block";
  document.getElementById("riwayat-container").style.display = "block";
}

document
  .getElementById("game-start-button")
  .addEventListener("click", async () => {
    document.getElementById("riwayat-container").style.display = "none";

    // Hentikan backsound awal
    const backsound = document.getElementById("backsound");
    backsound.pause();
    backsound.currentTime = 0;

    // Mainkan backsound game
    const gameMusic = document.getElementById("game-backsound");
    gameMusic.volume = 0.6;
    gameMusic.play();

    // Tampilkan countdown
    document.getElementById("intro-screen").style.display = "none";
    document.getElementById("game-countdown").style.display = "block";

    // 🔁 Inisialisasi webcam + model
    await init();

    // ✅ Acak soal
    if (selectedCategory === "sd") {
      shuffledQuestions = [...questionsSD];
    } else if (selectedCategory === "smp") {
      shuffledQuestions = [...questionsSMP];
    } else if (selectedCategory === "sma") {
      shuffledQuestions = [...questionsSMA];
    }
    shuffleArray(shuffledQuestions);

    // Countdown
    let count = 3;
    const countdownDisplay = document.getElementById("countdown-number");
    countdownDisplay.textContent = count;

    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownDisplay.textContent = count;
      } else {
        clearInterval(countdownInterval);
        document.getElementById("game-countdown").style.display = "none";
        document.getElementById("game-content").style.display = "block";
        mulaiTimer();
        tampilkanSoal();
      }
    }, 1000);
  });

document.getElementById("back-to-kategori").addEventListener("click", () => {
  // Sembunyikan semua tampilan selain kategori
  document.getElementById("intro-screen").style.display = "none";
  document.getElementById("game-countdown").style.display = "none";
  document.getElementById("game-content").style.display = "none";

  // Tampilkan kembali pemilihan kategori
  document.getElementById("kategori-screen").style.display = "block";

  // Sembunyikan riwayat jika perlu
  document.getElementById("riwayat-container").style.display = "none";
});

window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("kategori-screen").style.display = "block";
  document.getElementById("intro-screen").style.display = "none";
  document.getElementById("game-countdown").style.display = "none";
  document.getElementById("game-content").style.display = "none";

  tampilkanRiwayat();
  // ⏳ Preload webcam & model saat halaman dimuat
  await init();

  // 🚫 Jangan tampilkan webcam dulu, sembunyikan canvas
  if (webcam && webcam.canvas) {
    webcam.canvas.style.display = "none";
  }
});
