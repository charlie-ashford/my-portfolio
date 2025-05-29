const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const imageUrl = document.getElementById('imageUrl');
const copyButton = document.getElementById('copyButton');
const tooltip = document.getElementById('tooltip');
const statusMessage = document.getElementById('statusMessage');
const contextMenu = document.getElementById('contextMenu');
const pasteMenuItem = document.getElementById('pasteMenuItem');
const toast = document.getElementById('toast');
const dragOverlay = document.getElementById('dragOverlay');
const autoCopyToggle = document.getElementById('autoCopyToggle');
const copyNote = document.getElementById('copyNote');

if (localStorage.getItem('autoCopy') === 'false') {
  autoCopyToggle.checked = false;
} else {
  localStorage.setItem('autoCopy', 'true');
  autoCopyToggle.checked = true;
}

autoCopyToggle.addEventListener('change', () => {
  localStorage.setItem('autoCopy', autoCopyToggle.checked);
});

function shouldAutoCopy() {
  return autoCopyToggle.checked;
}

uploadArea.addEventListener('click', () => {
  fileInput.click();
});

document.addEventListener('dragenter', e => {
  e.preventDefault();
  e.stopPropagation();
  dragOverlay.classList.add('active');
});

document.addEventListener('dragleave', e => {
  e.preventDefault();
  e.stopPropagation();
  if (!e.relatedTarget || e.relatedTarget === document.documentElement) {
    dragOverlay.classList.remove('active');
  }
});

document.addEventListener('dragover', e => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('drop', e => {
  e.preventDefault();
  e.stopPropagation();
  dragOverlay.classList.remove('active');

  const dt = e.dataTransfer;
  const file = dt.files[0];

  if (file && isValidFile(file)) {
    handleFile(file);
  } else if (dt.files.length > 0) {
    showStatus(
      'please upload a valid image file (jpg, png, gif) under 10mb.',
      'error'
    );
  }
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];

  if (file && isValidFile(file)) {
    handleFile(file);
  } else if (fileInput.files.length > 0) {
    showStatus(
      'please upload a valid image file (jpg, png, gif) under 10mb.',
      'error'
    );
  }
});

document.addEventListener('paste', e => {
  const items = e.clipboardData.items;
  let foundImage = false;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile();
      if (file && isValidFile(file)) {
        handleFile(file);
        foundImage = true;
        break;
      }
    }
  }

  if (!foundImage && items.length > 0) {
    showStatus('no valid image found in clipboard.', 'error');
  }
});

document.addEventListener('contextmenu', e => {
  e.preventDefault();

  contextMenu.style.left = `${e.pageX}px`;
  contextMenu.style.top = `${e.pageY}px`;

  contextMenu.classList.add('show');
});

document.addEventListener('click', () => {
  contextMenu.classList.remove('show');
});

pasteMenuItem.addEventListener('click', () => {
  if (navigator.clipboard && navigator.clipboard.read) {
    navigator.clipboard
      .read()
      .then(clipboardItems => {
        let foundImage = false;

        for (const clipboardItem of clipboardItems) {
          for (const type of clipboardItem.types) {
            if (type.startsWith('image/')) {
              clipboardItem.getType(type).then(blob => {
                const file = new File([blob], 'pasted-image.png', {
                  type,
                });
                if (isValidFile(file)) {
                  handleFile(file);
                  foundImage = true;
                }
              });
              return;
            }
          }
        }

        if (!foundImage) {
          showStatus('no valid image found in clipboard.', 'error');
        }
      })
      .catch(err => {
        console.error('Failed to read clipboard:', err);
        showStatus('failed to access clipboard.', 'error');
      });
  } else {
    showStatus('clipboard access not supported in this browser.', 'error');
  }
});

function isValidFile(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 10 * 1024 * 1024;

  return validTypes.includes(file.type) && file.size <= maxSize;
}

function handleFile(file) {
  resetUI();

  progressContainer.classList.add('show');

  const reader = new FileReader();
  reader.onload = e => {
    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
  };
  reader.readAsDataURL(file);

  uploadFile(file);
}

function uploadFile(file) {
  const xhr = new XMLHttpRequest();
  const formData = new FormData();

  formData.append('image', file);

  xhr.upload.addEventListener('progress', e => {
    if (e.lengthComputable) {
      const percentComplete = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percentComplete + '%';
      progressText.textContent = `uploading... ${percentComplete}%`;
    }
  });

  xhr.onload = function () {
    if (xhr.status === 200) {
      try {
        const response = JSON.parse(xhr.responseText);
        if (response.success && response.url) {
          imageUrl.value = response.url;
          previewContainer.classList.add('show');

          progressContainer.classList.remove('show');

          if (shouldAutoCopy()) {
            copyToClipboard(response.url);
            showStatus(
              'image uploaded successfully! link copied to clipboard.',
              'success'
            );
            copyNote.textContent = 'link has been copied to your clipboard';
          } else {
            showStatus(
              'image uploaded successfully! click copy to get the link.',
              'success'
            );
            copyNote.textContent =
              'click the copy button to copy the link to your clipboard';
          }
        } else {
          showStatus('upload failed. please try again.', 'error');
        }
      } catch (e) {
        showStatus('server error. please try again.', 'error');
      }
    } else {
      showStatus('upload failed. please try again.', 'error');
    }
  };

  xhr.onerror = function () {
    showStatus('connection error. please check your internet.', 'error');
  };

  xhr.open('POST', '/upload', true);
  xhr.send(formData);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast('link copied to clipboard');
        tooltip.classList.add('show');
        setTimeout(() => {
          tooltip.classList.remove('show');
        }, 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        fallbackCopyToClipboard(text);
      });
  } else {
    fallbackCopyToClipboard(text);
    showToast('link copied to clipboard');
  }
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      tooltip.classList.add('show');
      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 2000);
    }
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

copyButton.addEventListener('click', () => {
  copyToClipboard(imageUrl.value);
  copyNote.textContent = 'link has been copied to your clipboard';
});

function showStatus(message, type) {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';
  statusMessage.classList.add(type);

  if (type === 'error') {
    progressContainer.classList.remove('show');
  }
}

function resetUI() {
  const statusMessage = document.getElementById('statusMessage');
  statusMessage.className = 'status-message';
  progressBar.style.width = '0%';
  progressText.textContent = 'uploading... 0%';
  previewContainer.classList.remove('show');
}