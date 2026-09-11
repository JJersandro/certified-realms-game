import Phaser from 'phaser';

export type TiltVector = { x: number; y: number };

// Wraps the DeviceOrientationEvent API behind a small enable/disable/read
// surface. Calibrates on enable -- whatever angle the player is holding
// the phone at becomes "neutral," and steering comes from the delta away
// from that, rather than assuming any fixed resting angle (people hold
// phones very differently). Portrait orientation is assumed; landscape
// support (where gamma/beta swap roles) isn't handled yet.
export class TiltControl {
  private baseline: { gamma: number; beta: number } | null = null;
  private current: { gamma: number; beta: number } = { gamma: 0, beta: 0 };
  private active = false;
  // last time any orientation event arrived, real or spurious -- lets the
  // caller detect "events stopped coming" (sensor permission revoked
  // mid-session, OS suspends it on background/foreground, etc.), not just
  // "no event ever arrived." A single spurious zero-valued event at enable
  // time (observed in headless/no-sensor environments) sets a baseline and
  // would otherwise mask a dead sensor for the rest of the session.
  private lastEventAt: number | null = null;

  private readonly handleOrientation = (e: DeviceOrientationEvent) => {
    const gamma = e.gamma ?? 0;
    const beta = e.beta ?? 0;
    if(this.baseline === null) this.baseline = { gamma, beta };
    this.current = { gamma, beta };
    this.lastEventAt = Date.now();
  };

  // Must be called from a user gesture (a tap) -- iOS 13+ requires that or
  // the permission prompt never appears and events never fire.
  async enable(): Promise<boolean> {
    const DeviceOrientationEventCtor = (window as unknown as { DeviceOrientationEvent?: {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    } }).DeviceOrientationEvent;

    if(!DeviceOrientationEventCtor) return false;

    if(typeof DeviceOrientationEventCtor.requestPermission === 'function'){
      try {
        const result = await DeviceOrientationEventCtor.requestPermission();
        if(result !== 'granted') return false;
      } catch {
        return false;
      }
    }

    this.baseline = null;
    this.lastEventAt = null;
    window.addEventListener('deviceorientation', this.handleOrientation);
    this.active = true;
    return true;
  }

  disable(){
    window.removeEventListener('deviceorientation', this.handleOrientation);
    this.active = false;
    this.baseline = null;
    this.lastEventAt = null;
  }

  get isActive(){ return this.active; }
  get hasBaseline(){ return this.baseline !== null; }

  // ms since the last orientation event, or Infinity if none has arrived
  // yet -- the caller uses this to detect a sensor that stopped delivering
  // updates, not just one that never started.
  msSinceLastEvent(): number {
    return this.lastEventAt === null ? Infinity : Date.now() - this.lastEventAt;
  }

  read(maxTiltDegrees: number): TiltVector {
    if(!this.baseline) return { x: 0, y: 0 };
    const deltaGamma = this.current.gamma - this.baseline.gamma;
    const deltaBeta = this.current.beta - this.baseline.beta;
    return {
      x: Phaser.Math.Clamp(deltaGamma / maxTiltDegrees, -1, 1),
      y: Phaser.Math.Clamp(-deltaBeta / maxTiltDegrees, -1, 1)
    };
  }
}
