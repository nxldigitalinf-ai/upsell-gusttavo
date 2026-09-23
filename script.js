document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Countdown Timer Logic (5 Minutes)
  const timerElement = document.getElementById('countdownTimer');
  let durationInSeconds = 5 * 60;

  function updateTimer() {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    if (timerElement) {
      timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }

    if (durationInSeconds > 0) {
      durationInSeconds--;
    } else {
      clearInterval(timerInterval);
    }
  }

  const timerInterval = setInterval(updateTimer, 1000);

  // Video Sound & Play/Pause Control
  const video = document.getElementById('heroVideo');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const heroMediaCard = document.getElementById('heroMediaCard');
  const videoWrap = document.querySelector('.video-container-wrap');
  const videoStateOverlay = document.getElementById('videoStateOverlay');
  const videoStateIcon = document.getElementById('videoStateIcon');

  let hasActivatedSound = false;
  let overlayTimeout;

  // Ensure muted autoplay starts immediately on load
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    const startMutedAutoplay = () => {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          const tryPlayOnce = () => {
            if (!hasActivatedSound) {
              video.muted = true;
              video.play().catch(() => {});
            }
          };
          window.addEventListener('touchstart', tryPlayOnce, { once: true, passive: true });
          window.addEventListener('click', tryPlayOnce, { once: true });
        });
      }
    };

    if (video.readyState >= 2) {
      startMutedAutoplay();
    } else {
      video.addEventListener('loadeddata', startMutedAutoplay, { once: true });
      video.addEventListener('canplay', startMutedAutoplay, { once: true });
    }
  }

  function showStateIndicator(isPlaying) {
    if (!videoStateOverlay || !videoStateIcon) return;
    clearTimeout(overlayTimeout);

    if (isPlaying) {
      videoStateIcon.className = 'video-state-icon playing';
      videoStateOverlay.classList.add('visible');
      overlayTimeout = setTimeout(() => {
        videoStateOverlay.classList.remove('visible');
      }, 700);
    } else {
      videoStateIcon.className = 'video-state-icon paused';
      videoStateOverlay.classList.add('visible');
    }
  }

  function handleVideoActivation() {
    if (!hasActivatedSound) {
      hasActivatedSound = true;
      video.muted = false;
      video.currentTime = 0; // Only reset to 0:00 on the initial activation
      video.play().catch(e => console.log('Audio playback permission:', e));
      if (heroMediaCard) {
        heroMediaCard.classList.add('sound-active');
      }
    } else {
      // Toggle play / pause WITHOUT resetting currentTime
      if (video.paused) {
        video.play().catch(e => console.log('Video play error:', e));
        showStateIndicator(true);
      } else {
        video.pause();
        showStateIndicator(false);
      }
    }
  }

  if (soundToggleBtn && video) {
    soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleVideoActivation();
    });
  }

  if (videoWrap && video) {
    videoWrap.addEventListener('click', () => {
      handleVideoActivation();
    });
  }


  // Luck Meter Animation (0 to 90%)
  const luckPercentVal = document.getElementById('luckPercentVal');
  const luckBarFill = document.getElementById('luckBarFill');
  const luckCircleProgress = document.getElementById('luckCircleProgress');

  if (luckPercentVal) {
    const targetPercent = 90;
    const duration = 1500; // 1.5s
    const startTime = performance.now();
    const circumference = 2 * Math.PI * 42; // ~263.89

    if (luckCircleProgress) {
      luckCircleProgress.style.strokeDasharray = `${circumference}`;
      luckCircleProgress.style.strokeDashoffset = `${circumference}`;
    }

    if (luckBarFill) {
      luckBarFill.style.width = '0%';
    }

    const animateMeter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(easeProgress * targetPercent);
      
      luckPercentVal.textContent = `${currentVal}%`;

      if (luckBarFill) {
        luckBarFill.style.width = `${easeProgress * targetPercent}%`;
      }

      if (luckCircleProgress) {
        const offset = circumference - (circumference * (easeProgress * targetPercent / 100));
        luckCircleProgress.style.strokeDashoffset = offset;
      }

      if (progress < 1) {
        requestAnimationFrame(animateMeter);
      } else {
        luckPercentVal.textContent = `${targetPercent}%`;
        if (luckBarFill) luckBarFill.style.width = `${targetPercent}%`;
        if (luckCircleProgress) {
          luckCircleProgress.style.strokeDashoffset = circumference - (circumference * (targetPercent / 100));
        }
      }
    };

    setTimeout(() => {
      requestAnimationFrame(animateMeter);
    }, 250);
  }

  // Casa Mobiliada Auto Carousel
  const casaSlides = document.querySelectorAll('.casa-slide');
  const casaDots = document.querySelectorAll('.casa-dot');

  if (casaSlides.length > 1) {
    let currentCasaSlide = 0;

    function showCasaSlide(index) {
      casaSlides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      casaDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    setInterval(() => {
      currentCasaSlide = (currentCasaSlide + 1) % casaSlides.length;
      showCasaSlide(currentCasaSlide);
    }, 2000);

    // Click indicator dots to jump to slide
    casaDots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentCasaSlide = idx;
        showCasaSlide(currentCasaSlide);
      });
    });
  }
});
