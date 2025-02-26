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
import { coverScale } from '@/utils/scale-fit';
import { CRTFilter } from 'pixi-filters';
import { debounce } from '@/utils/debounce';
// import { KawaseBlurFilter } from 'pixi-filters';

type InitProps = {
  parent: HTMLElement;
};

export type Anim = {
  init: (initProps: InitProps) => void;
  destroy: (() => Promise<void>) | (() => void);
} | null;

export function createAnim(): Anim {
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

  // Create reference to shared ticker
  const ticker = Ticker.shared;

  async function init({ parent }: InitProps) {
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

    await Assets.load('/img/pic-a.jpg');

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
  }

  // - |dims| will be set before this is called
  // - |onStageResize| will be called immediately after
  function start() {
    sprites.bg = Sprite.from('/img/pic-a.jpg');
    // sprites.bg.alpha = 0.0;
    sprites.bg.anchor.set(0.5);
    app.stage.addChild(sprites.bg);

    sprites.box = Sprite.from(Texture.WHITE);
    sprites.box.width = 40.0;
    sprites.box.height = 40.0;
    sprites.box.tint = 0xff3300;
    sprites.box.angle = 45.0;
    app.stage.addChild(sprites.box);

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

    containers.squareHolder = new Container();
    app.stage.addChild(containers.squareHolder);

    sprites.square = Sprite.from(Texture.WHITE);
    sprites.square.width = 40.0;
    sprites.square.height = 40.0;
    sprites.square.tint = 0x1c81ff;
    containers.squareHolder.addChild(sprites.square);

    // sprites.displacement = Sprite.from('/img/pic-a.jpg');
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
      sprites.square,
      { x: -100.0 },
      {
        x: 100.0,
        duration: 1.0,
        delay: 0.5,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      },
    );

    ticker.add(onTick);
    onTick();
  }

  let elapsedTime = 0.0;
  function onTick() {
    elapsedTime += ticker.elapsedMS * 0.001;

    sprites.box.position.set(
      dims.width * 0.5 -
        sprites.box.height * 0.5 +
        100.0 * Math.sin(elapsedTime * 2.5),
      dims.height * 0.5 -
        sprites.box.width * 0.5 +
        50.0 * Math.sin(elapsedTime * 5.0),
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
    // if (filters?.blur) {
    //   const easeFactor = firstRun ? 1.0 : 55.0;
    //   const target = mutedMode ? 4.0 : 0.00001;
    //   filters.blur.strength += (target - filters.blur.strength) / easeFactor;
    // }
    // if (filters?.displacement) {
    //   const easeFactor = firstRun ? 1.0 : 55.0;
    //   const target = mutedMode ? 1.0 : 5.0;
    //   const result =
    //     filters.displacement.scale.x +
    //     (target - filters.displacement.scale.x) / easeFactor;
    //   filters.displacement.scale.set(result);
    // }

    // if (emitter) {
    //   emitter.update(Ticker.shared.deltaMS / 1000.0);
    // }
  }

  let startCalled = false;
  function onStageResize(width: number, height: number) {
    dims.width = width;
    dims.height = height;

    if (!startCalled) {
      startCalled = true;
      start();
    }

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

    containers.squareHolder.x = dims.width * 0.5;
    containers.squareHolder.y = dims.height * 0.5;
  }

  function destroy() {
    ticker.remove(onTick);
    resizeObserver?.disconnect(); // Unobserves all observed Element or SVGElement targets.

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
