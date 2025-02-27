import {
  Application,
  Assets,
  Sprite,
  // Container,
  Ticker,
  Filter,
  Texture,
  Container,
} from 'pixi.js'; // Version: ^8.6.6

import gsap from 'gsap';
import { containScale, coverScale } from '@/utils/scale-fit';
import { CRTFilter } from 'pixi-filters';
import { debounce } from '@/utils/debounce';
import { bringToFront } from '@/utils/pixi';
import emitterConfig from '@/components/anim-comp/assets/particle-emitter.json';

import { createEmitter, Emitter } from '@/vendors/particle-emitter.js';
// import { delay } from '@/utils/async';

// import { KawaseBlurFilter } from 'pixi-filters';

type InitProps = {
  parent: HTMLElement;
  onLoaded?: () => void;
};

export type Anim = {
  init: (initProps: InitProps) => void;
  destroy: (() => Promise<void>) | (() => void);
} | null;

export type AnimProps = {
  picPath: string;
  enableParticles?: boolean;
};

const boxSize = 90.0;
const artboardDims = { width: 600.0, height: 800.0 };

Assets.init({
  basePath: import.meta.env.BASE_URL,
});

export function createAnim({
  picPath,
  enableParticles = false,
}: AnimProps): Anim {
  if (!window) {
    return null;
  }

  const pxRatio = window ? Math.min(window.devicePixelRatio, 2.0) : 1.0; // Pixel ratio is locked for duration

  const dims = {
    width: 0,
    height: 0,
  };

  const app = new Application();
  let resizeObserver: ResizeObserver | undefined;

  const containers: Record<string, Container> = {};
  const sprites: Record<string, Sprite> = {};
  const filters: Record<string, Filter> = {};
  let emitter: Emitter | null = null;

  // Create reference to shared ticker
  const ticker = Ticker.shared;

  async function init({ parent, onLoaded }: InitProps) {
    await app.init({
      background: 0x000000,
      // resizeTo: window,
      autoDensity: true, //   Adjusts the canvas using css pixels so it will scale properly
      backgroundAlpha: 1.0,
      //  width: 100, //  Number of pixels being drawn
      //  height: 100, //  Number of pixels being drawn
      resolution: pxRatio, //  The resolution / device pixel ratio of the renderer. Resolution controls scaling of content (sprites, etc.)
      hello: false,
      antialias: !window || pxRatio === 1.0, //  Only anti alias from non-retina displays
      resizeTo: parent, // document.getElementById('sizer'), // parent, //parent.parentNode,
      // preference: 'webgl', //  'webgl' | 'webgpu'
    });

    // Load all assets

    await Assets.load(picPath);

    //await delay(3000);

    // Particles
    if (enableParticles) {
      await Assets.load('img/dot.png');
    }

    parent.appendChild(app.canvas); // Attach (after loading)

    // Observe stage dims

    resizeObserver = new ResizeObserver(
      debounce((entries: ResizeObserverEntry[]) => {
        if (entries.length >= 1) {
          onStageResize(
            Math.round(entries[0].contentRect.width),
            Math.round(entries[0].contentRect.height),
          );
        }
      }, -1),
    );
    resizeObserver.observe(parent);

    if (onLoaded) {
      onLoaded();
    }
  }

  // - |dims| will be set before this is called
  // - |onStageResize| will be called immediately after
  function start() {
    sprites.bg = Sprite.from(picPath);
    //sprites.bg.alpha = 0.0;
    sprites.bg.anchor.set(0.5);
    app.stage.addChild(sprites.bg);

    if (enableParticles) {
      containers.particles = new Container();
      app.stage.addChild(containers.particles);

      emitter = createEmitter(containers.particles, emitterConfig, [
        'img/dot.png',
      ]);

      // emitter.updateSpawnPos(x, y); // Changes the spawn position of the emitter.
      // emitter.updateOwnerPos(0, 0); // Changes the position of the emitter's owner. You should call this if you are adding
      emitter.autoUpdate = false;
      emitter.emit = true;
    }

    containers.artboard = new Container();
    app.stage.addChild(containers.artboard);

    sprites.diamond = Sprite.from(Texture.WHITE);
    sprites.diamond.width = boxSize;
    sprites.diamond.height = boxSize;
    sprites.diamond.tint = 0xff3300;
    sprites.diamond.angle = 45.0;
    sprites.diamond.anchor.set(0.5);
    containers.artboard.addChild(sprites.diamond);

    const col = Math.floor(Math.random() * 256 * 256 * 256);

    sprites.regH = Sprite.from(Texture.WHITE);
    sprites.regH.width = 50.0;
    sprites.regH.height = 10.0;
    sprites.regH.tint = col;
    app.stage.addChild(sprites.regH);

    sprites.regV = Sprite.from(Texture.WHITE);
    sprites.regV.width = 10.0;
    sprites.regV.height = 50.0;
    sprites.regV.tint = col;
    app.stage.addChild(sprites.regV);

    sprites.box = Sprite.from(Texture.WHITE);
    sprites.box.width = boxSize;
    sprites.box.height = boxSize;
    sprites.box.tint = 0x1c81ff;
    sprites.box.anchor.set(0.5);
    containers.artboard.addChild(sprites.box);

    // sprites.displacement = Sprite.from('img/pic-a.jpg');
    // sprites.displacement.texture.source.addressMode = 'repeat'; // WRAP_MODES.REPEAT; // nope
    // app.stage.addChild(sprites.displacement);

    const _filters = [];
    filters.crt = new CRTFilter({
      // See: https://pixijs.io/filters/docs/CRTFilterOptions.html
      lineContrast: 0.3, // Default 0.25

      lineWidth: 4.0,
    });

    _filters.push(filters.crt);
    sprites.bg.filters = _filters;

    // Fade in bg
    gsap.from(sprites.bg, { duration: 5.0, alpha: 0.0, ease: 'Sine.easeOut' });

    gsap.fromTo(
      sprites.box,
      { x: -100.0 },
      {
        x: 100.0,
        duration: 1.3,
        delay: 0.5,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      },
    );

    ticker.add(onTick);
    onTick();
  }

  let startCalled = false;
  // Shouldn't have to check if items exist
  function onStageResize(width: number, height: number) {
    dims.width = width;
    dims.height = height;

    if (!startCalled) {
      startCalled = true;
      start();
    }

    containers.artboard.scale.set(
      containScale(
        artboardDims.width,
        artboardDims.height,
        dims.width,
        dims.height,
      ),
    );

    //sprites.bg.position.set(width * 0.5, height * 0.5);
    sprites.bg.position.set(dims.width * 0.5, dims.height * 0.5);
    const scale = coverScale(
      sprites.bg.texture.width,
      sprites.bg.texture.height,
      dims.width,
      dims.height,
    );
    sprites.bg.scale.set(scale);
    sprites.displacement?.scale.set(sprites.bg.scale.x * 2.0);

    // Reg br
    sprites.regH.x = dims.width - sprites.regH.width;
    sprites.regH.y = dims.height - sprites.regH.height;
    sprites.regV.x = dims.width - sprites.regV.width;
    sprites.regV.y = dims.height - sprites.regV.height;

    containers.artboard.x = dims.width * 0.5;
    containers.artboard.y = dims.height * 0.5;

    if (emitter) {
      emitter.updateSpawnPos(dims.width * 0.5, dims.height * 0.5);
      // Update spawn rect
      for (const b of emitter.initBehaviors) {
        if (b.shape) {
          b.shape.x = -dims.width * 0.5;
          b.shape.y = -dims.height * 0.5;
          b.shape.w = dims.width;
          b.shape.h = dims.height * 0.5;
        }
      }
    }
  }

  let elapsedTime = 0.0;
  // Shouldn't have to check if items exist
  let prevIsOverlap = true;
  let isBoxTop = true;
  const minDist = Math.sqrt(Math.pow(boxSize * 0.5, 2) * 2.0) + boxSize * 0.5;

  function onTick() {
    elapsedTime += ticker.elapsedMS * 0.001;

    const speedFactor = 1.3;
    sprites.diamond.position.set(
      boxSize * 1.3 * Math.sin(elapsedTime * 2.5 * speedFactor),
      boxSize * 1.3 * Math.sin(elapsedTime * 5.0 * speedFactor),
    );

    // delta = null, firstRun = false
    // const dt = delta?.deltaTime ?? 1.0;
    // if (sprites?.displacement) {
    //   const speedFactor = 0.6;
    //   sprites.displacement.x += 8 * dt * speedFactor;
    //   sprites.displacement.y += 3 * dt * speedFactor;
    //   //sprites.displacement.rotation = 11; //+= 0.1 * delta.deltaTime * speedFactor;
    // }

    if (filters.crt) {
      (filters.crt as CRTFilter).noise = 0.5 * Math.sin(elapsedTime * 0.5);
    }

    const dx = sprites.diamond.position.x - sprites.box.position.x;
    const dy = sprites.diamond.position.y - sprites.box.position.y;

    const isOverlap = Math.abs(dx) < minDist && Math.abs(dy) < minDist;

    if (!isOverlap && prevIsOverlap) {
      isBoxTop = !isBoxTop;
      if (isBoxTop) {
        bringToFront(sprites.box);
      } else {
        bringToFront(sprites.diamond);
      }
    }

    // if (filters?.displacement) {
    //   const easeFactor = firstRun ? 1.0 : 55.0;
    //   const target = mutedMode ? 1.0 : 5.0;
    //   const result =
    //     filters.displacement.scale.x +
    //     (target - filters.displacement.scale.x) / easeFactor;
    //   filters.displacement.scale.set(result);
    // }

    if (emitter) {
      emitter.update(ticker.deltaMS / 1000.0);
    }

    prevIsOverlap = isOverlap;
  }

  function destroy() {
    ticker.remove(onTick);
    resizeObserver?.disconnect(); // Unobserves all observed Element or SVGElement targets.

    if (emitter) {
      emitter.destroy();
      emitter = null;
    }

    for (const spriteName in sprites) {
      sprites[spriteName].filters = [];
      gsap.killTweensOf(sprites[spriteName]);
      delete sprites[spriteName];
    }
    for (const containerName in containers) {
      containers[containerName].filters = [];
      gsap.killTweensOf(containers[containerName]);
      delete containers[containerName];
    }

    for (const filterName in filters) {
      const destroyPrograms = false;
      filters[filterName].destroy(destroyPrograms);
      delete filters[filterName];
    }

    app.destroy(
      { removeView: true },
      {
        children: true, // If set to true, all the children will have their destroy method called as well. 'options' will be passed on to those calls.
        texture: false, // Only used for child Sprites if options.children is set to true Should it destroy the texture of the child sprite
        textureSource: false, // Only used for children with textures e.g. Sprites. If options.children is set to true, it should destroy the texture source of the child sprite.
        context: false, // Only used for children with graphicsContexts e.g. Graphics. If options.children is set to true, it should destroy the context of the child graphics.
      },
    ); // https://pixijs.download/dev/docs/PIXI.PIXI.Application.html#destroy
  }

  return {
    init,
    destroy,
  };
}
