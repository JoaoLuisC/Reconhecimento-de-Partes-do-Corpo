const URL = "./my_model/";
let model, webcam, labelContainer, maxPredictions;

async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < 3; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function initWebcam() {
    await loadModel();
    document.getElementById("image-preview").innerHTML = "";

    const flip = true;
    webcam = new tmImage.Webcam(300, 300, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
    webcam.update();
    await predictWebcam();
    window.requestAnimationFrame(loop);
}

async function predictWebcam() {
    const prediction = await model.predict(webcam.canvas);
    updateLabels(prediction);
}

async function predictImage(event) {
    await loadModel();
    document.getElementById("webcam-container").innerHTML = "";

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
            previewContainer.innerHTML = "";
            previewContainer.appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    }
}

function updateLabels(prediction) {
    const sortedPrediction = prediction.sort((a, b) => b.probability - a.probability);

    for (let i = 0; i < 3; i++) {
        const classPrediction = sortedPrediction[i].className + ": " + (sortedPrediction[i].probability * 100).toFixed(2) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
