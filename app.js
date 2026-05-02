// ================== СОСТОЯНИЕ ==================

let score = 0;
let correctStreak = 0;
let totalCorrect = 0;

let achievements = JSON.parse(localStorage.getItem("achievements")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

let level = 1;
let totalAnswered = 0;
let totalCorrectAnswers = 0;

let difficulty = "easy";
let mode = "";
let currentTopic = "";

// ================== ПРОГРЕСС ==================

function saveProgress(){
  localStorage.setItem("score", score);
  localStorage.setItem("level", level);
  localStorage.setItem("totalAnswered", totalAnswered);
  localStorage.setItem("totalCorrectAnswers", totalCorrectAnswers);
}

function loadProgress(){
  score = parseInt(localStorage.getItem("score")) || 0;
  level = parseInt(localStorage.getItem("level")) || 1;
  totalAnswered = parseInt(localStorage.getItem("totalAnswered")) || 0;
  totalCorrectAnswers = parseInt(localStorage.getItem("totalCorrectAnswers")) || 0;
}

loadProgress();

// ================== НАВИГАЦИЯ ==================

function openMode(m){
  mode = m;
  currentTopic = "";

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  if(mode === "theory"){
    chooseTheoryTopic();
  } 
  else if(mode === "main"){
    chooseTaskTopic();
  } 
  else {
    startBlitz();
  }
}

function goBack(){
  mode = "";
  currentTopic = "";

  document.getElementById("app").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}

// ================== ВЫБОР ТЕМ ==================

function chooseTaskTopic(){
  const container = document.getElementById("content");

  container.innerHTML = "<h2>Выберите тему (задачи)</h2>";

  Object.keys(tasksData).forEach(topic => {
    container.innerHTML += `
      <button onclick="setContent('${topic}')">${topic}</button>
    `;
  });

  container.innerHTML += `<br><button onclick="goBack()">⬅ Назад</button>`;
}

function chooseTheoryTopic(){
  const container = document.getElementById("content");

  container.innerHTML = "<h2>Выберите тему (теория)</h2>";

  Object.keys(theoryData).forEach(topic => {
    container.innerHTML += `
      <button onclick="setTopic('${topic}')">${topic}</button>
    `;
  });

  container.innerHTML += `<br><button onclick="goBack()">⬅ Назад</button>`;
}

// ================== ТЕМЫ ==================

function startTopic(topic){
  currentTopic = topic;

  if(!tasksData[currentTopic]){
    document.getElementById("content").innerHTML = "<h2>Задачи не найдены</h2>";
    return;
  }

  showTask();
}

function setTopic(topic){
  currentTopic = topic;

  if(!theoryData[currentTopic]){
    document.getElementById("content").innerHTML = "<h2>Теория не найдена</h2>";
    return;
  }

  showTheory();
}

// ================== ТЕОРИЯ ==================

function showTheory(){
  const container = document.getElementById("content");

  if(!currentTopic){
    container.innerHTML = "<h2>Выберите тему</h2>";
    return;
  }

  container.innerHTML = `
    <button onclick="chooseTheoryTopic()">⬅ Назад</button>
    <div style="margin-top:20px; text-align:left;">
      ${theoryData[currentTopic]}
    </div>
  `;
}

// ================== ЗАДАЧИ ==================

function showTask(){

  if(!currentTopic){
    chooseTaskTopic();
    return;
  }

  let tasks = tasksData[currentTopic][difficulty];
  let t = tasks[Math.floor(Math.random()*tasks.length)];

  document.getElementById("content").innerHTML = `

    <button onclick="chooseTaskTopic()">⬅ Назад</button>

    <div style="margin-top:10px;">
      ⭐ ${score} | 🏆 Уровень ${level}
    </div>

    <h2>${currentTopic}</h2>

    <div>
      <button onclick="setDiff('easy')">Лёгкий</button>
      <button onclick="setDiff('medium')">Средний</button>
      <button onclick="setDiff('hard')">Сложный</button>
    </div>

    <p style="font-size:20px; margin:20px;">
      ${t.q}
    </p>

    <input id="ans">
    <br>
    <button onclick="check('${t.a}')">Проверить</button>

    <div id="res" style="margin-top:10px;"></div>
  `;
}

function setDiff(d){
  difficulty = d;
  showTask();
}

// ================== ПРОВЕРКА ==================

function check(correct){

  let val = document.getElementById("ans").value;

  totalAnswered++;

  if(val == correct){
    totalCorrectAnswers++;
    score += 10;
    correctStreak++;
    totalCorrect++;

    if(totalCorrect >= 10){
      unlock("10 правильных ответов");
    }

    if(correctStreak >= 5){
      unlock("5 подряд");
    }

  } else {
    score -= 5;
    correctStreak = 0;
  }

  if(score >= level * 50){
    level++;
    score = 0;
  }

  document.getElementById("res").innerText =
    val == correct ? "✔ Правильно" : "✘ Ошибка";

  saveProgress();
}

// ================== БЛИЦ ==================

let blitzTime = 60;
let blitzScore = 0;
let blitzTimer;
let currentBlitz = null;

function generateBlitzTask(){

  const type = Math.floor(Math.random()*4);

  if(type === 0){
    let a = 100;
    let b = 2;
    let P = a/(2*b);
    let Q = a - b*P;
    return { q:`Qd=${a}-${b}P. Найди Q*`, a: Q.toFixed(0) };
  }

  if(type === 1){
    let P = 20;
    let Q = 30;
    return { q:`P=${P}, Q=${Q}. Найди TR`, a: (P*Q).toString() };
  }

  if(type === 2){
    let oldP = 100;
    let newP = 120;
    return { q:`Инфляция (%)`, a: "20" };
  }

  return { q:`2+2`, a:"4" };
}

function startBlitz(){

  const container = document.getElementById("content");

  blitzTime = 60;
  blitzScore = 0;

  container.innerHTML = `
    <h2>⚡ Суперблиц</h2>
    <div id="timer">⏱ 60</div>
    <div id="blitz-question"></div>
    <input id="blitz-answer">
    <button onclick="checkBlitz()">Ответить</button>
    <p id="blitz-score">0</p>
  `;

  nextBlitz();

  blitzTimer = setInterval(() => {
    blitzTime--;
    document.getElementById("timer").innerText = blitzTime;

    if(blitzTime <= 0){
      clearInterval(blitzTimer);
      endBlitz();
    }
  }, 1000);
}

function nextBlitz(){
  currentBlitz = generateBlitzTask();
  document.getElementById("blitz-question").innerText = currentBlitz.q;
}

function checkBlitz(){
  let val = document.getElementById("blitz-answer").value;

  if(val == currentBlitz.a){
    blitzScore++;
  }

  document.getElementById("blitz-score").innerText = blitzScore;
  nextBlitz();
}

function endBlitz(){
  document.getElementById("content").innerHTML = `
    <h2>Результат: ${blitzScore}</h2>
    <button onclick="startBlitz()">Ещё раз</button>
  `;
}

// ================== ДОСТИЖЕНИЯ ==================

function unlock(name){

  if(!achievements.includes(name)){
    achievements.push(name);
    localStorage.setItem("achievements", JSON.stringify(achievements));
    alert("🏆 " + name);
  }
}

function showAchievements(){

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  let html = "<h2>🏆 Достижения</h2>";

  achievements.forEach(a => {
    html += `<div class="card">${a}</div>`;
  });

  html += `<button onclick="goBack()">⬅ Назад</button>`;

  document.getElementById("content").innerHTML = html;
}

// ================== СТАТИСТИКА ==================

function showStats(){

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  let accuracy = totalAnswered > 0
    ? Math.round((totalCorrectAnswers / totalAnswered) * 100)
    : 0;

  document.getElementById("content").innerHTML = `
    <h2>📊 Статистика</h2>

    <div class="card">Решено: ${totalAnswered}</div>
    <div class="card">Правильно: ${totalCorrectAnswers}</div>
    <div class="card">Точность: ${accuracy}%</div>
    <div class="card">Уровень: ${level}</div>

    <button onclick="goBack()">⬅ Назад</button>
  `;
}

function setContent(topic) {
  const container = document.getElementById("content");

  const data = tasksData[topic];

  if (!data) {
    container.innerHTML = "Нет данных";
    return;
  }

  container.innerHTML = `
    <h2>${topic}</h2>

    <button onclick="loadLevel('${topic}', 'easy')">Easy</button>
    <button onclick="loadLevel('${topic}', 'medium')">Medium</button>
    <button onclick="loadLevel('${topic}', 'hard')">Hard</button>
  `;
}

function loadLevel(topic, level) {
  const container = document.getElementById("content");
  const tasks = tasksData[topic][level];

  if (!tasks || tasks.length === 0) {
    container.innerHTML = "Нет задач";
    return;
  }

  container.innerHTML = `<h2>${topic} — ${level}</h2>`;

  tasks.forEach((task, i) => {
    container.innerHTML += `
      <div class="task-card">
        <div class="task-header">Задача ${i + 1}</div>
        <div class="task-text">${task.q}</div>
        <input id="input-${i}">
        <button onclick="checkAnswer(${i}, '${task.a}')">Проверить</button>
        <div id="result-${i}"></div>
      </div>
    `;
  });
}