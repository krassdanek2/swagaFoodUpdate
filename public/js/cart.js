// Универсальный скрипт для добавления товаров в корзину
document.addEventListener('DOMContentLoaded', function() {
    // Получаем victimId из cookie
    function getVictimId() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'victimId') {
                return parseInt(value);
            }
        }
        return 1; // По умолчанию
    }

    // Обновляем счетчик корзины
    function updateCartCount(amountToAdd) {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            let currentCount = parseInt(cartCountElement.textContent, 10);
            if (isNaN(currentCount)) currentCount = 0;
            const newCount = currentCount + amountToAdd;
            cartCountElement.textContent = newCount;
        }
    }

    // Добавляем товар в корзину
    function addToCart(title, price) {
        const productData = {
            title: title,
            price: parseFloat(price),
            victimId: getVictimId()
        };

        fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => response.json())
        .then(data => {
            updateCartCount(1);
            console.log('Товар добавлен в корзину:', productData);
        })
        .catch(error => {
            console.error('Ошибка при добавлении в корзину:', error);
        });
    }

    // Обработчик для ссылок на товары
    document.addEventListener('click', function(e) {
        const menuItem = e.target.closest('.menu__item');
        if (menuItem) {
            e.preventDefault(); // Предотвращаем переход по ссылке
            
            const titleElement = menuItem.querySelector('.title span');
            const priceElement = menuItem.querySelector('.title p[style*="color:red"]');
            
            if (titleElement && priceElement) {
                const title = titleElement.textContent.split('\n')[0].trim();
                const priceText = priceElement.textContent.replace('€', '').trim();
                const price = parseFloat(priceText);
                
                if (!isNaN(price)) {
                    addToCart(title, price);
                }
            }
        }
    });

    // Обработчик для кнопок "Add to cart"
    document.addEventListener('click', function(e) {
        if (e.target.id === 'add_product') {
            e.preventDefault();
            
            const titleElement = document.querySelector('h1');
            const priceElement = document.querySelector('.product__price');
            
            if (titleElement && priceElement) {
                const title = titleElement.textContent.trim();
                const priceText = priceElement.textContent.replace('€', '').trim();
                const price = parseFloat(priceText);
                
                if (!isNaN(price)) {
                    addToCart(title, price);
                }
            }
        }
    });
});
