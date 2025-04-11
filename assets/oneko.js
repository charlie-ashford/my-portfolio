// oneko.js: https://github.com/adryd325/oneko.js
(function oneko() {
  const nekoSpeed = 12;
  const sleepDelaySeconds = 8;
  const spriteSize = 32;
  const framesPerSecond = 10;
  const sleepDelay = sleepDelaySeconds * framesPerSecond;
  const maxZIndex = Number.MAX_VALUE;
  const nekoFile = './assets/oneko.gif';

  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  const nekoEl = document.createElement('div');
  let nekoPosX = 32;
  let nekoPosY = 32;
  let mousePosX = 0;
  let mousePosY = 0;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  let lastFrameTimestamp;

  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * spriteSize}px ${
      sprite[1] * spriteSize
    }px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function updatePos() {
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  function updateMousePosition(event) {
    mousePosX = event.clientX;
    mousePosY = event.clientY;
    idleTime = 0;
    resetIdleAnimation();
  }

  function init() {
    nekoEl.id = 'oneko';
    nekoEl.ariaHidden = true;
    nekoEl.style.width = `${spriteSize}px`;
    nekoEl.style.height = `${spriteSize}px`;
    nekoEl.style.position = 'fixed';
    nekoEl.style.pointerEvents = 'none';
    nekoEl.style.imageRendering = 'pixelated';
    nekoEl.style.zIndex = maxZIndex;

    nekoPosX = mousePosX;
    nekoPosY = mousePosY;
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;

    let spriteSheetPath = nekoFile;
    const curScript = document.currentScript;
    if (curScript && curScript.dataset.cat) {
      spriteSheetPath = curScript.dataset.cat;
    }
    nekoEl.style.backgroundImage = `url(${spriteSheetPath})`;

    document.body.appendChild(nekoEl);

    document.addEventListener('wheel', function (event) {
      nekoPosY += event.deltaY / 10;
      updatePos();
    });

    window.requestAnimationFrame(onAnimationFrame);
  }

  function idle() {
    idleTime += 1;

    if (idleTime >= sleepDelay && idleAnimation === null) {
      const availableIdleAnimations = ['sleeping'];

      if (nekoPosX < 32) {
        availableIdleAnimations.push('scratchWallW');
      }
      if (nekoPosY < 32) {
        availableIdleAnimations.push('scratchWallN');
      }
      if (nekoPosX > window.innerWidth - 32) {
        availableIdleAnimations.push('scratchWallE');
      }
      if (nekoPosY > window.innerHeight - 32) {
        availableIdleAnimations.push('scratchWallS');
      }

      idleAnimation =
        availableIdleAnimations[
          Math.floor(Math.random() * availableIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case 'sleeping':
        if (idleAnimationFrame < 8) {
          setSprite('tired', 0);
          break;
        }
        setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;

      case 'scratchWallN':
      case 'scratchWallS':
      case 'scratchWallE':
      case 'scratchWallW':
      case 'scratchSelf':
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;

      default:
        setSprite('idle', 0);
        return;
    }

    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite('alert', 0);
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction = '';
    direction += diffY / distance > 0.5 ? 'N' : '';
    direction += diffY / distance < -0.5 ? 'S' : '';
    direction += diffX / distance > 0.5 ? 'W' : '';
    direction += diffX / distance < -0.5 ? 'E' : '';

    setSprite(direction, frameCount);
    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    updatePos();
  }

  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) {
      return;
    }

    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }

    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }

    window.requestAnimationFrame(onAnimationFrame);
  }

  document.addEventListener('mousemove', updateMousePosition);

  function onFirstMouseMove(event) {
    updateMousePosition(event);
    document.removeEventListener('mousemove', onFirstMouseMove);
    init();
  }

  document.addEventListener('mousemove', onFirstMouseMove);
})();
