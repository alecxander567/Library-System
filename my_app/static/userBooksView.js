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
        });

        categoryContainer.appendChild(categoryBookGrid);
        bookListDiv.appendChild(categoryContainer);
      }
    })
    .catch(error => console.error('Error fetching books:', error));
}