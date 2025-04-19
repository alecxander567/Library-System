document.addEventListener('DOMContentLoaded', function () {
  function getCSRFToken() {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    return csrfToken;
  }

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
        <div class="col">
          <img src="${book.image || 'default-book.jpg'}" alt="${book.title}" class="img-fluid" width="300">
        </div>
        <div class="col-md-8 book-info">
          <h2>${book.title}</h2>
          <h3>by ${book.author}</h3>
          <p><strong>Published:</strong> ${book.year_published}</p>
          <p><strong>Category:</strong> ${book.category}</p>
          <p><strong>Description:</strong> ${book.description}</p>
          <p><strong>Rating:</strong> ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)} (${book.rating}/5)</p>
          <button id="rateBookBtn" class="btn btn-warning mt-2">Rate Book</button>
        </div>
      </div>

      <div class="mt-3">
        <h5>Leave a Comment:</h5>
        <textarea id="commentText" class="form-control mb-2" placeholder="Your Comment"></textarea>
        <div style="display: flex; justify-content: flex-end;">
          <button class="btn" id="submitComment" style="background: #8B4411; color: white;">Post Comment</button>
        </div>
        <hr>
        <div id="commentSection"><em>Loading comments...</em></div>
      </div>
    `;

    document.getElementById('rateBookBtn').addEventListener('click', () => {
      const userRating = prompt(`Rate "${book.title}" from 1 to 5:`);
      const parsedRating = parseInt(userRating);
    
      if (parsedRating >= 1 && parsedRating <= 5) {
        fetch('/rate-book/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
          },
          body: JSON.stringify({
            book_id: book.id,
            rating: parsedRating
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert(`Thanks for rating! New average rating: ${data.new_rating.toFixed(2)}`);
            fetchBooks();
          } else {
            alert('Error: ' + data.error);
          }
        })
        .catch(err => {
          console.error(err);
          alert('Something went wrong.');
        });
      } else {
        alert('Please enter a valid rating between 1 and 5.');
      }
    });

    document.getElementById('submitComment').addEventListener('click', () => {
      const text = document.getElementById('commentText').value;
  
      fetch('/post-comment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
          book_id: book.id,
          text: text
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          loadComments(book.id);
          document.getElementById('commentText').value = '';
        } else {
          alert(data.error || 'Failed to post comment');
        }
      });
    });

    function loadComments(bookId) {
      fetch(`/get-comments/${bookId}/`)
        .then(res => res.json())
        .then(data => {
          const section = document.getElementById('commentSection');
          if (data.comments.length === 0) {
            section.innerHTML = "<p>No comments yet.</p>";
          } else {
            section.innerHTML = data.comments.map(c => `
              <div class="mb-2">
                <strong>${c.name}</strong> <small class="text-muted">(${c.created_at})</small><br>
                <span>${c.text}</span>
              </div>
            `).join('');
          }
        });
    }
    
    loadComments(book.id);

    const modal = new bootstrap.Modal(document.getElementById('bookDetailsModal'));
    modal.show();
  }
});
