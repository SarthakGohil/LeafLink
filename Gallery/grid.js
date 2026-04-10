
    document.addEventListener('DOMContentLoaded', function () {
      const hamburger = document.querySelector('.hamburger');
      const navLinks = document.querySelector('.nav-links');

      hamburger.addEventListener('click', function () {
        navLinks.classList.toggle('active');
      });
    });


    const menuIcon = document.querySelector('.menu-icon');
    const navbarMenu = document.querySelector('.navbar-menu');

    menuIcon.addEventListener('click',
      () => {
        navbarMenu.classList.toggle('active');

      });

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.column img');
    const overlay = document.getElementById('overlay');
    const popupImg = document.getElementById('popupImg');
    const closeBtn = document.getElementById('closeBtn');

    images.forEach(img => {
        img.addEventListener('click', () => {
            popupImg.src = img.src;
            overlay.style.display = 'flex'; 
        });
    });

    closeBtn.addEventListener('click', () => {
        overlay.style.display = 'none'; 
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none'; 
        }
    });
});
