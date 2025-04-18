function fetchBooks() {
    fetch('/api/books/')
        .then(response => response.json())
        .then(data => {
            const bookListDiv = document.getElementById('bookList');
            const books = data.books;
            
            bookListDiv.innerHTML = '';
            
            books.forEach(book => {
                const bookItem = document.createElement('div');
                bookItem.classList.add('card', 'book-card');
                
                const bookImage = book.image ? `${window.location.origin}${book.image}` : 'default-book-cover.jpg';
                
                bookItem.innerHTML = `
                <div class="book-card d-flex flex-column">
                    ${book.image ? `<img src="${book.image}" alt="Book Cover" class="book-cover">` : '<p>No cover image available</p>'}
                    <div class="card-body d-flex flex-column flex-grow-1">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text"><strong>Author:</strong> ${book.author}</p>
                        <p class="card-text"><strong>Year Published:</strong> ${book.year_published}</p>
                        <p class="card-text"><strong>Category:</strong> ${book.category}</p>
                        
                        <div class="d-flex justify-content-between mt-auto pt-3 card-buttons">
                            <!-- Pass the book id to open the modal -->
                            <button class="btn btn-md btn-outline-dark edit-book-btn" data-bs-toggle="modal" data-bs-target="#editBookModal" data-book-id="${book.id}">
                                Edit Book
                            </button>
                            <button class="btn btn-md" style="background: #8B4411; color: white;">View Book</button>
                        </div>
                    </div>
                </div>
                `;
                
                bookListDiv.appendChild(bookItem);
            });
        })
        .catch(error => console.error('Error fetching books:', error));
}

function fetchBookDetails(bookId) {
    fetch(`/api/books/${bookId}/`)
        .then(response => response.json())
        .then(book => {
            document.getElementById('editBookId').value = book.id;
            document.getElementById('editBookTitle').value = book.title;
            document.getElementById('editBookAuthor').value = book.author;
            document.getElementById('editBookCategory').value = book.category;
            document.getElementById('editBookYear').value = book.year_published;
            document.getElementById('editBookDescription').value = book.description;
            
            const editForm = document.getElementById('editBookForm');
            editForm.action = `/edit-book/${bookId}/`;
            
            const currentImageContainer = document.getElementById('currentImageContainer');
            if (book.image) {
                currentImageContainer.innerHTML = `
                    <div class="mb-2">
                        <p class="mb-1">Current Cover:</p>
                        <img src="${book.image}" alt="Current Book Cover" style="max-width: 100px; max-height: 150px;">
                    </div>
                `;
                currentImageContainer.style.display = 'block';
            } else {
                currentImageContainer.style.display = 'none';
            }
        })
        .catch(error => console.error('Error fetching book details:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchBooks();
    
    document.body.addEventListener('click', function(e) {
        const editButton = e.target.closest('.edit-book-btn');
        if (editButton) {
            const bookId = editButton.getAttribute('data-book-id');
            fetchBookDetails(bookId);
        }
    });
});

window.onload = function() {
    fetchBooks();
};