// Toggle burger menu
const burgerBtn = document.getElementById('burger-btn');
const dropdownMenu = document.getElementById('dropdown-menu');

burgerBtn.addEventListener('click', function() {
    this.classList.toggle('active');
    dropdownMenu.classList.toggle('active');
});

// Toggle submenu
document.querySelectorAll('.has-submenu').forEach(item => {
    item.addEventListener('click', function(e) {
        if (e.target === this) {
            e.stopPropagation();
            this.classList.toggle('active');
        }
    });
});