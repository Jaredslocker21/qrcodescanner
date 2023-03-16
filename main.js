const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
const RANGE = 'Sheet1!A:B';

const CLIENT_EMAIL = 'YOUR_CLIENT_EMAIL';
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY';

const video = document.getElementById('preview');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
let scanning = false;
let stream = null;

function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      video.play();
      document.getElementById('startBtn').disabled = true;
      document.getElementById('stopBtn').disabled = false;
      document.getElementById('scanBtn').disabled = false;
    })
    .catch(error => console.error(error));
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('scanBtn').disabled = true;
  }
}

function scanQRCode() {
  if (scanning) return;
  scanning = true;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  if (code) {
    // Display the QR code content on the page
    document.getElementById('result').innerText = code.data;

    // Use the Sheets API to add a new row to the spreadsheet
    const request = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[code.data]],
      }),
    };
    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=USER_ENTERED`, request)
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error(error));
  }
  scanning = false;
}

document.getElementById('startBtn').addEventListener('click', startCamera);
document.getElementById('stopBtn').addEventListener('click', stopCamera);
document.getElementById('scanBtn').addEventListener('click', scanQRCode);