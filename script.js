const URL = "./my_model/"; // Caminho do modelo treinado
let model, webcam, labelContainer, maxPredictions;

// Carregar o modelo
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Limpar resultados anteriores
    for (let i = 0; i < 3; i++) { // Limitar a exibição para 3 rótulos
        labelContainer.appendChild(document.createElement("div"));
    }
}

// Iniciar a webcam
async function initWebcam() {
    await loadModel();
    document.getElementById("image-preview").innerHTML = ""; // Limpar imagem carregada

    const flip = true;
    webcam = new tmImage.Webcam(300, 300, flip);
    await webcam.setup();
    await webcam.play();

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // Atualizar predição a cada 5 segundos
    setInterval(predictWebcam, 1000);
}

async function loop() {
    webcam.update();
    await predictWebcam();
    window.requestAnimationFrame(loop);
}

// Predição com a webcam
async function predictWebcam() {
    const prediction = await model.predict(webcam.canvas);
    updateLabels(prediction);
}

// Predição com upload de imagem
async function predictImage(event) {
    await loadModel();
    document.getElementById("webcam-container").innerHTML = ""; // Desativar webcam se ativada

    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function (e) {
            const imgElement = document.createElement("img");
            imgElement.src = e.target.result;
            imgElement.onload = async function () {
                const image = new Image();
                image.src = e.target.result;
                image.onload = async function () {
                    const prediction = await model.predict(image);
                    updateLabels(prediction);
                };
            };
            const previewContainer = document.getElementById("image-preview");
            previewContainer.innerHTML = ""; // Limpar imagem anterior
            previewContainer.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    }
}

// Atualizar rótulos de predição para exibir apenas as 3 melhores previsões
function updateLabels(prediction) {
    // Ordenar as previsões pela probabilidade (decrescente)
    const sortedPrediction = prediction.sort((a, b) => b.probability - a.probability);

    // Exibir apenas as 3 melhores previsões
    for (let i = 0; i < 3; i++) {
        const classPrediction = sortedPrediction[i].className + ": " + (sortedPrediction[i].probability * 100).toFixed(2) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
