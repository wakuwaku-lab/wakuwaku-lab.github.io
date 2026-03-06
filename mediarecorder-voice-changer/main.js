let chunks = [];
let mediaRecorder = null;
let currentSound = null;

window.onload = () => {
	if (!navigator.mediaDevices) {
		updateStatus("Media Devices not supported!!", "error");
		return;
	}

	navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
		readyMediaRecorder(stream);
	}).catch((err) => {
		updateStatus("Error: " + err.message, "error");
	});
};

function readyMediaRecorder(stream) {
	mediaRecorder = new MediaRecorder(stream);

	mediaRecorder.onstart = (e) => {
		updateStatus("Recording...", "recording");
		document.getElementById("btnStart").disabled = true;
		document.getElementById("btnStop").disabled = false;
	};

	mediaRecorder.onstop = (e) => {
		updateStatus("Processing...", "playing");
		const blob = new Blob(chunks, { "type": "audio/ogg; codecs=opus" });
		chunks = [];
		
		let reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = () => {
			playHowl(reader.result);
		};

		document.getElementById("btnStart").disabled = false;
		document.getElementById("btnStop").disabled = true;
	};

	mediaRecorder.ondataavailable = (e) => {
		chunks.push(e.data);
	};

	mediaRecorder.onerror = (e) => {
		updateStatus("Error: " + e, "error");
	};

	document.getElementById("btnStart").onclick = () => {
		if (mediaRecorder.state === "recording") return;
		chunks = [];
		mediaRecorder.start();
	};

	document.getElementById("btnStop").onclick = () => {
		if (mediaRecorder.state === "inactive") return;
		mediaRecorder.stop();
	};

	updateStatus("Ready to record", "");
}

function playHowl(base64) {
	if (currentSound) {
		currentSound.stop();
		currentSound.unload();
	}

	const rate = parseFloat(document.getElementById("rate").value);
	const volume = parseFloat(document.getElementById("volume").value);

	currentSound = new Howl({
		src: base64,
		loop: false,
		volume: volume,
		rate: rate,
		onplay: () => {
			updateStatus("Playing...", "playing");
		},
		onstop: () => {
			updateStatus("Ready to record", "");
		},
		onpause: () => {
			updateStatus("Paused", "");
		},
		onend: () => {
			updateStatus("Ready to record", "");
		}
	});

	currentSound.play();
}

function updateStatus(message, type) {
	const statusEl = document.getElementById("status");
	statusEl.textContent = message;
	statusEl.className = type || "";
}
