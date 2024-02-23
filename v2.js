
/* CONSTANTS */

const DIRECTIONS = {
    U: { r: -1, c: 0 },
    D: { r: 1, c: 0 },
    L: { r: 0, c: -1 },
    R: { r: 0, c: 1 },
};
const DELAY = 50;
const GRID_SIZE = 4;
const NEXT_CELL_READY = "NEXT_CELL_READY";
const MARGIN = 30;
const SCALE = 20;
const COLORS = ["red", "green", "yellow", "orange", "white"];
const STROKE_WIDTH = 3;

/* CLASSES */

class Point {
    constructor(visited, from) {
        this.visited = visited;
        this.from = from;
        this.tried = [];
    }
}

class SAW {

    constructor(canvas, startPosition) {
        this.currentPosition = { ...startPosition };
        this.canvas = canvas;
        this.colorIndex = 1;
        this.sequence = 0;
        this.initGrid(startPosition);
        document.addEventListener(NEXT_CELL_READY, this.draw.bind(this));
    }

    removeElement(id) {
        document.getElementById(id)?.remove();
    }

    generateSequence() {
        return this.sequence += 1;
    }

    drawLog() {
        let square = `${this.generateSequence()}\n`;
        for (let r = 0; r < GRID_SIZE; r += 1) {
            for (let c = 0; c < GRID_SIZE; c += 1) {
                square += this.grid[r][c].visited ? '*' : '0';
            }
            square += '\n';
        }
        console.log(square);
    }

    drawLine() {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("id", `l.${this.currentPosition.c * SCALE + MARGIN}.${this.currentPosition.r * SCALE + MARGIN}.${this.grid[this.currentPosition.r][this.currentPosition.c].from.c * SCALE + MARGIN}.${this.grid[this.currentPosition.r][this.currentPosition.c].from.r * SCALE + MARGIN}`)
        line.setAttribute("x1", this.currentPosition.c * SCALE + MARGIN);
        line.setAttribute("y1", this.currentPosition.r * SCALE + MARGIN);
        line.setAttribute("x2", this.grid[this.currentPosition.r][this.currentPosition.c].from.c * SCALE + MARGIN);
        line.setAttribute("y2", this.grid[this.currentPosition.r][this.currentPosition.c].from.r * SCALE + MARGIN);
        line.setAttribute("stroke", COLORS[this.colorIndex]);
        line.setAttribute("stroke-width", STROKE_WIDTH - 1);
        this.canvas.appendChild(line);
    }

    drawDot(cx, cy) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("id", `${cx}.${cy}`)
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 2);
        circle.setAttribute("stroke", COLORS[this.colorIndex]);
        circle.setAttribute("stroke-width", STROKE_WIDTH);
        this.canvas.appendChild(circle);
    }

    draw(e) {
        const { r, c } = e.detail;
        this.drawDot(c * SCALE + MARGIN, r * SCALE + MARGIN);
        this.grid[this.currentPosition.r][this.currentPosition.c].from && this.drawLine();
        setTimeout(() => {
            this.start();
        }, DELAY)
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    start() {
        const nominatedCells = [];
        Object.keys(DIRECTIONS).forEach((k) => {
            const nr = this.currentPosition.r + DIRECTIONS[k].r;
            const nc = this.currentPosition.c + DIRECTIONS[k].c;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                if (!this.grid[nr][nc].visited) {
                    if (!Array.from(this.grid[this.currentPosition.r][this.currentPosition.c].tried).some(i => i.r === nr && i.c === nc)) {
                        nominatedCells.push({ c: nc, r: nr });
                    }
                }
            }
        });

        if (!nominatedCells.length) {
            this.colorIndex = Math.floor(Math.random() * 5);
            try {
                this.removeElement(`${this.currentPosition.c * SCALE + MARGIN}.${this.currentPosition.r * SCALE + MARGIN}`);
                this.removeElement(`l.${this.currentPosition.c * SCALE + MARGIN}.${this.currentPosition.r * SCALE + MARGIN}.${this.grid[this.currentPosition.r][this.currentPosition.c].from?.c * SCALE + MARGIN}.${this.grid[this.currentPosition.r][this.currentPosition.c]?.from?.r * SCALE + MARGIN}`)
                const currentCell = this.grid[this.currentPosition.r][this.currentPosition.c];
                currentCell.visited = false;
                this.currentPosition = { r: currentCell.from.r, c: currentCell.from.c };
                setTimeout(() => { this.start() }, DELAY);
                return;
            } catch (ex) {
                return;
            }
        } else {
            const randomCell = this.shuffleArray(nominatedCells).pop();
            const { c, r } = randomCell;
            this.grid[this.currentPosition.r][this.currentPosition.c].tried.push({ c, r });
            const cell = this.grid[r][c];
            cell.visited = true;
            cell.from = { r: this.currentPosition.r, c: this.currentPosition.c };
            this.currentPosition = { c, r };
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent(NEXT_CELL_READY, { detail: { c, r } }));
            }, DELAY)

        }
    }

    initGrid(startPosition) {
        this.grid = [];
        for (let i = 0; i < GRID_SIZE; i += 1) {
            const row = [];
            for (let j = 0; j < GRID_SIZE; j += 1) {
                row.push(new Point(i === startPosition.r && j === startPosition.c, undefined));
            }
            this.grid.push(row);
        }
    }
}