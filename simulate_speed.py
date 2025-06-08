import requests
import time
import random

# Ganti dengan DATABASE_URL kamu
FIREBASE_URL = "https://iot-speed-logger-default-rtdb.firebaseio.com/vehicle_speed_log.json"

while True:
    speed = random.randint(10, 30)
    timestamp = int(time.time() * 1000)  # timestamp dalam milidetik
    data = {
        str(timestamp): {
            "speed": speed
        }
    }

    response = requests.patch(FIREBASE_URL, json=data)

    if response.status_code == 200:
        print(f"Terkirim: {speed} km/h")
    else:
        print("Gagal mengirim:", response.text)

    time.sleep(5)  # kirim setiap 5 detik
