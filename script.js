const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const captureBtn = document.getElementById('capture');

let stream = null;

async function startCamera() {
  try {
	stream = await navigator.mediaDevices.getUserMedia({ video: true });
	video.srcObject = stream;
	output.textContent = "Camersa started.";
  } catch (err) {
	console.error("Camera failure:", err);
	output.textContent = "Failed to access camera";
  }
}

function stopCamera() {
  if (stream) {
	stream.getTracks().forEach(track => track.stop());
	//video.srcObject = null;
	output.textContent = "Camera stopped.";
  }
}

startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);

captureBtn.addEventListener('click', () => {
  if (!stream) {
	output.textContent = "❗ Camera is off.";
	return;
  }
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
	output.textContent = "Processing OCR...";
	Tesseract.recognize(blob, 'eng', {
	  logger: m => console.log(m)
	}).then(({ data }) => {
	  output.textContent = data.text;

	  ctx.lineWidth = 1;
	  ctx.strokeStyle = 'red';
	  ctx.font = '12px sans-serif';
	  data.words.forEach(word => {
		const { x0, y0, x1, y1, text } = word.bbox;
		ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
		ctx.fillStyle = 'red';
		ctx.fillText(text, x0, y0 - 2);
	  });
	});
  }, 'image/jpeg');
});

startCamera();