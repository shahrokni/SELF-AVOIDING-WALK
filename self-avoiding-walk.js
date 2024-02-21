/***
 * THIS IS THE SO-CALLED SELF-AVOIDING WALK SOLUTION.
 * I SEE NO REAL APPLICATIONS FOR THIS PIECE OF CODE BUT KEEPING A SICK MIND BUSY! 8[]
 * THE IDEA JUMPED INTO MY MIND ON 20TH FEB 2024.
 * THE IMPLEMENTATION TOOK PLACE ON 21ST FEB 2024.
 * I DON'T GET ANY CREDIT FOR THIS, BUT IT'S OK. I AM USED TO IT! :P
 */

const CUSTOM_EVENT = "NEXT_CELL_CALCULATED";
const MARGIN = 300;
const PING_PONG = 20;

class Point {
    constructor(visited) {
        this.visited = visited;
    }

    setVisited() {
        this.visited = true;
    }
}



class SAW {

    constructor(canvas, startPoint) {
        this.canvas = canvas;
        this.pause = false;
        this.maxLength = 1000;
        this.actualLength = 0;
        this.startPoint = startPoint;
        this.currentPoint = { ...this.startPoint };
        this.steps = {
            up: {
                y: -1,
                x: 0
            },
            down: {
                y: 1,
                x: 0
            },
            left: {
                y: 0,
                x: -1
            },
            right: {
                y: 0,
                x: 1
            }
        }
        this.initGrid();
        document.addEventListener(CUSTOM_EVENT, this.draw.bind(this));
    }

    clean() {
        document.removeEventListener(CUSTOM_EVENT, this.draw.bind(this));
    }

    start() {
        const nominatedCells = [];
        Object.keys(this.steps).forEach((k) => {
            const i = this.currentPoint.x + this.steps[k].x;
            const j = this.currentPoint.y + this.steps[k].y;
            if (i >= 0 && i < 50 && j >= 0 && j < 50) {
                const adjacentCell = this.grid[i][j];
                if (!adjacentCell.visited)
                    nominatedCells.push({ adjacentCell, i, j });
            }
        });

        if (!nominatedCells.length || this.actualLength > this.maxLength) {
            console.log('progress finished!');
            this.hardReset();
            setTimeout(() => {
                this.start();
            }, 200)
            return;
        }

        const nextCell = nominatedCells[Math.floor(Math.random() * nominatedCells.length)];
        nextCell.adjacentCell.visited = true;
        this.actualLength += 1;

        setTimeout(() => {
            document.dispatchEvent(new CustomEvent(CUSTOM_EVENT, { detail: { nextCell } }));
        }, PING_PONG);
    }

    hardReset() {
        this.clean();
        this.initGrid();

        this.actualLength = 0;
        this.startPoint = { x: 0, y: 0 };
        this.currentPoint = { ...this.startPoint };
        while (this.canvas.firstChild) {
            this.canvas.removeChild(this.canvas.firstChild)
        }
    }

    drawDot(cx, cy, color) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", 2);
        circle.setAttribute("stroke", color);
        circle.setAttribute("stroke-width", "2");
        this.canvas.appendChild(circle);
    }

    drawPath(start, end, color) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", start.x);
        line.setAttribute("y1", start.y);
        line.setAttribute("x2", end.x);
        line.setAttribute("y2", end.y);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "2");
        this.canvas.appendChild(line)
    }

    draw(e) {
        const { nextCell: { i, j } } = e.detail;

        const color = (() => {
            const l = this.actualLength;
            if (l > 0 && l <= 20)
                return 'green';
            else if (l > 20 && l <= 40)
                return 'yellow';
            else if (l > 40 && l < 60)
                return 'orange';
            else return 'red';
        })();

        this.drawPath({ x: this.currentPoint.x * 20 + MARGIN, y: this.currentPoint.y * 20 + MARGIN }, { x: i * 20 + MARGIN, y: j * 20 + MARGIN }, color);
        this.drawDot(this.currentPoint.x * 20 + MARGIN, this.currentPoint.y * 20 + MARGIN, color);
        this.drawDot(i * 20 + MARGIN, j * 20 + MARGIN, color);
        this.currentPoint.x = i;
        this.currentPoint.y = j;
        setTimeout(() => {
            this.start();
        }, PING_PONG);
    }

    /* PRIVATE */
    initGrid() {
        this.grid = [];
        for (let i = 0; i < 50; i += 1) {
            const row = [];
            for (let j = 0; j < 50; j += 1) {
                row.push(new Point(i === this.startPoint.x && j === this.startPoint.y));
            }
            this.grid.push(row);
        }
    }


}