document.addEventListener('DOMContentLoaded', () => {
    // Array de libros que coincide con el catálogo
    const data = [
      { title: "El retrato de Dorian Gray", author: "Oscar Wilde", available: true },
      { title: "Ana Karenina", author: "León Tolstói", available: true },
      { title: "Diez negritos", author: "Agatha Christie", available: false },
      { title: "El código Da Vinci", author: "Dan Brown", available: true },
      { title: "El guardián entre el centeno", author: "J.D. Salinger", available: true },
      { title: "El proceso", author: "Franz Kafka", available: true },
      { title: "Las aventuras de Alicia en el país de las maravillas", author: "Lewis Carroll", available: true },
      { title: "Odisea", author: "Homero", available: false },
      { title: "El Principito", author: "Antoine de Saint-Exupéry", available: true },
      { title: "El Señor de los Anillos", author: "J.R.R. Tolkien", available: true },
      { title: "Don Quijote de la Mancha", author: "Miguel de Cervantes", available: true },
      { title: "Historia de dos ciudades", author: "Charles Dickens", available: true }
    ];
  
    const searchInput = document.getElementById('search-bar');
    const booksList = document.getElementById('booksList');
    const searchResultsSection = document.getElementById('search-results-section');
    const staticCatalog = document.getElementById('static-catalog');
  
    function displayBooks(filteredBooks) {
      booksList.innerHTML = '';
      filteredBooks.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book-card');
        bookElement.innerHTML = `
          <div class="book-image"></div>
          <h3>${book.title}</h3>
          <p>${book.author}</p>
          <p><strong>Disponible:</strong> ${book.available ? 'Sí' : 'No'}</p>
        `;
        booksList.appendChild(bookElement);
      });
    }
  
    // Detectar cambios en el input de búsqueda
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      if (query === "") {
        // Si no hay búsqueda, se muestra el catálogo estático y se ocultan los resultados dinámicos
        searchResultsSection.style.display = 'none';
        staticCatalog.style.display = 'block';
      } else {
        // Si hay búsqueda, se muestran los resultados dinámicos y se oculta el catálogo estático
        searchResultsSection.style.display = 'block';
        staticCatalog.style.display = 'none';
        const filteredBooks = data.filter(book =>
          book.title.toLowerCase().includes(query)
        );
        displayBooks(filteredBooks);
        addRecentSearch(query);
      }
    });
  });
  