import Vector2d from 'victor';
import { TweenMax, Power0 } from 'gsap';
export default class Player {
  constructor ({ id, name, color, position, mass }) {
    this.id = id;
    this.name = name;
    this.position = new Vector2d(...position);
    this.mass = mass;
    this.color = color || `hsl(${Math.random()*360},60%,50%)`;
    this.new = true;
    this.live = true;
    this.eating = false;
    this.toEat = [];
    this.lossMassTimeDelay = 500;
    this.lastScore = 100;
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
    if (this.mass > 101 && this.lossMassTimeDelay <= 0) {
      this.mass -= this.mass / 100;
      this.lossMassTimeDelay = 500;
    } else {
      this.lossMassTimeDelay -= 1;
    }
  }

  eat (mass) {
    this.mass += mass;
  }

  chew (mass) {
    if (mass) {
      this.toEat.unshift(mass);
    }
    if (this.toEat.length > 0) {
      TweenMax.to(this, 0.5, {
        ease: Power0.none,
        mass: this.mass + this.toEat.pop(),
        onComplete: (() => {
          if (this.toEat.length) {
            this.chew();
          }
        }).bind(this)
      });
    }
  }

  kill () {
    this.lastScore = this.score;
    TweenMax.to(this, 1, { mass: 0 });
    this.live = false;
  }

  revive () {
    TweenMax.to(this, 1, { mass: 100 });
    this.live = true;
  }

  randomizePosition (mapX, mapY) {
    this.position.x = Math.floor(Math.random() * (mapX - 100)) - ((mapX / 2) - 100);
    this.position.y = Math.floor(Math.random() * (mapY - 100)) - ((mapY / 2) - 100);
  }

  get maxSpeed () {
    return 15 / (1 + Math.log(this.radius));
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
    return this.mass * this.maxSpeed;
  }

  get score () {
    return parseInt(this.mass);
  }

  get toClient () {
    return {
      id: this.id,
      name: this.name,
      position: this.position.toObject(),
      radius: this.radius,
      scaleVision: this.scaleVision,
      color: this.color,
      live: this.live,
      mass: this.mass,
      score: this.score,
      lastScore: this.lastScore
    };
  }
}
