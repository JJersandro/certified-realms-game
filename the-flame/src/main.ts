import Phaser from 'phaser';

type Fuel = { x:number; y:number; r:number; energy:number; alive:boolean; pulse:number; kind:number; visual:Phaser.GameObjects.Arc };

class FlameScene extends Phaser.Scene {
  flame!: Phaser.GameObjects.Arc;
  halo!: Phaser.GameObjects.Arc;
  target = new Phaser.Math.Vector2();
  velocity = new Phaser.Math.Vector2();
  flameSize = 9;
  energy = 0;
  burned = 0;
  fuels: Fuel[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(){ super('flame'); }

  create(){
    this.cameras.main.setBackgroundColor('#080604');
    this.target.set(this.scale.width/2, this.scale.height/2);
    this.flame = this.add.circle(this.target.x, this.target.y, this.flameSize, 0xffb347).setDepth(5);
    this.halo = this.add.circle(this.target.x, this.target.y, this.flameSize*2.1, 0xff6b1a, 0.08).setDepth(4);

    const g=this.make.graphics({x:0,y:0,add:false});
    g.fillStyle(0xffffff,1); g.fillCircle(4,4,4); g.generateTexture('particle',8,8); g.destroy();
    this.particles = this.add.particles(0,0,'particle',{
      speed:{min:8,max:28}, lifespan:{min:180,max:500}, scale:{start:.9,end:0},
      alpha:{start:.55,end:0}, quantity:0, emitting:false, blendMode:Phaser.BlendModes.ADD
    });

    for(let i=0;i<150;i++) this.spawnFuel();
    this.input.on('pointermove', (p: Phaser.Input.Pointer)=>this.target.set(p.x,p.y));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer)=>this.target.set(p.x,p.y));

    this.add.text(24,22,'THE FLAME',{fontFamily:'Inter, sans-serif',fontSize:'12px',color:'#ffffff',alpha:.72}).setDepth(10);
    this.add.text(24,43,'move • touch • burn • grow',{fontFamily:'Inter, sans-serif',fontSize:'11px',color:'#ffffff',alpha:.34}).setDepth(10);
    this.add.text(this.scale.width-24,22,'SPARK',{fontFamily:'Inter, sans-serif',fontSize:'11px',color:'#ffb347',alpha:.65}).setOrigin(1,0).setDepth(10).setName('stage');
    this.scale.on('resize',()=>this.layout());
  }

  spawnFuel(){
    const margin=45; const x=Phaser.Math.Between(margin,Math.max(margin,this.scale.width-margin)); const y=Phaser.Math.Between(80,Math.max(80,this.scale.height-margin));
    if(Phaser.Math.Distance.Between(x,y,this.flame.x,this.flame.y)<120) return;
    const kind=Phaser.Math.Between(0,2); const r=kind===0?Phaser.Math.Between(3,6):kind===1?Phaser.Math.Between(6,10):Phaser.Math.Between(10,16);
    const visual=this.add.circle(x,y,r,kind===0?0xd7c7aa:kind===1?0x5d8c55:0x6b625b,0.78).setDepth(1);
    const fuel:Fuel={x,y,r,energy:r*r*(kind+1),alive:true,pulse:Math.random()*Math.PI*2,kind,visual};
    this.fuels.push(fuel);
  }

  update(t:number,dt:number){
    const dtS=dt/1000;
    const desired=new Phaser.Math.Vector2(this.target.x-this.flame.x,this.target.y-this.flame.y).scale(5.2);
    this.velocity.lerp(desired,Math.min(1,dtS*5.5));
    const maxSpeed=90+this.flameSize*8;
    if(this.velocity.length()>maxSpeed) this.velocity.setLength(maxSpeed);
    this.flame.x=Phaser.Math.Clamp(this.flame.x+this.velocity.x*dtS,10,this.scale.width-10);
    this.flame.y=Phaser.Math.Clamp(this.flame.y+this.velocity.y*dtS,65,this.scale.height-10);

    const wobble=1+Math.sin(t*.012)*.09+Math.sin(t*.027)*.045;
    this.flame.setRadius(this.flameSize*wobble);
    this.halo.setPosition(this.flame.x,this.flame.y).setRadius(this.flameSize*(2.0+.22*Math.sin(t*.008))).setAlpha(Math.min(.15,.035+this.flameSize/700));
    this.flame.setPosition(this.flame.x,this.flame.y);

    for(const f of this.fuels){
      if(!f.alive) continue;
      f.visual.setScale(1+Math.sin(t*.003+f.pulse)*.06);
      if(Phaser.Math.Distance.Between(this.flame.x,this.flame.y,f.x,f.y) < this.flameSize+f.r){
        f.alive=false; this.energy+=f.energy; this.burned++;
        this.flameSize=Math.min(72,9+Math.sqrt(this.energy)*.55);
        this.particles.setPosition(f.x,f.y); this.particles.explode(Phaser.Math.Clamp(Math.floor(f.r*1.5),4,20));
        f.visual.destroy();
      }
    }
    if(this.fuels.filter(f=>f.alive).length<80) for(let i=0;i<25;i++) this.spawnFuel();

    const stage=this.children.getByName('stage') as Phaser.GameObjects.Text;
    stage.setText(this.flameSize<14?'SPARK':this.flameSize<22?'EMBER':this.flameSize<34?'FLAME':this.flameSize<50?'BLAZE':'INFERNO');
    this.particles.setPosition(this.flame.x,this.flame.y);
    if(Math.random()<.45) this.particles.explode(1);
  }

  layout(){ (this.children.getByName('stage') as Phaser.GameObjects.Text)?.setPosition(this.scale.width-24,22); }
}

new Phaser.Game({
  type:Phaser.AUTO,parent:'game',width:window.innerWidth,height:window.innerHeight,backgroundColor:'#080604',
  scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight},
  render:{antialias:true,powerPreference:'high-performance'},scene:FlameScene
});
