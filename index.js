import 'core-js/actual';
import 'regenerator-runtime/runtime';


// STATE
let currentImages = [];
let currentIndex = 0;


// DOM ELEMENTS
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalPrevBtn = document.getElementById('modalPrevBtn');
const modalNextBtn = document.getElementById('modalNextBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const copyBtn = document.getElementById('copyBtn');
const contactForm = document.querySelector('.form');



const currentYearEl = document.getElementById('currentYear');
const year = new Date().getFullYear().toString();

currentYearEl.setAttribute('datetime', year);


// MODAL FUNCTIONS
const openModal = function(imgPath) {
  const largeImage = document.createElement('img');
  largeImage.classList.add('modal__image');
  largeImage.src = imgPath;
  modalContent.appendChild(largeImage);

  modal.showModal();

  updateNavigationButtons();
  // close btn is hidden when form modal is shown
  modalCloseBtn.style.visibility = 'visible';
}

const closeModal = function() {
  if (modal.open) {
    modalContent.innerHTML = '';

    modal.close();

    currentImages = [];
    currentIndex = 0;
  }
}

const updateModalImage = function(index) {
  modalContent.innerHTML = '';
  const imgPath = currentImages[index].dataset.image;
  const largeImage = document.createElement('img');
  largeImage.classList.add('modal__image');
  largeImage.src = imgPath;
  modalContent.appendChild(largeImage);

  updateNavigationButtons();
}

const showNextImage = function() {
  if (currentIndex < currentImages.length - 1) {
    currentIndex++;
    updateModalImage(currentIndex);
  }
}

const showPrevImage = function() {
  if (currentIndex > 0) {
    currentIndex--;
    updateModalImage(currentIndex);
  }
}

const updateNavigationButtons = function() {
  // hide prev btn if at first image
  if (currentIndex === 0) {
    modalPrevBtn.style.visibility = 'hidden';
  } else {
    modalPrevBtn.style.visibility = 'visible';
  }

  // hide next btn if at last image
  if (currentIndex === currentImages.length - 1) {
    modalNextBtn.style.visibility = 'hidden';
  } else {
    modalNextBtn.style.visibility = 'visible';
  }
  
  // handle single image case (both btns hidden)
  if (currentImages.length <= 1) {
    modalPrevBtn.style.visibility = 'hidden';
    modalNextBtn.style.visibility = 'hidden';
  }
}

document.querySelector('.gallery__item').addEventListener('keydown', (e) => {
  console.log('key:', e.key, 'defaultPrevented:', e.defaultPrevented);
});

document.querySelector('.gallery__item').addEventListener('click', (e) => {
  console.log('clicked', e);
});


// EVENT LISTENERS
document.addEventListener('click', e => {
  const btn = e.target.closest('.gallery__item');

  if (btn) {
    const img = btn.querySelector('.gallery__image');
    
    // 1. identify the project container (card)
    const card = btn.closest('.card');
    
    // 2. get all images in this project
    // Note: Use gallery__image instead of project-img
    currentImages = Array.from(card.querySelectorAll('.gallery__image'));
    
    // 3. find index of clicked image
    currentIndex = currentImages.indexOf(img);
    
    // const imgPath = e.target.dataset['image'];
    const imgPath = img.dataset['image'];
    openModal(imgPath);
  }

  // click modal outside image to close
  if (e.target.classList.contains('modal__content')) {
    closeModal();
  }

  // click close btn
  if (e.target.id === 'modalCloseBtn') {
    closeModal();
  }
  
  // click prev btn
  if (e.target.closest('#modalPrevBtn')) {
    showPrevImage();
  }

  // click next btn
  if (e.target.closest('#modalNextBtn')) {
    showNextImage();
  }

  // click close btn inside dynamic success message
  if (e.target.id === 'successModalCloseBtn') {
    closeModal();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
  }
  
  if (modal.open) {
    if (e.key === 'ArrowLeft') {
      if (document.activeElement === modalPrevBtn || document.activeElement === modalNextBtn) {
        document.activeElement.blur();
      }
      showPrevImage();
    }
    if (e.key === 'ArrowRight') {
      if (document.activeElement === modalPrevBtn || document.activeElement === modalNextBtn) {
        document.activeElement.blur();
      }
      showNextImage();
    }
  }
});



// FORM SUBMISSION
const showStatusMessage = (title, message, isSuccess = true) => {
  // hide btns used for image gallery
  modalPrevBtn.style.visibility = 'hidden';
  modalNextBtn.style.visibility = 'hidden';
  modalCloseBtn.style.visibility = 'hidden';

  const titleClass = isSuccess ? 'modal__msg-title' : 'modal__msg-title modal__msg-title--error';

  // set msg content
  modalContent.innerHTML = `
    <div class="modal__msg-box">
      <h3 class="${titleClass}">${title}</h3>
      <p class="modal__msg-text">${message}</p>
      <button class="btn btn--modal-msg" id="successModalCloseBtn">Close</button>
    </div>
  `;

  modal.showModal();

  // close after 2.5s
  setTimeout(() => {
    if (modal.open) {
      closeModal();
    }
  }, 2500);
}




contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;
  
  // change button state
  submitBtn.textContent = contactForm.dataset.submitting;
  submitBtn.disabled = true;
  
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  const formUrl = import.meta.env.VITE_FORM_URL;

  try {
    const response = await fetch(formUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      contactForm.reset();
      showStatusMessage(contactForm.dataset.successTitle, contactForm.dataset.successMessage, true);
    } else {
      showStatusMessage(contactForm.dataset.errorTitle, contactForm.dataset.errorMessage, false);
    }
  } catch (error) {
    showStatusMessage(contactForm.dataset.errorTitle, contactForm.dataset.errorMessage, false);
  } finally {
    // reset button state
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  }
});



// COPY EMAIL
const email = import.meta.env.VITE_EMAIL_ADDRESS;

copyBtn.addEventListener('click', () => {
  copyEmail(copyBtn, email);
});

const copyEmail = async (btn, email) => {
  try {
    await navigator.clipboard.writeText(email);
    const originalText = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = ` 
      <svg class="copy__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      ${btn.dataset.copied}
    `;
    
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = originalText;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy email:', error);
  }
};
