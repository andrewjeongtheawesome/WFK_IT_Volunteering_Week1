const URL = "../../resource/";
let model, webcam, labelContainer, maxPredictions;
let currentLetter = 'A'; // Initial letter

// Load the model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        webcam = new tmImage.Webcam(300, 300, true);
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        document.getElementById("start-btn").style.display = "none"; // Hide start button
    } catch (error) {
        console.error("Failed to load model:", error);
    }
}

async function loop() {
    if (webcam) {
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(loop);
    }
}

async function predict(image) {
    const prediction = await model.predict(image);
    labelContainer.innerHTML = '';
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = `${prediction[i].className}: ${prediction[i].probability.toFixed(2)}`;
        const div = document.createElement("div");
        div.innerText = classPrediction;
        labelContainer.appendChild(div);
    }

    const currentPrediction = prediction.find(p => p.className === currentLetter);
    if (currentPrediction && currentPrediction.probability > 0.99) {
        alert("Good!");
        skipQuestion();
    }
}

function getRandomLetter() {
    const letters = ['A', 'B', 'C', 'D'];
    return letters[Math.floor(Math.random() * letters.length)];
}

function skipQuestion() {
    currentLetter = getRandomLetter();
    document.getElementById('current-letter').textContent = currentLetter;
}

function stopWebcam() {
    if (webcam && webcam.stop) {
        webcam.stop();
        webcam = null; // Ensure webcam object is cleared
        document.getElementById('webcam-container').innerHTML = '<button id="start-btn" type="button" onclick="toggleWebcam()">Start Webcam</button>';
        labelContainer.innerHTML = '';
    }
}

async function toggleWebcam() {
    if (webcam) {
        stopWebcam();
    } else {
        await init();
    }
}

// Event Listeners for buttons
document.getElementById('stop-btn').addEventListener('click', stopWebcam);
document.getElementById('skip-btn').addEventListener('click', skipQuestion);
