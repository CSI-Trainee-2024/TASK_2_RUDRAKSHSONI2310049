let exercises = [];
let currentExerciseIndex = 0;
let timer;
let isPaused = false;
let remainingTime;
const timerDisplay = document.getElementById('timerDisplay');
const pauseResumeBtn = document.getElementById('pauseResumeBtn');
const endTaskBtn = document.getElementById('endTaskBtn');
const skipBreakBtn = document.getElementById('skipBreakBtn');


function loadExercisesFromLocalStorage() {
    const storedExercises = localStorage.getItem('exercises');
    if (storedExercises) {
        exercises = JSON.parse(storedExercises);
        renderExercises(); 
    }
}

document.getElementById('addExerciseBtn').addEventListener('click', () => {
    const name = document.getElementById('exerciseName').value;
    const minutes = parseInt(document.getElementById('minutesInput').value) || 0; 
    const seconds = parseInt(document.getElementById('secondsInput').value) || 0; 

    if (name && (minutes >= 0 || seconds >= 0)) {
        const totalDuration = (minutes * 60) + seconds;

        const exercise = {
            name: name,
            duration: totalDuration,
            completed: false,
            executionTime: 0
        };
        exercises.push(exercise);
        saveExercisesToLocalStorage(); 
        renderExercises();
        document.getElementById('startBtn').disabled = false;
    } else {
        alert('Please enter a valid exercise name and duration.');
    }
});

function saveExercisesToLocalStorage() {
    localStorage.setItem('exercises', JSON.stringify(exercises));
}

function renderExercises() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    exercises.forEach((exercise, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${exercise.name} - ${formatTime(exercise.duration)}</span>
            ${index === currentExerciseIndex ? `<button class="skipBtn" data-index="${index}">Skip</button>` : ''}
        `;
        exerciseList.appendChild(li);
    });
    document.querySelectorAll('.skipBtn').forEach(button => {
        button.addEventListener('click', skipExercise);
    });
}

document.getElementById('startBtn').addEventListener('click', () => {
    if (exercises.length > 0) {
        document.getElementById('startBtn').style.display = 'none'; 
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
    timerDisplay.textContent = `${formatTime(remainingTime)}`; 

    timer = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
            exercise.executionTime++;
            timerDisplay.textContent = `${formatTime(remainingTime)}`; 
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
            timerDisplay.textContent = `${formatTime(remainingTime)}`;
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
        renderExercises(); 
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
    localStorage.removeItem('exercises'); 

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
loadExercisesFromLocalStorage();

skipBreakBtn.addEventListener('click', () => {
    clearInterval(timer);
    skipBreakBtn.style.display = 'none';
    startNextExercise();
});





