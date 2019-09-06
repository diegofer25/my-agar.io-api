import Vector2d from 'victor';
import { TweenMax } from 'gsap';
export default class Player {
  constructor ({ id, position, mass }) {
    this.id = id;
    this.position = new Vector2d(...position);
    this.mass = mass;
    this.color = `hsl(${Math.random()*360},60%,50%)`;
    this.new = true;
    this.live = true;
  }

  move ({ x, y, /* percent */ }, { height, width }) {
    const difWidth = (width / 2) - this.diameter;
    const difHeight = (height / 2) - this.diameter ;
    // const speed = this.maxSpeed * percent;
    if (x && this.position.x < difWidth) { // - this.maxSpeed
      this.position.addX({ x: this.maxSpeed, y: 0 });
    } else if (!x && this.position.x > - difWidth) {
      this.position.subtractX({ x: this.maxSpeed, y: 0 });
    }

    if (y && this.position.y < difHeight) {
      this.position.addY({ x: 0, y: this.maxSpeed });
    } else if (!y && this.position.y > -difHeight) {
      this.position.subtractY({ x: 0, y: this.maxSpeed });
    }
  }

  eat (mass) {
    TweenMax.to(this, 1, { mass: this.mass + mass });
  }

  die () {
    this.mass = 0;
    this.live = false;
  }

  get maxSpeed () {
    return 30 / (1 + Math.log(this.radius));
  }

  get radius () {
    return Math.sqrt(this.mass);
  }

  get diameter () {
    return this.radius * 2;
  }

  get scaleVision () {
    return 1 / Math.log(Math.sqrt(this.radius) / 4 + 2);
  }

  get force () {
    return this.mass * this.speed.mid;
  }

  get toClient () {
    return {
      id: this.id,
      position: this.position.toObject(),
      radius: this.radius,
      scaleVision: this.scaleVision,
      color: this.color,
      live: this.live,
      mass: this.mass
    };
  }
}
