let exercises = [];
let currentExerciseIndex = 0;
let timer;
let isPaused = false;
let remainingTime;
const timerDisplay = document.getElementById('timerDisplay');
const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const endTaskBtn = document.getElementById('endTaskBtn');
const skipBreakBtn = document.getElementById('skipBreakBtn'); 
document.getElementById('addExerciseBtn').addEventListener('click', () => {
    const name = document.getElementById('exerciseName').value;
    const duration = parseInt(document.getElementById('duration').value);

    if (name && duration) {
        const exercise = {
            name: name,
            duration: duration * 60, 
            completed: false,
            executionTime: 0
        };
        exercises.push(exercise);
        renderExercises();
        document.getElementById('startBtn').disabled = false;
    }
});
function renderExercises() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    exercises.forEach((exercise, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${exercise.name} - ${exercise.duration / 60} min</span>
            <button class="skipBtn" data-index="${index}">Skip</button>
        `;
        exerciseList.appendChild(li);
    });
    document.querySelectorAll('.skipBtn').forEach(button => {
        button.addEventListener('click', skipExercise);
    });
}
document.getElementById('startBtn').addEventListener('click', () => {
    if (exercises.length > 0) {
        document.getElementById('startBtn').disabled = true;
        pauseResumeBtn.disabled = false;
        endTaskBtn.disabled = false;
        startExercise(currentExerciseIndex);
    }
});
pauseResumeBtn.addEventListener('click', () => {
    if (!isPaused) {
        pauseTimer();
    } else {
        resumeTimer();
    }
});
endTaskBtn.addEventListener('click', () => {
    clearInterval(timer);
    saveSummaryAndNavigate();
});

function startExercise(index) {
    if (index >= exercises.length) {
        saveSummaryAndNavigate();
        return;
    }
    const exercise = exercises[index];
    remainingTime = exercise.duration;
    timerDisplay.textContent = `Exercise: ${exercise.name} - Remaining Time: ${formatTime(remainingTime)}`;

    timer = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            exercise.executionTime++;
            timerDisplay.textContent = `Exercise: ${exercise.name} - Remaining Time: ${formatTime(remainingTime)}`;
        } else {
            clearInterval(timer);
            exercise.completed = true;
            startBreak(); 
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isPaused = true;
    pauseResumeBtn.textContent = 'Resume';
}

function resumeTimer() {
    isPaused = false;
    pauseResumeBtn.textContent = 'Pause';
    timer = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            exercises[currentExerciseIndex].executionTime++;
            timerDisplay.textContent = ` Remaining Time: ${formatTime(remainingTime)}`;
        } else {
            clearInterval(timer);
            exercises[currentExerciseIndex].completed = true;
            startBreak();
        }
    }, 1000);
}

function startBreak() {
    let breakTime = 30;
    timerDisplay.textContent = `Break - Remaining Time: ${formatTime(breakTime)}`;
    skipBreakBtn.style.display = 'inline-block';

    timer = setInterval(() => {
        if (breakTime > 0) {
            breakTime--;
            timerDisplay.textContent = `Break - Remaining Time: ${formatTime(breakTime)}`;
            

        } else {
            clearInterval(timer);
            skipBreakBtn.style.display = 'none'; 
            startNextExercise();  
        }
    }, 1000);
}


function startNextExercise() {
    currentExerciseIndex++; 
    if (currentExerciseIndex < exercises.length) {
        startExercise(currentExerciseIndex);  
    } else {
        saveSummaryAndNavigate();  
    }
}

function skipExercise(event) {
    const index = event.target.getAttribute('data-index');
    if (timer) {
        clearInterval(timer);
    }
    startBreak();
}
function saveSummaryAndNavigate() {
    const summary = exercises.map(exercise => ({
        name: exercise.name,
        timeSpent: exercise.executionTime,
        duration: exercise.duration
    }));
    localStorage.setItem('exerciseSummary', JSON.stringify(summary));
    window.location.href = 'summary.html';
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

skipBreakBtn.addEventListener('click', () => {
    clearInterval(timer);
    skipBreakBtn.style.display = 'none';
    startNextExercise();
});







