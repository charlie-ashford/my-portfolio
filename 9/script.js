const projects = [
  {
    title: 'communitrics discord bot',
    description:
      'discord bot for real-time tracking of youtube channel milestones.',
    date: 'jan 2024',
    link: 'https://communitrics.com',
  },
  {
    title: 'mrbeast subscriber graph',
    description:
      "real-time graph of mrbeast's subscriber count with historical data.",
    date: 'may 2024',
    link: 'https://mrbeastgraph.com',
  },
  {
    title: 'youtube data exporter',
    description: 'export statistics for any youtube channel or video.',
    date: 'aug 2024',
    link: 'https://export.communitrics.com',
  },
  {
    title: 'communitrics graphs',
    description:
      'subscriber and average graphs for communitrics tracked channels.',
    date: 'apr 2024',
    link: 'https://graphs.communitrics.com',
  },
  {
    title: 'sctools',
    description:
      'a collection of tools made by stats creators, for stats creators.',
    date: 'sept 2024',
    link: 'https://sctools.org',
  },
  {
    title: 'video data',
    description:
      'hourly statistics for mrbeast, taylor swift and other channel videos with daily data.',
    date: 'aug 2024',
    link: 'https://videostats.communitrics.com',
  },
  {
    title: 'socialstats.app',
    description:
      'best analytics of all time for all platforms, made with galvin and nia.',
    date: 'jan 2025',
    link: 'https://socialstats.app',
  },
  {
    title: 'my portfolio',
    description:
      "my personal portfolio site to showcase my projects, you're probably on it right now.",
    date: 'jan 2025',
    link: 'https://charlieashford.com',
  },
  {
    title: 'mrbeast hourly stats bot',
    description: "discord bot for hourly mrbeast's subscriber count updates.",
    date: 'may 2024',
  },
  {
    title: 'top youtube channels',
    description: 'list of the 1,000 most-subscribed youtube channels.',
    date: 'apr 2024',
    link: 'https://top.communitrics.com',
  },
  {
    title: 'old youtube channels',
    description: 'explore all youtube channels from 2005.',
    date: 'oct 2024',
    link: 'https://oldtube.communitrics.com',
  },
  {
    title: 'color extractor',
    description:
      'tool to extract a color palette from any youtube profile pic or image.',
    date: 'apr 2025',
    link: 'https://colors.communitrics.com',
  },
  {
    title: 'communitrics counting',
    description:
      'analytics and leaderboards for discord counting channels via communitrics.',
    date: 'jul 2024',
    link: 'https://counting.communitrics.com',
  },
  {
    title: 'mrbeast subs twitter bot',
    description: 'automated twitter bot for mrbeast subscriber milestones.',
    date: 'feb 2025',
    link: 'https://twitter.com/MrBeast_Count',
  },
  {
    title: 'reminder discord bot',
    description: 'customisable periodic reminder system for discord.',
    date: 'feb 2025',
    link: 'https://discord.com/oauth2/authorize?client_id=1339020731052331058',
  },
  {
    title: 'global clicker',
    description: 'realtime collaborative global clicker and counter.',
    date: 'may 2024',
    link: 'https://clicker.communitrics.com',
  },
  {
    title: 'ytb discord xp leaderboard',
    description: 'custom tracking bot for ytbattles discord server xp data.',
    date: 'sept 2024',
  },
  {
    title: 'bluesky statistics',
    description: 'user count and growth analytics for bluesky.',
    date: 'nov 2024',
    link: 'https://bluesky.communitrics.com',
  },
];

const workItems = [
  {
    company: 'NewStudio',
    role: 'extension developer and NewStats lead',
    description:
      'NewStats offers better youtube analytics integrated with NewStudio, a better youtube studio experience.',
    date: 'oct 2025 - present',
  },
];

const caseGrid = document.getElementById('case-grid');
const workStack = document.getElementById('work-stack');

projects.forEach((project, index) => {
  const card = document.createElement('article');
  card.className = 'case-card';
  const caseNumber = String(index + 1).padStart(3, '0');
  card.innerHTML = `
    <div class="case-meta">
      <span>case ${caseNumber}</span>
      <span>${project.date}</span>
    </div>
    <h3>${project.title}</h3>
    <p>${project.description}</p>
    ${
      project.link
        ? `<a class="case-link" href="${project.link}" target="_blank" rel="noopener">Open file</a>`
        : `<span class="case-link">Confidential</span>`
    }
  `;
  caseGrid.appendChild(card);
});

workItems.forEach(item => {
  const card = document.createElement('article');
  card.className = 'work-card';
  card.innerHTML = `
    <h3>${item.company}</h3>
    <p><strong>${item.role}</strong></p>
    <p>${item.description}</p>
    <p class="case-meta">${item.date}</p>
  `;
  workStack.appendChild(card);
});

const timeEl = document.getElementById('local-time');
const ageEl = document.getElementById('age');

function updateTime() {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  timeEl.textContent = formatter.format(new Date());
}

function updateAge() {
  const birth = new Date('2005-10-25T00:00:00+10:00');
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  ageEl.textContent = `${age} years`;
}

updateTime();
updateAge();
setInterval(updateTime, 1000);
