/* North Star Bakery - Interactive JavaScript */
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    // Product Category Filtering (products.html)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            productCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Form Submission Handling (contact.html)
    const preOrderForm = document.getElementById('preOrderForm');
    const formFeedback = document.getElementById('formFeedback');

    if (preOrderForm) {
        preOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const pickupDate = document.getElementById('pickupDate').value;

            formFeedback.style.display = 'block';
            formFeedback.className = 'notice-box';
            formFeedback.style.backgroundColor = '#e8f5e9';
            formFeedback.style.borderColor = '#a5d6a7';
            formFeedback.style.color = '#1b5e20';
            formFeedback.innerHTML = `<strong>Thank you, ${name}!</strong> Your request for pickup on <strong>${pickupDate}</strong> has been received. Our baking team will contact you shortly to confirm your order details.`;
            
            preOrderForm.reset();
            formFeedback.scrollIntoView({ behavior: 'smooth' });
        });
    }
});
