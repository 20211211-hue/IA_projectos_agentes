let score = 0;
const scoreDisplay = document.getElementById('score');
const target = document.getElementById('target');
const gameArea = document.getElementById('gameArea');

function moveTarget() {
    const areaWidth = gameArea.clientWidth - 50; // 50 é a largura do alvo
    const areaHeight = gameArea.clientHeight - 50; // 50 é a altura do alvo
    const x = Math.random() * areaWidth;
    const y = Math.random() * areaHeight;

    target.style.left = `${x}px`;
    target.style.top = `${y}px`;
}

target.addEventListener('click', () => {
    score++;
    scoreDisplay.textContent = score;
    moveTarget();
});

// Move o alvo pela primeira vez ao carregar a página
moveTarget();
