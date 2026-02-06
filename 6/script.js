const projects = [
  {
    title: 'Communitrics Discord Bot',
    description:
      'Real-time alerts for YouTube milestones with community-first UX and clear celebratory moments.',
    year: '2024',
    focus: 'Realtime tracking',
  },
  {
    title: 'MrBeast Subscriber Graph',
    description:
      'A live timeline of subscriber growth with historical context and smooth data storytelling.',
    year: '2024',
    focus: 'Live charts',
  },
  {
    title: 'YouTube Data Exporter',
    description:
      'Export structured statistics for any channel or video to power deeper analysis.',
    year: '2024',
    focus: 'Data tools',
  },
  {
    title: 'Communitrics Graphs',
    description:
      'Subscriber and average graphs for the Communitrics tracked channels suite.',
    year: '2023',
    focus: 'Analytics suite',
  },
  {
    title: 'SocialStats',
    description:
      'Fast, clean snapshots of social growth patterns across creator platforms.',
    year: '2023',
    focus: 'Insight dashboard',
  },
];

const work = [
  {
    role: 'NewStats Lead',
    org: 'NewStudio',
    detail: 'Guiding product direction, UX, and data clarity for large-scale stats tooling.',
  },
  {
    role: 'Extension Developer',
    org: 'NewStudio',
    detail: 'Building browser extensions that surface creator insights in-context.',
  },
  {
    role: 'Independent Builder',
    org: 'Freelance',
    detail: 'Custom dashboards and data visualizations for online communities.',
  },
];

const projectsGrid = document.getElementById('projects-grid');
const workGrid = document.getElementById('work-grid');

projects.forEach(project => {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.innerHTML = `
    <div class="project-meta">
      <span>${project.year}</span>
      <span>${project.focus}</span>
    </div>
    <h3>${project.title}</h3>
    <p>${project.description}</p>
  `;
  projectsGrid.appendChild(card);
});

work.forEach(item => {
  const card = document.createElement('article');
  card.className = 'work-card';
  card.innerHTML = `
    <span>${item.org}</span>
    <h3>${item.role}</h3>
    <p>${item.detail}</p>
  `;
  workGrid.appendChild(card);
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

const floaters = document.querySelectorAll('.floater');

window.addEventListener('mousemove', event => {
  const x = (event.clientX / window.innerWidth - 0.5) * 40;
  const y = (event.clientY / window.innerHeight - 0.5) * 40;
  floaters.forEach(floater => {
    const speed = parseFloat(floater.dataset.speed || '0.02');
    floater.style.transform = `translate3d(${x * speed}px, ${y * speed}px, 0)`;
  });
});
