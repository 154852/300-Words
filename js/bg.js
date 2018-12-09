class Point {
    constructor(x, y) {
        this.x = x? x:0;
        this.y = y? y:0;
    }

    add(point) {
        this.x += point.x;
        this.y += point.y;
    }

    divideScalar(scalar) {
        return new Point(this.x / scalar, this.y / scalar);
    }

    distanceToSquared(point) {
        return ((point.x - this.x) ** 2) + ((point.y - this.y) ** 2);
    }

    distanceTo(point) {
        return Math.sqrt(this.distanceToSquared(point));
    }

    shuffle(radius) {
        return new Point(this.x + (((Math.random() - 0.5) * 2) * radius), this.y + (((Math.random() - 0.5) * 2) * radius));
    }
}

class Color {
    constructor(r, g, b, a) {
        this.r = r? r:0;
        this.g = g? g:0;
        this.b = b? b:0;
        this.a = a? a:1;
    }

    lighter(x) {
        return new Color(this.r + x, this.g + x, this.b + x, this.a);
    }

    darker(x) {
        return this.lighter(-x);
    }

    toString() {
        return 'rgba(' + parseInt(this.r) + ',' + parseInt(this.g) + ',' + parseInt(this.b) + ',' + this.a + ')';
    }
}

class Polygon {
    constructor(vertices, color) {
        this.vertices = vertices;
        this.baseColor = color;
    }

    center() {
        const average = new Point();

        for (const vertex of this.vertices) {
            average.add(vertex);
        }

        return average.divideScalar(this.vertices.length);
    }

    render(ctx, lightness) { 
        ctx.fillStyle = this.baseColor.lighter(lightness).toString();
        ctx.strokeStyle = ctx.fillStyle;

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    mass() {
        let size = 0;

        for (let i = 1; i < this.vertices.length; i++) {
            size += this.vertices[i].distanceTo(this.vertices[i - 1]);
        }

        return size / (this.vertices.length - 1);
    }
}

Array.prototype.extend = function(array) {
    for (let i = 0; i < array.length; i++) this.push(array[i]);
}

function _genLine(width, gap, y, offset) {
    const vertices = [];

    for (let i = 0; i < width; i++) vertices.push(new Point((i * gap) + offset, y).shuffle(15));

    return vertices;
}

class Background {
    constructor(canvas) {
        this.canvas = canvas;
        this.setSize(this.getGraphicalSize());
        this.ctx = canvas.getContext('2d');

        this.squareSize = new Point(50, 50);

        const lines = [];
        for (let i = 0; i < (this.canvas.height / this.squareSize.y) + 2; i++) {
            lines.push(_genLine((this.canvas.width / this.squareSize.x) + 1, this.squareSize.x, i * this.squareSize.y, i % 2 != 0? 0:(this.squareSize.x / -2)));
        }

        this.polygons = [];
        for (let l = 1; l < lines.length - 1; l++) {
            const line = lines[l];

            for (let x = 1; x < line.length - 1; x++) {
                let color = (Math.random() * 200) + 50;

                this.polygons.push(new Polygon([
                    line[x - (l % 2) + 1],
                    lines[l - 1][x],
                    lines[l - 1][x + 1]
                ], new Color(255, color, color)));
                
                color = (Math.random() * 155) + 70;
                this.polygons.push(new Polygon([
                    line[x],
                    line[x - 1],
                    lines[l - 1][x + (l % 2) - 1]
                ], new Color(255, color, color)));
            }
        }

        const that = this;
        document.body.addEventListener('mousemove', (event) => {
            that.render(new Point(event.pageX * window.devicePixelRatio, event.pageY * window.devicePixelRatio));
        });
    }

    render(mousepos) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const polygon of this.polygons) {
            const lightness = (polygon.center().distanceTo(mousepos) * 0.035) ** 3;
            if (lightness < 200) polygon.render(this.ctx, lightness);
        }
    }

    setSize(x, y) {
        if (typeof x != 'number') {
            y = x.height;
            x = x.width;
        }

        this.canvas.width = x * window.devicePixelRatio;
        this.canvas.height = y * window.devicePixelRatio;
    }

    getGraphicalSize() {
        return this.canvas.getBoundingClientRect();
    }
}