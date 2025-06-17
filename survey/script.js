const projects = {
  0: {
    title: 'your information',
    description:
      'please provide your name so i can prevent duplicate responses.',
  },
  1: {
    title: 'communitrics discord bot',
    description:
      'discord bot for real-time tracking of youtube channel milestones.',
  },
  2: {
    title: 'mrbeast subscriber graph',
    description:
      "real-time graph of mrbeast's subscriber count with historical data.",
  },
  3: {
    title: 'youtube data exporter',
    description: 'export statistics for any youtube channel or video.',
  },
  4: {
    title: 'communitrics graphs',
    description:
      'subscriber and average graphs for communitrics tracked channels.',
  },
  5: {
    title: 'mrbeast video data',
    description: 'hourly statistics for all mrbeast videos with daily data.',
  },
  6: {
    title: 'top youtube channels',
    description: 'list of the 1,000 most-subscribed youtube channels.',
  },
  7: {
    title: 'old youtube channels',
    description: 'explore all youtube channels from 2005.',
  },
  8: {
    title: 'color extractor',
    description:
      'tool to extract a color pallete from any youtube profile pic or image.',
  },
  9: {
    title: 'communitrics counting',
    description:
      'analytics and leaderboards for discord counting channels via communitrics.',
  },
  10: {
    title: 'bluesky statistics',
    description: 'user count and growth analytics for bluesky.',
  },
};

let currentProjectIndex = 0;
const totalProjects = Object.keys(projects).length;
const surveyData = {};
let currentContent = null;
let nextContent = null;

const surveyContent = document.getElementById('survey-content');
const progressFill = document.getElementById('progress-fill');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const surveyCard = document.getElementById('survey-card');
const thankYouCard = document.getElementById('thank-you-card');
const navigation = document.getElementById('navigation');

function initSurvey() {
  renderQuestion(currentProjectIndex);
  updateProgress();

  adjustHeight();
  window.addEventListener('resize', adjustHeight);
}

function adjustHeight() {
  const viewportHeight = window.innerHeight;
  const headerHeight = document.querySelector('header').offsetHeight;
  const availableHeight = viewportHeight - headerHeight - 80;

  const surveyWrapper = document.querySelector('.survey-wrapper');
  surveyWrapper.style.maxHeight = `${availableHeight}px`;
}

function renderQuestion(projectIndex) {
  const project = projects[projectIndex];

  const content = document.createElement('div');
  content.className = 'question-content';

  if (projectIndex === 0) {
    content.innerHTML = `
            <div class="question-counter">
              <i class="fas fa-user question-counter-icon"></i>
              <span>step ${projectIndex + 1} of ${totalProjects}</span>
            </div>
            
            <div class="project-info">
              <h3 class="project-title">${project.title}</h3>
              <p class="project-description">${project.description}</p>
            </div>
            
            <div class="feedback-section" style="margin-top: 2rem;">
              <label for="user-name" class="feedback-label">your name</label>
              <input type="text" id="user-name" class="feedback-input" placeholder="enter your name" style="height: 50px;" required>
            </div>
          `;
  } else {
    content.innerHTML = `
            <div class="question-counter">
              <i class="fas fa-chart-simple question-counter-icon"></i>
              <span>project ${projectIndex} of ${totalProjects - 1}</span>
            </div>
            
            <div class="project-info">
              <h3 class="project-title">${project.title}</h3>
              <p class="project-description">${project.description}</p>
            </div>
            
            <div class="slider-group">
              <div class="slider-label">
                <span class="slider-title">how often do you use this?</span>
              </div>
              <div class="rating-container usage-rating">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                  .map(
                    num => `
                  <div class="rating-option">
                    <input type="radio" name="usage-${projectIndex}" value="${num}" id="usage-${projectIndex}-${num}" class="rating-input usage-input" ${
                      num === 5 ? 'checked' : ''
                    }>
                    <label for="usage-${projectIndex}-${num}" class="rating-button">${num}</label>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <div class="rating-labels">
                <span>never</span>
                <span>every day</span>
              </div>
            </div>
            
            <div class="slider-group">
              <div class="slider-label">
                <span class="slider-title">how important is this to you?</span>
              </div>
              <div class="rating-container importance-rating">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                  .map(
                    num => `
                  <div class="rating-option">
                    <input type="radio" name="importance-${projectIndex}" value="${num}" id="importance-${projectIndex}-${num}" class="rating-input importance-input" ${
                      num === 5 ? 'checked' : ''
                    }>
                    <label for="importance-${projectIndex}-${num}" class="rating-button">${num}</label>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <div class="rating-labels">
                <span>not important</span>
                <span>very important</span>
              </div>
            </div>
            
            <div class="feedback-section">
              <label for="feedback-${projectIndex}" class="feedback-label">any specific feedback?</label>
              <textarea id="feedback-${projectIndex}" class="feedback-input" placeholder="what do you like? what could be improved?"></textarea>
            </div>
          `;
  }

  if (surveyData[projectIndex]) {
    const savedData = surveyData[projectIndex];

    setTimeout(() => {
      if (projectIndex === 0) {
        const nameInput = content.querySelector('#user-name');
        if (nameInput) nameInput.value = savedData.name || '';
      } else {
        const usageInput = content.querySelector(
          `#usage-${projectIndex}-${savedData.usage}`
        );
        if (usageInput) usageInput.checked = true;

        const importanceInput = content.querySelector(
          `#importance-${projectIndex}-${savedData.importance}`
        );
        if (importanceInput) importanceInput.checked = true;

        const feedbackInput = content.querySelector('.feedback-input');
        feedbackInput.value = savedData.feedback || '';
      }
    }, 0);
  }

  return content;
}

function updateProgress() {
  const percent = (currentProjectIndex / totalProjects) * 100;
  progressFill.style.width = `${percent}%`;

  prevButton.disabled = currentProjectIndex === 0;

  if (currentProjectIndex === totalProjects - 1) {
    nextButton.innerHTML = 'submit <i class="fas fa-check"></i>';
    nextButton.classList.remove('next');
    nextButton.classList.add('submit');
  } else {
    nextButton.innerHTML = 'next <i class="fas fa-arrow-right"></i>';
    nextButton.classList.add('next');
    nextButton.classList.remove('submit');
  }
}

function saveCurrentQuestionData() {
  const content = surveyContent.querySelector('.question-content');
  if (!content) return;

  if (currentProjectIndex === 0) {
    const nameInput = content.querySelector('#user-name');
    surveyData[currentProjectIndex] = {
      name: nameInput ? nameInput.value.trim() : '',
    };
  } else {
    const usageInput = content.querySelector('.usage-input:checked');
    const importanceInput = content.querySelector('.importance-input:checked');
    const feedbackInput = content.querySelector('.feedback-input');

    surveyData[currentProjectIndex] = {
      projectId: currentProjectIndex,
      projectTitle: projects[currentProjectIndex].title,
      usage: parseInt(usageInput ? usageInput.value : 5),
      importance: parseInt(importanceInput ? importanceInput.value : 5),
      feedback: feedbackInput.value.trim(),
    };
  }
}

function goToNextQuestion() {
  saveCurrentQuestionData();

  if (currentProjectIndex === 0) {
    const nameInput = document.getElementById('user-name');
    if (!nameInput.value.trim()) {
      alert('please enter your name to continue.');
      nameInput.focus();
      return;
    }
  }

  if (currentProjectIndex < totalProjects - 1) {
    currentContent = surveyContent.querySelector('.question-content');

    setTimeout(() => {
      surveyContent.innerHTML = '';
      nextContent = renderQuestion(currentProjectIndex + 1);
      surveyContent.appendChild(nextContent);

      currentProjectIndex++;
      updateProgress();
    }, 400);
  } else {
    submitSurvey();
  }
}

function goToPrevQuestion() {
  saveCurrentQuestionData();

  if (currentProjectIndex > 0) {
    currentContent = surveyContent.querySelector('.question-content');

    setTimeout(() => {
      surveyContent.innerHTML = '';
      nextContent = renderQuestion(currentProjectIndex - 1);
      surveyContent.appendChild(nextContent);

      currentProjectIndex--;
      updateProgress();
    }, 400);
  }
}

async function submitSurvey() {
  saveCurrentQuestionData();

  try {
    const name = surveyData[0]?.name;

    if (!name || name.trim() === '') {
      alert('name is required to submit the survey.');
      while (currentProjectIndex > 0) {
        await new Promise(resolve => {
          goToPrevQuestion();
          setTimeout(resolve, 700);
        });
      }
      return;
    }

    const responses = Object.keys(surveyData)
      .filter(key => key !== '0')
      .map(key => {
        const data = surveyData[key];
        return {
          projectId: data.projectId,
          projectTitle: data.projectTitle,
          usage: data.usage,
          importance: data.importance,
          feedback: data.feedback || '',
        };
      });

    nextButton.disabled = true;
    nextButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> submitting...';

    const response = await fetch('https://api.communitrics.com/survey', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        responses: responses,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'failed to submit survey');
    }

    surveyCard.style.display = 'none';
    thankYouCard.style.display = 'block';
    thankYouCard.classList.add('fade-in');

    progressFill.style.width = '100%';
    navigation.style.display = 'none';

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);
  } catch (error) {
    console.error('error submitting survey:', error);
    alert('there was an error submitting your survey. please try again.');

    nextButton.disabled = false;
    nextButton.innerHTML = 'submit <i class="fas fa-check"></i>';
  }
}

prevButton.addEventListener('click', goToPrevQuestion);
nextButton.addEventListener('click', goToNextQuestion);

document.addEventListener('DOMContentLoaded', () => {
  currentContent = renderQuestion(currentProjectIndex);
  surveyContent.appendChild(currentContent);
  initSurvey();
});
