from flask import Flask, render_template, jsonify
import psutil
import random

app = Flask(__name__)

def get_gpu():
    return round(random.uniform(5, 35), 1)

def get_temp(cpu):
    return int(40 + cpu * 0.6)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/metrics")
def metrics():
    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    net = round(psutil.net_io_counters().bytes_sent/(1024*1024),1)

    gpu = get_gpu()
    temp = get_temp(cpu)

    return jsonify({
        "cpu": cpu,
        "ram": ram,
        "disk": disk,
        "gpu": gpu,
        "network": net,
        "temp": temp
    })

if __name__ == "__main__":
    app.run(debug=True)
