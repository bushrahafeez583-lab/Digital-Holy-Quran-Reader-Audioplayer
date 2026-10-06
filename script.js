const surahSelect =
    document.getElementById("surah-select");

const loading =
    document.getElementById("loading");

const message =
    document.getElementById("message");

const surahName =
    document.getElementById("surah-name");

const surahDetails =
    document.getElementById("surah-details");

const ayahContainer =
    document.getElementById("ayah-container");

const audioPlayer =
    document.getElementById("audio-player");

const playButton =
    document.getElementById("play-btn");

const previousButton =
    document.getElementById("previous-btn");

const nextButton =
    document.getElementById("next-btn");

const currentAyahText =
    document.getElementById("current-ayah");

const continuousPlay =
    document.getElementById("continuous-play");


let currentSurah = 1;

let currentAyah = 0;

let ayahs = [];
async function loadSurahs() {

    try {

        const response =
            await fetch(
                "https://api.alquran.cloud/v1/surah"
            );

        if (!response.ok) {
            throw new Error("Surah API error");
        }

        const result =
            await response.json();

        surahSelect.innerHTML = "";

        result.data.forEach(function (surah) {

            const option =
                document.createElement("option");

            option.value =
                surah.number;

            option.textContent =
                `${surah.number}. ${surah.englishName}`;

            surahSelect.appendChild(option);

        });

        loadSurah(1);

    }

    catch (error) {

        console.log(error);

        message.textContent =
            "Unable to load Surahs.";

    }

}
async function loadSurah(number) {

    showLoading();

    message.textContent = "";

    ayahContainer.innerHTML = "";

    try {

        const response =
            await fetch(
                `https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,en.asad,ar.alafasy`
            );

        if (!response.ok) {
            throw new Error("Quran API error");
        }

        const result =
            await response.json();

        const arabicData =
            result.data.find(function (item) {
                return item.edition.language === "ar" &&
                    item.edition.type === "quran";
            });

        const translationData =
            result.data.find(function (item) {
                return item.edition.identifier === "en.asad";
            });

        const audioData =
            result.data.find(function (item) {
                return item.edition.identifier === "ar.alafasy";
            });

        if (!arabicData || !translationData) {
            throw new Error("Quran data missing");
        }

        ayahs = arabicData.ayahs;

        currentSurah = number;

        currentAyah = 0;

        surahSelect.value = number;

        surahName.textContent =
            `${arabicData.englishName} - ${arabicData.name}`;

        surahDetails.textContent =
            `${arabicData.numberOfAyahs} Ayahs • ${arabicData.revelationType}`;

        displayAyahs(
            arabicData.ayahs,
            translationData.ayahs
        );

        setupAudio(
            audioData
        );

        updateButtons();

    }

    catch (error) {

        console.log(error);

        message.textContent =
            "Unable to load this Surah. Please try again.";

    }

    finally {

        hideLoading();

    }

}
function displayAyahs(
    arabicAyahs,
    translationAyahs
) {

    ayahContainer.innerHTML = "";

    arabicAyahs.forEach(
        function (ayah, index) {

            const translation =
                translationAyahs[index];

            const div =
                document.createElement("div");

            div.className =
                "ayah";

            div.id =
                `ayah-${index}`;

            div.innerHTML = `

                <div class="ayah-number">
                    ${ayah.numberInSurah}
                </div>

                <p class="arabic">
                    ${ayah.text}
                </p>

                <p class="translation">
                    ${translation
                        ? translation.text
                        : "Translation unavailable."
                    }
                </p>

            `;

            ayahContainer.appendChild(div);

        }
    );

}
function setupAudio(audioData) {

    if (
        !audioData ||
        !audioData.ayahs
    ) {

        message.textContent =
            "Audio is not available.";

        return;

    }
    ayahs =
        audioData.ayahs.map(
            function (ayah, index) {

                return {
                    arabic:
                        document.querySelectorAll(
                            ".arabic"
                        )[index]?.textContent || "",

                    audio:
                        ayah.audio,

                    number:
                        ayah.numberInSurah
                };

            }
        );

    loadAudio();

}
function loadAudio() {

    if (!ayahs.length) {
        return;
    }

    const ayah =
        ayahs[currentAyah];

    audioPlayer.src =
        ayah.audio;

    currentAyahText.textContent =
        `Ayah ${ayah.number}`;

    highlightAyah();

    updateButtons();

}
function playAudio() {

    audioPlayer.play();

    playButton.innerHTML =
        '<i class="fa-solid fa-pause"></i> Pause';

}
function pauseAudio() {

    audioPlayer.pause();

    playButton.innerHTML =
        '<i class="fa-solid fa-play"></i> Play';

}
playButton.addEventListener(
    "click",
    function () {

        if (audioPlayer.paused) {

            playAudio();

        } else {

            pauseAudio();

        }

    }
);
audioPlayer.addEventListener(
    "ended",
    function () {

        if (
            continuousPlay.checked &&
            currentAyah < ayahs.length - 1
        ) {

            currentAyah++;

            loadAudio();

            playAudio();

        } else {

            pauseAudio();

        }

    }
);
previousButton.addEventListener(
    "click",
    function () {

        if (currentAyah > 0) {

            currentAyah--;

            loadAudio();

            playAudio();

        }

    }
);
nextButton.addEventListener(
    "click",
    function () {

        if (
            currentAyah <
            ayahs.length - 1
        ) {

            currentAyah++;

            loadAudio();

            playAudio();

        }

    }
);
function highlightAyah() {

    document
        .querySelectorAll(".ayah")
        .forEach(
            function (ayah) {

                ayah.classList.remove(
                    "active"
                );

            }
        );

    const activeAyah =
        document.getElementById(
            `ayah-${currentAyah}`
        );

    if (activeAyah) {

        activeAyah.classList.add(
            "active"
        );

        activeAyah.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}
function updateButtons() {

    previousButton.disabled =
        currentAyah === 0;

    nextButton.disabled =
        currentAyah ===
        ayahs.length - 1;

}
surahSelect.addEventListener(
    "change",
    function () {

        const number =
            Number(
                surahSelect.value
            );

        audioPlayer.pause();

        loadSurah(number);

    }
);
audioPlayer.addEventListener(
    "play",
    function () {

        playButton.innerHTML =
            '<i class="fa-solid fa-pause"></i> Pause';

    }
);
audioPlayer.addEventListener(
    "pause",
    function () {

        playButton.innerHTML =
            '<i class="fa-solid fa-play"></i> Play';

    }
);
function showLoading() {

    loading.style.display =
        "block";

}
function hideLoading() {

    loading.style.display =
        "none";

}
loadSurahs();