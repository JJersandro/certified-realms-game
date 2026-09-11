import Phaser from 'phaser';

type Fuel = { x:number; y:number; r:number; energy:number; alive:boolean; pulse:number; kind:number };

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
  lastTouch = 0;

  constructor(){ super('flame'); }

  create(){
    this.cameras.main.setBackgroundColor('#080604');
    this.target.set(this.scale.width/2, this.scale.height/2);
    this.flame = this.add.circle(this.target.x, this.target.y, this.flameSize, 0xffb347).setDepth(5);
    this.halo = this.add.circle(this.target.x, this.target.y, this.flameSize*2.1, 0xff6b1a, 0.08).setDepth(4);

    for(let i=0;i<150;i++) this.spawnFuel();

    this.input.on('pointermove', (p: Phaser.Input.Pointer)=>this.target.set(p.x,p.y));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer)=>this.target.set(p.x,p.y));

    this.particles = this.add.particles(0,0,'__WHITE',{
      speed:{min:8,max:28}, lifespan:{min:180,max:500}, scale:{start:.9,end:0},
      alpha:{start:.55,end:0}, quantity:0, emitting:false, blendMode:Phaser.BlendModes.ADD
    });

    this.add.text(24,22,'THE FLAME',{fontFamily:'Inter, sans-serif',fontSize:'12px',color:'#ffffff',alpha:.72}).setDepth(10);
    this.add.text(24,43,'move • touch • burn • grow',{fontFamily:'Inter, sans-serif',fontSize:'11px',color:'#ffffff',alpha:.34}).setDepth(10);
    this.add.text(this.scale.width-24,22,'SPARK',{fontFamily:'Inter, sans-serif',fontSize:'11px',color:'#ffb347',alpha:.65}).setOrigin(1,0).setDepth(10).setName('stage');
    this.scale.on('resize',()=>this.layout());
  }

  spawnFuel(){
    const margin=45; const x=Phaser.Math.Between(margin,this.scale.width-margin); const y=Phaser.Math.Between(80,this.scale.height-margin);
    if(Phaser.Math.Distance.Between(x,y,this.flame.x,this.flame.y)<120) return this.spawnFuel();
    const kind=Phaser.Math.Between(0,2); const r=kind===0?Phaser.Math.Between(3,6):kind===1?Phaser.Math.Between(6,10):Phaser.Math.Between(10,16);
    const g=this.add.circle(x,y,r,kind===0?0xd7c7aa:kind===1?0x5d8c55:0x6b625b,0.78).setDepth(1);
    (g as any).fuelIndex=this.fuels.length;
    this.fuels.push({x,y,r,energy:r*r*(kind+1),alive:true,pulse:Math.random()*Math.PI*2,kind});
  }

  update(_t:number,dt:number){
    const dtS=dt/1000;
    const dx=this.target.x-this.flame.x, dy=this.target.y-this.flame.y;
    const desired=new Phaser.Math.Vector2(dx,dy).scale(5.2);
    this.velocity.lerp(desired,Math.min(1,dtS*5.5));
    const maxSpeed=90+this.flameSize*8;
    if(this.velocity.length()>maxSpeed) this.velocity.setLength(maxSpeed);
    this.flame.x=Phaser.Math.Clamp(this.flame.x+this.velocity.x*dtS,10,this.scale.width-10);
    this.flame.y=Phaser.Math.Clamp(this.flame.y+this.velocity.y*dtS,65,this.scale.height-10);

    const wobble=1+Math.sin(_t*.012)*.09+Math.sin(_t*.027)*.045;
    this.flame.setRadius(this.flameSize*wobble);
    this.halo.setPosition(this.flame.x,this.flame.y).setRadius(this.flameSize*(2.0+.22*Math.sin(_t*.008))).setAlpha(Math.min(.15,.035+this.flameSize/700));
    this.flame.setPosition(this.flame.x,this.flame.y);

    for(let i=0;i<this.fuels.length;i++){
      const f=this.fuels[i]; if(!f.alive) continue;
      const d=Phaser.Math.Distance.Between(this.flame.x,this.flame.y,f.x,f.y);
      if(d < this.flameSize+f.r){
        f.alive=false; this.energy+=f.energy; this.burned++;
        this.flameSize=Math.min(72,9+Math.sqrt(this.energy)*.55);
        this.particles.setPosition(f.x,f.y); this.particles.explode(Phaser.Math.Clamp(Math.floor(f.r*1.5),4,20));
        const obj=this.children.list.find((o:any)=>o.getData && o.getData('fuel')===i) as Phaser.GameObjects.GameObject|undefined;
        if(obj) obj.destroy();
      }
    }
    if(this.fuels.filter(f=>f.alive).length<80) for(let i=0;i<25;i++) this.spawnFuel();

    const stage=this.children.getByName('stage') as Phaser.GameObjects.Text;
    const label=this.flameSize<14?'SPARK':this.flameSize<22?'EMBER':this.flameSize<34?'FLAME':this.flameSize<50?'BLAZE':'INFERNO';
    stage.setText(label);
    this.particles.setPosition(this.flame.x,this.flame.y);
    if(Math.random()<.45) this.particles.explode(1);
  }

  layout(){
    const stage=this.children.getByName('stage') as Phaser.GameObjects.Text;
    stage?.setPosition(this.scale.width-24,22);
  }
}

const config: Phaser.Types.Core.GameConfig={
  type:Phaser.AUTO,parent:'game',width:'100%',height:'100%',backgroundColor:'#080604',
  scale:{mode:Phaser.Scale.RESIZE,width:window.innerWidth,height:window.innerHeight},
  render:{antialias:true,powerPreference:'high-performance'},
  scene:FlameScene
};

new Phaser.Game(config);
