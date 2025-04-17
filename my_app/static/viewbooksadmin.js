// Function to fetch books from the Django API
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
            
                        <!-- Buttons aligned at the bottom -->
                        <div class="d-flex justify-content-between mt-auto pt-3 card-buttons">
                            <button class="btn btn-md btn-outline-dark">Edit Book</button>
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

window.onload = fetchBooks;
