import Vector2d from 'victor';

export default class Player {
  constructor ({ id, position, mass, speed }) {
    this.id = id;
    this.position = new Vector2d(...position);
    this.mass = mass;
    this.speed = { max: speed * 2, mid: speed, min: speed/2 };
    this.color = `hsl(${Math.random()*360},60%,50%)`;
    this.new = true;
    this.live = true;
  }

  move (direction) {
    const directionVector = Vector2d.fromArray(direction);
    const { speed, position, radius } = this;

    var { x, y } = position;

    if (directionVector.x - radius > x) {
      this.position.addX({ x: speed.mid, y: 0 });
    } else if (directionVector.x + radius < x - (radius * 2)) {
      this.position.subtractX({ x: speed.mid, y: 0 });
    }

    if (directionVector.y - radius > y) {
      this.position.addY({ x: 0, y: speed.mid });
    } else if (directionVector.y + radius < y - (radius * 2)) {
      this.position.subtractY({ x: 0, y: speed.mid });
    }
  }

  get radius () {
    return Math.sqrt(this.mass);
  }

  get scaleVision () {
    return 1 / Math.log(Math.sqrt(this.radius) / 4 + 2);
  }

  get toClient () {
    return { ...this,
      radius: this.radius,
      scaleVision: this.scaleVision
    };
  }
}
