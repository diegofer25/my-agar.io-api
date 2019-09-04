import Vec2 from 'vec2';

export default class Player {
  constructor ({ id, position, length, speed }) {
    this.id = id;
    this.position = new Vec2(position);
    this.radius = length;
    this.speed = speed;
    this.color = `hsl(${Math.random()*360},60%,50%)`;
    this.new = true;
    this.live = true;
  }

  move (vec) {
    this.position.set(vec);
  }
}
