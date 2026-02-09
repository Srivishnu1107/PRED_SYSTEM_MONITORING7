function newChart(id,color){
    return new Chart(document.getElementById(id),{
        type:"line",
        data:{labels:[],datasets:[{data:[],borderColor:color,tension:0.4}]},
        options:{plugins:{legend:{display:false}},scales:{y:{min:0,max:100}}}
    })
}

const cpuChart=newChart("cpuChart","#2d6cdf");
const ramChart=newChart("ramChart","#22c55e");
const diskChart=newChart("diskChart","#eab308");
const gpuChart=newChart("gpuChart","#8b5cf6");

const tempChart=new Chart(document.getElementById("tempChart"),{
    type:"doughnut",
    data:{datasets:[{data:[0,100],backgroundColor:["red","#333"]}]},
    options:{cutout:"70%",plugins:{legend:{display:false}}}
})

function push(chart,val){
    chart.data.labels.push("");
    chart.data.datasets[0].data.push(val);
    if(chart.data.labels.length>20){
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update();
}

function updateHealth(cpu,ram,disk,temp){
    let score=100-(cpu*0.3+ram*0.2+disk*0.2+temp*0.3);
    score=Math.max(0,Math.min(100,Math.round(score)));
    document.getElementById("healthBar").style.width=score+"%";
    document.getElementById("healthText").innerText="Health "+score+"%";

    let s="";
    if(cpu>85)s+="CPU High\n";
    if(ram>85)s+="RAM High\n";
    if(temp>80)s+="Temp High\n";
    document.getElementById("suggestions").innerText=s||"All good";
}

function buildCalendar(){
    const cal=document.getElementById("calendar");
    for(let i=1;i<=30;i++){
        const d=document.createElement("div");
        d.className="day";
        const r=Math.random();
        if(r<0.7)d.classList.add("good");
        else if(r<0.9)d.classList.add("warn");
        else d.classList.add("bad");
        d.innerText=i;
        cal.appendChild(d);
    }
}
buildCalendar();

function voice(){
    const msg=new SpeechSynthesisUtterance("System running normally");
    speechSynthesis.speak(msg);
}

function ask(){
    const q=document.getElementById("msg").value.toLowerCase();
    let ans="All systems stable";
    if(q.includes("cpu"))ans="CPU usage normal";
    if(q.includes("ram"))ans="RAM healthy";
    document.getElementById("reply").innerText=ans;
}

setInterval(async()=>{
    const res=await fetch("/metrics");
    const d=await res.json();

    document.getElementById("cpuBox").innerText="CPU "+d.cpu+"%";
    document.getElementById("ramBox").innerText="RAM "+d.ram+"%";
    document.getElementById("diskBox").innerText="Disk "+d.disk+"%";
    document.getElementById("gpuBox").innerText="GPU "+d.gpu+"%";
    document.getElementById("netBox").innerText="Net "+d.network+" MB";

    push(cpuChart,d.cpu);
    push(ramChart,d.ram);
    push(diskChart,d.disk);
    push(gpuChart,d.gpu);

    tempChart.data.datasets[0].data=[d.temp,100-d.temp];
    tempChart.update();
    document.getElementById("tempValue").innerText=d.temp+"°C";

    updateHealth(d.cpu,d.ram,d.disk,d.temp);

},1500);
