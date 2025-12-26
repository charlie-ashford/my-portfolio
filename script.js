const cursorDot = document.createElement('div');
const cursorOutline = document.createElement('div');
cursorDot.className = 'cursor-dot';
cursorOutline.className = 'cursor-outline';
document.body.appendChild(cursorDot);
document.body.appendChild(cursorOutline);

let mouseX = 0;
let mouseY = 0;
let outlineX = 0;
let outlineY = 0;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  cursorDot.style.left = `${mouseX}px`;
  cursorDot.style.top = `${mouseY}px`;
});

function animateCursorOutline() {
  outlineX += mouseX - outlineX;
  outlineY += mouseY - outlineY;

  cursorOutline.style.left = `${outlineX}px`;
  cursorOutline.style.top = `${outlineY}px`;

  requestAnimationFrame(animateCursorOutline);
}

animateCursorOutline();

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

let mouse = { x: null, y: null, radius: 150 };

window.addEventListener('mousemove', e => {
  mouse.x = e.x;
  mouse.y = e.y;
});

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initParticles();
}

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 1.5 + 0.5;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fillStyle = 'rgba(127, 208, 243, 0.5)';

    ctx.fill();
  }

  update() {
    // Movement
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;

    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    const repelDistance = 120;
    if (mouse.x != null && distance < repelDistance) {
      const forceDirectionX = dx / distance;
      const forceDirectionY = dy / distance;
      const force = (repelDistance - distance) / repelDistance;

      const directionX = forceDirectionX * force * 3;
      const directionY = forceDirectionY * force * 3;

      this.x -= directionX;
      this.y -= directionY;
    }

    this.draw();
  }
}

function connect() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a; b < particles.length; b++) {
      let distance =
        (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
        (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

      const connectDistance = 111 * 111;

      if (distance < connectDistance) {
        let opacityValue = (1 - distance / connectDistance) * 0.2;

        ctx.strokeStyle = `rgba(127, 208, 243, ${opacityValue})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }

    if (mouse.x != null) {
      let mouseDist =
        (particles[a].x - mouse.x) * (particles[a].x - mouse.x) +
        (particles[a].y - mouse.y) * (particles[a].y - mouse.y);

      if (mouseDist < 180 * 180) {
        let mouseOpacity = (1 - mouseDist / (180 * 180)) * 0.6;

        ctx.strokeStyle = `rgba(127, 208, 243, ${mouseOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
}

function initParticles() {
  particles = [];
  const numberOfParticles = (width * height) / 10000;
  for (let i = 0; i < numberOfParticles; i++) {
    particles.push(new Particle());
  }
}

function initParticles() {
  particles = [];
  const numberOfParticles = (width * height) / 12000;
  for (let i = 0; i < numberOfParticles; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
  }
  connect();
  requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', resize);

const projects = {
  1: {
    title: 'communitrics discord bot',
    description:
      'discord bot for real-time tracking of youtube channel milestones.',
    image: 'images/communitrics.png',
    link: 'https://communitrics.com',
    date: 'jan 2024',
    icon: 'fab fa-discord',
    span: 'span-2-col',
  },
  2: {
    title: 'mrbeast subscriber graph',
    description:
      "real-time graph of mrbeast's subscriber count with historical data.",
    image: 'images/mbgraph.png',
    link: 'https://mrbeastgraph.com',
    code: 'https://github.com/charlie-ashford/mrbeast-graph',
    date: 'may 2024',
    icon: 'fas fa-chart-line',
  },
  3: {
    title: 'youtube data exporter',
    description: 'export statistics for any youtube channel or video.',
    image: 'images/export.png',
    link: 'https://export.communitrics.com',
    code: 'https://github.com/charlie-ashford/data-exporter',
    date: 'aug 2024',
    icon: 'fas fa-file-export',
  },
  4: {
    title: 'communitrics graphs',
    description:
      'subscriber and average graphs for communitrics tracked channels.',
    image: 'images/graphs.png',
    link: 'https://graphs.communitrics.com',
    code: 'https://github.com/charlie-ashford/channel-graphs',
    date: 'apr 2024',
    icon: 'fas fa-chart-area',
  },
  5: {
    title: 'sctools',
    description:
      'a collection of tools made by stats creators, for stats creators.',
    image: 'images/sctools.png',
    link: 'https://sctools.org',
    date: 'sept 2024',
    icon: 'fas fa-tools',
  },
  6: {
    title: 'video data',
    description:
      'hourly statistics for all mrbeast, taylor swift and other channel videos with daily data.',
    image: 'images/videos.png',
    link: 'https://videostats.communitrics.com',
    code: 'https://github.com/charlie-ashford/video-stats',
    date: 'aug 2024',
    icon: 'fas fa-video',
  },
  7: {
    title: 'socialstats.app',
    description:
      'best analytics of all time for all platforms, made with galvin and nia.',
    image: 'images/socialstats.png',
    link: 'https://socialstats.app',
    date: 'jan 2025',
    icon: 'fas fa-chart-pie',
    span: 'span-2-col',
  },
  8: {
    title: 'my portfolio',
    description:
      "my personal portfolio site to showcase my projects, you're probably on it right now.",
    image: 'images/portfolio.png',
    link: 'https://charlieashford.com',
    code: 'https://github.com/charlie-ashford/my-portfolio',
    date: 'jan 2025',
    icon: 'fas fa-laptop-code',
  },
  9: {
    title: 'mrbeast hourly stats bot',
    description: "discord bot for hourly mrbeast's subscriber count updates.",
    image: 'images/hourly.png',
    date: 'may 2024',
    icon: 'fas fa-clock',
  },
  10: {
    title: 'top youtube channels',
    description: 'list of the 1,000 most-subscribed youtube channels.',
    image: 'images/top.png',
    link: 'https://top.communitrics.com',
    code: 'https://github.com/charlie-ashford/top-channels',
    date: 'apr 2024',
    icon: 'fas fa-trophy',
  },
  11: {
    title: 'old youtube channels',
    description: 'explore all youtube channels from 2005.',
    image: 'images/oldtube.png',
    link: 'https://oldtube.communitrics.com',
    code: 'https://github.com/charlie-ashford/old-youtube',
    date: 'oct 2024',
    icon: 'fas fa-history',
  },
  12: {
    title: 'color extractor',
    description:
      'tool to extract a color pallete from any youtube profile pic or image.',
    image: 'images/colors.png',
    link: 'https://colors.communitrics.com',
    code: 'https://github.com/charlie-ashford/color-extractor',
    date: 'apr 2025',
    icon: 'fas fa-eye-dropper',
  },
  13: {
    title: 'communitrics counting',
    description:
      'analytics and leaderboards for discord counting channels via communitrics.',
    image: 'images/counting.png',
    link: 'https://counting.communitrics.com',
    code: 'https://github.com/charlie-ashford/counting-data',
    date: 'jul 2024',
    icon: 'fas fa-sort-numeric-up',
  },
  14: {
    title: 'mrbeast subs twitter bot',
    description: 'automated twitter bot for mrbeast subscriber milestones.',
    image: 'images/twitter.png',
    link: 'https://twitter.com/MrBeast_Count',
    date: 'feb 2025',
    icon: 'fab fa-twitter',
  },
  15: {
    title: 'reminder discord bot',
    description: 'customisable periodic reminder system for discord.',
    image: 'images/remind.png',
    link: 'https://discord.com/oauth2/authorize?client_id=1339020731052331058',
    date: 'feb 2025',
    icon: 'fas fa-bell',
  },
  16: {
    title: 'global clicker',
    description: 'realtime collaborative global clicker and counter.',
    image: 'images/clicker.png',
    link: 'https://clicker.communitrics.com',
    code: 'https://github.com/charlie-ashford/global-clicker',
    date: 'may 2024',
    icon: 'fas fa-mouse-pointer',
  },
  17: {
    title: 'ytb discord xp leaderboard',
    description: 'custom tracking bot for ytbattles discord server xp data.',
    image: 'images/ytb.png',
    date: 'sept 2024',
    icon: 'fas fa-medal',
  },
  18: {
    title: 'bluesky statistics',
    description: 'user count and growth analytics for bluesky.',
    image: 'images/bluesky.png',
    link: 'https://bluesky.communitrics.com',
    code: 'https://github.com/charlie-ashford/bluesky-stats',
    date: 'nov 2024',
    icon: 'fas fa-cloud',
  },
};

const professionalWork = {
  1: {
    company: 'newstudio',
    role: 'extension developer and newstats lead',
    description:
      'newstats offers better youtube analytics integrated with newstudio, a better youtube studio experience.',
    logo: 'images/newstudio.png',
    link: 'https://newstudio.app',
    date: 'nov 2025 - present',
  },
};

function preloadImages() {
  const imageCache = new Map();

  Object.values(projects).forEach(project => {
    if (project.image) {
      const img = new Image();
      img.src = project.image;
      imageCache.set(project.image, img);
    }
  });

  Object.values(professionalWork).forEach(work => {
    if (work.logo) {
      const img = new Image();
      img.src = work.logo;
      imageCache.set(work.logo, img);
    }
  });

  return imageCache;
}

function renderProjects() {
  const projectsGrid = document.querySelector('.projects-grid');
  Object.entries(projects).forEach(([id, project]) => {
    const card = document.createElement('div');
    card.className = `project-card slide-up ${project.span || ''}`;
    card.style.animationDelay = `${parseInt(id) * 0.1}s`;
    card.innerHTML = `
      <div class="project-header">
        <h3 class="project-title">${project.title}</h3>
        <i class="${project.icon} project-icon"></i>
      </div>
      <p class="project-desc">${project.description}</p>
      <div class="project-meta">
        <span class="project-status">
          <i class="fas fa-calendar-days"></i>
          ${project.date}
        </span>
      </div>
    `;
    card.addEventListener('click', () => showProjectModal(project));
    projectsGrid.appendChild(card);
  });
}

function renderProfessionalWork() {
  const workList = document.querySelector('.work-list');
  if (!workList) return;

  const projectCount = Object.keys(projects).length;
  const projectBaseDelay = projectCount * 0.1;
  const projectAnimDuration = 0.6;
  const totalProjectTime = projectBaseDelay + projectAnimDuration;

  Object.entries(professionalWork).forEach(([id, work]) => {
    const item = document.createElement('div');
    item.className = 'work-item slide-up';
    item.style.animationDelay = `${totalProjectTime + parseInt(id) * 0.1}s`;
    item.innerHTML = `
      ${
        work.logo
          ? `<img src="${work.logo}" alt="${work.company}" class="work-logo">`
          : ''
      }
      <div class="work-content">
        <div class="work-header">
          <div>
            <h3 class="work-title">${work.company}</h3>
            <p class="work-role">${work.role}</p>
          </div>
          <span class="work-date">${work.date}</span>
        </div>
        <p class="work-description">${work.description}</p>
      </div>
    `;

    if (work.link) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        window.open(work.link, '_blank');
      });
    }

    workList.appendChild(item);
  });
}

function animateProfessionalWorkSection() {
  const workSection = document.querySelector('.work-section');
  const workTitle = workSection?.querySelector('.section-title');

  if (!workTitle) return;

  const projectCount = Object.keys(projects).length;
  const projectBaseDelay = projectCount * 0.1;
  const projectAnimDuration = 0.6;
  const totalProjectTime = projectBaseDelay + projectAnimDuration;

  workTitle.style.opacity = '0';
  workTitle.style.animation = 'none';
  workTitle.style.animation = `fadeIn 0.6s ease ${
    totalProjectTime - 0.3
  }s forwards`;
}

function showProjectModal(project) {
  const modal = document.querySelector('.modal');
  const modalImage = modal.querySelector('.modal-image');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('.modal-description');
  const viewProjectBtn = modal.querySelector('.modal-btn.primary');
  const viewCodeBtn = modal.querySelector('.modal-btn.secondary');

  if (project.image) {
    modalImage.src = project.image;
    modalImage.alt = project.title;
    modalImage.style.display = 'block';
  } else {
    modalImage.style.display = 'none';
  }

  modalTitle.textContent = project.title;
  modalDescription.textContent = project.description;

  if (project.link) {
    viewProjectBtn.href = project.link;
    viewProjectBtn.style.display = 'inline-flex';
  } else {
    viewProjectBtn.style.display = 'none';
  }

  if (project.code) {
    viewCodeBtn.href = project.code;
    viewCodeBtn.style.display = 'inline-flex';
  } else {
    viewCodeBtn.style.display = 'none';
  }

  modal.classList.add('active');
}

function closeModal() {
  document.querySelector('.modal').classList.remove('active');
}

let marqueeAnimationFrame;
let isHoveringMarquee = false;

const getElement = id => document.getElementById(id);
const getSelector = sel => document.querySelector(sel);

function setupSongMarquee() {
  const [songInfo, container, songSection] = [
    getElement('song-info'),
    getSelector('.song-info-container'),
    getElement('song-section'),
  ];
  if (!songInfo || !container || !songSection) return;
  Object.assign(songInfo.style, {
    whiteSpace: 'nowrap',
    display: 'inline-block',
    position: 'relative',
    transform: 'translateX(0)',
  });
  songSection.addEventListener('mouseenter', () => (isHoveringMarquee = true));
  songSection.addEventListener('mouseleave', () => (isHoveringMarquee = false));
  if (
    songSection.style.display !== 'none' &&
    getComputedStyle(songSection).display !== 'none'
  ) {
    setTimeout(startMarquee, 100);
  }
}

function startMarquee() {
  const [songInfo, container] = [
    getElement('song-info'),
    getSelector('.song-info-container'),
  ];
  if (!songInfo || !container) return;
  const [textWidth, containerWidth] = [
    songInfo.scrollWidth,
    container.clientWidth,
  ];
  if (textWidth <= containerWidth + 5) return;
  if (marqueeAnimationFrame) cancelAnimationFrame(marqueeAnimationFrame);
  let [lastTime, position] = [null, 0];
  const scrollSpeed = 30;
  function animate(timestamp) {
    if (!isHoveringMarquee && lastTime) {
      position -= ((timestamp - lastTime) / 1000) * scrollSpeed;
      if (position <= -textWidth - 20) position = containerWidth;
      songInfo.style.transform = `translateX(${position}px)`;
    }
    lastTime = timestamp;
    marqueeAnimationFrame = requestAnimationFrame(animate);
  }
  marqueeAnimationFrame = requestAnimationFrame(animate);
}

function updateSongInfo(artist, song) {
  const songInfo = getElement('song-info');
  if (!songInfo) return;
  if (marqueeAnimationFrame) {
    cancelAnimationFrame(marqueeAnimationFrame);
    marqueeAnimationFrame = null;
  }
  songInfo.textContent = `${song} - ${artist}`;
  Object.assign(songInfo.style, {
    transition: 'none',
    transform: 'translateX(0px)',
  });
  songInfo.offsetWidth;
  setTimeout(startMarquee, 100);
}

async function fetchDiscordPresence() {
  const apiUrl = `https://api.lanyard.rest/v1/users/1158588351943811142`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.success) {
      const lanyardData = data.data;
      const discordStatusCircle = document.getElementById(
        'discord-status-circle'
      );
      const discordStatusText = document.getElementById('discord-status-text');
      const discordTooltip = document.getElementById('discord-tooltip');

      let status = lanyardData.discord_status;
      let statusText = status;
      let tooltipText = '';

      let platformInfo = [];
      if (lanyardData.active_on_discord_desktop) platformInfo.push('desktop');
      if (lanyardData.active_on_discord_mobile) platformInfo.push('mobile');
      if (lanyardData.active_on_discord_web) platformInfo.push('web');

      const customStatusActivity = lanyardData.activities.find(
        activity => activity.id === 'custom'
      );
      if (customStatusActivity && customStatusActivity.emoji) {
        const emoji = customStatusActivity.emoji;

        if (emoji.id) {
          const emojiImageURL = `https://cdn.discordapp.com/emojis/${
            emoji.id
          }.${emoji.animated ? 'gif' : 'png'}`;
          tooltipText = `<img src="${emojiImageURL}" alt="${emoji.name}" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 5px;">`;
        } else if (emoji.name) {
          tooltipText = `<span style="font-size: 16px; line-height: 20px; display: inline-block; width: 20px; height: 20px; text-align: center; vertical-align: middle; margin-right: 5px;">${emoji.name}</span>`;
        }
      }

      if (platformInfo.length > 0) {
        tooltipText +=
          (tooltipText ? ' ' : '') + `active on: ${platformInfo.join(', ')}`;
      }

      if (discordTooltip) {
        discordTooltip.innerHTML =
          tooltipText || (status === 'offline' ? 'offline' : 'online');
      }

      discordStatusCircle.classList.remove(
        'status-online',
        'status-idle',
        'status-dnd',
        'status-offline'
      );

      switch (status) {
        case 'online':
          discordStatusCircle.classList.add('status-online');
          break;
        case 'idle':
          discordStatusCircle.classList.add('status-idle');
          break;
        case 'dnd':
          discordStatusCircle.classList.add('status-dnd');
          statusText = 'dnd';
          break;
        default:
          statusText = 'offline';
          discordStatusCircle.classList.add('status-offline');
          break;
      }

      if (discordStatusText) {
        discordStatusText.textContent = statusText;
      }

      const gameSection = document.getElementById('game-section');
      const gameInfo = document.getElementById('game-info');

      const gameActivity = lanyardData.activities.find(
        activity => activity.type === 0
      );

      if (gameActivity) {
        if (gameInfo)
          gameInfo.textContent = `playing ${gameActivity.name.toLowerCase()}`;
        if (gameSection) gameSection.style.display = 'flex';
      } else {
        if (gameInfo) gameInfo.textContent = '';
        if (gameSection) gameSection.style.display = 'none';
      }

      const songSection = document.getElementById('song-section');
      const songImage = document.getElementById('song-image');
      const songInfoEl = document.getElementById('song-info');
      const songLink = document.getElementById('song-link');

      if (lanyardData.listening_to_spotify && lanyardData.spotify) {
        const { artist, song, album_art_url, track_id } = lanyardData.spotify;

        const currentText = songInfoEl ? songInfoEl.textContent : '';
        const newText = `${song} - ${artist}`;

        if (songImage) songImage.src = album_art_url;
        if (songSection) songSection.style.display = 'flex';
        if (songLink)
          songLink.href = `https://open.spotify.com/track/${track_id}`;

        if (currentText !== newText) {
          updateSongInfo(artist, song);
        }
      } else {
        if (songImage) songImage.src = '';
        if (songInfoEl) songInfoEl.textContent = '';
        if (songSection) songSection.style.display = 'none';
        if (songLink) songLink.href = '#';

        if (marqueeAnimationFrame) {
          cancelAnimationFrame(marqueeAnimationFrame);
          marqueeAnimationFrame = null;
        }
      }
    } else {
      const discordStatusText = document.getElementById('discord-status-text');
      const gameSection = document.getElementById('game-section');
      const songImage = document.getElementById('song-image');
      const songInfoEl = document.getElementById('song-info');
      const discordStatusCircle = document.getElementById(
        'discord-status-circle'
      );
      const songSection = document.getElementById('song-section');
      const songLink = document.getElementById('song-link');

      if (discordStatusText) discordStatusText.textContent = '';
      if (gameSection) gameSection.style.display = 'none';
      if (songImage) songImage.src = '';
      if (songInfoEl) songInfoEl.textContent = '';
      if (discordStatusCircle)
        discordStatusCircle.classList.add('status-offline');
      if (songSection) songSection.style.display = 'none';
      if (songLink) songLink.href = '#';

      if (marqueeAnimationFrame) {
        cancelAnimationFrame(marqueeAnimationFrame);
        marqueeAnimationFrame = null;
      }
    }
  } catch (error) {
    console.error('Error fetching Discord presence:', error);
  }
}

function updateDiscordPresence() {
  fetchDiscordPresence();
  setTimeout(updateDiscordPresence, 4000);
}

const { DateTime } = luxon;

function updateTime() {
  const zone = 'Australia/Sydney';
  const timeElement = document.getElementById('my-time');
  const now = DateTime.now().setZone(zone);

  timeElement.textContent = now.toFormat('d MMM yyyy, HH:mm:ss');
  updateAge(zone);

  setTimeout(updateTime, 1000 - now.millisecond);
}

function updateAge(zone) {
  const birth = DateTime.fromISO('2005-10-25T00:00:00', { zone });
  const now = DateTime.now().setZone(zone);
  const years = Math.floor(now.diff(birth, 'years').years);
  const lastBirthday = birth.plus({ years });
  const diff = now
    .diff(lastBirthday, ['days', 'hours', 'minutes', 'seconds'])
    .toObject();

  const days = Math.floor(diff.days || 0);
  const hours = Math.floor(diff.hours || 0);
  const minutes = Math.floor(diff.minutes || 0);
  const seconds = Math.floor(diff.seconds || 0);

  const ageEl = document.getElementById('my-age');
  const isMobile = window.matchMedia('(max-width: 950px)').matches;
  ageEl.innerHTML = isMobile
    ? `${years} years, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
    : `${years} years, ${days} days, ${hours} hours,<br>${minutes} minutes, ${seconds} seconds`;
}

function checkSocialsOverlap() {
  const socials = document.querySelector('.socials');
  const container = document.querySelector('.container');

  const containerRect = container.getBoundingClientRect();
  const availableSpace = containerRect.left;

  if (availableSpace < 100) {
    socials.style.position = 'static';
    socials.style.flexDirection = 'row';
    socials.style.justifyContent = 'center';
    socials.style.marginTop = '3rem';
    socials.style.marginBottom = '2rem';
  } else {
    socials.style.position = 'fixed';
    socials.style.flexDirection = 'column';
    socials.style.justifyContent = 'flex-start';
    socials.style.marginTop = '0';
    socials.style.marginBottom = '0';
    socials.style.left = '3rem';
    socials.style.bottom = '3rem';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  preloadImages();
  renderProjects();
  renderProfessionalWork();
  animateProfessionalWorkSection();
  setupSongMarquee();

  const modal = document.querySelector('.modal');
  const closeBtn = modal.querySelector('.close-btn');

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  document.documentElement.style.scrollBehavior = 'smooth';
});

window.addEventListener('load', () => {
  checkSocialsOverlap();
  updateTime();
  updateDiscordPresence();
  resize();
  animateParticles();
});

window.addEventListener('resize', checkSocialsOverlap);
