document.addEventListener('DOMContentLoaded', function () {
  function fetchBooks() {
    fetch('/user/books/')
      .then(response => response.json())
      .then(data => {
        const bookListDiv = document.getElementById('bookList');
        const books = data.books;

        const categories = {};

        books.forEach(book => {
          if (!categories[book.category]) {
            categories[book.category] = [];
          }
          categories[book.category].push(book);
        });

        bookListDiv.innerHTML = '';

        let isFirstCategory = true;

        for (const category in categories) {
          const categoryContainer = document.createElement('div');

          const categoryTitle = document.createElement('h2');
          categoryTitle.classList.add('category-title');

          if (isFirstCategory) {
            categoryTitle.classList.add('first');
            isFirstCategory = false;
          }

          categoryTitle.innerText = category;
          categoryContainer.appendChild(categoryTitle);

          const categoryBookGrid = document.createElement('div');
          categoryBookGrid.classList.add('book-grid');

          categories[category].forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.classList.add('book-card');

            const image = document.createElement('img');
            image.src = book.image || 'default-book.jpg';
            image.alt = book.title;

            const bookInfo = document.createElement('div');
            bookInfo.classList.add('book-info');

            const title = document.createElement('h3');
            title.textContent = book.title;

            const author = document.createElement('h6');
            author.textContent = `by ${book.author}`;

            const starRatingContainer = document.createElement('div');
            starRatingContainer.classList.add('star-rating-container');

            const rating = book.rating || 0;

            for (let i = 1; i <= 5; i++) {
              const star = document.createElement('span');
              star.classList.add('star');
              star.innerText = i <= rating ? '★' : '☆';
              starRatingContainer.appendChild(star);
            }

            const totalRating = document.createElement('span');
            totalRating.classList.add('total-rating');
            totalRating.textContent = `(${rating}/5)`;
            starRatingContainer.appendChild(totalRating);

            bookInfo.appendChild(title);
            bookInfo.appendChild(author);
            bookInfo.appendChild(starRatingContainer);

            const buttons = document.createElement('div');
            buttons.classList.add('book-buttons');

            const viewBtn = document.createElement('button');
            viewBtn.classList.add('view-btn');
            viewBtn.textContent = 'View Book';

            const addToFavoritesBtn = document.createElement('button');
            addToFavoritesBtn.classList.add('edit-btn');
            addToFavoritesBtn.textContent = 'Add to Favorites';

            addToFavoritesBtn.addEventListener('click', function () {
              console.log(`Added ${book.title} to favorites.`);
            });

            viewBtn.addEventListener('click', function () {
              showBookDetails(book);
            });

            buttons.appendChild(addToFavoritesBtn);
            buttons.appendChild(viewBtn);

            bookInfo.appendChild(buttons);
            bookCard.appendChild(image);
            bookCard.appendChild(bookInfo);

            categoryBookGrid.appendChild(bookCard);
          });

          categoryContainer.appendChild(categoryBookGrid);
          bookListDiv.appendChild(categoryContainer);
        }
      })
      .catch(error => console.error('Error fetching books:', error));
  }

  fetchBooks();

  function showBookDetails(book) {
    const modalContent = document.getElementById('bookDetailsContent');

    modalContent.innerHTML = `
        <div class="row">
            <!-- Image Column -->
            <div class="col">
                <img src="${book.image || 'default-book.jpg'}" alt="${book.title}" class="img-fluid" width="300">
            </div>
            <!-- Info Column with reduced padding class -->
            <div class="col-md-8 book-info">
                <h2>${book.title}</h2>
                <h3>by ${book.author}</h3>
                <p><strong>Published:</strong> ${book.year_published}</p>
                <p><strong>Category:</strong> ${book.category}</p>
                <p><strong>Description:</strong> ${book.description}</p>
                <p><strong>Rating:</strong> ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)} (${book.rating}/5)</p>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
    modal.show();
  }
});